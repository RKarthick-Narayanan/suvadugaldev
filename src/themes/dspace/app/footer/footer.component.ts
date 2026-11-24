import {
  AsyncPipe,
  DatePipe,
} from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FooterComponent as BaseFooterComponent } from '../../../../app/footer/footer.component';
import { MarkdownViewerComponent } from '../../../../app/shared/markdown-viewer/markdown-viewer.component';

@Component({
  selector: 'ds-themed-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [
    AsyncPipe,
    DatePipe,
    MarkdownViewerComponent,
    RouterLink,
    TranslateModule,
  ],
})
export class FooterComponent extends BaseFooterComponent {
  // Pending entries have no approved destinations and must not be rendered as links.
  readonly footerGroups = {
    about: { heading: 'suvadugal.footer.about', pending: ['About Suvadugal', 'About the Initiative', 'Partner Institutions'] },
    information: { heading: 'suvadugal.footer.information', pending: ['Access & Usage Policy', 'Copyright & Attribution'] },
    contact: { heading: 'suvadugal.footer.contact', pending: ['Contact Us'] },
    links: { heading: 'suvadugal.footer.links', pending: [] },
  };
}
