import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ActivatedRoute,
  Data,
} from '@angular/router';
import { AuthService } from '@dspace/core/auth/auth.service';
import { DATA_SERVICE_FACTORY } from '@dspace/core/cache/builders/build-decorators';
import { ArrayMoveChangeAnalyzer } from '@dspace/core/data/array-move-change-analyzer.service';
import { HALDataService } from '@dspace/core/data/base/hal-data-service.interface';
import { AuthorizationDataService } from '@dspace/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '@dspace/core/data/feature-authorization/feature-id';
import { ItemDataService } from '@dspace/core/data/item-data.service';
import { RemoteData } from '@dspace/core/data/remote-data';
import { UpdateDataService } from '@dspace/core/data/update-data.service';
import {
  APP_DATA_SERVICES_MAP,
  LazyDataServicesMap,
} from '@dspace/core/data-services-map-type';
import { lazyDataService } from '@dspace/core/lazy-data-service';
import { NotificationsService } from '@dspace/core/notification-system/notifications.service';
import { Context } from '@dspace/core/shared/context.model';
import { DSpaceObject } from '@dspace/core/shared/dspace-object.model';
import { GenericConstructor } from '@dspace/core/shared/generic-constructor';
import { Item } from '@dspace/core/shared/item.model';
import { MetadataMap } from '@dspace/core/shared/metadata.models';
import { getFirstCompletedRemoteData } from '@dspace/core/shared/operators';
import { ResourceType } from '@dspace/core/shared/resource-type';
import { MetadataSecurityConfigurationService } from '@dspace/core/submission/metadatasecurityconfig-data.service';
import { MetadataSecurityConfiguration } from '@dspace/core/submission/models/metadata-security-configuration';
import {
  hasNoValue,
  hasValue,
  isNotEmpty,
} from '@dspace/shared/utils/empty.util';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest,
  combineLatest as observableCombineLatest,
  EMPTY,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import {
  catchError,
  defaultIfEmpty,
  map,
  switchMap,
  take,
} from 'rxjs/operators';

import { AlertComponent } from '../../shared/alert/alert.component';
import { AlertType } from '../../shared/alert/alert-type';
import { BtnDisabledDirective } from '../../shared/btn-disabled.directive';
import { ThemedLoadingComponent } from '../../shared/loading/themed-loading.component';
import { DsoEditMetadataFieldValuesComponent } from './dso-edit-metadata-field-values/dso-edit-metadata-field-values.component';
import {
  DsoEditMetadataChangeType,
  DsoEditMetadataForm,
} from './dso-edit-metadata-form';
import { DsoEditMetadataHeadersComponent } from './dso-edit-metadata-headers/dso-edit-metadata-headers.component';
import { DsoEditMetadataValueComponent } from './dso-edit-metadata-value/dso-edit-metadata-value.component';
import { DsoEditMetadataValueHeadersComponent } from './dso-edit-metadata-value-headers/dso-edit-metadata-value-headers.component';
import { MetadataFieldSelectorComponent } from './metadata-field-selector/metadata-field-selector.component';

@Component({
  selector: 'ds-base-dso-edit-metadata',
  styleUrls: ['./dso-edit-metadata.component.scss'],
  templateUrl: './dso-edit-metadata.component.html',
  imports: [
    AlertComponent,
    AsyncPipe,
    BtnDisabledDirective,
    DsoEditMetadataFieldValuesComponent,
    DsoEditMetadataHeadersComponent,
    DsoEditMetadataValueComponent,
    DsoEditMetadataValueHeadersComponent,
    MetadataFieldSelectorComponent,
    ThemedLoadingComponent,
    TranslateModule,
  ],
})
/**
 * Component showing a table of all metadata on a DSpaceObject and options to modify them
 */
export class DsoEditMetadataComponent implements OnInit, OnDestroy {
  /**
   * DSpaceObject to edit metadata for
   */
  @Input() dso: DSpaceObject;

  /**
   * Reference to the component responsible for showing a metadata-field selector
   * Used to validate its contents (existing metadata field) before adding a new metadata value
   */
  @ViewChild(MetadataFieldSelectorComponent) metadataFieldSelectorComponent: MetadataFieldSelectorComponent;

  /**
   * Resolved update data-service for the given DSpaceObject (depending on its type, e.g. ItemDataService for an Item)
   * Used to send the PATCH request
   */
  @Input() updateDataService: UpdateDataService<DSpaceObject>;

  /**
   * Type of the DSpaceObject in String
   * Used to resolve i18n messages
   */
  dsoType: string;

  /**
   * A dynamic form object containing all information about the metadata and the changes made to them, see {@link DsoEditMetadataForm}
   */
  form: DsoEditMetadataForm;

  /**
   * The metadata field entered by the user for a new metadata value
   */
  newMdField: string;

  // Properties determined by the state of the dynamic form, updated by onValueSaved()
  isReinstatable: boolean;
  hasChanges: boolean;
  isEmpty: boolean;

  /**
   * Whether or not the form is currently being submitted
   */
  saving$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Tracks for which metadata-field a drag operation is taking place
   * Null when no drag is currently happening for any field
   * This is a BehaviorSubject that is passed down to child components, to give them the power to alter the state
   */
  draggingMdField$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  /**
   * Whether or not the metadata field is currently being validated
   */
  loadingFieldValidation$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Combination of saving$ and loadingFieldValidation$
   * Emits true when any of the two emit true
   */
  savingOrLoadingFieldValidation$: Observable<boolean>;

  /**
   * The AlertType enumeration for access in the component's template
   * @type {AlertType}
   */
  public AlertTypeEnum = AlertType;

  /**
   * Subscription for updating the current DSpaceObject
   * Unsubscribed from in ngOnDestroy()
   */
  dsoUpdateSubscription: Subscription;

  /**
   * Field to keep track of the current security level
   * in case a new mdField is added and the security level needs to be set
   */
  newMdFieldWithSecurityLevelValue: number;

  /**
   * Flag to indicate if the metadata security configuration is present
   * for the newly added metadata field
   */
  hasSecurityMetadata = false;

  /**
   * Contains metadata security configuration object
   */
  isFormInitialized$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Contains metadata security configuration object
   */
  securitySettings$: BehaviorSubject<MetadataSecurityConfiguration> = new BehaviorSubject(null);

  metadataReadError = false;
  editingPermissionDenied = false;
  savedBeforeMetadataRefresh = false;
  private editingProjectedMetadata = false;
  private metadataReadSubscription: Subscription;
  private saveSubscription: Subscription;

  public readonly Context = Context;

  constructor(protected route: ActivatedRoute,
              protected notificationsService: NotificationsService,
              protected translateService: TranslateService,
              protected parentInjector: Injector,
              protected arrayMoveChangeAnalyser: ArrayMoveChangeAnalyzer<number>,
              protected cdr: ChangeDetectorRef,
              @Inject(APP_DATA_SERVICES_MAP) private dataServiceMap: LazyDataServicesMap,
              protected metadataSecurityConfigurationService: MetadataSecurityConfigurationService,
              @Inject(DATA_SERVICE_FACTORY) protected getDataServiceFor: (resourceType: ResourceType) => GenericConstructor<HALDataService<any>>) {
  }

  /**
   * Read the route (or parent route)'s data to retrieve the current DSpaceObject
   * After it's retrieved, initialise the data-service and form
   */
  ngOnInit(): void {
    if (hasNoValue(this.dso)) {
      const routeData$ = combineLatest([this.route.data, this.route.parent.data]).pipe(
        map(([data, parentData]: [Data, Data]) => Object.assign({}, data, parentData)),
      );
      const optIn = this.route.snapshot.routeConfig?.data?.editAllMetadataLanguages === true;
      this.dsoUpdateSubscription = routeData$.pipe(
        switchMap((data) => {
          if (optIn) {
            this.clearEditorSession();
            if (!data.dso?.hasSucceeded || !data.dso.payload) {
              return EMPTY;
            }
          }
          this.initDSO(data.dso.payload);
          this.editingProjectedMetadata = optIn && this.dso instanceof Item && this.dso.isArchived === true;
          const settings$ = () => combineLatest([this.retrieveDataService(), this.getSecuritySettings()]);
          if (!this.editingProjectedMetadata) {
            return settings$();
          }
          const auth = this.parentInjector.get(AuthService);
          return combineLatest([auth.getAuthenticatedUserIdFromStore(), auth.isAuthenticated()]).pipe(
            switchMap(([userId, authenticated]) => {
              this.clearEditorSession();
              if (!authenticated || !userId) {
                return EMPTY;
              }
              const href = this.dso._links?.self?.href;
              const allowed$ = href
                ? this.parentInjector.get(AuthorizationDataService).isAuthorized(FeatureID.CanEditMetadata, href, undefined, false, false)
                : of(false);
              return allowed$.pipe(
                take(1),
                defaultIfEmpty(false),
                catchError(() => of(false)),
                switchMap((allowed) => {
                  this.editingPermissionDenied = !allowed;
                  return allowed ? settings$() : EMPTY;
                }),
              );
            }),
          );
        }),
      ).subscribe(([dataService, securitySettings]) => this.prepareEditor(dataService, securitySettings));
    } else {
      this.initDSOType(this.dso);
      this.dsoUpdateSubscription = combineLatest([this.retrieveDataService(), this.getSecuritySettings()])
        .subscribe(([dataService, securitySettings]) => this.prepareEditor(dataService, securitySettings));
    }
    this.savingOrLoadingFieldValidation$ = observableCombineLatest([this.saving$, this.loadingFieldValidation$]).pipe(
      map(([saving, loading]: [boolean, boolean]) => saving || loading),
    );
  }

  private prepareEditor(dataService: UpdateDataService<DSpaceObject>, securitySettings: MetadataSecurityConfiguration): void {
    this.securitySettings$.next(securitySettings);
    this.initDataService(dataService);
    if (this.editingProjectedMetadata) {
      this.readProjectedMetadata();
    } else {
      this.initForm();
      this.isFormInitialized$.next(true);
    }
  }

  private clearEditorSession(): void {
    this.metadataReadSubscription?.unsubscribe();
    this.saveSubscription?.unsubscribe();
    this.isFormInitialized$.next(false);
    this.form = undefined;
    this.saving$.next(false);
    this.loadingFieldValidation$.next(false);
    this.metadataReadError = false;
    this.savedBeforeMetadataRefresh = false;
    this.editingPermissionDenied = false;
  }

  retryMetadataRead(): void {
    if (this.editingProjectedMetadata && this.metadataReadError) {
      this.readProjectedMetadata();
    }
  }

  private readProjectedMetadata(): void {
    this.metadataReadSubscription?.unsubscribe();
    this.metadataReadError = false;
    this.isFormInitialized$.next(false);
    this.form = undefined;
    this.metadataReadSubscription = this.parentInjector.get(ItemDataService)
      .getAllLanguagesMetadata(this.dso as Item, { forEditing: true }).pipe(
        take(1),
        defaultIfEmpty(null),
        catchError(() => of(null)),
      ).subscribe((metadata) => {
        if (metadata) {
          this.initForm(metadata);
          this.isFormInitialized$.next(true);
          this.savedBeforeMetadataRefresh = false;
        } else {
          this.metadataReadError = true;
        }
      });
  }

  /**
   * Get the security settings for the current DSpaceObject,
   * based on entityType (e.g. Person)
   */
  getSecuritySettings(): Observable<MetadataSecurityConfiguration> {
    if (this.dso instanceof Item) {
      const entityType: string = (this.dso as Item).entityType;
      return this.metadataSecurityConfigurationService.findById(entityType).pipe(
        getFirstCompletedRemoteData(),
        map((securitySettingsRD: RemoteData<MetadataSecurityConfiguration>) => {
          return securitySettingsRD.hasSucceeded ? securitySettingsRD.payload : null;
        }),
        catchError(() => of(null)),
      );
    } else {
      return of(null);
    }
  }

  /**
   * Resolve the data-service for the current DSpaceObject and retrieve its instance
   */
  retrieveDataService(): Observable<UpdateDataService<DSpaceObject>> {
    if (hasNoValue(this.updateDataService)) {
      const lazyProvider$: Observable<UpdateDataService<DSpaceObject>> = lazyDataService(this.dataServiceMap, this.dsoType, this.parentInjector);
      return lazyProvider$;
    } else {
      return of(this.updateDataService);
    }
  }

  /**
   * Initialise the current DSpaceObject
   */
  initDSO(object: DSpaceObject) {
    this.dso = object;
    this.initDSOType(object);
  }

  /**
   * Initialise the current DSpaceObject's type
   */
  initDSOType(object: DSpaceObject) {
    let type: ResourceType;
    if (typeof object.type === 'string') {
      type = new ResourceType(object.type);
    } else {
      type = object.type;
    }
    this.dsoType = type.value;
  }

  /**
   * Initialise the data-service for the current DSpaceObject
   */
  initDataService(dataService: UpdateDataService<DSpaceObject>): void {
    if (isNotEmpty(dataService)) {
      this.updateDataService = dataService;
    }
  }

  /**
   * Initialise the dynamic form object by passing the DSpaceObject's metadata
   * Call onValueSaved() to update the form's state properties
   */
  initForm(metadata: MetadataMap = this.dso.metadata): void {
    this.form = new DsoEditMetadataForm(metadata);
    this.onValueSaved();
    this.cdr.detectChanges();
  }

  /**
   * Update the form's state properties
   */
  onValueSaved(): void {
    this.hasChanges = this.form.hasChanges();
    this.isReinstatable = this.form.isReinstatable();
    this.isEmpty = Object.keys(this.form.fields).length === 0;
  }

  /**
   * Submit the current changes to the form by retrieving json PATCH operations from the form and sending it to the
   * DSpaceObject's data-service
   * Display notifications and reset the form afterwards if successful
   */
  submit(): void {
    if (!this.isFormInitialized$.value || this.saving$.value || !this.hasChanges) {
      return;
    }
    this.saving$.next(true);
    this.saveSubscription = this.updateDataService.patch(this.dso, this.form.getOperations(this.arrayMoveChangeAnalyser)).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe({
      next: (rd: RemoteData<DSpaceObject>) => {
        this.saving$.next(false);
        if (!rd.hasSucceeded) {
          if (this.editingProjectedMetadata && [401, 403].includes(rd.statusCode)) {
            this.clearEditorSession();
            this.editingPermissionDenied = true;
          }
          this.showSaveError(rd.errorMessage);
          return;
        }
        this.notificationsService.success(
          this.translateService.instant(`${this.dsoType}.edit.metadata.notifications.saved.title`),
          this.translateService.instant(`${this.dsoType}.edit.metadata.notifications.saved.content`),
        );
        if (this.editingProjectedMetadata) {
          this.savedBeforeMetadataRefresh = true;
          this.readProjectedMetadata();
        } else {
          this.dso = rd.payload;
          this.initForm();
        }
      },
      error: (error: unknown) => {
        this.saving$.next(false);
        this.showSaveError(error instanceof Error ? error.message : '');
      },
    });
  }

  private showSaveError(message: string): void {
    this.notificationsService.error(this.translateService.instant(`${this.dsoType}.edit.metadata.notifications.error.title`), message);
  }

  /**
   * Confirm the newly added value
   * @param saved Whether or not the value was manually saved (only then, add the value to its metadata field)
   */
  confirmNewValue(saved: boolean): void {
    if (saved) {
      this.setMetadataField();
    }
  }

  /**
   * Set the metadata field of the temporary added new metadata value
   * This will move the new value to its respective parent metadata field
   * Validate the metadata field first
   */
  setMetadataField(): void {
    this.form.resetReinstatable();
    this.loadingFieldValidation$.next(true);
    const editedForm = this.form;
    this.metadataFieldSelectorComponent.validate().subscribe((valid: boolean) => {
      if (editedForm !== this.form) {
        return;
      }
      this.loadingFieldValidation$.next(false);
      if (valid) {
        this.form.setMetadataField(this.newMdField);
        this.setSecurityLevelForNewMdField();
        this.onValueSaved();
      }
    });
  }

  /**
   * Add a new temporary metadata value
   */
  add(): void {
    this.newMdField = undefined;
    this.form.add();
  }

  /**
   * Discard all changes within the current form
   */
  discard(): void {
    this.form.discard();
    this.onValueSaved();
  }

  /**
   * Restore any changes previously discarded from the form
   */
  reinstate(): void {
    this.form.reinstate();
    this.onValueSaved();
  }

  /**
   * Keep track of the metadata field that is currently being edited / added
   * Reset the security level properties for the new metadata field
   * @param value The value of the new metadata field
   */
  onMdFieldChange(value: string){
    if (hasValue(value)) {
      this.newMdFieldWithSecurityLevelValue = null;
      this.hasSecurityMetadata = false;
    }
  }

  /**
   * Update the security level for the field at the given index
   */
  onUpdateSecurityLevel(securityLevel: number) {
    this.setSecurityLevelForNewMdField(securityLevel);
  }

  /**
   * Set the security level for the new metadata field
   * If the new metadata field has no security level yet, store the security level in a temporary variable
   * until the metadata field is validated and set.
   * @param securityLevel The security level to set for the new metadata field
   */
  setSecurityLevelForNewMdField(securityLevel?: number) {
    // if the metadata field already exists among the metadata fields,
    //  set the security level for the new metadata field in the right position
    if (hasValue(this.newMdField) && hasValue(this.form.fields[this.newMdField]) && this.hasSecurityMetadata) {
      const lastIndex = this.form.fields[this.newMdField].length - 1;
      const obj = this.form.fields[this.newMdField][lastIndex];

      if (hasValue(securityLevel)) {
        // metadata field is not set yet, so store the security level for the new metadata field
        this.newMdFieldWithSecurityLevelValue = securityLevel;
      } else {
        // metadata field is set, so set the security level for the new metadata field
        obj.change = DsoEditMetadataChangeType.ADD;
        const customSecurity = this.securitySettings$.value.metadataCustomSecurity[this.newMdField];
        const lastCustomSecurityLevel = customSecurity[customSecurity.length - 1];

        obj.newValue.securityLevel = this.newMdFieldWithSecurityLevelValue ?? lastCustomSecurityLevel;
      }
    }

    // if the security level value is changed before the metadata field is set,
    // store the security level in a temporary variable
    if (hasValue(securityLevel) && hasNoValue(this.form.fields[this.newMdField])) {
      this.newMdFieldWithSecurityLevelValue = securityLevel;
    }

    if (!this.hasSecurityMetadata) {
      // for newly added metadata fields, set the security level to the default security level
      // (in case there is no custom security level for the metadata field)
      const lastDefaultSecurityLevel = this.securitySettings$.value?.metadataSecurityDefault?.at(-1);
      if (hasValue(lastDefaultSecurityLevel)) {
        this.form.fields[this.newMdField].at(-1).newValue.securityLevel = lastDefaultSecurityLevel;
      }
    }
  }

  /**
   * Check if the new metadata field has a security level
   */
  hasSecurityLevel(event: boolean) {
    this.hasSecurityMetadata = event;
  }

  /**
   * Unsubscribe from any open subscriptions
   */
  ngOnDestroy(): void {
    this.metadataReadSubscription?.unsubscribe();
    this.saveSubscription?.unsubscribe();
    if (hasValue(this.dsoUpdateSubscription)) {
      this.dsoUpdateSubscription.unsubscribe();
    }
  }

}
