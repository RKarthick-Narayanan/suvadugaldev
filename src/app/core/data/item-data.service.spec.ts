import { HttpClient } from '@angular/common/http';
import { createSuccessfulRemoteDataObject$ } from '@dspace/core/utilities/remote-data.utils';
import { Store } from '@ngrx/store';
import {
  cold,
  getTestScheduler,
} from 'jasmine-marbles';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { BrowseService } from '../browse/browse.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { RestResponse } from '../cache/response.models';
import { CoreState } from '../core-state.model';
import { NotificationsService } from '../notification-system/notifications.service';
import { ExternalSourceEntry } from '../shared/external-source-entry.model';
import { Item } from '../shared/item.model';
import { HALEndpointServiceStub } from '../testing/hal-endpoint-service.stub';
import { getMockRemoteDataBuildService } from '../testing/remote-data-build.service.mock';
import { getMockRequestService } from '../testing/request.service.mock';
import { testCreateDataImplementation } from './base/create-data.spec';
import { testDeleteDataImplementation } from './base/delete-data.spec';
import { testPatchDataImplementation } from './base/patch-data.spec';
import { FindListOptions } from './find-list-options.model';
import { ItemDataService } from './item-data.service';
import {
  DeleteRequest,
  PostRequest,
} from './request.models';
import { RequestService } from './request.service';
import { RequestEntry } from './request-entry.model';

describe('ItemDataService', () => {
  let scheduler: TestScheduler;
  let service: ItemDataService;
  let browseService: BrowseService;
  const requestService = Object.assign(getMockRequestService(), {
    generateRequestId(): string {
      return scopeID;
    },
    getByHref(requestHref: string) {
      const responseCacheEntry = new RequestEntry();
      responseCacheEntry.response = new RestResponse(true, 200, 'OK');
      return of(responseCacheEntry);
    },
    removeByHrefSubstring(href: string) {
      // Do nothing
    },
  }) as RequestService;
  const rdbService = getMockRemoteDataBuildService();

  const itemEndpoint = 'https://rest.api/core';

  const store = {} as Store<CoreState>;
  const objectCache = {} as ObjectCacheService;
  const halEndpointService: any = new HALEndpointServiceStub(itemEndpoint);
  const bundleService = jasmine.createSpyObj('bundleService', {
    findByHref: {},
  });

  const scopeID = '4af28e99-6a9c-4036-a199-e1b587046d39';
  const options = Object.assign(new FindListOptions(), {
    scopeID: scopeID,
    sort: {
      field: '',
      direction: undefined,
    },
  });

  const browsesEndpoint = 'https://rest.api/discover/browses';
  const itemBrowseEndpoint = `${browsesEndpoint}/author/items`;
  const scopedEndpoint = `${itemBrowseEndpoint}?scope=${scopeID}`;
  const serviceEndpoint = `https://rest.api/core/items`;
  const browseError = new Error('getBrowseURL failed');
  const notificationsService = {} as NotificationsService;
  const http = {} as HttpClient;
  const comparator = {} as any;
  const ScopedItemEndpoint = `https://rest.api/core/items/${scopeID}`;

  function initMockBrowseService(isSuccessful: boolean) {
    const obs = isSuccessful ?
      cold('--a-', { a: itemBrowseEndpoint }) :
      cold('--#-', undefined, browseError);
    return jasmine.createSpyObj('bs', {
      getBrowseURLFor: obs,
    });
  }

  function initTestService() {
    return new ItemDataService(
      requestService,
      rdbService,
      objectCache,
      halEndpointService,
      notificationsService,
      comparator,
      browseService,
      bundleService,
      null,
    );
  }

  describe('isolated multilingual metadata', () => {
    const href = 'https://rest.api/core/items/123';
    const item = Object.assign(new Item(), { _links: { self: { href } } });
    const metadata = { 'dc.title': [
      { value: 'English', language: 'en', place: 0, authority: 'key', confidence: 600, securityLevel: 0 },
      { value: 'தமிழ்', language: 'ta', place: 1 },
      { value: 'Neutral', language: null, place: 2 },
    ] };

    it('requests the projection and returns detached metadata with its attributes', () => {
      const rest = jasmine.createSpyObj('rest', { get: of({ payload: { metadata } }) });
      const instance = new ItemDataService(null, null, null, null, null, null, null, null, rest);
      instance.getAllLanguagesMetadata(item).subscribe((result) => {
        expect(result['dc.title'].map((value) => value.value)).toEqual(['English', 'தமிழ்', 'Neutral']);
        expect(result['dc.title'][0].authority).toBe('key');
        expect(result['dc.title'][0].confidence).toBe(600);
        expect(result['dc.title'][0].securityLevel).toBe(0);
        expect(result['dc.title'][1].place).toBe(1);
        expect(Object.is(result, metadata)).toBeFalse();
      });
      expect(rest.get).toHaveBeenCalledWith(href + '?projection=allLanguages');
    });

    it('preserves edit attributes and a null language without rewriting positions', () => {
      const first = metadata['dc.title'][0];
      const values = [{ ...first, value: 'தமிழ்', language: 'ta', place: 1 }, first,
        { value: 'Neutral', language: null, place: 2, authority: null, confidence: -1 }];
      const rest = jasmine.createSpyObj('rest', { get: of({ payload: { metadata: { 'dc.title': values } } }) });
      const instance = new ItemDataService(null, null, null, null, null, null, null, null, rest);
      instance.getAllLanguagesMetadata(item, { forEditing: true }).subscribe((result) => {
        expect(result['dc.title'].map(({ language, place }) => [language, place])).toEqual([['ta', 1], ['en', 0], [null, 2]]);
        expect(result['dc.title'][1].securityLevel).toBe(0);
        expect(result['dc.title'][2].securityLevel).toBeUndefined();
      });
    });

    for (const attributes of [
      { place: 2 }, { place: -1 }, { language: 23 }, { authority: {} },
      { confidence: null }, { securityLevel: '0' },
    ]) {
      it(`rejects unsafe edit metadata with attributes ${JSON.stringify(attributes)}`, () => {
        const values = [{ ...metadata['dc.title'][0], ...attributes }];
        const rest = jasmine.createSpyObj('rest', { get: of({ payload: { metadata: { 'dc.title': values } } }) });
        const instance = new ItemDataService(null, null, null, null, null, null, null, null, rest);
        const error = jasmine.createSpy('error');
        instance.getAllLanguagesMetadata(item, { forEditing: true }).subscribe({ error });
        expect(error).toHaveBeenCalled();
      });
    }

    it('rejects malformed metadata', () => {
      const rest = jasmine.createSpyObj('rest', { get: of({ payload: {} }) });
      const instance = new ItemDataService(null, null, null, null, null, null, null, null, rest);
      let failed = false;
      instance.getAllLanguagesMetadata(item).subscribe({ error: () => failed = true });
      expect(failed).toBeTrue();
    });
  });

  describe('composition', () => {
    const initService = () => new ItemDataService(null, null, null, null, null, null, null, null, null);
    testCreateDataImplementation(initService);
    testPatchDataImplementation(initService);
    testDeleteDataImplementation(initService);
  });

  describe('getBrowseEndpoint', () => {
    beforeEach(() => {
      scheduler = getTestScheduler();
    });

    it('should return the endpoint to fetch Items within the given scope and starting with the given string', () => {
      browseService = initMockBrowseService(true);
      service = initTestService();

      const result = service.getBrowseEndpoint(options);
      const expected = cold('--b-', { b: scopedEndpoint });

      expect(result).toBeObservable(expected);
    });

    describe('if the dc.date.issue browse isn\'t configured for items', () => {
      beforeEach(() => {
        browseService = initMockBrowseService(false);
        service = initTestService();
      });
      it('should throw an error', () => {
        const result = service.getBrowseEndpoint(options);
        const expected = cold('--#-', undefined, browseError);

        expect(result).toBeObservable(expected);
      });
    });
  });

  describe('removeMappingFromCollection', () => {
    let result;

    beforeEach(() => {
      service = initTestService();
      result = service.removeMappingFromCollection('item-id', 'collection-id');
    });

    it('should send a DELETE request', () => {
      result.subscribe(() => expect(requestService.send).toHaveBeenCalledWith(jasmine.any(DeleteRequest)));
    });
  });

  describe('mapToCollection', () => {
    let result;

    beforeEach(() => {
      service = initTestService();
      result = service.mapToCollection('item-id', 'collection-href');
    });

    it('should send a POST request', () => {
      result.subscribe(() => expect(requestService.send).toHaveBeenCalledWith(jasmine.any(PostRequest)));
    });
  });

  describe('importExternalSourceEntry', () => {
    let result;

    const externalSourceEntry = Object.assign(new ExternalSourceEntry(), {
      display: 'John, Doe',
      value: 'John, Doe',
      _links: { self: { href: 'http://test-rest.com/server/api/integration/externalSources/orcidV2/entryValues/0000-0003-4851-8004' } },
    });

    beforeEach(() => {
      service = initTestService();
      result = service.importExternalSourceEntry(externalSourceEntry, 'collection-id');
    });

    it('should send a POST request', (done) => {
      result.subscribe(() => {
        expect(requestService.send).toHaveBeenCalledWith(jasmine.any(PostRequest));
        done();
      });
    });
  });

  describe('createBundle', () => {
    const itemId = '3de6ea60-ec39-419b-ae6f-065930ac1429';
    const bundleName = 'ORIGINAL';
    let result;

    beforeEach(() => {
      service = initTestService();
      result = service.createBundle(itemId, bundleName);
    });

    it('should send a POST request', (done) => {
      result.subscribe(() => {
        expect(requestService.send).toHaveBeenCalledWith(jasmine.any(PostRequest));
        done();
      });
    });
  });

  describe('when cache is invalidated', () => {
    beforeEach(() => {
      service = initTestService();
    });
    it('should call setStaleByHrefSubstring', () => {
      service.invalidateItemCache('uuid');
      expect(requestService.setStaleByHrefSubstring).toHaveBeenCalledWith('item/uuid');
    });
  });

  describe('findByCustomUrl', () => {
    let itemDataService: ItemDataService;
    let searchData: any;
    let findByHrefSpy: jasmine.Spy;
    let getSearchByHrefSpy: jasmine.Spy;
    const id = 'custom-id';
    const fakeHrefObs = of('https://rest.api/core/items/search/findByCustomURL?q=custom-id');
    const linksToFollow = [];
    const projections = ['full', 'detailed'];

    beforeEach(() => {
      searchData = jasmine.createSpyObj('searchData', ['getSearchByHref']);
      getSearchByHrefSpy = searchData.getSearchByHref.and.returnValue(fakeHrefObs);
      itemDataService = new ItemDataService(
        requestService,
        rdbService,
        objectCache,
        halEndpointService,
        notificationsService,
        comparator,
        browseService,
        bundleService,
        null,
      );

      (itemDataService as any).searchData = searchData;
      findByHrefSpy = spyOn(itemDataService, 'findByHref').and.returnValue(createSuccessfulRemoteDataObject$(new Item()));
    });

    it('should call searchData.getSearchByHref with correct parameters', () => {
      itemDataService.findByCustomUrl(id, true, true, linksToFollow, projections).subscribe();

      expect(getSearchByHrefSpy).toHaveBeenCalledWith(
        'findByCustomURL',
        jasmine.objectContaining({
          searchParams: jasmine.arrayContaining([
            jasmine.objectContaining({ fieldName: 'q', fieldValue: id }),
            jasmine.objectContaining({ fieldName: 'projection', fieldValue: 'full' }),
            jasmine.objectContaining({ fieldName: 'projection', fieldValue: 'detailed' }),
          ]),
        }),
        ...linksToFollow,
      );
    });

    it('should call findByHref with the href observable returned from getSearchByHref', () => {
      itemDataService.findByCustomUrl(id, true, false, linksToFollow, projections).subscribe();

      expect(findByHrefSpy).toHaveBeenCalledWith(fakeHrefObs, true, false, ...linksToFollow);
    });
  });

  describe('findById', () => {
    let itemDataService: ItemDataService;

    beforeEach(() => {
      itemDataService = new ItemDataService(
        requestService,
        rdbService,
        objectCache,
        halEndpointService,
        notificationsService,
        comparator,
        browseService,
        bundleService,
        null,
      );
      spyOn(itemDataService, 'findByCustomUrl').and.returnValue(createSuccessfulRemoteDataObject$(new Item()));
      spyOn(itemDataService, 'findByHref').and.returnValue(createSuccessfulRemoteDataObject$(new Item()));
      spyOn(itemDataService as any, 'getIDHrefObs').and.returnValue(of('uuid-href'));
    });

    it('should call findByHref when given a valid UUID', () => {
      const validUuid = '4af28e99-6a9c-4036-a199-e1b587046d39';
      itemDataService.findById(validUuid).subscribe();

      expect((itemDataService as any).getIDHrefObs).toHaveBeenCalledWith(encodeURIComponent(validUuid));
      expect(itemDataService.findByHref).toHaveBeenCalled();
      expect(itemDataService.findByCustomUrl).not.toHaveBeenCalled();
    });

    it('should call findByCustomUrl when given a non-UUID id', () => {
      const nonUuid = 'custom-url';
      itemDataService.findByIdOrCustomUrl(nonUuid).subscribe();

      expect(itemDataService.findByCustomUrl).toHaveBeenCalledWith(nonUuid, true, true, []);
      expect(itemDataService.findByHref).not.toHaveBeenCalled();
    });
  });


});
