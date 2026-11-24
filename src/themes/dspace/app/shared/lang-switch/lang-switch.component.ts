import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { LangSwitchComponent as BaseComponent } from '../../../../../app/shared/lang-switch/lang-switch.component';

@Component({
  selector: 'ds-themed-lang-switch',
  templateUrl: './lang-switch.component.html',
  styleUrls: ['./lang-switch.component.scss'],
  imports: [
    TranslateModule,
  ],
})
export class LangSwitchComponent extends BaseComponent {}
