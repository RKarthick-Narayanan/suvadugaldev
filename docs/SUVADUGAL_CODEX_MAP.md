# Suvadugal Codex map

## Environment

This is the local VS Code and Codex workspace. [package.json](../package.json) declares DSpace Angular 10.1.0. The local Angular frontend uses [config.dev.yml](../config/config.dev.yml) to reach the live DSpace 10.1 REST API at `https://suvadugal.tholkudi.in/server`.

The [default theme](../src/config/default-app-config.ts#L473) is `dspace`. The existing `src/themes/custom/` directory is unused for current Suvadugal modifications. Keep theme configuration as it is.

```text
Live REST browse definitions -> BrowseService -> BrowseMenuProvider
  -> ordered Suvadugal entries -> public navbar -> /browse/<id>
Home route -> themed HomePage -> news, search, communities, recent items
```

## Navigation and translations

- [app.menus.ts](../src/app/app.menus.ts) registers the public Browse provider. [browse.menu.ts](../src/app/shared/menu/providers/browse.menu.ts) keeps the existing “All of DSpace” parent and shows only REST definitions for `artform`, `artist`, `instrument`, `performance`, `eventspace`, `subclass`, `ptype`, and `itype`, in that order.
- [browse.menu.spec.ts](../src/app/shared/menu/providers/browse.menu.spec.ts) covers ordering, routing, and missing definitions. The [live Browse endpoint](https://suvadugal.tholkudi.in/server/api/discover/browses?size=100) returned seven allowed IDs on 23 November 2026. The menu includes `artform` once the backend exposes it.
- The [navbar](../src/app/navbar/navbar.component.html) renders the public menu. Its entries resolve `menu.section.browse_global_by_<id>` from [English](../src/assets/i18n/en.json5) and [Tamil](../src/assets/i18n/ta.json5).
- [home-page-routes.ts](../src/app/home-page/home-page-routes.ts) loads the themed homepage. The [base template](../src/app/home-page/home-page.component.html) includes news, search, communities, and recent items.

## Local workflow and boundaries

Change local source, run focused tests, build locally, and verify in a browser. Install locked dependencies with `npm ci --include=dev`. Run `npm test` with focused spec paths, `npm run build` for a development build, and `npm run start:dev` for the local UI at `http://localhost:4000`.

Local dependency installation, tests, and builds are permitted. Backend modifications and production deployment require separate authorization. Use read-only requests against the live API during validation. Production deployment commands are **UNVERIFIED**.

If Node reaches its heap limit, prefix the build or dev server command with `NODE_OPTIONS=--max-old-space-size=4096 NG_BUILD_MAX_WORKERS=1`. The live API currently returns `403 Invalid CORS request` for the local browser origin `http://localhost:4000`.
