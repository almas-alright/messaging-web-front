# Release Candidate Review

Date: 2026-07-06

## 11.01 Build Checks

- `npm install --loglevel=error`: passed.
- `npm run build -- --clearScreen false`: passed.
- `docker compose config`: passed.
- `docker build --build-arg VITE_API_BASE_URL=http://10.10.33.97:8080 --build-arg VITE_WS_BASE_URL=ws://10.10.33.97:8080/ws -t messaging-web-front:rc .`: passed.
- `npm run lint`: not configured; `package.json` has no `lint` script.

## 11.02 Backend Flow Verification

Verified against a local backend on `http://localhost:8080` using the documented
local demo buyer identity and default local demo JWT secret.

- `GET /health`: passed with `{"status":"ok","service":"messaging-service"}`.
- `GET /ready`: passed with `{"status":"ok","service":"messaging-service"}`.
- `GET /auth/me` with buyer JWT: passed and returned `buyer-001`.
- `GET /auth/me` without JWT: returned `401` as expected.
- `POST /conversations/conv-001/attachments`: passed and returned an attachment id.
- WebSocket `/ws?token=<JWT>`: passed with `connection.ready`.
- WebSocket `conversation.join`: passed with `conversation.joined` for `conv-001`.
- WebSocket text `message.send`: passed with `message.created` and `message_type: "text"`.
- WebSocket file `message.send` using uploaded `attachment_id`: passed with `message.created` and `message_type: "file"`.
- WebSocket `conversation.history`: passed and returned the text and file messages.
- Frontend dev server `GET http://localhost:5173/`: passed with HTTP `200`.

Manual browser click-through is still recommended before a stakeholder demo, but
the protocol flow used by the frontend was verified end to end from the terminal.

## 11.03 README Installation Review

Reviewed `README.md` for fresh-clone local setup, LAN demo setup, Docker static
frontend usage, backend CORS notes, and check commands.

Changes made:

- Added prerequisites for Node.js, npm, Docker Compose, and backend port `8080`.
- Added explicit `cp .env.example .env.local` setup in local and LAN flows.
- Kept Docker static frontend instructions and local test checklist links.

## 11.04 Frontend Backend Config Boundary Review

Reviewed the config, HTTP client, WebSocket client, and demo JWT storage.

Changes made:

- Added `docs/config-boundary.md`.
- Linked the config boundary document from `README.md`.

Boundary summary:

- Frontend owns configurable API/WebSocket URLs, demo JWT paste/storage, UI
  state, HTTP requests, and browser WebSocket messages.
- Backend owns JWT validation, conversation membership, persistence, attachment
  storage, policy status, and moderation behavior.
- Login/register/password, production identity integration, production DB setup,
  and AI remain out of scope for this frontend demo.
