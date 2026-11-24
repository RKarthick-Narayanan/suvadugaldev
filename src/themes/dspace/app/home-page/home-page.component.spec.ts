/* eslint-disable max-classes-per-file -- Distinct child stubs exercise content projection and search inputs. */
import {
  AsyncPipe,
  NgTemplateOutlet,
} from '@angular/common';
import {
  Component,
  Input,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  provideRouter,
  RouterLink,
} from '@angular/router';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { LocaleService } from '@dspace/core/locale/locale.service';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { of } from 'rxjs';

import { HomePageComponent } from './home-page.component';

@Component({
  selector: 'ds-configuration-search-page',
  template: '<ng-content select="[searchContentTop]"></ng-content>',
})
class SearchPageStubComponent {
  @Input() sideBarWidth: number;
  @Input() showViewModes: boolean;
  @Input() searchEnabled: boolean;
  @Input() inPlaceSearch: boolean;
  @Input() showScopeSelector: boolean;
}

@Component({ selector: 'ds-search-form', template: '' })
class SearchFormStubComponent {
  @Input() inPlaceSearch: boolean;
  @Input() searchPlaceholder: string;
}

describe('Suvadugal themed homepage', () => {
  let fixture: ComponentFixture<HomePageComponent>;
  let component: HomePageComponent;
  let translate: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { homePage: { recentSubmissions: { pageSize: 5 }, showDiscoverFilters: false } } },
        { provide: ActivatedRoute, useValue: { data: of({ site: { firstMetadataValue: () => 'CMS heading' } }) } },
        { provide: LocaleService, useValue: { getCurrentLanguageCode: () => of('en') } },
      ],
    }).overrideComponent(HomePageComponent, {
      set: {
        imports: [AsyncPipe, NgTemplateOutlet, RouterLink, TranslateModule, SearchPageStubComponent, SearchFormStubComponent],
        schemas: [NO_ERRORS_SCHEMA],
      },
    }).compileComponents();
    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { 'suvadugal.home.title': 'Discover the archive' });
    translate.setTranslation('ta', { 'suvadugal.home.title': 'காப்பகத்தை ஆராயுங்கள்' });
    translate.use('en');
    fixture.detectChanges();
  });

  it('renders search, entity cards, domain cards and recent submissions in order', () => {
    const sections = fixture.nativeElement.querySelectorAll('section');
    expect(Array.from(sections).map((section: HTMLElement) => section.getAttribute('aria-labelledby')))
      .toEqual([null, 'archive-search-title', 'entity-title', 'domain-title']);
    const search = fixture.debugElement.queryAll(By.directive(SearchFormStubComponent));
    expect(search.length).toBe(1);
    expect(search[0].componentInstance.inPlaceSearch).toBeFalse();
    expect(fixture.nativeElement.querySelectorAll('ds-suvadugal-recent-additions').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('ds-header, ds-footer, ds-top-level-community-list').length).toBe(0);
  });

  it('links the three entity cards to their Discovery filters', () => {
    const links = fixture.debugElement.queryAll(By.css('#entity-title ~ .browse-grid a'));
    expect(links.length).toBe(3);
    expect(links.map((link) => link.injector.get(RouterLink).queryParams)).toEqual([
      { 'f.entityType': 'ArtForm,equals' },
      { 'f.entityType': 'ArtistProfile,equals' },
      { 'f.entityType': 'Instrument,equals' },
    ]);
    for (const link of links) {
      expect(link.nativeElement.getAttribute('href')).toContain('/search');
    }
  });

  it('links each domain to its DSpace community route', () => {
    const links = fixture.debugElement.queryAll(By.css('#domain-title ~ .browse-grid a'));
    expect(links.map((link) => link.nativeElement.getAttribute('href'))).toEqual([
      '/communities/f1214b8b-fdb7-4501-aebd-9674d4d60aa8',
      '/communities/3ee09be8-11aa-44d4-90b4-c03594c0757c',
      '/communities/fa82aeab-c455-4d3c-9800-98bb0ab836fc',
    ]);
  });

  it('keeps CMS, COAR, news, suggestions, and the optional search sidebar', () => {
    expect(fixture.nativeElement.querySelector('ds-markdown-viewer')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ds-home-coar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ds-home-news')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ds-suggestions-popup')).toBeTruthy();
    component.showDiscoverFilters = true;
    component.recentSubmissionspageSize = 0;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ds-configuration-search-page')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('ds-search-form').length).toBe(1);
    expect(fixture.nativeElement.querySelector('ds-suvadugal-recent-additions')).toBeNull();
  });

  it('updates visible interface labels when the language changes', () => {
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Discover the archive');
    translate.use('ta');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('காப்பகத்தை ஆராயுங்கள்');
  });
  it('uses focusable native links with accessible names for all cards', () => {
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('.browse-card'));
    expect(links.length).toBe(6);
    for (const link of links) {
      expect(link.getAttribute('href')).toBeTruthy();
      expect(link.textContent.trim().length).toBeGreaterThan(0);
      expect(link.tabIndex).toBe(0);
    }
  });

  it('changes slides using controls and wraps', () => {
    expect(component.activeSlide).toBe(0);
    expect(component.slides).toEqual(['B01.jpeg', 'B02.jpeg', 'B03.jpeg', 'B04.jpeg']);
    const image: HTMLImageElement = fixture.nativeElement.querySelector('.hero__image');
    expect(Number(image.getAttribute('width')) / Number(image.getAttribute('height'))).toBeCloseTo(3.2);
    const buttons = fixture.nativeElement.querySelectorAll('.hero__controls button');
    expect(buttons.length).toBe(7);
    buttons[5].click();
    fixture.detectChanges();
    expect(component.activeSlide).toBe(1);
    expect(fixture.nativeElement.querySelector('.hero__image').getAttribute('src')).toContain('B02.jpeg');
    buttons[0].click();
    buttons[0].click();
    fixture.detectChanges();
    expect(component.activeSlide).toBe(3);
    expect(buttons[4].getAttribute('aria-current')).toBe('true');
  });

  it('advances automatically and stops when paused', () => {
    component.pauseCarousel();
    jasmine.clock().install();
    try {
      component.startCarousel();
      jasmine.clock().tick(7000);
      expect(component.activeSlide).toBe(1);
      component.pauseCarousel();
      jasmine.clock().tick(14000);
      expect(component.activeSlide).toBe(1);
      component.toggleCarousel();
      jasmine.clock().tick(7000);
      expect(component.activeSlide).toBe(2);
      component.pauseCarousel();
    } finally {
      jasmine.clock().uninstall();
    }
  });

});
