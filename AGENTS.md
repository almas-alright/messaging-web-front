# AGENTS.md

Global rules for this frontend repository.

## Project

Messaging Web Front is a frontend-only chat application for the reusable messaging backend service.

Backend repo:

```text
https://github.com/almas-alright/messaging-service
```

## Stack

- Vite
- React
- TypeScript
- Simple CSS first
- Browser WebSocket
- Browser Fetch API
- No heavy UI library in the first demo

## Product Direction

Initial demo:

- WhatsApp-like chat window
- Manual JWT input
- Configurable backend API base URL
- Configurable WebSocket URL
- Conversation join
- Realtime send/receive
- Emoji support
- File upload/send
- Attachment link/preview
- Local network demo from Ubuntu host

Future:

- tawk.to-like embeddable chat widget
- iframe/script embed
- compact floating chat launcher
- voice message sending
- optional AI bot on a specific chat side
- human takeover from AI bot

## Hard Rules

- Frontend only.
- Do not implement backend code here.
- Do not duplicate backend business logic.
- Backend URL and WebSocket URL must be configurable.
- Do not hardcode `localhost` as the only usable backend target.
- Do not implement AI bot in first demo.
- Do not implement voice messages in first demo.
- Do not implement embed widget in first demo.
- Keep the UI simple and testable.

## Workflow Rules

- One phase = one branch.
- One task = one commit.
- Stop after each phase.
- Do not do all phases together.

Branch format:

```text
phase/<phase-number>-<phase-slug>
```

Commit format:

```text
task(<phase-number>.<task-number>): <short task summary>
```

## Required Checks

For implementation phases, run when applicable:

```bash
npm install
npm run build
npm run lint
```

If lint is not configured yet, do not invent extra tooling unless the phase asks for it.

## Stop Rule

After each phase, report:

- Branch
- Commits
- Files changed
- Checks run
- Blockers
- Next phase

Do not continue to the next phase without approval.
