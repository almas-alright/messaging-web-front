# Phase Plan

Do not implement all phases together. Execute one phase, commit task by task, then stop.

## Phase 01: Agentic Scaffolding

Branch:

```text
phase/01-agentic-scaffold
```

Tasks:

- 01.01 Add README with product direction and local installation notes
- 01.02 Add global agent rules
- 01.03 Add Codex entry point
- 01.04 Add workflow phase plan
- 01.05 Add task checklist
- 01.06 Add context and contract docs

## Phase 02: Vite React Skeleton

Branch:

```text
phase/02-vite-react-skeleton
```

Tasks:

- 02.01 Initialize Vite React TypeScript app
- 02.02 Add basic folder structure
- 02.03 Add environment config loading
- 02.04 Add base layout shell
- 02.05 Add README run instructions update

## Phase 03: Backend Configuration And Health Check

Branch:

```text
phase/03-backend-config-health
```

Tasks:

- 03.01 Add API base URL settings form
- 03.02 Add WebSocket URL settings form
- 03.03 Persist settings in local storage
- 03.04 Add health/readiness check buttons
- 03.05 Show backend connection status

## Phase 04: JWT Demo Auth

Branch:

```text
phase/04-jwt-demo-auth
```

Tasks:

- 04.01 Add JWT textarea
- 04.02 Persist JWT in local storage for demo
- 04.03 Add `/auth/me` API call
- 04.04 Show current user display name and role
- 04.05 Add clear/reset demo auth action

## Phase 05: WebSocket Connection

Branch:

```text
phase/05-websocket-connection
```

Tasks:

- 05.01 Add WebSocket client module
- 05.02 Connect using configured WebSocket URL and JWT
- 05.03 Show connection state
- 05.04 Handle `connection.ready`
- 05.05 Add reconnect/disconnect buttons

## Phase 06: Conversation Join And History

Branch:

```text
phase/06-conversation-history
```

Tasks:

- 06.01 Add conversation ID input
- 06.02 Send `conversation.join`
- 06.03 Show joined conversation state
- 06.04 Send `conversation.history`
- 06.05 Render `conversation.messages`

## Phase 07: WhatsApp-Like Chat UI

Branch:

```text
phase/07-chat-ui
```

Tasks:

- 07.01 Add message list layout
- 07.02 Add own/other message bubbles
- 07.03 Add message composer
- 07.04 Send `message.send`
- 07.05 Render realtime `message.created`
- 07.06 Add responsive mobile-friendly layout

## Phase 08: Emoji Support

Branch:

```text
phase/08-emoji-support
```

Tasks:

- 08.01 Add simple emoji picker
- 08.02 Insert emoji into composer
- 08.03 Keep keyboard typing simple
- 08.04 Verify emoji send/receive through WebSocket

## Phase 09: File Upload And File Message

Branch:

```text
phase/09-file-upload
```

Tasks:

- 09.01 Add file picker
- 09.02 Upload to `POST /conversations/{id}/attachments`
- 09.03 Send file message with `attachment_id`
- 09.04 Render file message link/metadata
- 09.05 Show upload progress/error state where practical

## Phase 10: Local Network Demo Polish

Branch:

```text
phase/10-local-network-demo
```

Tasks:

- 10.01 Add LAN run guide to README
- 10.02 Add `.env.example`
- 10.03 Add Dockerfile for frontend static hosting if practical
- 10.04 Add docker-compose frontend example if practical
- 10.05 Add local test checklist

## Phase 11: Release Candidate Review

Branch:

```text
phase/11-release-candidate-review
```

Tasks:

- 11.01 Run build checks
- 11.02 Verify backend health/auth/connect/join/send/file flow
- 11.03 Review README installation instructions
- 11.04 Review frontend/backend config boundary
- 11.05 Prepare release notes

## Future Phase 12: Embeddable Widget Research

Do not implement in first demo.

Goal:

- tawk.to-like iframe/script embed plan
- compact widget size
- launcher button
- host-page safe isolation

## Future Phase 13: Voice Message Plan

Do not implement in first demo.

Goal:

- browser audio recording UX
- upload audio as attachment
- render playable voice message

## Future Phase 14: AI Bot And Human Takeover Plan

Do not implement in first demo.

Goal:

- optional bot on a specific chat side
- bot/human state indicator
- human takeover UX
- clear boundary with future backend/bot service
