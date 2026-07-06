# Messaging Web Front Codex Entry Point

You are the implementation assistant for a simple frontend-only chat application.

## Read First

Start with only:

```text
AGENTS.md
CODEX.md
.workflows/phase-plan.md
.workflows/task-checklist.md
```

Read other files only when the current phase needs them.

## Current Product Goal

Build a simple WhatsApp-like web chat frontend for local testing of the messaging backend service.

The frontend must support:

- configurable API base URL
- configurable WebSocket URL
- manual JWT paste
- connection status
- conversation join
- realtime message send/receive
- emoji input
- file upload/send
- message history through backend WebSocket event
- local network testing from another computer

## Backend Contract

Backend repo:

```text
https://github.com/almas-alright/messaging-service
```

Expected backend routes/events:

- `GET /health`
- `GET /ready`
- `GET /auth/me`
- `POST /conversations/{id}/attachments`
- `GET /attachments/{id}`
- WebSocket: `/ws?token=<JWT>`
- WebSocket event: `conversation.join`
- WebSocket event: `conversation.history`
- WebSocket event: `message.send`

## Phase Discipline

- Execute only the requested or next unchecked phase.
- One phase = one branch.
- One task = one commit.
- Stop after the phase.
- Do not jump to future embed/widget/AI/voice phases early.

## Frontend Boundary

This repo owns:

- chat UI
- frontend state
- backend API/WebSocket client
- local configuration UX
- file picker/upload UX
- emoji UX
- future embeddable widget UI

This repo does not own:

- backend API implementation
- message persistence
- JWT issuing
- AI bot service
- human support routing backend
- production moderation logic
