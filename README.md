# Messaging Web Front

Simple chat frontend for the reusable messaging backend service.

This repository is **frontend only**.

Backend repository:

```text
https://github.com/almas-alright/messaging-service
```

## Goal

Build a simple WhatsApp-like chat UI that can run on your Ubuntu PC and connect to the local messaging backend through configurable URLs.

Initial local demo:

- Vite + React + TypeScript
- Configurable backend API base URL
- Configurable WebSocket URL
- Manual JWT paste for local demo
- Buyer/seller chat UI
- Message list
- Emoji support
- File upload/send
- Attachment preview/link
- Local network testing from other computers

Future direction:

- Embeddable chat widget like tawk.to
- Website iframe/script integration
- Compact floating chat window
- Voice message sending
- Optional AI bot per chat side
- Human takeover from AI bot

## Not In First Demo

- Full marketplace frontend
- Production auth login
- AI bot implementation
- Voice messages
- tawk.to-style embed script
- Agent dashboard

Those are future phases.

## Local Installation Plan

Both backend and frontend can run on the same Ubuntu PC.

Backend example:

```bash
git clone https://github.com/almas-alright/messaging-service.git
cd messaging-service
docker compose up --build
```

Frontend local run:

```bash
git clone https://github.com/almas-alright/messaging-web-front.git
cd messaging-web-front
npm install
npm run dev -- --host 0.0.0.0
```

The app defaults to:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080/ws
```

For LAN testing, create a local `.env.local` file:

```env
VITE_API_BASE_URL=http://192.168.1.10:8080
VITE_WS_BASE_URL=ws://192.168.1.10:8080/ws
```

Use your Ubuntu PC LAN IP instead of `192.168.1.10`.

Other computers on the same local network can open:

```text
http://192.168.1.10:5173
```

## Frontend Checks

Run:

```bash
npm install
npm run build
```

`npm run lint` is not configured yet.

## Backend CORS Requirement

The backend must allow local frontend origins during LAN testing, for example:

```text
http://localhost:5173
http://127.0.0.1:5173
http://192.168.1.10:5173
```

For production, CORS should be restricted to approved domains only.

## Agent Workflow

Start from:

```text
AGENTS.md
CODEX.md
.workflows/phase-plan.md
.workflows/task-checklist.md
```

Rules:

- One phase = one branch
- One task = one commit
- Stop after each phase
- Do not implement all phases together
- Keep this repository frontend-only
