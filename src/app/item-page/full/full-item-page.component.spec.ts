import {
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
  PLATFORM_ID,
} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@dspace/core/auth/auth.service';
import { NotifyInfoService } from '@dspace/core/coar-notify/notify-info/notify-info.service';
import { AuthorizationDataService } from '@dspace/core/data/feature-authorization/authorization-data.service';
import { ItemDataService } from '@dspace/core/data/item-data.service';
import { RemoteData } from '@dspace/core/data/remote-data';
import { SignpostingDataService } from '@dspace/core/data/signposting-data.service';
import { HeadTagService } from '@dspace/core/metadata/head-tag.service';
import { HardRedirectService } from '@dspace/core/services/hard-redirect.service';
import { LinkHeadService } from '@dspace/core/services/link-head.service';
import { ServerResponseService } from '@dspace/core/services/server-response.service';
import { Item } from '@dspace/core/shared/item.model';
import { ActivatedRouteStub } from '@dspace/core/testing/active-router.stub';
import { HeadTagServiceMock } from '@dspace/core/testing/head-tag-service.mock';
import { TranslateLoaderMock } from '@dspace/core/testing/translate-loader.mock';
import { createPaginatedList } from '@dspace/core/testing/utils.test';
import {
  createFailedRemoteDataObject,
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$,
} from '@dspace/core/utilities/remote-data.utils';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import {
  BehaviorSubject,
  of,
  Subject,
  throwError,
} from 'rxjs';

import { DsoEditMenuComponent } from '../../shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { ThemedLoadingComponent } from '../../shared/loading/themed-loading.component';
import { getMockThemeService } from '../../shared/theme-support/test/theme-service.mock';
import { ThemeService } from '../../shared/theme-support/theme.service';
import { TruncatePipe } from '../../shared/utils/truncate.pipe';
import { VarDirective } from '../../shared/utils/var.directive';
import { ROUTES as workflowRoutes } from '../../workflowitems-edit-page/workflowitems-edit-page-routes';
import { ROUTES as workspaceRoutes } from '../../workspaceitems-edit-page/workspaceitems-edit-page-routes';
import { ThemedItemAlertsComponent } from '../alerts/themed-item-alerts.component';
import { CollectionsComponent } from '../field-components/collections/collections.component';
import { ROUTES as itemRoutes } from '../item-page-routes';
import { ITEM_ACCESS_BY_TOKEN_PATH } from '../item-page-routing-paths';
import { ThemedItemPageTitleFieldComponent } from '../simple/field-components/specific-field/title/themed-item-page-field.component';
import { createRelationshipsObservable } from '../simple/item-types/shared/item.component.spec';
import { ItemVersionsComponent } from '../versions/item-versions.component';
import { ItemVersionsNoticeComponent } from '../versions/notice/item-versions-notice.component';
import { ThemedFullFileSectionComponent } from './field-components/file-section/themed-full-file-section.component';
import { FullItemPageComponent } from './full-item-page.component';
import { ThemedFullItemPageComponent } from './themed-full-item-page.component';

const mockItem: Item = Object.assign(new Item(), {
  bundles: createSuccessfulRemoteDataObject$(createPaginatedList([])),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'test item',
      },
    ],
  },
});

const mockWithdrawnItem: Item = Object.assign(new Item(), {
  bundles: createSuccessfulRemoteDataObject$(createPaginatedList([])),
  metadata: [],
  relationships: createRelationshipsObservable(),
  isWithdrawn: true,
});

describe('FullItemPageComponent', () => {
  let comp: FullItemPageComponent;
  let fixture: ComponentFixture<FullItemPageComponent>;

  let routeStub: ActivatedRouteStub;
  let routeData;
  let userId$: BehaviorSubject<string>;
  let authorizationDataService: AuthorizationDataService;
  let serverResponseService: jasmine.SpyObj<ServerResponseService>;
  let signpostingDataService: jasmine.SpyObj<SignpostingDataService>;
  let linkHeadService: jasmine.SpyObj<LinkHeadService>;
  let notifyInfoService: jasmine.SpyObj<NotifyInfoService>;
  let headTagService: HeadTagServiceMock;

  const mocklink = {
    href: 'http://test.org',
    rel: 'test',
    type: 'test',
  };

  const mocklink2 = {
    href: 'http://test2.org',
    rel: 'test',
    type: 'test',
  };

  beforeEach(waitForAsync(() => {
    userId$ = new BehaviorSubject<string>(null);
    routeData = {
      dso: createSuccessfulRemoteDataObject(mockItem),
      links: [mocklink, mocklink2],
    };

    routeStub = Object.assign(new ActivatedRouteStub(), {
      data: of(routeData),
    });

    authorizationDataService = jasmine.createSpyObj('authorizationDataService', {
      isAuthorized: of(false),
    });

    serverResponseService = jasmine.createSpyObj('ServerResponseService', {
      setHeader: jasmine.createSpy('setHeader'),
    });

    signpostingDataService = jasmine.createSpyObj('SignpostingDataService', {
      getLinks: of([mocklink, mocklink2]),
    });

    linkHeadService = jasmine.createSpyObj('LinkHeadService', {
      addTag: jasmine.createSpy('setHeader'),
      removeTag: jasmine.createSpy('removeTag'),
    });

    notifyInfoService = jasmine.createSpyObj('NotifyInfoService', {
      isCoarConfigEnabled: of(true),
      getCoarLdnLocalInboxUrls: of(['http://test.org']),
      getInboxRelationLink: of('http://test.org'),
    });

    headTagService = new HeadTagServiceMock();

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock,
        },
      }), RouterTestingModule.withRoutes([]), BrowserAnimationsModule, FullItemPageComponent, TruncatePipe, VarDirective],
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: ItemDataService, useValue: {} },
        { provide: AuthService, useValue: { getAuthenticatedUserIdFromStore: () => userId$, isAuthenticated: () => of(false) } },
        { provide: HeadTagService, useValue: headTagService },
        { provide: AuthorizationDataService, useValue: authorizationDataService },
        { provide: ServerResponseService, useValue: serverResponseService },
        { provide: SignpostingDataService, useValue: signpostingDataService },
        { provide: LinkHeadService, useValue: linkHeadService },
        { provide: NotifyInfoService, useValue: notifyInfoService },
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: ThemeService, useValue: getMockThemeService() },
        { provide: HardRedirectService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(FullItemPageComponent, {
        remove: {
          imports: [
            ItemVersionsComponent,
            ItemVersionsNoticeComponent,
            ThemedLoadingComponent,
            ThemedItemPageTitleFieldComponent,
            DsoEditMenuComponent,
            ThemedItemAlertsComponent,
            CollectionsComponent,
            ThemedFullFileSectionComponent,
          ],
        },
        add: { changeDetection: ChangeDetectionStrategy.Default },
      }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(FullItemPageComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  }));

  afterEach(() => {
    fixture.debugElement.nativeElement.remove();
  });

  it('loads projected metadata only on the opted-in route and renders all languages', () => {
    const projected = { 'dc.title': [{ value: 'English', language: 'en' }, { value: 'தமிழ்', language: 'ta' }, { value: 'Neutral', language: null }] };
    const service = TestBed.inject(ItemDataService) as any;
    service.getAllLanguagesMetadata = jasmine.createSpy('getAllLanguagesMetadata').and.returnValue(of(projected));
    const read = service.getAllLanguagesMetadata;
    const snapshot = routeStub.snapshot;
    spyOnProperty(routeStub, 'snapshot').and.returnValue({ ...snapshot, routeConfig: { data: { allLanguagesMetadata: true } }, queryParams: {} } as any);
    comp.ngOnInit();
    fixture.detectChanges();
    expect(read).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('table').textContent).toContain('English');
    expect(fixture.nativeElement.querySelector('table').textContent).toContain('தமிழ்');
    expect(fixture.nativeElement.querySelector('table').textContent).toContain('Neutral');
    expect(fixture.nativeElement.querySelector('table').textContent).toContain('—');
  });

  it('shows loading until the projected request completes', () => {
    const response = new Subject<any>();
    const service = TestBed.inject(ItemDataService) as any;
    service.getAllLanguagesMetadata = jasmine.createSpy('getAllLanguagesMetadata').and.returnValue(response);
    const snapshot = routeStub.snapshot;
    spyOnProperty(routeStub, 'snapshot').and.returnValue({ ...snapshot, routeConfig: { data: { allLanguagesMetadata: true } }, queryParams: {} } as any);
    comp.ngOnInit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    response.next({ 'dc.title': [{ value: 'தமிழ்', language: 'ta' }] });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table').textContent).toContain('தமிழ்');
  });

  it('shows an error rather than incomplete metadata when the projection fails', () => {
    const service = TestBed.inject(ItemDataService) as any;
    service.getAllLanguagesMetadata = jasmine.createSpy('getAllLanguagesMetadata').and.returnValue(throwError(() => new Error('failed')));
    const snapshot = routeStub.snapshot;
    spyOnProperty(routeStub, 'snapshot').and.returnValue({ ...snapshot, routeConfig: { data: { allLanguagesMetadata: true } }, queryParams: {} } as any);
    comp.ngOnInit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('item.page.metadata.error');
  });

  it('clears and reloads projected metadata when the signed-in user changes', () => {
    const response = new Subject<any>();
    const service = TestBed.inject(ItemDataService) as any;
    service.getAllLanguagesMetadata = jasmine.createSpy('getAllLanguagesMetadata').and.returnValues(
      of({ 'dc.title': [{ value: 'Private', language: 'en' }] }), response,
    );
    const snapshot = routeStub.snapshot;
    spyOnProperty(routeStub, 'snapshot').and.returnValue({ ...snapshot, routeConfig: { data: { allLanguagesMetadata: true } } } as any);
    comp.ngOnInit();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Private');
    userId$.next('another-user');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Private');
    expect(service.getAllLanguagesMetadata).toHaveBeenCalledTimes(2);
  });

  it('cancels the previous item read when the Full Item route is reused', () => {
    const pending = new Subject<any>();
    const replacement = Object.assign(new Item(), mockItem, { uuid: 'replacement' });
    const routeData$ = new BehaviorSubject(routeData);
    Object.assign(routeStub, { data: routeData$ });
    const service = TestBed.inject(ItemDataService);
    service.getAllLanguagesMetadata = jasmine.createSpy().and.returnValues(
      pending, of({ 'dc.title': [{ value: 'Replacement', language: 'en' }] }),
    );
    const snapshot = routeStub.snapshot;
    spyOnProperty(routeStub, 'snapshot').and.returnValue({
      ...snapshot, routeConfig: itemRoutes.find((route) => route.path === ':id').children.find((route) => route.path === 'full'),
    } as any);
    comp.ngOnInit();
    fixture.detectChanges();
    expect(pending.observed).toBeTrue();

    routeData$.next({ ...routeData, dso: createSuccessfulRemoteDataObject(replacement) });
    fixture.detectChanges();
    expect(pending.observed).toBeFalse();
    expect(service.getAllLanguagesMetadata).toHaveBeenCalledWith(replacement);
    expect(service.getAllLanguagesMetadata).toHaveBeenCalledTimes(2);
    pending.next({ 'dc.title': [{ value: 'Stale', language: 'en' }] });
    expect(fixture.nativeElement.querySelector('table').textContent).toContain('Replacement');
    expect(fixture.nativeElement.querySelector('table').textContent).not.toContain('Stale');
  });

  it('cancels the read when the current item becomes unavailable', () => {
    const pending = new Subject<any>();
    const routeData$ = new BehaviorSubject(routeData);
    Object.assign(routeStub, { data: routeData$ });
    const service = TestBed.inject(ItemDataService);
    service.getAllLanguagesMetadata = jasmine.createSpy().and.returnValue(pending);
    const snapshot = routeStub.snapshot;
    spyOnProperty(routeStub, 'snapshot').and.returnValue({
      ...snapshot, routeConfig: itemRoutes.find((route) => route.path === ':id').children.find((route) => route.path === 'full'),
    } as any);
    comp.ngOnInit();
    fixture.detectChanges();
    expect(pending.observed).toBeTrue();

    routeData$.next({ ...routeData, dso: createFailedRemoteDataObject() });
    expect(pending.observed).toBeFalse();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    expect(service.getAllLanguagesMetadata).toHaveBeenCalledTimes(1);
  });

  for (const variant of [
    { name: 'workspace', routes: workspaceRoutes, submissionKey: 'wsi' },
    { name: 'workflow', routes: workflowRoutes, submissionKey: 'wfi' },
    { name: 'token', routes: itemRoutes, path: ITEM_ACCESS_BY_TOKEN_PATH },
  ]) {
    it(`keeps the resolved metadata and existing controls on the ${variant.name} Full Item route`, () => {
      const routeConfig = variant.routes.find((route) => route.path === ':id').children
        .find((route) => route.component === ThemedFullItemPageComponent && (!variant.path || route.path === variant.path));
      const snapshot = routeStub.snapshot;
      spyOnProperty(routeStub, 'snapshot').and.returnValue({ ...snapshot, routeConfig } as any);
      if (variant.submissionKey) {
        routeData[variant.submissionKey] = createSuccessfulRemoteDataObject$({ id: 'submission' });
      }
      const service = TestBed.inject(ItemDataService);
      service.getAllLanguagesMetadata = jasmine.createSpy();
      comp.ngOnInit();
      fixture.detectChanges();

      expect(routeConfig).toBeDefined();
      expect(service.getAllLanguagesMetadata).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('table').textContent).toContain('test item');
      expect(comp.fromSubmissionObject).toBe(!!variant.submissionKey);
      expect(!!fixture.nativeElement.querySelector('.simple-view-link')).toBe(!variant.submissionKey);
    });
  }

  it('does not request the projection for token access', () => {
    const service = TestBed.inject(ItemDataService) as any;
    service.getAllLanguagesMetadata = jasmine.createSpy('getAllLanguagesMetadata');
    const snapshot = routeStub.snapshot;
    spyOnProperty(routeStub, 'snapshot').and.returnValue({ ...snapshot, routeConfig: { data: { allLanguagesMetadata: true } }, queryParams: { accessToken: 'token' } } as any);
    comp.ngOnInit();
    fixture.detectChanges();
    expect(service.getAllLanguagesMetadata).not.toHaveBeenCalled();
  });

  it('should display the item\'s metadata', () => {
    const table = fixture.debugElement.query(By.css('table'));
    for (const metadatum of mockItem.allMetadata(Object.keys(mockItem.metadata))) {
      expect(table.nativeElement.innerHTML).toContain(metadatum.value);
    }
  });

  it('should show simple view button when not originated from workflow item', () => {
    expect(comp.fromSubmissionObject).toBe(false);
    const simpleViewBtn = fixture.debugElement.query(By.css('.simple-view-link'));
    expect(simpleViewBtn).toBeTruthy();
  });

  it('should not show simple view button when originated from workflow', fakeAsync(() => {
    routeData.wfi = createSuccessfulRemoteDataObject$({ id: 'wfiId' });
    comp.ngOnInit();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(comp.fromSubmissionObject).toBe(true);
      const simpleViewBtn = fixture.debugElement.query(By.css('.simple-view-link'));
      expect(simpleViewBtn).toBeFalsy();
    });
  }));

  describe('when the item is withdrawn and the user is an admin', () => {
    beforeEach(() => {
      comp.isAdmin$ = of(true);
      comp.itemRD$ = new BehaviorSubject<RemoteData<Item>>(createSuccessfulRemoteDataObject(mockWithdrawnItem));
      fixture.detectChanges();
    });

    it('should display the item', () => {
      const objectLoader = fixture.debugElement.query(By.css('.full-item-info'));
      expect(objectLoader.nativeElement).not.toBeNull();
    });

    it('should add the signposting links', () => {
      expect(serverResponseService.setHeader).toHaveBeenCalled();
      expect(linkHeadService.addTag).toHaveBeenCalledTimes(3);
    });
  });
  describe('when the item is withdrawn and the user is not an admin', () => {
    beforeEach(() => {
      comp.itemRD$ = new BehaviorSubject<RemoteData<Item>>(createSuccessfulRemoteDataObject(mockWithdrawnItem));
      fixture.detectChanges();
    });

    it('should not display the item', () => {
      const objectLoader = fixture.debugElement.query(By.css('.full-item-info'));
      expect(objectLoader).toBeNull();
    });
  });

  describe('when the item is not withdrawn and the user is an admin', () => {
    beforeEach(() => {
      comp.isAdmin$ = of(true);
      comp.itemRD$ = new BehaviorSubject<RemoteData<Item>>(createSuccessfulRemoteDataObject(mockItem));
      fixture.detectChanges();
    });

    it('should display the item', () => {
      const objectLoader = fixture.debugElement.query(By.css('.full-item-info'));
      expect(objectLoader).not.toBeNull();
    });

    it('should add the signposting links', () => {
      expect(serverResponseService.setHeader).toHaveBeenCalled();
      expect(linkHeadService.addTag).toHaveBeenCalledTimes(3);
    });
  });

  describe('when the item is not withdrawn and the user is not an admin', () => {
    beforeEach(() => {
      comp.itemRD$ = new BehaviorSubject<RemoteData<Item>>(createSuccessfulRemoteDataObject(mockItem));
      fixture.detectChanges();
    });

    it('should display the item', () => {
      const objectLoader = fixture.debugElement.query(By.css('.full-item-info'));
      expect(objectLoader).not.toBeNull();
    });

    it('should add the signposting links', () => {
      expect(serverResponseService.setHeader).toHaveBeenCalled();
      expect(linkHeadService.addTag).toHaveBeenCalledTimes(3);
    });
  });
});
