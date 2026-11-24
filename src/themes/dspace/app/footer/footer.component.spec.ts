import {
  AsyncPipe,
  DatePipe,
} from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  RouterLink,
} from '@angular/router';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { NotifyInfoService } from '@dspace/core/coar-notify/notify-info/notify-info.service';
import { OrejimeService } from '@dspace/core/cookies/orejime.service';
import { AuthorizationDataService } from '@dspace/core/data/feature-authorization/authorization-data.service';
import { SiteDataService } from '@dspace/core/data/site-data.service';
import { LocaleService } from '@dspace/core/locale/locale.service';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { of } from 'rxjs';

import { FooterComponent } from './footer.component';

describe('Suvadugal footer', () => {
  const cookies = { showSettings: jasmine.createSpy('showSettings') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: OrejimeService, useValue: cookies },
        { provide: APP_CONFIG, useValue: { info: { enableCookieConsentPopup: true, enablePrivacyStatement: true, enableEndUserAgreement: true, enableCOARNotifySupport: false }, homePage: { showTopFooter: false } } },
        { provide: AuthorizationDataService, useValue: { isAuthorized: () => of(true) } },
        { provide: NotifyInfoService, useValue: {} },
        { provide: SiteDataService, useValue: { find: () => of({ firstMetadataValue: () => '' }) } },
        { provide: LocaleService, useValue: { getCurrentLanguageCode: () => of('en') } },
      ],
    }).overrideComponent(FooterComponent, {
      set: { imports: [AsyncPipe, DatePipe, RouterLink, TranslateModule], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
  });

  it('keeps guarded actions, attribution and official destinations', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const hrefs = Array.from(root.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/info/privacy');
    expect(hrefs).toContain('/info/feedback');
    expect(hrefs).toContain('/info/accessibility');
    expect(hrefs).toContain('/info/end-user-agreement');
    expect(hrefs).toContain('https://tnadwpoa.tn.gov.in/');
    expect(hrefs).toContain('https://www.tntribalwelfare.tn.gov.in/');
    expect(hrefs).toContain('https://tribal.nic.in/home.aspx');
    expect(hrefs).toContain('https://www.dspace.org/');
    expect(hrefs).toContain('https://www.lyrasis.org/');
    expect(hrefs.every((href) => !!href && href !== '#')).toBeTrue();
    expect(root.querySelectorAll('.footer-grid section').length).toBe(3);
    expect(Array.from(root.querySelectorAll('.footer-grid section')).every((section) => !!section.querySelector('a'))).toBeTrue();
    root.querySelector('button').click();
    expect(cookies.showSettings).toHaveBeenCalled();
  });

  it('retains the four approved groups without rendering unavailable sections', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    expect(Object.keys(fixture.componentInstance.footerGroups)).toEqual(['about', 'information', 'contact', 'links']);
    expect(fixture.componentInstance.footerGroups.about.pending.length).toBe(3);
    fixture.componentInstance.showPrivacyPolicy = false;
    fixture.componentInstance.showSendFeedback$ = of(false);
    fixture.componentInstance.coarLdnEnabled$ = of(true);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelectorAll('.footer-grid section').length).toBe(1);
    expect(root.querySelector('a[href="/info/privacy"]')).toBeNull();
    expect(root.querySelector('a[href="/info/feedback"]')).toBeNull();
    expect(root.querySelector('a[href="/info/coar-notify-support"]')).not.toBeNull();
  });

  it('renders translated headings and switches languages through the existing service', () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { 'suvadugal.footer.links': 'Important Links' });
    translate.setTranslation('ta', { 'suvadugal.footer.links': 'முக்கிய இணைப்புகள்' });
    translate.use('en');
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Important Links');
    translate.use('ta');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('முக்கிய இணைப்புகள்');
  });
});
