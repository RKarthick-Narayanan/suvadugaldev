import { NavigationEnd } from '@angular/router';
import { createPaginatedList } from '@dspace/core/testing/utils.test';
import { createSuccessfulRemoteDataObject } from '@dspace/core/utilities/remote-data.utils';
import {
  of,
  Subject,
} from 'rxjs';

import { ComcolPageBrowseByComponent } from './comcol-page-browse-by.component';

describe('Community and collection browse navigation', () => {
  const indexes = ['subject', 'performance', 'dateaccessioned', 'artform', 'artist', 'instrument', 'eventspace', 'itype'];
  const config = { community: { defaultBrowseTab: 'search' }, collection: { defaultBrowseTab: 'search' } };

  function setup(type: string, id: string, definitions = indexes, defaultTab = 'search') {
    const events = new Subject<NavigationEnd>();
    const base = `/${type === 'collection' ? 'collections' : 'communities'}/${id}`;
    const router = { url: `${base}/search`, events, navigate: jasmine.createSpy('navigate') };
    const browse = { getBrowseDefinitions: () => of(createSuccessfulRemoteDataObject(createPaginatedList(definitions.map((name) => ({ id: name }))))) };
    const appConfig = { ...config, [type]: { defaultBrowseTab: defaultTab } };
    const component = new ComcolPageBrowseByComponent(appConfig as any, router as any, browse as any);
    component.id = id;
    component.contentType = type;
    component.ngOnInit();
    return { component, events, base, router };
  }

  for (const [type, id] of [['community', 'community-id'], ['community', 'subcommunity-id'], ['collection', 'collection-id']]) {
    it(`orders allowed indexes and preserves scope for ${id}`, () => {
      const { component, base, events } = setup(type, id, indexes, 'browse_artist');
      let options;
      component.allOptions$.subscribe((value) => options = value);
      const fixed = type === 'community' ? ['search', 'comcols'] : ['search'];
      expect(options.map((option) => option.id)).toEqual([...fixed, 'browse_artist', 'browse_instrument', 'browse_performance', 'browse_artform']);
      expect(options[0].routerLink).toBe(`${base}/search`);
      if (type === 'community') {
        expect(options[1].routerLink).toBe(`${base}/subcoms-cols`);
      }
      expect(options.slice(fixed.length).map((option) => option.routerLink)).toEqual(
        ['artist', 'instrument', 'performance', 'artform'].map((name) => `${base}/browse/${name}`),
      );
      expect(options.slice(fixed.length).map((option) => option.label)).toEqual(
        ['artist', 'instrument', 'performance', 'artform'].map((name) => `browse.comcol.by.${name}`),
      );
      events.next(new NavigationEnd(1, `${base}/browse/instrument`, `${base}/browse/instrument`) as any);
      // DSpace emits Scroll events to this component after navigation.
      events.next({ type: 15, routerEvent: { urlAfterRedirects: `${base}/browse/instrument` } } as any);
      expect(component.currentOption$.value.id).toBe('browse_instrument');
      component.ngOnDestroy();
    });
  }

  it('omits definitions that the backend does not expose', () => {
    const { component } = setup('community', 'example', ['artist', 'performance', 'title']);
    let options;
    component.allOptions$.subscribe((value) => options = value);
    expect(options.map((option) => option.id)).toEqual(['search', 'comcols', 'browse_artist', 'browse_performance']);
    component.ngOnDestroy();
  });
});
