import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import {
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { provideEffects } from '@ngrx/effects';
import {
  provideState,
  provideStore,
  Store,
} from '@ngrx/store';
import { of } from 'rxjs';

import { AuthInterceptor } from '../auth/auth.interceptor';
import { AuthService } from '../auth/auth.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { coreReducers } from '../core.reducers';
import { coreSelector } from '../core.selectors';
import { CoreState } from '../core-state.model';
import { APP_DATA_SERVICES_MAP } from '../data-services-map-type';
import { DspaceRestInterceptor } from '../dspace-rest/dspace-rest.interceptor';
import { DspaceRestService } from '../dspace-rest/dspace-rest.service';
import { UUIDIndexEffects } from '../index/index.effects';
import { LocaleInterceptor } from '../locale/locale.interceptor';
import { LocaleService } from '../locale/locale.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { Item } from '../shared/item.model';
import { MetadataMap } from '../shared/metadata.models';
import { XSRFService } from '../xsrf/xsrf.service';
import { ItemDataService } from './item-data.service';
import { RequestEffects } from './request.effects';
import { RequestService } from './request.service';

describe('isolated item metadata and object cache', () => {
  const baseUrl = 'https://rest.api/server';
  const ssrBaseUrl = 'http://rest.internal/server';
  const href = baseUrl + '/api/core/items/1698f1d3-be98-4c51-9fd8-6bfedcbd59b7';
  const projection = href + '?projection=allLanguages';
  const links = { self: { href } };
  const english = { value: 'English', language: 'en' };
  const tamil = { value: 'தமிழ்', language: 'ta' };
  const dto = { uuid: href.split('/').at(-1), type: 'item', _links: links };
  let http: HttpTestingController;
  let service: ItemDataService;
  let requests: RequestService;
  let core: CoreState;
  let platform: string;
  let token: { accessToken: string } | null;
  let language: string;

  beforeEach(() => {
    platform = 'browser';
    token = null;
    language = 'ta';
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideStore(),
        provideState('core', coreReducers),
        provideEffects(RequestEffects, UUIDIndexEffects),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        DspaceRestService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: LocaleInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: DspaceRestInterceptor, multi: true },
        { provide: PLATFORM_ID, useFactory: () => platform },
        { provide: APP_CONFIG, useValue: { rest: { baseUrl, ssrBaseUrl }, cache: { msToLive: { default: 60000 } } } },
        { provide: APP_DATA_SERVICES_MAP, useValue: {} },
        { provide: XSRFService, useValue: { tokenInitialized$: of(true) } },
        { provide: HALEndpointService, useValue: { getRootHref: () => baseUrl + '/api' } },
        { provide: LocaleService, useValue: { getLanguageCodeList: () => of(language) } },
        { provide: AuthService, useValue: {
          getToken: () => token,
          isTokenExpired: () => false,
          buildAuthHeader: () => 'Bearer ' + token.accessToken,
          getImpersonateID: () => null,
        } },
      ],
    });
  });

  function setup(): void {
    http = TestBed.inject(HttpTestingController);
    requests = TestBed.inject(RequestService);
    service = new ItemDataService(requests, TestBed.inject(RemoteDataBuildService), TestBed.inject(ObjectCacheService),
      TestBed.inject(HALEndpointService), null, null, null, null, TestBed.inject(DspaceRestService));
    TestBed.inject(Store).select(coreSelector).subscribe((value) => core = value);
  }

  afterEach(() => http?.verify());

  for (const defaultFirst of [true, false]) {
    it(`isolates overlapping reads when the ${defaultFirst ? 'default' : 'projected'} response arrives first`, fakeAsync(() => {
      setup();
      const item = Object.assign(new Item(), { _links: links });
      let canonical: Item;
      let projected: MetadataMap;

      const defaultRead = service.findByHref(href, true, false).subscribe((rd) => {
        if (rd.hasSucceeded) {
          canonical = rd.payload;
        }
      });
      service.getAllLanguagesMetadata(item).subscribe((metadata) => projected = metadata);
      tick();
      const normal = http.expectOne(href);
      const multilingual = http.expectOne(projection);
      const flushDefault = () => {
        // Request state uses millisecond timestamps to distinguish pending and completed updates.
        tick(1);
        normal.flush({ ...dto, metadata: { 'dc.title': [english] } });
      };
      const flushProjection = () => multilingual.flush({ ...dto, metadata: { 'dc.title': [english, tamil] } });

      if (defaultFirst) {
        flushDefault();
        tick();
        const originalCache = core['cache/object'];
        const originalRequests = core['data/request'];
        flushProjection();
        tick();
        expect(core['cache/object']).toBe(originalCache);
        expect(core['data/request']).toBe(originalRequests);
      } else {
        flushProjection();
        tick();
        expect(Object.keys(core['cache/object'])).toEqual([]);
        expect(canonical).toBeUndefined();
        flushDefault();
        tick();
      }

      expect(Object.keys(core['cache/object'])).toEqual([href]);
      expect((core['cache/object'][href].data as Item).allMetadataValues('dc.title')).toEqual(['English']);
      expect(canonical?.allMetadataValues('dc.title')).toEqual(['English']);
      expect(projected['dc.title'].map((value) => value.language)).toEqual(['en', 'ta']);
      expect(item.metadata).toBeUndefined();
      const projectedEntry = requests.getByHref(projection).subscribe((entry) => expect(entry).toBeUndefined());
      projectedEntry.unsubscribe();
      defaultRead.unsubscribe();
    }));
  }

  it('rewrites the projected URL for SSR and applies the locale and current authentication headers', () => {
    platform = 'server';
    setup();
    const item = Object.assign(new Item(), { _links: links });
    service.getAllLanguagesMetadata(item).subscribe();
    const url = projection.replace(baseUrl, ssrBaseUrl);
    const anonymous = http.expectOne(url);
    expect(anonymous.request.headers.get('Accept-Language')).toBe('ta');
    expect(anonymous.request.headers.has('Authorization')).toBeFalse();
    anonymous.flush({ metadata: {} });

    language = 'en';
    token = { accessToken: 'test-token' };
    service.getAllLanguagesMetadata(item).subscribe();
    const authenticated = http.expectOne(url);
    expect(authenticated.request.headers.get('Accept-Language')).toBe('en');
    expect(authenticated.request.headers.get('Authorization')).toBe('Bearer test-token');
    authenticated.flush({ metadata: {} });
  });
});
