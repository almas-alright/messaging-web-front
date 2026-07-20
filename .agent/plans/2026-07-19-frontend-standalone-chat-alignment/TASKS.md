# Frontend Standalone Chat Alignment Tasks

Working branch: `frontend-standalone-chat-alignment`

## FE-CHAT-01 — Agent workflow alignment

- [x] FE-CHAT-01.01 Replace frontend `AGENTS.md` with backend-style minimal startup rules
- [x] FE-CHAT-01.02 Replace frontend `CODEX.md` with `.agent/CURRENT_PLAN.md` pointer
- [x] FE-CHAT-01.03 Ensure old `.workflows` remain legacy only
- [x] FE-CHAT-01.04 Update `.agent/state/HANDOFF.md`

Commit:

```text
task(frontend-chat.01): align frontend agent workflow
```

---

## FE-CHAT-02 — API and auth client foundation

- [x] FE-CHAT-02.01 Add/clean API client module for backend auth endpoints
- [x] FE-CHAT-02.02 Add typed request/response models for register/login/refresh/logout/me
- [x] FE-CHAT-02.03 Add auth error normalization
- [x] FE-CHAT-02.04 Keep backend API base URL configurable

Backend endpoints:

```text
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

Commit:

```text
task(frontend-chat.02): add auth api client foundation
```

---

## FE-CHAT-03 — Token storage and session lifecycle

- [x] FE-CHAT-03.01 Add token/session storage wrapper
- [x] FE-CHAT-03.02 Store messaging access token and refresh token safely for browser demo
- [x] FE-CHAT-03.03 Add refresh flow helper
- [x] FE-CHAT-03.04 Add logout/clear session helper
- [x] FE-CHAT-03.05 Remove main-flow dependency on manual JWT textarea

Commit:

```text
task(frontend-chat.03): add messaging token session lifecycle
```

---

## FE-CHAT-04 — Login/register UI

- [x] FE-CHAT-04.01 Add email/password login screen
- [x] FE-CHAT-04.02 Add registration screen
- [x] FE-CHAT-04.03 Add neutral error display
- [x] FE-CHAT-04.04 Add loading/submitting states
- [x] FE-CHAT-04.05 After login/register, load `/auth/me`

Commit:

```text
task(frontend-chat.04): add email password auth screens
```

---

## FE-CHAT-05 — Google/GitHub login UI hooks

- [x] FE-CHAT-05.01 Add Google login button placeholder flow
- [x] FE-CHAT-05.02 Add GitHub login button placeholder flow
- [x] FE-CHAT-05.03 Wire frontend calls to backend provider endpoints where existing backend contract allows
- [x] FE-CHAT-05.04 Show clear “provider not configured” state if env/provider is missing
- [x] FE-CHAT-05.05 Do not hardcode provider secrets

Backend endpoints:

```text
POST /auth/google
POST /auth/github
```

Commit:

```text
task(frontend-chat.05): add provider login ui hooks
```

---

## FE-CHAT-06 — Authenticated app shell

- [x] FE-CHAT-06.01 Split unauthenticated and authenticated app states
- [x] FE-CHAT-06.02 Show current user profile from `/auth/me`
- [x] FE-CHAT-06.03 Add logout action
- [x] FE-CHAT-06.04 Route authenticated users into standalone chat UI
- [x] FE-CHAT-06.05 Keep old demo route available only if still needed for dev reference

Commit:

```text
task(frontend-chat.06): add authenticated chat shell
```

---

## FE-CHAT-07 — Contacts and direct conversation flow

- [x] FE-CHAT-07.01 Update contacts client to use authenticated APIs
- [x] FE-CHAT-07.02 Remove frontend-supplied `owner_user_id` from main flow
- [x] FE-CHAT-07.03 Add contact search/add/list UI using messaging token
- [x] FE-CHAT-07.04 Resolve/open one-to-one conversation from contact
- [x] FE-CHAT-07.05 Handle permission/404/conflict states cleanly

Commit:

```text
task(frontend-chat.07): align contacts with authenticated identity
```

---

## FE-CHAT-08 — WebSocket messaging token connection

- [x] FE-CHAT-08.01 Update WebSocket client to use messaging access token
- [x] FE-CHAT-08.02 Reconnect after token refresh where practical
- [x] FE-CHAT-08.03 Join selected conversation after `connection.ready`
- [x] FE-CHAT-08.04 Show connected/joined/disconnected state
- [x] FE-CHAT-08.05 Remove false “message sent” state when socket send fails

Commit:

```text
task(frontend-chat.08): connect websocket with messaging token
```

---

## FE-CHAT-09 — Message history, send, receipts

- [x] FE-CHAT-09.01 Load conversation history after opening conversation
- [x] FE-CHAT-09.02 Render own/other messages
- [x] FE-CHAT-09.03 Send text messages through WebSocket
- [x] FE-CHAT-09.04 Render delivered/seen status
- [x] FE-CHAT-09.05 Mark visible received messages as seen where appropriate

Commit:

```text
task(frontend-chat.09): align one-to-one message flow
```

---

## FE-CHAT-10 — Attachment flow with auth token

- [x] FE-CHAT-10.01 Upload attachment using messaging access token
- [x] FE-CHAT-10.02 Send file message with returned attachment id
- [x] FE-CHAT-10.03 Render attachment metadata/link
- [x] FE-CHAT-10.04 Handle upload failure and size/type errors

Commit:

```text
task(frontend-chat.10): align attachment flow with auth
```

---

## FE-CHAT-11 — Final docs and verification

- [ ] FE-CHAT-11.01 Update README run guide for backend auth flow
- [ ] FE-CHAT-11.02 Add local test checklist for two-browser chat
- [ ] FE-CHAT-11.03 Run `npm run build`
- [ ] FE-CHAT-11.04 Run `npm run lint` if configured
- [ ] FE-CHAT-11.05 Record final handoff

Commit:

```text
task(frontend-chat.11): document standalone chat alignment
```
