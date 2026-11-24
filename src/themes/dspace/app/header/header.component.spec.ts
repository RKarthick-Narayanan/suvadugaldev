import { AsyncPipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  RouterLink,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { HostWindowService } from '../../../../app/shared/host-window.service';
import { MenuService } from '../../../../app/shared/menu/menu.service';
import { HeaderComponent } from './header.component';

describe('Suvadugal shared header', () => {
  const menu = { isMenuCollapsed: () => of(true), toggleMenu: jasmine.createSpy('toggleMenu') };
  const windowService = { isUpTo: () => of(false) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: MenuService, useValue: menu },
        { provide: HostWindowService, useValue: windowService },
      ],
    }).overrideComponent(HeaderComponent, {
      set: { imports: [AsyncPipe, RouterLink, TranslateModule], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
  });

  it('links the supplied logo home and retains shared navigation controls', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('#header-logo').getAttribute('src')).toBe('assets/dspace/images/suvadugal/logo.jpeg');
    expect(root.querySelector('#header-logo').closest('a').getAttribute('href')).toBe('/home');
    for (const selector of ['ds-navbar', 'ds-search-navbar', 'ds-lang-switch', 'ds-auth-nav-menu']) {
      expect(root.querySelector(selector)).withContext(selector).toBeTruthy();
    }
  });

  it('opens the mobile navigation when its toggle is activated', () => {
    spyOn(windowService, 'isUpTo').and.returnValue(of(true));
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('#navbar-toggler').click();
    expect(menu.toggleMenu).toHaveBeenCalled();
  });
});
