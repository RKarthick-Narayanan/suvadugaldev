/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */

import { Injectable } from '@angular/core';
import {
  Observable,
  of,
} from 'rxjs';

import { TextMenuItemModel } from '../menu-item/models/text.model';
import { MenuItemType } from '../menu-item-type.model';
import { PartialMenuSection } from '../menu-provider.model';
import { AbstractExpandableMenuProvider } from './helper-providers/expandable-menu-provider';

const SUVADUGAL_ENTITIES = [
  { label: 'artform', type: 'ArtForm' },
  { label: 'artist', type: 'ArtistProfile' },
  { label: 'instrument', type: 'Instrument' },
  { label: 'performance', type: 'Performance' },
];

/**
 * Menu provider to create the "All of DSpace" browse menu sections in the public navbar
 */
@Injectable()
export class BrowseMenuProvider extends AbstractExpandableMenuProvider {
  getTopSection(): Observable<PartialMenuSection> {
    return of(
      {
        model: {
          type: MenuItemType.TEXT,
          text: 'menu.section.browse_global',
        } as TextMenuItemModel,
        icon: 'globe',
        visible: true,
      },
    );
  }

  getSubSections(): Observable<PartialMenuSection[]> {
    return of(SUVADUGAL_ENTITIES.map(({ label, type }) => ({
      visible: true,
      model: {
        type: MenuItemType.LINK,
        text: `menu.section.browse_global_by_${label}`,
        link: '/search',
        queryParams: { 'f.entityType': `${type},equals` },
      },
    })));
  }
}
