# Task Checklist

## Phase 01: Agentic Scaffolding

- [x] 01.01 Add README with product direction and local installation notes
- [x] 01.02 Add global agent rules
- [x] 01.03 Add Codex entry point
- [x] 01.04 Add workflow phase plan
- [x] 01.05 Add task checklist
- [x] 01.06 Add context and contract docs

## Phase 02: Vite React Skeleton

- [x] 02.01 Initialize Vite React TypeScript app
- [x] 02.02 Add basic folder structure
- [x] 02.03 Add environment config loading
- [x] 02.04 Add base layout shell
- [x] 02.05 Add README run instructions update

## Phase 03: Backend Configuration And Health Check

- [x] 03.01 Add API base URL settings form
- [x] 03.02 Add WebSocket URL settings form
- [x] 03.03 Persist settings in local storage
- [x] 03.04 Add health/readiness check buttons
- [x] 03.05 Show backend connection status

## Phase 04: JWT Demo Auth

- [x] 04.01 Add JWT textarea
- [x] 04.02 Persist JWT in local storage for demo
- [x] 04.03 Add `/auth/me` API call
- [x] 04.04 Show current user display name and role
- [x] 04.05 Add clear/reset demo auth action

## Phase 05: WebSocket Connection

- [x] 05.01 Add WebSocket client module
- [x] 05.02 Connect using configured WebSocket URL and JWT
- [x] 05.03 Show connection state
- [x] 05.04 Handle `connection.ready`
- [x] 05.05 Add reconnect/disconnect buttons

## Phase 06: Conversation Join And History

- [x] 06.01 Add conversation ID input
- [x] 06.02 Send `conversation.join`
- [x] 06.03 Show joined conversation state
- [x] 06.04 Send `conversation.history`
- [x] 06.05 Render `conversation.messages`

## Phase 07: WhatsApp-Like Chat UI

- [x] 07.01 Add message list layout
- [x] 07.02 Add own/other message bubbles
- [x] 07.03 Add message composer
- [x] 07.04 Send `message.send`
- [x] 07.05 Render realtime `message.created`
- [x] 07.06 Add responsive mobile-friendly layout

## Phase 08: Emoji Support

- [x] 08.01 Add simple emoji picker
- [x] 08.02 Insert emoji into composer
- [x] 08.03 Keep keyboard typing simple
- [x] 08.04 Verify emoji send/receive through WebSocket

## Phase 09: File Upload And File Message

- [x] 09.01 Add file picker
- [x] 09.02 Upload to `POST /conversations/{id}/attachments`
- [x] 09.03 Send file message with `attachment_id`
- [ ] 09.04 Render file message link/metadata
- [ ] 09.05 Show upload progress/error state where practical

## Phase 10: Local Network Demo Polish

- [ ] 10.01 Add LAN run guide to README
- [ ] 10.02 Add `.env.example`
- [ ] 10.03 Add Dockerfile for frontend static hosting if practical
- [ ] 10.04 Add docker-compose frontend example if practical
- [ ] 10.05 Add local test checklist

## Phase 11: Release Candidate Review

- [ ] 11.01 Run build checks
- [ ] 11.02 Verify backend health/auth/connect/join/send/file flow
- [ ] 11.03 Review README installation instructions
- [ ] 11.04 Review frontend/backend config boundary
- [ ] 11.05 Prepare release notes

## Future Phase 12: Embeddable Widget Research

- [ ] 12.01 Research iframe/script options
- [ ] 12.02 Define widget size and launcher UX
- [ ] 12.03 Define host-page isolation rules

## Future Phase 13: Voice Message Plan

- [ ] 13.01 Define audio recording UX
- [ ] 13.02 Define upload as attachment flow
- [ ] 13.03 Define playback UI

## Future Phase 14: AI Bot And Human Takeover Plan

- [ ] 14.01 Define bot-side configuration UX
- [ ] 14.02 Define bot/human state display
- [ ] 14.03 Define human takeover UX
