/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */

import { TestBed } from '@angular/core/testing';

import { MenuItemType } from '../menu-item-type.model';
import { PartialMenuSection } from '../menu-provider.model';
import { BrowseMenuProvider } from './browse.menu';

describe('BrowseMenuProvider', () => {

  const expectedTopSection: PartialMenuSection = {
    visible: true,
    model: {
      type: MenuItemType.TEXT,
      text: 'menu.section.browse_global',
    },
    icon: 'globe',
  };

  let provider: BrowseMenuProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [BrowseMenuProvider] });
    provider = TestBed.inject(BrowseMenuProvider);
  });

  it('should be created', () => {
    expect(provider).toBeTruthy();
  });

  it('getTopSection should return expected menu section', (done) => {
    provider.getTopSection().subscribe((section) => {
      expect(section).toEqual(expectedTopSection);
      done();
    });
  });

  it('returns exactly four translated Discovery links in Suvadugal order', (done) => {
    provider.getSubSections().subscribe((sections) => {
      const expected = [
        ['artform', 'ArtForm,equals'],
        ['artist', 'ArtistProfile,equals'],
        ['instrument', 'Instrument,equals'],
        ['performance', 'Performance,equals'],
      ].map(([label, filter]) => ({
        visible: true,
        model: {
          type: MenuItemType.LINK,
          text: `menu.section.browse_global_by_${label}`,
          link: '/search',
          queryParams: { 'f.entityType': filter },
        },
      }));
      expect(sections).toEqual(expected);
      done();
    });
  });
});
