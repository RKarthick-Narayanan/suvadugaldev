import {
  AsyncPipe,
  NgTemplateOutlet,
} from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { LocaleService } from '@dspace/core/locale/locale.service';
import { getCommunityPageRoute } from '@dspace/core/router/utils/dso-route.utils';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownViewerComponent } from 'src/app/shared/markdown-viewer/markdown-viewer.component';

import { HomeCoarComponent } from '../../../../app/home-page/home-coar/home-coar.component';
import { ThemedHomeNewsComponent } from '../../../../app/home-page/home-news/themed-home-news.component';
import { HomePageComponent as BaseComponent } from '../../../../app/home-page/home-page.component';
import { SuggestionsPopupComponent } from '../../../../app/notifications/suggestions/popup/suggestions-popup.component';
import { ThemedConfigurationSearchPageComponent } from '../../../../app/search-page/themed-configuration-search-page.component';
import { ThemedSearchFormComponent } from '../../../../app/shared/search-form/themed-search-form.component';
import { RecentAdditionsComponent } from './recent-additions/recent-additions.component';

@Component({
  selector: 'ds-themed-home-page',
  styleUrls: ['./home-page.component.scss'],
  templateUrl: './home-page.component.html',
  imports: [
    AsyncPipe,
    HomeCoarComponent,
    MarkdownViewerComponent,
    NgTemplateOutlet,
    RecentAdditionsComponent,
    RouterLink,
    SuggestionsPopupComponent,
    ThemedConfigurationSearchPageComponent,
    ThemedHomeNewsComponent,
    ThemedSearchFormComponent,
    TranslateModule,
  ],
})
export class HomePageComponent extends BaseComponent {
  readonly slides = ['B01.jpeg', 'B02.jpeg', 'B03.jpeg', 'B04.jpeg'];
  activeSlide = 0;
  isPlaying = false;
  private carouselTimer: ReturnType<typeof setInterval> | undefined;

  readonly entities = [
    { id: 'artform', type: 'ArtForm' },
    { id: 'artist', type: 'ArtistProfile' },
    { id: 'instrument', type: 'Instrument' },
  ];

  readonly domains = [
    { id: 'performing', route: getCommunityPageRoute('f1214b8b-fdb7-4501-aebd-9674d4d60aa8') },
    { id: 'fine', route: getCommunityPageRoute('3ee09be8-11aa-44d4-90b4-c03594c0757c') },
    { id: 'martial', route: getCommunityPageRoute('fa82aeab-c455-4d3c-9800-98bb0ab836fc') },
  ];

  constructor() {
    super(inject(APP_CONFIG), inject(ActivatedRoute), inject(LocaleService));
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.startCarousel();
      }
    });
    destroyRef.onDestroy(() => this.pauseCarousel());
  }

  startCarousel(): void {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.carouselTimer = setInterval(() => this.selectSlide(this.activeSlide + 1), 7000);
    }
  }

  pauseCarousel(): void {
    clearInterval(this.carouselTimer);
    this.carouselTimer = undefined;
    this.isPlaying = false;
  }

  toggleCarousel(): void {
    if (this.isPlaying) {
      this.pauseCarousel();
    } else {
      this.startCarousel();
    }
  }

  selectSlide(index: number): void {
    this.activeSlide = (index + this.slides.length) % this.slides.length;
  }
}

