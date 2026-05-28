# AGENTS.md — openmower-app-vue

Vue 3 + Vuetify 4 + Pinia port of the Next.js [openmower-app](https://github.com/GitHubMyHub/openmower-app). The port is intentionally a **1:1 mirror** of the upstream React app — views/components map directly to their `src/app/*` originals. When in doubt about UX/structure, replicate the original rather than inventing.

## Architecture (read these together)

- **Bootstrap flow** (`src/App.vue` → `src/lib/actions.ts` → `src/stores/config.ts` → `src/stores/mowers.ts`): On mount, `loadAppConfig()` returns either `VITE_MOWER_*` build-time env vars or a fetch of `/config.json` (with a `ws://<hostname>:9001` localhost fallback). `configStore.setConfig()` then `mowersStore.loadMowers()` opens MQTT clients. `App.vue` also syncs Vuetify theme to `prefers-color-scheme`.
- **One MQTT client per unique `mqtt_ws_url`** (`stores/mowers.ts`), shared across all mowers on that broker. Each `Mower` instance is `markRaw`'d before being put into Pinia state — the cast `as unknown as Mower` is intentional to preserve class methods through Pinia's deep-proxy typing.
- **MQTT topic contract** per `mqtt_prefix`: subscribes to `capabilities/json`, `robot_state/json`, `map/json`, `rpc/response`; publishes `rpc/request` and BSON-encoded `teleop`. All inbound JSON is validated through `zod` schemas in `src/stores/schemas.ts` — never assign raw `JSON.parse` results to store state. Legacy map format (no `areas` field) is auto-converted via `convertLegacyMap()`.
- **JSON-RPC over MQTT**: `src/lib/rpc-base.ts` is the framework-agnostic transport (10 s timeout, `nanoid`-style ids from `utils/area-utils.ts:generateId`). `src/lib/rpc.ts` is **generated** from `openrpc.json` — `// GENERATED FILE, DO NOT EDIT!!!`; regenerate via `npm run genrpc` (runs `scripts/generate-rpc-client.ts`, not present in repo — must be added or pulled from upstream when first invoked).
- **Routing** (`src/router/index.ts`): two layouts — `default.vue` (sidebar/mobile-bar shell) for dashboard/tasks/sensors/settings/debug, and `map.vue` for `/map`. A `beforeEach` guard redirects `/` → `/map` unless `import.meta.env.DEV` or `VITE_IS_DEV=true` (mirrors upstream Next.js behavior).

## Conventions

- **Imports**: always use the `@/` alias (`@/stores/...`, `@/lib/...`) — configured in `vite.config.ts` and tsconfig. Never use deep relative paths.
- **State access in components**: `const { mowers } = storeToRefs(useMowersStore())` for reactive fields; call actions directly on the store. See `views/DashboardView.vue` for the canonical pattern.
- **Page shell**: every view uses `<Page><PageHeader title subtitle><HeaderStat/></PageHeader><PageContent>…</PageContent></Page>` from `@/components/page` (barrel export). Don't roll your own layout wrappers.
- **Vuetify**: global defaults in `src/plugins/vuetify.ts` (e.g. `VCard` always `rounded="lg"`, `VBtn` text-transform none). Theme colors mirror the upstream MUI palette — change `sharedColors` there, not per-component. Use Vuetify utility classes (`d-flex ga-4`, `text-h6`, `bg-grey-lighten-4`) before custom CSS.
- **Icons**: MDI only (`mdi-*`); `lucide-vue-next` is a dep but prefer MDI for consistency with upstream.
- **Each view's `<script setup>` starts with a JSDoc** naming the upstream file it ports (e.g. `port of src/app/page.tsx`) — keep this when adding new views.
- **Mocked vs live data**: some views (e.g. `DashboardView`) intentionally mix live fields (`mower.state.battery_percentage`) with hard-coded mock objects copied verbatim from upstream. Don't "clean these up" unless porting the upstream change too.
- **Capability gating**: use `mower.hasCapability(name, minLevel?)` rather than reading `mower.capabilities` directly.

## Developer workflows

```powershell
npm run dev          # Vite on http://localhost:3000
npm run build        # parallel: vue-tsc --build + vite build
npm run lint         # oxlint --fix then eslint --fix --cache (run-s)
npm run format       # oxfmt src/
npm run test:unit    # vitest
npm run test:e2e     # playwright (see e2e/)
npm run genrpc       # regenerate src/lib/rpc.ts from openrpc.json
```

- **Type-check standalone**: `npm run type-check` (uses `vue-tsc --build` against the project-references tsconfig — do **not** run `tsc` directly).
- **Lint stack is dual**: oxlint first (fast), then eslint (`eslint.config.ts` uses flat config + `pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json')` so oxlint-covered rules are disabled in eslint). When silencing a rule, check which linter owns it.
- **Docker**: `docker build -t openmower-app .` → static bundle served by nginx (`nginx.conf`) on port 3000.

## When adding features

1. Find the upstream Next.js equivalent first; port structure rather than redesign.
2. New MQTT-derived data → add a `zod` schema in `stores/schemas.ts`, subscribe in `mowers.ts`'s `connect` handler, parse in the `message` handler.
3. New RPC method → regenerate `rpc.ts` from `openrpc.json` rather than hand-editing.
4. New view → register in `router/index.ts`, add a nav entry in `components/navigation/navigationItems.ts`, wrap content in `<Page>`.
