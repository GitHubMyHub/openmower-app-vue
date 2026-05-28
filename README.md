<div align="center">

# 🌱 OpenMower App — Vue 3

**A modern, real-time dashboard for your [OpenMower](https://openmower.de) robotic lawnmower fleet.**
Vue 3 · Vuetify 4 · Pinia · MapLibre GL · MQTT over WebSockets

[![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vuetify](https://img.shields.io/badge/Vuetify-4.0-1867C0?logo=vuetify&logoColor=white)](https://vuetifyjs.com/)
[![Pinia](https://img.shields.io/badge/Pinia-3.0-FFD859?logo=pinia&logoColor=black)](https://pinia.vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre%20GL-5.21-396CB2?logo=maplibre&logoColor=white)](https://maplibre.org/)
[![MQTT](https://img.shields.io/badge/MQTT-5.x-660066?logo=eclipsemosquitto&logoColor=white)](https://mqtt.org/)
[![Zod](https://img.shields.io/badge/Zod-3.24-3E67B1)](https://zod.dev/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](#-license)
[![Node](https://img.shields.io/badge/node-%E2%89%A520.19-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

---

## ✨ Overview

`openmower-app-vue` is a **1:1 port** of the original Next.js
[openmower-app](https://github.com/GitHubMyHub/openmower-app) onto a fully
client-side Vue 3 + Vuetify 4 stack. It connects to one or more
[OpenMower](https://github.com/ClemensElflein/open_mower_ros) robots over
MQTT-over-WebSockets, visualises live state and maps in real time, and exposes
the on-board JSON-RPC API for control and configuration.

| Area    | Original (Next.js)              | This port (Vue)                                  |
| ------- | ------------------------------- | ------------------------------------------------ |
| UI      | MUI v7 + Emotion                | **Vuetify 4** + SCSS                             |
| State   | Zustand + Immer + React context | **Pinia** + Immer                                |
| Map     | `maplibre-react-components`     | **`maplibre-gl`** (direct)                       |
| RPC     | `mqtt` + custom JSON-RPC client | identical (`src/lib/rpc.ts`, framework-agnostic) |
| Routing | Next.js App Router              | **vue-router 5**                                 |
| Schemas | `zod`                           | `zod`                                            |
| Bundler | Next.js / Turbopack             | **Vite 8**                                       |
| Linting | ESLint                          | **oxlint** → ESLint (flat config)                |

> 💡 The port deliberately mirrors the upstream layout — views, components and
> stores map directly to their `src/app/*` counterparts in the original repo.

---

## 🚀 Features

- 🛰️ **Live telemetry** — battery, GPS quality, pose, current state/sub-state
  and action progress, streamed from `robot_state/json`.
- 🗺️ **Interactive map** — MapLibre GL view of working/navigation areas,
  obstacles, docking stations and the live mower position, with automatic
  conversion of the legacy map format.
- 🎮 **Teleop** — keyboard / touch driving via BSON-encoded `teleop` messages
  at 10 Hz (`composables/useTeleop.ts`).
- 🤖 **Multi-mower fleet** — one MQTT client per unique broker URL, shared
  across all mowers on that broker.
- 🔌 **JSON-RPC over MQTT** — fully typed client (`src/lib/rpc.ts`) generated
  from `openrpc.json`; 10 s request timeout, request/response correlation by id.
- ✅ **Runtime-validated payloads** — every inbound MQTT message is parsed
  through a `zod` schema (`src/stores/schemas.ts`) before touching the store.
- 🌗 **Auto light/dark theme** synced with `prefers-color-scheme`.
- 📱 **Responsive shell** — sidebar on desktop, bottom bar on mobile.
- 🐳 **Single-file Docker deploy** — static bundle served by nginx on port 3000.

---

## 📋 Requirements

- **Node.js** `^20.19.0` or `>=22.12.0` (`node:24-alpine` is used for Docker
  builds)
- **npm** (or `bun` — a `bun.lock` is checked in)
- A reachable **MQTT broker with WebSocket listener** (default
  `ws://<host>:9001`) exposing the OpenMower topics under your configured
  `mqtt_prefix`.

---

## ⚡ Quick start

```bash
git clone <your-fork-url> openmower-app-vue
cd openmower-app-vue
npm install
npm run dev          # → http://localhost:3000
```

By default the app loads `public/config.json` which points at
`ws://localhost:9001`. Edit it (or supply env vars — see below) to point at
your mower.

---

## ⚙️ Configuration

The app is configured at runtime. On startup `loadAppConfig()`
(`src/lib/actions.ts`) resolves the configuration in this order:

1. **Build-time env vars** (if `VITE_MOWER_NAME` is set) — single mower baked
   into the bundle.
2. **`/config.json`** fetched from the deployed `public/` folder — supports
   multiple mowers.
3. **Localhost fallback** — `ws://<window.location.hostname>:9001`.

### `public/config.json`

```jsonc
{
  "mowers": [
    {
      "id": "1",
      "name": "OpenMower",
      "description": "",
      "mqtt_ws_url": "ws://localhost:9001",
      "mqtt_prefix": ""
    }
  ]
}
```

### Vite environment variables

| Variable                 | Description                                     | Default                       |
| ------------------------ | ----------------------------------------------- | ----------------------------- |
| `VITE_MOWER_NAME`        | Enables single-mower env mode when set          | _unset_                       |
| `VITE_MOWER_MQTT_WS_URL` | WebSocket URL of the broker                     | `ws://<host>:9001`            |
| `VITE_MOWER_MQTT_PREFIX` | MQTT topic prefix for that mower                | `""`                          |
| `VITE_IS_DEV`            | Force-enable dev-only routes/nav (`true`/unset) | follows `import.meta.env.DEV` |

### MQTT topic contract

For each mower, under its `mqtt_prefix`, the app:

| Direction | Topic               | Payload                             |
| --------- | ------------------- | ----------------------------------- |
| 📥 sub    | `capabilities/json` | `{ [name]: level }` (zod-validated) |
| 📥 sub    | `robot_state/json`  | Robot state (zod-validated)         |
| 📥 sub    | `map/json`          | Map (modern **or** legacy format)   |
| 📥 sub    | `rpc/response`      | JSON-RPC 2.0 response               |
| 📤 pub    | `rpc/request`       | JSON-RPC 2.0 request (10 s timeout) |
| 📤 pub    | `teleop`            | **BSON** `{ vx, vz }` @ 10 Hz       |

---

## 🧰 Scripts

| Command              | What it does                                                  |
| -------------------- | ------------------------------------------------------------- |
| `npm run dev`        | Vite dev server on http://localhost:3000                      |
| `npm run build`      | Parallel `vue-tsc --build` + `vite build` → `dist/`           |
| `npm run build-only` | Skip type-check (used by Docker)                              |
| `npm run preview`    | Serve the production bundle locally                           |
| `npm run type-check` | Project-references type check (`vue-tsc --build`)             |
| `npm run lint`       | `oxlint --fix` then `eslint --fix --cache` (run sequentially) |
| `npm run format`     | `oxfmt src/`                                                  |
| `npm run test:unit`  | Vitest unit tests                                             |
| `npm run test:e2e`   | Playwright end-to-end tests (`e2e/`)                          |
| `npm run genrpc`     | Regenerate `src/lib/rpc.ts` from `openrpc.json`               |

---

## 🏗️ Architecture

### Bootstrap flow

```
main.ts ─▶ App.vue ─┬─▶ loadAppConfig()  ─▶ configStore.setConfig(...)
                    │                       └─▶ mowersStore.loadMowers()
                    └─▶ syncTheme(prefers-color-scheme)
```

### State

- **`stores/config.ts`** — holds the resolved `AppConfig`.
- **`stores/mowers.ts`** — opens one `mqtt.connect()` **per unique
  `mqtt_ws_url`** and fans the messages out to the matching `Mower` instances.
  Each `Mower` is `markRaw`'d to preserve class identity through Pinia's
  deep-proxy typing.
- **`stores/map.ts`** — view state for the MapLibre canvas.
- **`stores/schemas.ts`** — every MQTT payload is parsed through a `zod` schema
  before being assigned to the store. Legacy map payloads (no `areas` field)
  are transparently upgraded by `convertLegacyMap()`.

### JSON-RPC layer

- `src/lib/rpc-base.ts` — transport-agnostic JSON-RPC 2.0 client (publishes to
  `rpc/request`, correlates `rpc/response` by id, 10 s timeout).
- `src/lib/rpc.ts` — **generated** from `openrpc.json` (`// GENERATED FILE, DO
  NOT EDIT!!!`). Regenerate with `npm run genrpc`.

### Routing & layouts

- **`layouts/default.vue`** — sidebar + mobile bottom bar shell for
  `dashboard / tasks / sensors / settings / debug`.
- **`layouts/map.vue`** — fullscreen shell for `/map`.
- A `beforeEach` guard redirects `/` → `/map` outside dev mode (mirrors the
  original Next.js behaviour). Toggle with `VITE_IS_DEV=true`.

### Project layout

```
src/
  App.vue              # v-app shell, OS-theme sync, config bootstrap
  main.ts              # createApp + plugins
  plugins/             # Vuetify + Pinia + Router registration
  router/              # vue-router config
  layouts/             # default.vue, map.vue
  views/               # DashboardView, MapView, TasksView, SensorsView,
                       # SettingsView, DebugView
  components/
    navigation/        # Sidebar + MobileBottomBar + MowerSelector
    page/              # Page / PageHeader / PageContent / HeaderStat shell
    map/               # MowerMap, markers, mapStyles
  stores/              # Pinia stores (config, mowers, map) + zod schemas
  lib/                 # rpc-base, generated rpc client, actions, cardStyles
  composables/         # useTeleop
  utils/               # coordinates, area-utils, area-converter, map-issues
  types/               # AppConfig / MowerConfig / NavigationItem / GeoJSON
  assets/styles/       # main.scss + Vuetify settings.scss
public/
  config.json          # runtime config (multi-mower friendly)
openrpc.json           # source of truth for src/lib/rpc.ts
e2e/                   # Playwright tests
```

---

## 🧪 Testing

```bash
npm run test:unit       # Vitest + jsdom
npm run test:e2e        # Playwright (installs browsers on first run)
```

Playwright config lives in `playwright.config.ts`; specs in `e2e/`.

---

## 🐳 Docker

A multi-stage Dockerfile builds the static bundle with `node:24-alpine` and
serves it with `nginx:alpine` on port **3000** (SPA fallback configured in
`nginx.conf`).

```bash
docker build -t openmower-app .
docker run --rm -p 3000:3000 openmower-app
```

To point a built image at a different broker without rebuilding, mount your
own `config.json`:

```bash
docker run --rm -p 3000:3000 \
  -v $(pwd)/my-config.json:/usr/share/nginx/html/config.json:ro \
  openmower-app
```

---

## 🤝 Contributing

1. Find the upstream Next.js equivalent first — port structure rather than
   redesign.
2. New MQTT-derived data → add a `zod` schema in `stores/schemas.ts`,
   subscribe in `mowers.ts`'s `connect` handler, parse in the `message`
   handler.
3. New RPC method → regenerate `rpc.ts` from `openrpc.json` rather than
   hand-editing.
4. New view → register in `router/index.ts`, add a nav entry in
   `components/navigation/navigationItems.ts`, wrap content in `<Page>`.
5. Run `npm run lint && npm run type-check && npm run test:unit` before
   opening a PR.

See [`AGENTS.md`](./AGENTS.md) for the full set of conventions used by
contributors and AI coding agents.

---

## 🙏 Acknowledgements

- [ClemensElflein/open_mower_ros](https://github.com/ClemensElflein/open_mower_ros) — the OpenMower firmware/ROS stack this UI talks to.
- [GitHubMyHub/openmower-app](https://github.com/GitHubMyHub/openmower-app) — the original Next.js application this project ports.
- [Vuetify](https://vuetifyjs.com/), [MapLibre GL](https://maplibre.org/), [MQTT.js](https://github.com/mqttjs/MQTT.js) and the rest of the open-source ecosystem that makes this possible.

---

## 📄 License

Released under the **MIT License**. See `LICENSE` (or the upstream project) for
details.
