# Suvadugal homepage implementation plan

Milestone 3 is authorized. Milestone 2 remains partially complete until browser and responsive checks pass. [DESIGN.md](DESIGN.md) is the visual and interaction specification. [PROGRESS.md](PROGRESS.md) records decisions, blockers and validation. Paths are relative to the DSpace Angular 10.1 checkout.

## Verified source architecture

- Local `config/config.dev.yml` targets `https://suvadugal.tholkudi.in/server`. The generated local config selected `dspace`, consistent with `src/config/default-app-config.ts`. Use `src/themes/dspace/` throughout.
- `src/app/root/root.component.html` mounts the shared header/navbar wrapper and footer around the router outlet. `src/app/home-page/home-page-routes.ts` uses `ThemedHomePageComponent`, whose dynamic import already checks for a theme homepage. The stock homepage supplies CMS header metadata, HomeNews, COAR, optional Discovery sidebar, the suggestions popup, the global search form, the community list and recent submissions.
- `src/themes/dspace/app/` contains existing theme header, navbar, header wrapper and HomeNews overrides. The dspace homepage and footer overrides are now present. The shared footer is resolved by `src/app/footer/themed-footer.component.ts`.
- The existing Browse provider uses four direct Discovery entity links and translated labels. The link component passes query parameters through mouse and keyboard navigation. Preserve this behavior and leave routing and core navigation in place.

## File and component mapping

| Path | Implementation |
|---|---|
| `src/themes/dspace/app/home-page/home-page.component.{ts,html,scss}` | Add a standalone `HomePageComponent` at the existing themed import path. Compose the required sections. Reuse base homepage initialization where feasible. Preserve config-driven CMS, COAR, optional filters and suggestions behavior. Replace the homepage community list with the approved browse grids and retain Communities & Collections in shared navigation. |
| `src/themes/dspace/app/home-page/hero-carousel/` | Add a standalone carousel component using B01.jpeg through B04.jpeg from the supplied ZIP in filename order, local assets and meaningful descriptions. Autoplay advances every seven seconds, pauses on interaction, honors reduced motion, and includes a pause/play control. Include previous/next and indicators. Follow the accessibility and geometry in DESIGN.md. |
| `src/app/shared/search-form/themed-search-form.component.ts` | Reuse as `ds-search-form` with `inPlaceSearch=false`. It already handles the search destination and query. Style the homepage instance at theme level. |
| `src/themes/dspace/app/home-page/browse-card/` | Add a standalone card component shared by both grids. Use translated labels, descriptions, accent variants and RouterLink/queryParams. Keep the approved display order. |
| `src/themes/dspace/app/home-page/recent-additions/` | Add a standalone dynamic grid. Follow the request and rendering patterns in `src/app/home-page/recent-item-list/`. Reuse the existing SearchService, PaginatedSearchOptions, RemoteData handling, thumbnail, access-status and item route helpers. |
| `src/themes/dspace/app/header/header.component.{html,scss}` | Adapt the existing shared header to Figma. Use the existing translated nav, language, auth, context-help and impersonation components. Check both desktop and mobile markup before touching the theme navbar or header wrapper. |
| `src/themes/dspace/app/footer/footer.component.{ts,html,scss}` | Add a standalone `FooterComponent` at the existing themed import path. Reuse base footer configuration, conditions, and cookie handler. Preserve existing DSpace legal/accessibility behavior and attribution while laying out the four approved groups. |
| `src/themes/dspace/assets/`, `src/assets/i18n/{en,ta}.json5` | Store original approved Figma exports locally. Add bilingual keys using real copy. Use component SCSS and existing style conventions. Avoid temporary Figma URLs and hardcoded record assets. |

## Discovery contract

Entity cards use `/search` with Angular query parameter `f.entityType` equal to `ArtForm,equals`, `ArtistProfile,equals`, or `Instrument,equals`. Existing live checks returned 10 ArtForm records, no public ArtistProfile records, and one Instrument. Artist Profiles stays visible even with an empty result set. Counts are observations, never UI constants.

The domain cards link to existing communities using `getCommunityPageRoute(id)` from `src/app/core/router/utils/dso-route.utils.ts`. These user-provided UUIDs are configuration values, not Discovery filters:

| Card | Community | UUID |
|---|---|---|
| Performing Arts | Performing Art | `f1214b8b-fdb7-4501-aebd-9674d4d60aa8` |
| Fine Arts | Visual Art | `3ee09be8-11aa-44d4-90b4-c03594c0757c` |
| Martial Arts | Martial Art | `fa82aeab-c455-4d3c-9800-98bb0ab836fc` |

Entity cards retain Discovery filters. All three community UUIDs returned HTTP 200 with matching community names in the milestone 1 read-only API check.

## Internal information pages

Inspect `src/app/info/info-routes.ts`, `src/app/info/privacy/`, its themed wrapper and the parent routing configuration before adding routes. New pages for the six approved internal footer entries require genuine approved content and verified route names. Use the existing standalone components, routing and localization patterns. Do not publish placeholder content. Existing Privacy and Feedback routes retain their guards and visibility rules. Adding new info routes necessarily touches the core info routing file; limit that change to approved pages and preserve all existing routes.

Use the existing recent-items request pattern: item-only, descending `homePage.recentSubmissions.sortField` (locally `dc.date.accessioned`), respect a zero page size as disabled, and render at most four items. Follow thumbnail/accessStatus only when existing configuration allows it. Use real titles, type/access status and item URLs. Keep empty, loading, failed and missing-thumbnail states.

## Milestones and acceptance

1. **Resolve prerequisites.** Document the community mappings, supplied banners, responsive and Tamil instructions, and internal page architecture. Confirm actual content and routes before publishing new information pages. Complete review and wait for approval before milestone 2.
2. **Homepage layout and navigation.** Match Figma's desktop section rhythm and approved order. Test search input, all three entity destinations and each community destination. Check keyboard focus and narrow viewport overflow.
3. **Carousel and recent items.** Test pause/resume where applicable, reduced motion, keyboard navigation and stable cropping. Test recent sorting, zero to four cards, real item links and all loading/error/empty states.
4. **Shared header/footer.** Verify same language/auth/search and mobile menu behavior on home, search and item routes. Verify cookie settings, existing legal/accessibility actions, approved institutional links and footer responsive layout. Check for duplicate shell elements.
5. **Local acceptance.** Add/run focused Angular tests and the development build. Compare 1440 px and narrow viewport renders to Figma and verify English and Tamil. A previous local run needed `NODE_OPTIONS=--max-old-space-size=4096 NG_BUILD_MAX_WORKERS=1`. Start via `npm run start:dev` if authorized. Live browser checks require an approved origin because the backend previously rejected `http://localhost:4000` with 403. Preserve metadata, relationships, public navigation and REST authorization throughout. Production deployment requires separate approval.

The approved shared header branding source is 01.jpeg. Preserve its proportions. The hero uses the approved uncropped 3.2:1 ratio; mobile embedded text legibility is an accepted limitation.

## Milestone 3 validation note

The dspace theme dynamic imports and built asset paths were verified in source and build output. Component tests use mocked services. Full browser interaction and responsive/Figma comparison remain open. The recent grid currently delegates to stock DSpace grid cards, so confirm or adapt them to the approved visual before marking milestone 3 complete. Retain the six internal information links as pending until content is approved. See PROGRESS.md for commands and results.

## Footer correction acceptance

The theme footer retains four approved groups in `footerGroups`; About has no publishable destination and is hidden until content and routes are approved. Information and Contact appear only when their existing guarded links are available. Keep the six pending destinations documented and never use placeholder URLs. The main grid favors the longer institutional names; utility actions and attribution follow below. Verify actual 1440/768/375 px rendering, Tamil text, keyboard focus, live routes, and comparison with Figma in an available browser before visual acceptance.
