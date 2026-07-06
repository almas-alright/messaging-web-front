# Release Notes

## Messaging Web Front Local Demo RC

Date: 2026-07-06

This release candidate is a frontend-only local demo for the reusable messaging
service.

## Included

- Vite + React + TypeScript app shell.
- Configurable backend API and WebSocket URLs.
- Manual JWT paste flow for local demo auth.
- `GET /auth/me` current-user check.
- WebSocket connect, reconnect, and disconnect controls.
- Conversation ID input, join, and history loading.
- Chat message rendering for own, other, system, history, and realtime events.
- Text message send over WebSocket.
- Emoji picker and keyboard-friendly composer behavior.
- Attachment selection, upload, file-message send, and attachment card rendering.
- LAN demo instructions.
- Static frontend Docker image with Nginx.
- Frontend `compose.yaml`.
- Local test checklist and config-boundary documentation.

## Verified

- Production build passes.
- Docker image build passes.
- Docker Compose config passes.
- Local backend health and readiness pass.
- Local demo JWT auth passes.
- Local WebSocket connect, join, text send, file send, and history pass.
- Frontend dev server responds with HTTP `200`.

## Known Gaps

- `npm run lint` is not configured.
- Browser click-through is still recommended before stakeholder demos.
- Demo JWT is stored in browser localStorage for local testing only.
- Vite Docker builds embed `VITE_API_BASE_URL` and `VITE_WS_BASE_URL` at build
  time; the settings panel can override them in browser localStorage.

## Not Included

- Login, register, or password forms.
- Production identity provider integration.
- Production database setup.
- AI bot or AI moderation.
- Voice messages.
- Embeddable widget.
- Marketplace-specific workflows outside messaging.

## Run

Development server:

```bash
cp .env.example .env.local
npm install
npm run dev -- --host 0.0.0.0
```

Static Docker frontend:

```bash
docker compose up --build
```

Release-candidate review details are in
[release-candidate-review.md](release-candidate-review.md).
