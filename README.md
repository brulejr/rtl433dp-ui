# rtl433dp-ui

React + TypeScript + Vite UI for the `rtl433-data-pipeline` REST APIs.

## Features (baseline)

- OIDC (OAuth2/OIDC) login (PKCE) using `oidc-client-ts`
- Models:
  - List models: `GET /api/v1/models`
  - Details: `GET /api/v1/models/{modelName}/{fingerprint}`
  - Search: `POST /api/v1/models/search`
  - Update sensors: `POST /api/v1/models/{modelName}/{fingerprint}/sensors`
- Recommendations:
  - List candidates: `GET /api/v1/recommendations`
  - Promote: `POST /api/v1/recommendations/promote`
- Known devices:
  - List: `GET /api/v1/known-devices`
- I18N via `i18next` + `react-i18next` (namespaces per feature)

> WebSockets are intentionally not included yet.

## Prereqs

- Node.js 20+ recommended

## Configure

Copy `.env.example` to `.env.local` and adjust:

- `VITE_API_BASE_URL` (e.g. http://localhost:8080)
- OIDC settings (Keycloak recommended)

## Run

```bash
npm install
npm run dev
```

## Notes on backend auth/CORS

If you host UI and API on different origins, enable CORS on the backend for the UI origin,
or proxy through Vite dev server (see `vite.config.ts` for a commented example).

## Run in Docker (development)

This runs the Vite dev server inside a container (no foreground process on your host), with hot reload via bind mounts.

```bash
docker compose -f docker-compose.dev.yml up --build
```

Open:

- http://localhost:5173

### Backend access

By default, the compose file sets:

- `VITE_API_BASE_URL=http://host.docker.internal:8080`

If your backend is running on your host at a different port, change that value.
If your backend is in Docker on a shared network, you can instead set `VITE_API_BASE_URL` to the backend service name.
