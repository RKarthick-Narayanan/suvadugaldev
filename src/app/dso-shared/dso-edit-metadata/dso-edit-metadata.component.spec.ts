import { CommonModule } from '@angular/common';
import {
  DebugElement,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  BrowserModule,
  By,
} from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@dspace/core/auth/auth.service';
import { ArrayMoveChangeAnalyzer } from '@dspace/core/data/array-move-change-analyzer.service';
import { AuthorizationDataService } from '@dspace/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '@dspace/core/data/feature-authorization/feature-id';
import { ItemDataService } from '@dspace/core/data/item-data.service';
import { APP_DATA_SERVICES_MAP } from '@dspace/core/data-services-map-type';
import { NotificationsService } from '@dspace/core/notification-system/notifications.service';
import { Collection } from '@dspace/core/shared/collection.model';
import { COLLECTION } from '@dspace/core/shared/collection.resource-type';
import { DSpaceObject } from '@dspace/core/shared/dspace-object.model';
import { Item } from '@dspace/core/shared/item.model';
import { ITEM } from '@dspace/core/shared/item.resource-type';
import { MetadataValue } from '@dspace/core/shared/metadata.models';
import { MetadataSecurityConfigurationService } from '@dspace/core/submission/metadatasecurityconfig-data.service';
import { MetadataSecurityConfiguration } from '@dspace/core/submission/models/metadata-security-configuration';
import { ActivatedRouteStub } from '@dspace/core/testing/active-router.stub';
import { TestDataService } from '@dspace/core/testing/test-data-service.mock';
import {
  createFailedRemoteDataObject$,
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$,
} from '@dspace/core/utilities/remote-data.utils';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  of,
  Subject,
  throwError,
} from 'rxjs';
import { mockSecurityConfig } from 'src/app/submission/utils/submission.mock';

import { AlertComponent } from '../../shared/alert/alert.component';
import { BtnDisabledDirective } from '../../shared/btn-disabled.directive';
import { ThemedLoadingComponent } from '../../shared/loading/themed-loading.component';
import { VarDirective } from '../../shared/utils/var.directive';
import { DsoEditMetadataComponent } from './dso-edit-metadata.component';
import { DsoEditMetadataFieldValuesComponent } from './dso-edit-metadata-field-values/dso-edit-metadata-field-values.component';
import { DsoEditMetadataChangeType } from './dso-edit-metadata-form';
import { DsoEditMetadataHeadersComponent } from './dso-edit-metadata-headers/dso-edit-metadata-headers.component';
import { DsoEditMetadataValueComponent } from './dso-edit-metadata-value/dso-edit-metadata-value.component';
import { DsoEditMetadataValueHeadersComponent } from './dso-edit-metadata-value-headers/dso-edit-metadata-value-headers.component';
import { MetadataFieldSelectorComponent } from './metadata-field-selector/metadata-field-selector.component';

const ADD_BTN = 'add';
const REINSTATE_BTN = 'reinstate';
const SAVE_BTN = 'save';
const DISCARD_BTN = 'discard';

const mockDataServiceMap: any = new Map([
  [ITEM.value, () => import('@dspace/core/testing/test-data-service.mock').then(m => m.TestDataService)],
]);

const metadataSecurityConfigDataServiceSpy = jasmine.createSpyObj('metadataSecurityConfigDataService', {
  findById: createSuccessfulRemoteDataObject$(mockSecurityConfig),
});

describe('DsoEditMetadataComponent', () => {
  let component: DsoEditMetadataComponent;
  let fixture: ComponentFixture<DsoEditMetadataComponent>;

  let notificationsService: NotificationsService;

  let dso: DSpaceObject;
  let metadataRead: jasmine.Spy;
  let authenticated$: BehaviorSubject<boolean>;
  let userId$: BehaviorSubject<string>;
  let canEdit: jasmine.Spy;
  let route: ActivatedRouteStub;

  beforeEach(waitForAsync(() => {
    dso = Object.assign(new Item(), {
      type: ITEM,
      _links: { self: { href: 'https://rest.example/api/core/items/test-item' } },
      metadata: {
        'dc.title': [
          Object.assign(new MetadataValue(), {
            value: 'Test Title',
            language: 'en',
            place: 0,
          }),
        ],
        'dc.subject': [
          Object.assign(new MetadataValue(), {
            value: 'Subject One',
            language: 'en',
            place: 0,
          }),
          Object.assign(new MetadataValue(), {
            value: 'Subject Two',
            language: 'en',
            place: 1,
          }),
          Object.assign(new MetadataValue(), {
            value: 'Subject Three',
            language: 'en',
            place: 2,
          }),
        ],
      },
    });

    metadataRead = jasmine.createSpy('getAllLanguagesMetadata');
    authenticated$ = new BehaviorSubject(true);
    userId$ = new BehaviorSubject('editor');
    canEdit = jasmine.createSpy('isAuthorized').and.returnValue(of(true));
    route = new ActivatedRouteStub();
    route.parent = new ActivatedRouteStub();

    notificationsService = jasmine.createSpyObj('notificationsService', [
      'error',
      'success',
    ]);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserModule,
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        DsoEditMetadataComponent,
        VarDirective,
        BtnDisabledDirective,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: ItemDataService, useValue: { getAllLanguagesMetadata: metadataRead } },
        { provide: AuthorizationDataService, useValue: { isAuthorized: canEdit } },
        { provide: AuthService, useValue: {
          getAuthenticatedUserIdFromStore: () => userId$,
          isAuthenticated: () => authenticated$,
        } },
        { provide: APP_DATA_SERVICES_MAP, useValue: mockDataServiceMap },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: MetadataSecurityConfigurationService, useValue: metadataSecurityConfigDataServiceSpy },
        ArrayMoveChangeAnalyzer,
        TestDataService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(DsoEditMetadataComponent, {
        remove: {
          imports: [
            DsoEditMetadataValueComponent,
            DsoEditMetadataHeadersComponent,
            MetadataFieldSelectorComponent,
            DsoEditMetadataValueHeadersComponent,
            DsoEditMetadataFieldValuesComponent,
            AlertComponent,
            ThemedLoadingComponent,
          ],
        },
      })
      .compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(DsoEditMetadataComponent);
    component = fixture.componentInstance;
    component.dso = dso;
    fixture.detectChanges();
  }));

  describe('archived item multilingual editing', () => {
    const values = [
      Object.assign(new MetadataValue(), { value: 'Tamil text', language: 'ta', place: 0, authority: 'authority', confidence: 600, securityLevel: 1 }),
      Object.assign(new MetadataValue(), { value: 'English text', language: 'en', place: 1, authority: null, confidence: -1 }),
      Object.assign(new MetadataValue(), { value: 'Neutral text', language: null, place: 2 }),
    ];
    const projection = { 'dc.title': values };
    let patch: jasmine.Spy;

    function openEditor(archived = true): void {
      fixture.destroy();
      fixture = TestBed.createComponent(DsoEditMetadataComponent);
      component = fixture.componentInstance;
      Object.assign(dso, { isArchived: archived });
      (route.parent as ActivatedRouteStub).testData = { dso: createSuccessfulRemoteDataObject(dso) };
      const snapshot = route.snapshot;
      spyOnProperty(route, 'snapshot').and.returnValue({
        ...snapshot, routeConfig: { data: { editAllMetadataLanguages: true } },
      } as any);
      patch = jasmine.createSpy('patch').and.returnValue(createSuccessfulRemoteDataObject$(dso));
      component.updateDataService = { patch } as any;
      fixture.detectChanges();
    }

    it('waits for the projection, edits one language by original position and rereads after PATCH', () => {
      const initial = new Subject<typeof projection>();
      const refresh = new Subject<typeof projection>();
      metadataRead.and.returnValues(initial, refresh);
      openEditor();
      expect(metadataRead).toHaveBeenCalledOnceWith(dso, { forEditing: true });
      expect(component.form).toBeUndefined();
      initial.next(projection);
      expect(component.form.fields['dc.title'].map((entry) => entry.originalValue.language)).toEqual(['ta', 'en', null]);
      const tamil = component.form.fields['dc.title'][0];
      tamil.newValue.value = 'Updated Tamil';
      tamil.confirmChanges();
      component.onValueSaved();
      component.submit();
      expect(patch).toHaveBeenCalledOnceWith(dso, [{ op: 'replace', path: '/metadata/dc.title/0',
        value: { value: 'Updated Tamil', language: 'ta', authority: 'authority', confidence: 600, securityLevel: 1 },
      }]);
      expect(component.form).toBeUndefined();
      expect(component.isFormInitialized$.value).toBeFalse();
      refresh.next({ 'dc.title': [tamil.newValue, ...values.slice(1)] });
      expect(component.form.fields['dc.title'][0].originalValue.value).toBe('Updated Tamil');
      expect(component.form.fields['dc.title'][1].originalValue).toBe(values[1]);
      expect(component.hasChanges).toBeFalse();
    });

    it('keeps editing closed on initial failure and retries the read', () => {
      metadataRead.and.returnValues(throwError(() => new Error('unsafe positions')), of(projection));
      openEditor();
      expect(component.metadataReadError).toBeTrue();
      expect(component.savedBeforeMetadataRefresh).toBeFalse();
      expect(component.isFormInitialized$.value).toBeFalse();
      component.submit();
      component.retryMetadataRead();
      expect(patch).not.toHaveBeenCalled();
      expect(component.isFormInitialized$.value).toBeTrue();
    });

    it('retains unsaved changes after a failed PATCH', () => {
      metadataRead.and.returnValue(of(projection));
      openEditor();
      patch.and.returnValue(createFailedRemoteDataObject$('PATCH failed', 409));
      component.form.fields['dc.title'][1].change = DsoEditMetadataChangeType.REMOVE;
      component.onValueSaved();
      component.submit();
      expect(patch.calls.mostRecent().args[1]).toEqual([{ op: 'remove', path: '/metadata/dc.title/1' }]);
      expect(notificationsService.error).toHaveBeenCalled();
      expect(metadataRead).toHaveBeenCalledTimes(1);
      expect(component.isFormInitialized$.value).toBeTrue();
      expect(component.hasChanges).toBeTrue();
    });

    it('reports a saved PATCH separately from a failed refresh and retries without patching', () => {
      metadataRead.and.returnValues(of(projection), throwError(() => new Error('refresh failed')), of(projection));
      openEditor();
      component.form.fields['dc.title'][1].change = DsoEditMetadataChangeType.REMOVE;
      component.onValueSaved();
      component.submit();
      expect(notificationsService.success).toHaveBeenCalled();
      expect(component.savedBeforeMetadataRefresh).toBeTrue();
      expect(component.metadataReadError).toBeTrue();
      expect(component.form).toBeUndefined();
      component.submit();
      component.retryMetadataRead();
      expect(patch).toHaveBeenCalledTimes(1);
      expect(metadataRead).toHaveBeenCalledTimes(3);
      expect(component.isFormInitialized$.value).toBeTrue();
    });

    it('drops a pending read and hides saved metadata when the same ID signs out', () => {
      const pending = new Subject<typeof projection>();
      metadataRead.and.returnValues(pending, of(projection));
      openEditor();
      expect(pending.observed).toBeTrue();
      authenticated$.next(false);
      expect(pending.observed).toBeFalse();
      expect(component.form).toBeUndefined();
      authenticated$.next(true);
      expect(component.isFormInitialized$.value).toBeTrue();
      authenticated$.next(false);
      expect(component.form).toBeUndefined();
      expect(component.isFormInitialized$.value).toBeFalse();
    });

    function editAndSave(index: number, text: string): void {
      const entry = component.form.fields['dc.title'][index];
      entry.newValue.value = text;
      entry.confirmChanges();
      component.onValueSaved();
      component.submit();
    }

    it('requires fresh edit permission for a new signed-in identity before reading or saving', () => {
      const permission = new Subject<boolean>();
      canEdit.and.returnValues(of(true), permission, of(true));
      metadataRead.and.returnValue(of(projection));
      openEditor();
      expect(canEdit).toHaveBeenCalledOnceWith(FeatureID.CanEditMetadata, dso.self, undefined, false, false);

      userId$.next('reader');
      expect(component.form).toBeUndefined();
      expect(metadataRead).toHaveBeenCalledTimes(1);
      permission.next(false);
      component.submit();
      expect(component.editingPermissionDenied).toBeTrue();
      expect(patch).not.toHaveBeenCalled();

      userId$.next('another-editor');
      expect(component.editingPermissionDenied).toBeFalse();
      expect(component.isFormInitialized$.value).toBeTrue();
      expect(metadataRead).toHaveBeenCalledTimes(2);
    });

    it('waits for the authenticated identity before checking permission', () => {
      userId$.next(undefined);
      metadataRead.and.returnValue(of(projection));
      openEditor();
      expect(canEdit).not.toHaveBeenCalled();
      expect(metadataRead).not.toHaveBeenCalled();
      expect(component.form).toBeUndefined();

      userId$.next('editor');
      expect(canEdit).toHaveBeenCalledTimes(1);
      expect(component.isFormInitialized$.value).toBeTrue();
    });

    it('closes editing when a PATCH reports revoked permission', () => {
      metadataRead.and.returnValue(of(projection));
      openEditor();
      patch.and.returnValue(createFailedRemoteDataObject$('Forbidden', 403));
      editAndSave(0, 'Rejected');
      expect(component.editingPermissionDenied).toBeTrue();
      expect(component.form).toBeUndefined();
      expect(metadataRead).toHaveBeenCalledTimes(1);
    });

    for (const transition of ['navigation', 'identity change', 'destroy']) {
      it(`ignores the outstanding PATCH response after ${transition}`, () => {
        const response = new Subject();
        metadataRead.and.returnValue(of(projection));
        openEditor();
        patch.and.returnValue(response);
        editAndSave(0, 'Pending');
        expect(response.observed).toBeTrue();
        const replacement = Object.assign(new Item(), dso, { uuid: 'replacement' });
        if (transition === 'navigation') {
          (route.parent as ActivatedRouteStub).testData = { dso: createSuccessfulRemoteDataObject(replacement) };
          expect(metadataRead).toHaveBeenCalledWith(replacement, { forEditing: true });
        } else if (transition === 'identity change') {
          canEdit.and.returnValue(of(false));
          userId$.next('reader');
          expect(component.form).toBeUndefined();
        } else {
          fixture.destroy();
        }

        expect(response.observed).toBeFalse();
        const reads = metadataRead.calls.count();
        response.next(createSuccessfulRemoteDataObject(dso));
        expect(notificationsService.success).not.toHaveBeenCalled();
        expect(metadataRead).toHaveBeenCalledTimes(reads);
        expect(patch).toHaveBeenCalledTimes(1);
      });
    }

    it('uses the fresh positions and attributes for two successive saves in the same editor', () => {
      const refreshed = {
        'dc.title': [Object.assign(new MetadataValue(), values[1], { place: 0 }),
          Object.assign(new MetadataValue(), values[0], { place: 1, value: 'First save' }), values[2]],
      };
      metadataRead.and.returnValues(of(projection), of(refreshed), of(refreshed));
      openEditor();
      editAndSave(0, 'First save');
      expect(component.form.fields['dc.title'][1].originalValue).toBe(refreshed['dc.title'][1]);
      editAndSave(1, 'Second save');
      expect(patch.calls.allArgs().map(([, operations]) => operations[0].path)).toEqual(['/metadata/dc.title/0', '/metadata/dc.title/1']);
      expect(patch.calls.mostRecent().args[1][0].value).toEqual({
        value: 'Second save', language: 'ta', authority: 'authority', confidence: 600, securityLevel: 1,
      });
      expect(metadataRead).toHaveBeenCalledTimes(3);
    });

    it('keeps the existing form for a non-archived item', () => {
      openEditor(false);
      expect(metadataRead).not.toHaveBeenCalled();
      expect(component.form.fields['dc.title'][0].originalValue.value).toBe('Test Title');
    });
  });

  it('rebuilds a collection form from its PATCH response without requesting an item projection', () => {
    fixture.destroy();
    fixture = TestBed.createComponent(DsoEditMetadataComponent);
    component = fixture.componentInstance;
    const collection = Object.assign(new Collection(), { type: COLLECTION, metadata: dso.metadata });
    const response = Object.assign(new Collection(), collection, { metadata: { 'dc.title': [
      Object.assign(new MetadataValue(), { value: 'Saved collection', language: 'en', place: 0 }),
    ] } });
    const patch = jasmine.createSpy('patch').and.returnValue(createSuccessfulRemoteDataObject$(response));
    component.dso = collection;
    component.updateDataService = { patch } as any;
    fixture.detectChanges();
    const title = component.form.fields['dc.title'][0];
    title.newValue.value = 'Saved collection';
    title.confirmChanges();
    component.onValueSaved();
    component.submit();
    expect(patch).toHaveBeenCalledOnceWith(collection, jasmine.any(Array));
    expect(metadataRead).not.toHaveBeenCalled();
    expect(canEdit).not.toHaveBeenCalled();
    expect(component.form.fields['dc.title'][0].originalValue.value).toBe('Saved collection');
  });

  it('should set security configuration object', () => {
    expect(component.securitySettings$.value).toEqual(mockSecurityConfig);
  });

  describe('when no changes have been made', () => {
    assertButton(ADD_BTN, true, false);
    assertButton(REINSTATE_BTN, false);
    assertButton(SAVE_BTN, true, true);
    assertButton(DISCARD_BTN, true, true);
  });

  describe('when the form contains changes', () => {
    beforeEach(() => {
      component.form.fields['dc.title'][0].newValue.value = 'Updated Title Once';
      component.form.fields['dc.title'][0].confirmChanges();
      component.form.resetReinstatable();
      component.onValueSaved();
      fixture.detectChanges();
    });

    assertButton(SAVE_BTN, true, false);
    assertButton(DISCARD_BTN, true, false);

    describe('and they were discarded', () => {
      beforeEach(() => {
        component.discard();
        fixture.detectChanges();
      });

      assertButton(REINSTATE_BTN, true, false);
      assertButton(SAVE_BTN, true, true);
      assertButton(DISCARD_BTN, false);

      describe('and a new change is made', () => {
        beforeEach(() => {
          component.form.fields['dc.title'][0].newValue.value = 'Updated Title Twice';
          component.form.fields['dc.title'][0].confirmChanges();
          component.form.resetReinstatable();
          component.onValueSaved();
          fixture.detectChanges();
        });

        assertButton(REINSTATE_BTN, false);
        assertButton(SAVE_BTN, true, false);
        assertButton(DISCARD_BTN, true, false);
      });
    });
  });

  describe('when a new value is present', () => {
    beforeEach(() => {
      component.add();
      fixture.detectChanges();
    });

    assertButton(ADD_BTN, true, true);

    it('should display a row with a field selector and metadata value', () => {
      expect(fixture.debugElement.query(By.css('ds-metadata-field-selector'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('ds-dso-edit-metadata-value'))).toBeTruthy();
    });

    describe('and gets assigned to a metadata field', () => {
      beforeEach(() => {
        component.form.newValue.newValue.value = 'New Subject';
        component.form.setMetadataField('dc.subject');
        component.form.resetReinstatable();
        component.onValueSaved();
        fixture.detectChanges();
      });

      assertButton(ADD_BTN, true, false);

      it('should not display the separate row with field selector and metadata value anymore', () => {
        expect(fixture.debugElement.query(By.css('ds-metadata-field-selector'))).toBeNull();
        expect(fixture.debugElement.query(By.css('ds-dso-edit-metadata-value'))).toBeNull();
      });
    });

    it('should fetch security settings for Item', () => {
      component.dso = Object.assign(new Item(), {
        ...dso,
        entityType: 'Person',
      });
      component.getSecuritySettings().subscribe((securitySettings: MetadataSecurityConfiguration) => {
        expect(securitySettings).toBeDefined();
      });
    });
  });

  function assertButton(name: string, exists: boolean, disabled: boolean = false): void {
    describe(`${name} button`, () => {
      let btn: DebugElement;

      beforeEach(waitForAsync(() => {
        fixture.detectChanges();
        btn = fixture.debugElement.query(By.css(`#dso-${name}-btn`));
      }));

      if (exists) {
        it('form should be initialized', waitForAsync(() => {
          expect(component.isFormInitialized$.value).toBeTrue();
        }));

        it('should exist', waitForAsync(() => {
          expect(btn).toBeTruthy();
        }));

        it(`should${disabled ? ' ' : ' not '}be disabled`, () => {
          if (disabled) {
            expect(btn.nativeElement.getAttribute('aria-disabled')).toBe('true');
            expect(btn.nativeElement.classList.contains('disabled')).toBeTrue();
          } else {
            expect(btn.nativeElement.getAttribute('aria-disabled')).not.toBe('true');
            expect(btn.nativeElement.classList.contains('disabled')).toBeFalse();
          }
        });
      } else {
        it('should not exist', waitForAsync(() => {
          expect(btn).toBeNull();
        }));
      }
    });
  }

});
