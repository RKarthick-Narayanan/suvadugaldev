import {
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { MetadataValue } from '@dspace/core/shared/metadata.models';
import { TranslateLoaderMock } from '@dspace/core/testing/translate-loader.mock';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { parse } from 'json5';

import { MetadataValuesComponent } from '../../../../field-components/metadata-values/metadata-values.component';
import { mockItemWithMetadataFieldsAndValue } from '../item-page-field.component.spec';
import { ItemPageTitleFieldComponent } from './item-page-title-field.component';

let comp: ItemPageTitleFieldComponent;
let fixture: ComponentFixture<ItemPageTitleFieldComponent>;

const mockField = 'dc.title';
const mockValue = 'test value';

describe('ItemPageTitleFieldComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock,
        },
      }), ItemPageTitleFieldComponent, MetadataValuesComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ItemPageTitleFieldComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ItemPageTitleFieldComponent);
    comp = fixture.componentInstance;
    comp.item = mockItemWithMetadataFieldsAndValue([mockField], mockValue);
    fixture.detectChanges();
  }));

  it('should display display the correct metadata value', () => {
    expect(fixture.nativeElement.innerHTML).toContain(mockValue);
  });

  it('should set the correct language on the title metadata', () => {
    expect(comp.nameMetadata.language).toBe('en_US');
  });

  it('renders all Suvadugal entity prefixes and the original title in English and Tamil', async () => {
    const translations = TestBed.inject(TranslateService);
    const entities = [
      ['ArtForm', 'Art Form:', 'கலை வடிவம்:'],
      ['ArtistProfile', 'Artist Profile:', 'கலைஞர் அறிமுகம்:'],
      ['Instrument', 'Instrument:', 'இசைக்கருவி:'],
      ['Performance', 'Performance:', 'கலை நிகழ்வு:'],
      ['Space', 'Cultural Space:', 'பண்பாட்டு வெளி:'],
    ];
    for (const [language, index] of [['en', 1], ['ta', 2]] as const) {
      const response = await fetch(`/assets/i18n/${language}.json5`);
      expect(response.ok).toBeTrue();
      translations.setTranslation(language, parse(await response.text()));
      translations.use(language);
      for (const entity of entities) {
        comp.item.metadata['dspace.entity.type'] = [Object.assign(new MetadataValue(), { value: entity[0] })];
        fixture.detectChanges();
        const renderedTitle = fixture.nativeElement.querySelector('h1').textContent.replace(/\s+/g, ' ').trim();
        expect(renderedTitle).toBe(`${entity[index]} ${mockValue}`);
      }
    }
  });
});
