# OpenMower App — Vue 3

A Vue 3 / Vuetify 4 / Pinia rewrite of the original Next.js
[openmower-app](https://github.com/GitHubMyHub/openmower-app).

This project mirrors the original application 1:1 in structure and feature set:

| Area | Original (Next.js)            | This port (Vue)                                  |
| ---- | ----------------------------- | ------------------------------------------------ |
| UI   | MUI v7 + Emotion              | Vuetify 4 + SCSS                                 |
| State| Zustand + Immer + React ctx   | Pinia + Immer                                    |
| Map  | maplibre-react-components     | maplibre-gl (direct)                             |
| RPC  | mqtt + custom JSON-RPC client | identical (`src/lib/rpc.ts`, framework-agnostic) |
| Routing | Next.js App Router         | vue-router 5                                     |

## Project layout

```
src/
  App.vue            v-app shell, OS-theme sync, config bootstrap
  main.ts            createApp + plugins
  plugins/           Vuetify + Pinia + Router registration
  router/            vue-router config (mirrors original app routes)
  layouts/           default.vue, map.vue
  views/             DashboardView, MapView, TasksView, SensorsView,
                     SettingsView, DebugView
  components/
    navigation/      Sidebar + MobileBottomBar
    page/            Page / PageHeader / PageContent / HeaderStat shell
    map/             MowerMap, markers, mapStyles
  stores/            Pinia stores (config, mowers, map) + zod schemas
  lib/               rpc-base, generated rpc client, actions, cardStyles
  composables/       useTeleop
  utils/             coordinates, area-utils, area-converter, map-issues
  types/             AppConfig / MowerConfig / NavigationItem / GeoJSON
  assets/styles/     main.scss + Vuetify settings.scss
```

## Configuration

At runtime the app fetches `/config.json` (kept in `public/config.json`).
Alternatively define these Vite env variables to build with a single mower
preconfigured:

- `VITE_MOWER_NAME`
- `VITE_MOWER_MQTT_WS_URL` (defaults to `ws://<host>:9001`)
- `VITE_MOWER_MQTT_PREFIX`

## Scripts

```
npm run dev        # Vite dev server on http://localhost:3000
npm run build      # type-check + production build into dist/
npm run preview    # serve the built bundle
npm run lint       # oxlint + eslint --fix
```

## Docker

```
docker build -t openmower-app .
docker run -p 3000:3000 openmower-app
```

The image builds the static bundle and serves it via nginx on port 3000.
