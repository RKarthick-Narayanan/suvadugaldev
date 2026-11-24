import { AsyncPipe } from '@angular/common';
import {
  NO_ERRORS_SCHEMA,
  PLATFORM_ID,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  RouterLink,
} from '@angular/router';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { SortDirection } from '@dspace/core/cache/models/sort-options.model';
import { PaginationService } from '@dspace/core/pagination/pagination.service';
import { ViewMode } from '@dspace/core/shared/view-mode.model';
import { createPaginatedList } from '@dspace/core/testing/utils.test';
import { createSuccessfulRemoteDataObject } from '@dspace/core/utilities/remote-data.utils';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { SearchService } from '../../../../../app/shared/search/search.service';
import { SearchConfigurationService } from '../../../../../app/shared/search/search-configuration.service';
import { environment } from '../../../../../environments/environment';
import { RecentAdditionsComponent } from './recent-additions.component';

describe('Recent additions', () => {
  const search = jasmine.createSpy('search');
  const pagination = { clearPagination: jasmine.createSpy('clearPagination') };

  beforeEach(async () => {
    search.and.returnValue(of(createSuccessfulRemoteDataObject(createPaginatedList([]))));
    await TestBed.configureTestingModule({
      imports: [RecentAdditionsComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: APP_CONFIG, useValue: environment },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: SearchService, useValue: { search } },
        { provide: PaginationService, useValue: pagination },
        { provide: SearchConfigurationService, useValue: {} },
      ],
    }).overrideComponent(RecentAdditionsComponent, {
      set: { imports: [AsyncPipe, RouterLink, TranslateModule], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
  });

  it('requests up to four items using the configured newest-first sort', () => {
    const fixture = TestBed.createComponent(RecentAdditionsComponent);
    fixture.componentInstance.paginationConfig.pageSize = 10;
    fixture.detectChanges();
    expect(fixture.componentInstance.paginationConfig.pageSize).toBe(4);
    expect(fixture.componentInstance.sortConfig.direction).toBe(SortDirection.DESC);
    expect(fixture.componentInstance.viewMode).toBe(ViewMode.GridElement);
    expect(search).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('suvadugal.home.recent.empty');
  });

  it('renders item-specific links and fallback and distinguishes loading and failure', () => {
    const fixture = TestBed.createComponent(RecentAdditionsComponent);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    c.itemRD$ = of({ hasSucceeded: true, payload: { page: [{ id: 'one', uuid: 'one', name: 'Actual title', metadata: {}, firstMetadataValue: (key: string) => key === 'dspace.entity.type' ? 'Performance' : null }] } } as any);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.recent-card h3').textContent).toContain('Actual title');
    expect(fixture.nativeElement.querySelector('.recent-card__view').getAttribute('href')).toBe('/entities/performance/one');
    expect(fixture.nativeElement.querySelector('.recent-card__fallback')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.recent-card__entity').textContent).toContain('suvadugal.card.entity.performance');
    expect(fixture.nativeElement.querySelector('.recent-card__access')).toBeNull();
    c.itemRD$ = of({ isLoading: true } as any);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ds-loading')).toBeTruthy();
    c.itemRD$ = of({ hasFailed: true } as any);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ds-error')).toBeTruthy();
  });
});
