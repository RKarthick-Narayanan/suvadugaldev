import { AsyncPipe } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { getItemPageRoute } from '@dspace/core/router/utils/dso-route.utils';
import { Item } from '@dspace/core/shared/item.model';
import { ViewMode } from '@dspace/core/shared/view-mode.model';
import { TranslateModule } from '@ngx-translate/core';

import { RecentItemListComponent } from '../../../../../app/home-page/recent-item-list/recent-item-list.component';
import { ErrorComponent } from '../../../../../app/shared/error/error.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { ThemedThumbnailComponent } from '../../../../../app/thumbnail/themed-thumbnail.component';

@Component({
  selector: 'ds-suvadugal-recent-additions',
  templateUrl: './recent-additions.component.html',
  styleUrls: ['./recent-additions.component.scss'],
  imports: [
    AsyncPipe,
    ErrorComponent,
    RouterLink,
    ThemedLoadingComponent,
    ThemedThumbnailComponent,
    TranslateModule,
  ],
})
export class RecentAdditionsComponent extends RecentItemListComponent implements OnInit {
  override viewMode = ViewMode.GridElement;
  readonly itemRoute = getItemPageRoute;

  entityKey(item: Item): string | null {
    const type = item.firstMetadataValue('dspace.entity.type');
    const supported: Record<string, string> = {
      ArtForm: 'artform', ArtistProfile: 'artist', Instrument: 'instrument', Performance: 'performance', Space: 'space',
    };
    return supported[type] ? 'suvadugal.card.entity.' + supported[type] : null;
  }

  accessKey(status: string): string | null {
    const supported = ['open.access', 'metadata.only', 'restricted', 'embargo'];
    const normalized = status?.toLowerCase();
    return supported.includes(normalized) ? 'access-status.' + normalized + '.listelement.badge' : null;
  }


  override ngOnInit(): void {
    this.paginationConfig.pageSize = Math.min(this.paginationConfig.pageSize, 4);
    super.ngOnInit();
  }
}
