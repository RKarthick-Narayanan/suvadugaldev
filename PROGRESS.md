# Suvadugal homepage progress

## Status

Milestone 1 review is **COMPLETE** for the five decisions supplied by the user. Milestone 2 is **PARTIALLY COMPLETE** pending homepage-specific automated tests and browser, responsive, keyboard and visual verification. The three community IDs resolve publicly, the four supplied images were inspected, and the information-page architecture was reviewed. New information pages remain dependent on approved substantive content. User approval is required before milestone 2. No application code, assets, tests, dependencies, or configuration were changed during milestone 1.

## Milestones

- [x] Inspect Figma desktop frame and DSpace Angular 10.1 source.
- [x] Confirm homepage order, domain semantics, rotating hero direction, and the four footer groups.
- [x] Verify official external footer destinations in DESIGN.md.
- [x] Record source paths, data contracts, acceptance criteria, and open blockers.
- [x] Confirm community routing and verify all three domain UUIDs via read-only REST requests.
- [x] Record the supplied carousel, footer, responsive and Tamil decisions.
- [x] Receive user authorization to begin implementation and milestone 1.
- [x] Complete milestone 1 review.
- [x] Obtain approval before milestone 2.
- [ ] Complete milestone 2 browser, responsive and visual validation.
- [x] Receive approval to proceed to milestone 3.
- [ ] Implement homepage, hero, dynamic recent items, and shared header/footer.
- [ ] Run focused tests, a development build, and visual and browser acceptance.

## Confirmed decisions

Use the existing default dspace theme. The ordered sections, carousel requirements, and approved footer links are in [DESIGN.md](DESIGN.md). Domain cards use the three supplied DSpace communities and the existing getCommunityPageRoute helper. Entity cards continue to use Discovery. Use banners B01 through B04 in filename order with automatic seven-second rotation, a pause/play control, and previous/next controls and indicators (updated at the user’s request). Adapt desktop responsively and translate new interface copy into Tamil. Use established DSpace info-page architecture and approved content. Preserve existing item routes, locale and footer behavior. No changes to repository metadata or relationships are required.

## Verification evidence

- Figma MCP returned the screenshot, node structure, style details and asset references for frame `1272:13472`. Mobile or separately localized layouts were not verified.
- The checked local configuration selected `dspace` and pointed to the live Suvadugal backend.
- Prior entity-navigation validation passed 10 focused Angular tests and a development build. The live API returned 10 Art Forms, zero Artist Profiles, one Instrument and one Performance. These were earlier checks of the navigation work, not tests of the proposed homepage.
- **Community mapping verified:** read-only `/server/api/core/communities/{uuid}` requests returned HTTP 200 for Performing Art (`f1214b8b-fdb7-4501-aebd-9674d4d60aa8`), Visual Art (`3ee09be8-11aa-44d4-90b4-c03594c0757c`), and Martial Art (`fa82aeab-c455-4d3c-9800-98bb0ab836fc`). The source helper is `getCommunityPageRoute` in `src/app/core/router/utils/dso-route.utils.ts`.
- **Banner archive inspected:** four JPEG images `B01.jpeg`–`B04.jpeg`, each 1280 × 400 RGB, opened successfully and were reviewed in a contact sheet. They contain embedded Tamil text. Their aspect ratio differs from the 1440 × 578 desktop Figma hero; rendered cropping requires validation. No files were added to the application.
- **Information pages:** `src/app/info/info-routes.ts` registers existing guarded feedback and conditional privacy routes. New approved information pages require route registration and themed standalone components, with actual content supplied or approved before publication.
- **Milestone 1 checks:** archive integrity and dimensions, contact-sheet inspection, read-only community API requests and source inspection passed. No application code changed, so Angular tests and build were not applicable. In-page rendering and language switching are implementation acceptance checks.
- The prior browser check received `403 Invalid CORS request` from the live API for `http://localhost:4000`. This is a separate blocker from the current 502. No backend changes were made.
- Homepage tests and builds were not run for this documentation-only task.

## Milestone 2 work

Status: **PARTIALLY COMPLETE**. The homepage-specific Angular checks and development build pass. Full browser interaction, desktop/tablet/mobile rendering, and Figma visual comparison remain unverified because computer-use inventory returned no available browsers. A previous direct API check also found the live server rejects the localhost browser origin with `403 Invalid CORS request`. This blocks live search results and navigation acceptance until an authorized test environment is available.

Files added: `src/themes/dspace/app/home-page/home-page.component.ts`, `.html`, `.scss`, and `home-page.component.spec.ts`. Files modified: `src/assets/i18n/en.json5`, `src/assets/i18n/ta.json5`, and this progress document. Existing unrelated working-tree changes remain present.

- `CHROME_BIN=/usr/bin/google-chrome NG_BUILD_MAX_WORKERS=1 npm test -- --include=src/themes/dspace/app/home-page/home-page.component.spec.ts --include=src/app/shared/search-form/search-form.component.spec.ts --browsers=ChromeHeadless --progress=false` passed **15 tests**, including 6 actual themed-homepage tests. Angular component tests use stubs for the search form and other children. The separate existing search-form tests cover search navigation behavior.
- The homepage tests verify the three Discovery query-parameter values, three community hrefs, section order, exactly one homepage search form, focusable named native card links, translation-service switching with test data, recent-list visibility, CMS, COAR, news, suggestions, and optional sidebar. They do not constitute end-to-end keyboard or live API verification.
- Both real JSON5 catalogs parsed and all 14 homepage keys were present and nonempty in English and Tamil. Built assets were not visually checked for typography.
- `ESLINT_USE_FLAT_CONFIG=false npx eslint` on the new homepage TS and spec plus the four previously modified navigation TS files passed with two existing no-floating-promises warnings in the navigation files. The homepage test uses a narrow max-classes-per-file exception for its two distinct child stubs.
- `NODE_OPTIONS=--max-old-space-size=4096 NG_BUILD_MAX_WORKERS=1 npm run build -- --progress=false` passed with unused custom-theme warnings. `git diff --check` passed.
- Responsive acceptance at desktop/tablet/mobile and comparison to Figma are outstanding. CSS contains 991 px and 575 px breakpoints but layout geometry, overflow and focus appearance were not observed. Header/news/footer duplication and actual search submission through the full running app remain unverified. The stock HomeNews and stock recent list are intentionally present until milestone 3. No claim of milestone completion is made.

## Milestone 3 work

Status: **PARTIALLY COMPLETE**. User approved proceeding while milestone 2 remains partially complete. Added supplied B01–B04 images and logo to `src/themes/dspace/assets/images/suvadugal/`. Implemented a manual four-slide 3.2:1 carousel in the themed homepage, with translated previous/next buttons, indicators, wrapping and live slide announcement. Replaced the stock DSpace promotional banner with CMS news only. The logo source was inspected and copied unchanged. The shared header keeps existing navigation controls.

Added `src/themes/dspace/app/home-page/recent-additions/`, extending the existing recent list query, limiting its configured page size to four, and using DSpace's existing grid renderer. Added a theme footer in `src/themes/dspace/app/footer/` with the four column headings, three verified government links, existing guarded Privacy and Feedback links, cookie, accessibility, agreement, COAR and attribution actions. Six internal links are held pending substantive content. This is not yet the full approved footer. Added English/Tamil labels to both translation catalogs.

- Focused homepage/carousel test run passed **7 tests**, including previous/next and indicator behavior. One earlier run failed because the existing section-order assertion omitted the newly added hero; the assertion was corrected, and the subsequent run passed.
- `ESLINT_USE_FLAT_CONFIG=false npx eslint --fix` passed on the three new/modified component TS files after resolving import-order and member-order errors. A development build passed with existing unused custom-theme warnings. The final development build was rerun after the header logo CSS specificity adjustment and passed (hash 6a0117bba98db9f6).
- **Still required:** meaningful tests of recent query ordering, limit, empty/error/loading and thumbnails; tests for footer guards, cookie action and links; logo/header tests; English/Tamil rendering and keyboard/responsive browser checks; Figma comparison; review of DSpace grid cards against the approved recent-card design. Browser automation previously reported no browser surface, and live REST CORS remains blocked for localhost.
- Small embedded Tamil banner text on mobile is an accepted limitation. Keep milestone 2 partially complete. Do not mark milestone 3 complete until all feasible gates and remaining requirements pass.

## Milestone 3 validation on 24 November 2026

Status remains **PARTIALLY COMPLETE**. User authorized further validation and directed that milestone 4 must await approval. No browser surfaces were returned by computer-use inventory, so no desktop, tablet, mobile, real keyboard interaction, full page theme activation, or visual Figma comparison was performed. Existing dev configuration points directly to live REST; no proxy is configured in the inspected Angular serve settings. Previous localhost requests received 403 CORS. Do not alter backend security.

Theme integration was traced through the default dspace runtime config, themed dynamic imports, dspace eager header registrations, homepage import of the carousel and recent component, and the footer wrapper. The final development build contains the dspace homepage and footer chunks and all five image assets under `assets/dspace/images/suvadugal/`. Actual live rendering remains unverified. The custom-theme warnings arise because `tsconfig.app.json` includes `src/themes/**/*.ts`, while custom theme eager and listable registrations are commented out. Those warnings do not themselves indicate dspace failed to compile.

New tests:
- `src/themes/dspace/app/home-page/recent-additions/recent-additions.component.spec.ts` checks configured descending sort, four-item request limit, grid mode, empty, loading, failure and item loader emission with mocked dependencies. It does not validate live ordering, actual item links, thumbnail rendering, or the visual Figma card.
- `src/themes/dspace/app/footer/footer.component.spec.ts` checks guarded privacy/feedback/agreement links, the three government URLs, attribution and cookie click with mocked services.
- `src/themes/dspace/app/header/header.component.spec.ts` checks logo URL/home link, child control presence and mobile toggle with mocks.
- The homepage test checks ordered carousel image filenames, source dimensions ratio, previous/next/indicator state and wrapping. This does not establish actual browser keyboard navigation, displayed geometry or Tamil accessibility.
- Focused theme run passed **12 tests**. Existing DSpace item-grid and thumbnail run passed **42 tests**. Initial test process hit Node heap limit; retry with `NODE_OPTIONS=--max-old-space-size=4096` passed after correcting one test import.
- ESLint passed for the eight theme TS files using `ESLINT_USE_FLAT_CONFIG=false`; it emitted the legacy ESLint config warning. Development build passed with 4 GB heap, hash `82f482f80e2626bd`, and custom-theme unused warnings. `git diff --check` passed.
- Corrected the recent section heading to the approved “Recent Additions” and added the Tamil counterpart.
- Outstanding Figma gaps established from source/design inspection: the recent section uses the stock DSpace grid renderer, which is not established as a match for the Figma card; domain cards lack the descriptive copy shown in the design; six approved footer destinations cannot be published without substantive content; header/logo, typography, spacing, mobile overflow, carousel geometry and all visual fidelity remain unverified. Compare in an authorized browser before correcting layout. Mobile banner text legibility is an accepted limitation.
- Do not begin milestone 4. Obtain substantive page content before adding the six pending links. Continue recent-item and footer behavior tests, live navigation and browser accessibility/responsive checks where a supported environment becomes available.

## Remaining dependencies

- Approved substantive content is needed for About Suvadugal, About the Initiative, Partner Institutions, Access & Usage Policy, Copyright & Attribution, and Contact Us. Create the approved pages through existing info architecture only when content is available; do not publish placeholders.
- Banner credits and meaningful image descriptions need verification against the supplied material. Validate that the embedded text remains visible at desktop, tablet and mobile sizes.
- The prior local browser origin received a 403 CORS response. An authorized test environment is needed for live browser data. This does not block independent implementation and automated checks.
- Validate translated interface copy, Tamil font fallback, optional CMS/COAR/sidebar placement, responsive layout and carousel accessibility during implementation.

## Resume after context compaction

1. Start in the DSpace Angular 10.1 checkout. Read DESIGN.md, IMPLEMENTATION_PLAN.md, and this file in that order. Review `git status --short` and preserve existing navigation, translations and working-tree edits.
2. The user authorized implementation but requires a quality-gate report and approval before each next milestone. Complete milestone 1 prerequisites and request approval before milestone 2.
3. Continue milestone 3 work and validation. Milestone 2 browser validation remains open. Use the verified community UUIDs and DSpace route helper for domains and Discovery for entity cards. Follow the approved carousel settings and do not invent information-page content.
4. Use existing `src/themes/dspace/` and shared DSpace components. Record files changed and actual test/build/browser results before reporting completion. Production deployment and backend changes require separate authorization.

## Milestone 3 footer correction — 24 November 2026

Status: **PARTIALLY COMPLETE**. Updated `src/themes/dspace/app/footer/footer.component.ts`, `.html`, `.scss` and `.spec.ts`, plus DESIGN.md, IMPLEMENTATION_PLAN.md and PROGRESS.md. The four approved groups remain in component configuration. About is hidden because all three destinations are pending; Information & Policies retains Privacy Policy, with Access & Usage Policy and Copyright & Attribution pending; Contact retains guarded feedback, with Contact Us pending. No placeholder links or content were added.

The main grid gives Important Links additional space and hides any group without a valid destination. CSS defines a two-column tablet layout and single-column narrow layout; 48 px desktop gutters, legible Roboto typography, focus styles, a utility divider, and a separate attribution region are specified. Actual geometry, font loading, overflow, keyboard usability and Figma comparison remain unverified: computer-use inventory returned no browser surfaces, so no screenshot could be captured. Previous live API localhost CORS restrictions also remain.

Focused ChromeHeadless command `NODE_OPTIONS=--max-old-space-size=4096 CHROME_BIN=/usr/bin/google-chrome NG_BUILD_MAX_WORKERS=1 npm test -- --include=src/themes/dspace/app/footer/footer.component.spec.ts --browsers=ChromeHeadless --progress=false` passed 3 tests: available destinations and cookie action, conditional empty sections/COAR, and translation service switching with fixture translations. Both actual English/Tamil catalogs parse and contain all 15 relevant footer keys; the existing Tamil accessibility label remains English and needs editorial translation. ESLint passed for the footer component and spec using `ESLINT_USE_FLAT_CONFIG=false` (legacy-config warning). Official institutional destinations were checked against their respective government sites.

Do not begin Milestone 4. Finish the broader Milestone 3 visual/functional acceptance separately; the footer work alone does not satisfy it.

The preceding interrupted Milestone 3 work also left the header language selector referring to `suvadugal.language.other`, which is absent from both catalogs. This footer-only task does not change the header or those catalogs; fix and test that separate issue when the broader work resumes. Computer-use browser creation was also attempted and returned `Browser is not available: iab`.

The development build `NODE_OPTIONS=--max-old-space-size=4096 NG_BUILD_MAX_WORKERS=1 npm run build -- --progress=false` passed with the previously documented unused custom-theme compilation warnings. `git diff --check` passed.

## Hero rotation update

At the user’s request, the existing four banners automatically advance every seven seconds. A bilingual pause/play control is available; rotation pauses on pointer hover or focus and remains initially off when reduced motion is requested. Browser visual testing remains outstanding.

Focused homepage tests passed (8 tests, including automatic advancement and pause). ESLint passed for the themed homepage component and spec. No browser visual check was performed for this update.

## Next-phase TODO — Tamil typography and mobile navigation

Status: **PENDING**, requested by the user on 24 November 2026. Do not begin this work without the approval required for the next phase.

- [ ] Review Tamil typography and spacing on the homepage and shared navigation. The bundled Playfair Display and Roboto font files contain no Tamil glyphs; the browser falls back to another font, which can vary by device. Headings also use desktop-oriented sizes and card widths; verify which factors cause the observed wide or overflowing Tamil text before changing styles.
- [ ] Evaluate self-hosted Noto Sans Tamil for interface and body text and Noto Serif Tamil for headings, with appropriate font licensing and system fallbacks. Compare actual Tamil samples with the approved design, keep English typography intact, and verify loading and text shaping across desktop/mobile browsers. Font selection is a recommendation pending visual review.
- [ ] Investigate the hamburger missing in the supplied 360 px emulated screenshot; it is visible in the other supplied mobile capture. Check header width, flex sizing, Tamil label length, viewport breakpoint detection, screenshot capture method, and icon rendering before deciding the cause. Preserve existing search, language switch, authentication, navigation, and accessibility controls.
- [ ] Test at 320, 360, 375 and 768 px and on a real mobile device where available, in English and Tamil. Verify menu open/close, keyboard and touch access, visible focus, header overflow, card text wrapping, responsive spacing, and absence of horizontal page overflow. Compare emulated screenshots with the live viewport and identify any capture-specific discrepancy.
- [ ] Record before/after screenshots, test outcomes, known banner text limitations, and any unresolved issues. No implementation or deployment was performed for this TODO.

## Tamil typography and mobile responsiveness — implementation status

Status: **PARTIALLY COMPLETE**. The shared theme now includes locally hosted Noto Sans Tamil and Noto Serif Tamil regular/bold fonts plus their license. Unicode-range font faces supplement the existing Roboto, Nunito and Playfair Display families so Tamil text can use the same fallback even in the English interface. Font files were inspected and contain Tamil glyphs; actual text shaping across different browsers and real devices remains unverified.

Changed the shared header HTML/SCSS to allow its existing controls to wrap at mobile widths; the mobile search, language and hamburger controls have 44 px minimum touch targets. The mobile logo is 44 px high. Homepage mobile heading sizes and card text wrapping were adjusted, and long recent-item titles can expand on narrow screens. No routes, backend configuration or metadata were changed.

Focused Angular run: 19 tests passed covering header, homepage, carousel, recent additions, footer and scoped browse navigation. ESLint passed for the relevant existing TypeScript files; there were no TypeScript edits. `git diff --check` passed. Development build was run separately; see the following validation record for its final result.

Headless Chrome was used because the interactive browser inventory was empty. At 320, 360, 375, 390, 414, 768, 1024 and 1440 px in English and Tamil, a preliminary pass on the rendered error page reported no document overflow. The menu opened and closed at 320 and 360 px in both languages. The final Tamil checks at 320 and 360 px found no overlap between search, language and login hit areas and confirmed menu open/close. The final English pass did not load the header in time; an earlier English pass confirmed menu open/close, but its exact final hit areas remain unverified. These checks are NOT full homepage acceptance.

Live localhost browser requests were rejected by the API CORS policy, redirecting the app to its 500 page. Therefore the homepage card grids, actual recent additions, carousel interaction, community/collection browse pages, item pages, language switching through the real application, font appearance throughout the UI, keyboard focus and full-page desktop/mobile visual comparison are NOT verified. Captures under `/tmp/suvadugal-responsive/` show the 500 page, not the complete homepage. No backend security was changed. Use an authorized test environment to complete these checks, including the original eight viewport widths and both languages, before marking the task complete. No production deployment or next milestone was started.

Final development build `NODE_OPTIONS=--max-old-space-size=4096 NG_BUILD_MAX_WORKERS=1 npm run build -- --progress=false` passed after the last header changes. The known unused `custom` theme warnings remain. The local development server and headless browser were stopped after testing.
