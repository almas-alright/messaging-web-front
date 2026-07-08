# Frontend Glass Chat V2 Phase Plan

Branch: `upgrade-phase-glass-chat-v2`

This plan defines the frontend-only work needed to build a new WhatsApp-like,
macOS glass chat experience on top of the backend V2 APIs. It is a planning and
execution guide only. Do not implement frontend code in this phase.

## Product Objective

Build a polished V2 chat UI that feels like a lightweight WhatsApp/macOS glass
messenger while preserving the current demo app until the V2 surface is ready.

The V2 UI should:

- Remove the backend port connection panel from the main product surface.
- Remove the health check section from the main product surface.
- Remove buyer/seller framing and labels.
- Remove the technical JWT textarea from the main UI.
- Use demo identity built around email, unique username, display name, and a placeholder avatar.
- Show a contact sidebar with search, add contact, and contact list states.
- Open direct conversations from contacts.
- Show avatar-corner presence status.
- Render delivered and seen message status.
- Render moderation-aware message bubble states.
- Reuse existing API, WebSocket, file, emoji, and moderation client logic where possible.
- Keep the current demo app untouched until a later swap or route decision.

## UI Layout

### App Shell

The V2 app should use a full-viewport desktop chat layout with responsive mobile
behavior:

- Left sidebar for the current user, search, add contact, and contact list.
- Main conversation pane for selected direct chat.
- Message timeline with floating glass bubbles.
- Composer anchored at the bottom of the conversation pane.
- Optional conversation header with contact name, username, avatar, presence,
  and lightweight connection state.

The first screen should be the actual chat experience, not a landing page.

### Sidebar

Sidebar elements:

- Current demo user identity summary.
- Search/add contact input that accepts email or username.
- Contact rows with placeholder avatar, display name, username or email, latest
  message preview when available, and presence dot.
- Empty state for no contacts.
- Error state for duplicate, missing, or self-contact attempts.

Avoid buyer/seller language. Use user/contact/conversation language.

### Conversation Pane

Conversation pane elements:

- Contact avatar and display name in header.
- Presence text such as `online` or `last active`.
- Message list with own/other alignment.
- Delivered/seen marker on own messages.
- Composer with text input, emoji affordance, file affordance if reused, and send button.
- Clear empty state when no contact is selected.

### Visual Style

Use macOS glass styling with discipline:

- Translucent surfaces using `backdrop-filter` where supported.
- Soft shadows and layered depth.
- Floating message bubbles.
- Rounded but controlled radii.
- Greenish semi-transparent glass for normal outgoing/accepted messages.
- Yellow semi-transparent glass for warning messages.
- Red semi-transparent glass for alert, block, or flagged states.
- Subtle background depth without decorative clutter.

Animation:

- Add a very subtle slow swing animation only to the latest message if it feels
  pleasant and non-distracting.
- Respect `prefers-reduced-motion`.
- Disable or remove the animation if it competes with reading messages.

## Backend V2 API Dependencies

Backend branch: `upgrade-phase-v2`

Frontend guide in backend repo:

```text
../messaging-service/docs/v2/FRONTEND_V2_INTEGRATION_GUIDE.md
```

### Demo Identity

```http
POST /demo/users
GET /users/search?query=
GET /users/{id}
```

Create user request:

```json
{
  "email": "akash@example.com",
  "username": "akash",
  "display_name": "Akash"
}
```

Use these endpoints for the V2 demo identity setup flow. This is not production
login and does not create passwords or sessions.

### Contacts

```http
POST /contacts
GET /contacts?owner_user_id=
DELETE /contacts/{contact_id}?owner_user_id=
```

Add contact request:

```json
{
  "owner_user_id": "user-001",
  "contact": "akash@example.com"
}
```

The `contact` value can be email or username.

### Direct Conversations

```http
POST /contacts/{contact_user_id}/conversation
```

Request:

```json
{
  "owner_user_id": "user-001"
}
```

Use this endpoint when a contact row is selected. The same two users should
resolve to the same direct conversation id.

### Presence

```http
GET /presence/users/{user_id}
GET /contacts/presence?owner_user_id=
```

Presence values:

- `online`
- `offline`
- `last_active_at`

Presence is REST-backed in this backend phase. Do not assume
`presence.online` or `presence.offline` WebSocket events exist yet.

### Message History

```http
GET /conversations/{id}/messages?limit=30&before=
```

This endpoint requires the local demo JWT and returns chronological windows.
Use it for initial conversation hydration if it is cleaner than the older
WebSocket `conversation.history` path.

### Seen Receipt

```http
PATCH /messages/{id}/seen
```

Requires local demo JWT. Use when a recipient opens or reads a message.
Message authors cannot mark their own messages seen.

### WebSocket

```text
GET /ws?token=<JWT>
```

Events to send:

```json
{"type":"conversation.join","conversation_id":"conv-direct-000001"}
{"type":"message.send","conversation_id":"conv-direct-000001","client_message_id":"client-msg-001","body":"Hello"}
{"type":"message.seen","message_id":"msg-000001"}
{"type":"connection.heartbeat","conversation_id":"conv-direct-000001"}
```

Events to handle:

```json
{"type":"connection.ready","user_id":"user-001"}
{"type":"conversation.joined","conversation_id":"conv-direct-000001","user_id":"user-001"}
{"type":"message.created","conversation_id":"conv-direct-000001","message_id":"msg-000001","client_message_id":"client-msg-001","message_type":"text","policy_status":"clean","sender_id":"user-001","body":"Hello","created_at":"2026-01-01T10:00:00Z"}
{"type":"message.delivered","conversation_id":"conv-direct-000001","message_id":"msg-000001","user_id":"user-002","status":"delivered","updated_at":"2026-01-01T10:00:01Z"}
{"type":"message.seen","conversation_id":"conv-direct-000001","message_id":"msg-000001","user_id":"user-002","status":"seen","updated_at":"2026-01-01T10:00:05Z"}
{"type":"error","error":"message blocked by moderation","conversation_id":"conv-direct-000001"}
```

### Moderation

Existing frontend moderation logic may remain advisory/visual. Backend
moderation is authoritative for `message.send`.

Message visual states:

- `policy_status: clean`: normal greenish glass bubble.
- `policy_status: flagged`: red or alert glass bubble, depending on severity
  if available.
- Frontend warning before send: yellow glass preview or composer warning.
- Backend block error: red failed/blocked state; do not render as confirmed sent
  unless the UI clearly marks it blocked.

## Frontend Folder Structure Proposal

Keep the current demo app files intact. Add V2 alongside them until the new
surface is ready.

Suggested structure:

```text
src/
  app/
    AppRouter.tsx
    routes.ts
  features/
    glassChatV2/
      GlassChatApp.tsx
      components/
        GlassShell.tsx
        ContactSidebar.tsx
        ContactRow.tsx
        AddContactForm.tsx
        ConversationHeader.tsx
        MessageTimeline.tsx
        MessageBubble.tsx
        MessageComposer.tsx
        PresenceDot.tsx
        ReceiptMark.tsx
      hooks/
        useDemoIdentity.ts
        useContacts.ts
        useContactPresence.ts
        useDirectConversation.ts
        useGlassChatSocket.ts
        useMessageReceipts.ts
      state/
        glassChatStore.ts
      styles/
        glassChat.css
    chat/
      existing current demo chat files
  api/
    httpClient.ts
    v2Client.ts
  realtime/
    webSocketClient.ts
    v2Events.ts
  moderation/
    existing reusable moderation files
  types/
    chat.ts
    v2.ts
```

Notes:

- Reuse `src/api/httpClient.ts` instead of creating a second HTTP foundation.
- Reuse `src/realtime/webSocketClient.ts` where practical.
- Keep V2-specific React state close to `features/glassChatV2`.
- Keep API DTO types separate from UI view models when that reduces confusion.
- Avoid moving the old demo app during early V2 phases.

## Phase-By-Phase Implementation Plan

Each phase should be one branch task and one commit unless the user explicitly
changes the workflow. Do not implement future phases early.

### Phase V2-FE-00 - Planning Bundle

Goal: add this plan only.

Deliverables:

- `docs/v2/FRONTEND_GLASS_CHAT_V2_PHASE_PLAN.md`

Commit:

```text
docs(v2): add glass chat frontend phase plan
```

### Phase V2-FE-01 - V2 App Shell Without Replacing Demo

Goal: create the V2 feature entry point and static glass layout while keeping
the existing demo UI available.

Deliverables:

- V2 route or local feature toggle that can show `GlassChatApp`.
- Static shell with sidebar, conversation pane, and composer layout.
- No backend calls beyond existing app behavior.
- Current demo UI untouched.

Acceptance:

- App builds.
- Existing demo app still works.
- V2 shell can be opened through the chosen route/toggle.
- Mobile and desktop layouts do not overlap.

Codex prompt template:

```text
Work on branch: upgrade-phase-glass-chat-v2.

Complete only Phase V2-FE-01: V2 App Shell Without Replacing Demo.
Make one commit on this branch.
Stop after commit.

Read:
- AGENTS.md
- CODEX.md
- docs/v2/FRONTEND_GLASS_CHAT_V2_PHASE_PLAN.md
- src/App.tsx
- src/components/*
- src/features/chat/*

Task:
Add a V2 glass chat shell alongside the existing demo UI. Do not replace or
remove the current demo app. No backend integration yet.

Run:
- npm run build

Commit with message:
feat(v2): add glass chat app shell
```

### Phase V2-FE-02 - Demo Identity Setup

Goal: support email + username demo identity without exposing a technical JWT
textarea in the main V2 UI.

Deliverables:

- Demo identity form for email, username, and optional display name.
- API client calls for `POST /demo/users`, `GET /users/{id}`, and
  `GET /users/search?query=`.
- Local state/storage for active V2 demo user id.
- Friendly duplicate email/username handling.
- Placeholder avatar display.

Acceptance:

- User can create a demo identity.
- Duplicate email and username errors are readable.
- User search works by email or username.
- Main V2 UI does not show a technical JWT textarea.
- Existing demo auth UI remains untouched outside V2.

Codex prompt template:

```text
Work on branch: upgrade-phase-glass-chat-v2.

Complete only Phase V2-FE-02: Demo Identity Setup.
Make one commit on this branch.
Stop after commit.

Read:
- docs/v2/FRONTEND_GLASS_CHAT_V2_PHASE_PLAN.md
- src/api/httpClient.ts
- src/config/*
- existing auth storage code if needed

Task:
Add V2 demo identity creation/search support using backend V2 user APIs.
Do not implement contacts yet. Do not expose the technical JWT textarea in the
main V2 UI. Keep current demo app untouched.

Run:
- npm run build

Commit with message:
feat(v2): add glass chat demo identity setup
```

### Phase V2-FE-03 - Contacts Sidebar

Goal: add and list contacts by email or username.

Deliverables:

- Contact sidebar wired to `POST /contacts` and `GET /contacts`.
- Add-contact form with email/username input.
- Stable contact rows with avatar, display name, username/email.
- Empty, loading, duplicate, self-contact, and not-found states.

Acceptance:

- Add contact by email works.
- Add contact by username works.
- Duplicate add does not duplicate UI rows.
- Contact list remains stable after refresh.
- Current demo app remains untouched.

Codex prompt template:

```text
Work on branch: upgrade-phase-glass-chat-v2.

Complete only Phase V2-FE-03: Contacts Sidebar.
Make one commit on this branch.
Stop after commit.

Read:
- docs/v2/FRONTEND_GLASS_CHAT_V2_PHASE_PLAN.md
- V2 identity code
- src/api/httpClient.ts

Task:
Wire the V2 contact sidebar to backend contact APIs. Do not implement direct
conversation opening yet. Keep current demo app untouched.

Run:
- npm run build

Commit with message:
feat(v2): add glass chat contacts sidebar
```

### Phase V2-FE-04 - Direct Conversation Opening

Goal: clicking a contact resolves and opens a direct conversation.

Deliverables:

- API client for `POST /contacts/{contact_user_id}/conversation`.
- Selected contact/conversation state.
- Conversation header showing contact identity.
- Join resolved conversation through existing WebSocket flow when connected.
- Initial message history loading path selected and documented in code comments
  only where necessary.

Acceptance:

- Contact click opens the same conversation id on repeated clicks.
- Non-contact errors are handled cleanly.
- Joined conversation can receive/send messages through existing WebSocket logic.
- Existing seeded `conv-001` demo remains unaffected.

Codex prompt template:

```text
Work on branch: upgrade-phase-glass-chat-v2.

Complete only Phase V2-FE-04: Direct Conversation Opening.
Make one commit on this branch.
Stop after commit.

Read:
- docs/v2/FRONTEND_GLASS_CHAT_V2_PHASE_PLAN.md
- src/realtime/webSocketClient.ts
- V2 contact sidebar code
- existing chat join/history code

Task:
Resolve direct conversations from contact selection and join the resolved
conversation through the existing WebSocket flow. Do not implement presence or
receipts yet.

Run:
- npm run build

Commit with message:
feat(v2): open direct glass chat conversations
```

### Phase V2-FE-05 - Presence Display

Goal: show avatar-corner online/offline status for contacts.

Deliverables:

- API client for `GET /presence/users/{user_id}` and
  `GET /contacts/presence?owner_user_id=`.
- Presence dot component.
- Sidebar presence refresh on load and periodic/lightweight refresh.
- Conversation header presence display.

Acceptance:

- Online contacts show an online dot.
- Offline contacts show offline state and last active text when available.
- UI does not assume WebSocket `presence.online/offline` events.
- Presence polling is simple and easy to remove later.

Codex prompt template:

```text
Work on branch: upgrade-phase-glass-chat-v2.

Complete only Phase V2-FE-05: Presence Display.
Make one commit on this branch.
Stop after commit.

Read:
- docs/v2/FRONTEND_GLASS_CHAT_V2_PHASE_PLAN.md
- V2 contacts/direct conversation code

Task:
Add avatar-corner presence status using backend V2 REST presence endpoints.
Do not invent WebSocket presence events.

Run:
- npm run build

Commit with message:
feat(v2): show contact presence in glass chat
```

### Phase V2-FE-06 - Delivered And Seen Receipts

Goal: render WhatsApp-like delivered and seen states.

Deliverables:

- Handle WebSocket `message.delivered` and `message.seen`.
- Send WebSocket or HTTP seen updates when a recipient opens/reads a message.
- Receipt mark component for delivered/seen on own messages.
- History hydration uses `receipt_status` when available.

Acceptance:

- Own messages show delivered after recipient delivery event.
- Own messages show seen after recipient seen event.
- Recipient marks messages seen without marking own messages.
- Receipt state survives simple history reload while backend memory remains.

Codex prompt template:

```text
Work on branch: upgrade-phase-glass-chat-v2.

Complete only Phase V2-FE-06: Delivered And Seen Receipts.
Make one commit on this branch.
Stop after commit.

Read:
- docs/v2/FRONTEND_GLASS_CHAT_V2_PHASE_PLAN.md
- src/realtime/webSocketClient.ts
- V2 message state code

Task:
Add delivered/seen receipt handling for the V2 glass chat. Do not change backend
code and do not change the old demo UI.

Run:
- npm run build

Commit with message:
feat(v2): add glass chat message receipts
```

### Phase V2-FE-07 - Moderation-Aware Bubble States

Goal: render warning, flagged, alert, and blocked message states clearly.

Deliverables:

- Map frontend advisory moderation findings to yellow warning UI before send.
- Map backend `policy_status` to normal or alert bubble styles.
- Handle backend moderation block errors as failed/blocked optimistic messages.
- Keep backend moderation authoritative.

Acceptance:

- Clean messages use greenish glass.
- Advisory warning uses yellow glass.
- Flagged/alert/backend-blocked states use red glass.
- Raw sensitive matched text is not displayed unnecessarily.

Codex prompt template:

```text
Work on branch: upgrade-phase-glass-chat-v2.

Complete only Phase V2-FE-07: Moderation-Aware Bubble States.
Make one commit on this branch.
Stop after commit.

Read:
- docs/v2/FRONTEND_GLASS_CHAT_V2_PHASE_PLAN.md
- src/moderation/*
- V2 message bubble/composer code

Task:
Add moderation-aware visual states to V2 glass chat bubbles and composer
warnings. Backend decisions remain authoritative.

Run:
- npm run build

Commit with message:
feat(v2): add moderation aware glass bubbles
```

### Phase V2-FE-08 - Glass Polish And Motion QA

Goal: finish the macOS glass visual treatment and responsive behavior.

Deliverables:

- Final glass styling pass.
- Latest-message subtle slow swing animation if it passes comfort checks.
- `prefers-reduced-motion` support.
- Mobile layout pass.
- Browser smoke screenshots if practical.

Acceptance:

- No overlapping UI on desktop or mobile.
- Text fits inside bubbles and controls.
- Animation is subtle or disabled.
- Current demo app remains accessible until final product decision.

Codex prompt template:

```text
Work on branch: upgrade-phase-glass-chat-v2.

Complete only Phase V2-FE-08: Glass Polish And Motion QA.
Make one commit on this branch.
Stop after commit.

Read:
- docs/v2/FRONTEND_GLASS_CHAT_V2_PHASE_PLAN.md
- V2 glass chat components/styles

Task:
Polish the V2 glass chat visual system and responsive states. Keep motion subtle
and respect reduced motion. Do not add new backend behavior.

Run:
- npm run build

Commit with message:
style(v2): polish glass chat experience
```

## Testing Checklist

Run during implementation phases:

```bash
npm install
npm run build
```

Manual checks:

- Current demo app still opens and behaves as before.
- V2 app can create or select a demo user.
- Duplicate email and username errors are readable.
- Search finds users by email and username.
- Contact add by email works.
- Contact add by username works.
- Self-contact is rejected in UI.
- Missing contact returns a readable not-found state.
- Contact list stays stable after refresh.
- Clicking a contact resolves a direct conversation.
- Repeated contact click returns the same conversation.
- WebSocket connects with a local demo JWT.
- Conversation join succeeds before send.
- Message send renders `message.created`.
- Connected recipient produces delivered status where practical.
- Seen action produces seen status.
- Presence shows online/offline and last active.
- Backend moderation warning/flag/block states are represented visually.
- Blocked messages are not shown as confirmed sent.
- File/emoji behavior remains intact if reused in V2.
- Mobile width does not overlap sidebar, bubbles, composer, or header.
- Keyboard focus remains usable in composer and add-contact form.
- `prefers-reduced-motion` disables latest-message swing.

Optional browser QA:

- Desktop Chromium.
- Mobile viewport around 390px wide.
- LAN URL with backend on another host IP.

## Do-Not-Do List

- Do not implement backend code in this repository.
- Do not change the current demo UI during the planning phase.
- Do not replace the current demo app until a later explicit phase asks for it.
- Do not add a backend port connection panel to the V2 main UI.
- Do not add a health check section to the V2 main UI.
- Do not use buyer/seller labels in V2.
- Do not expose a technical JWT textarea in the main V2 UI.
- Do not implement real authentication.
- Do not implement AI chat, AI moderation, or bot handoff.
- Do not add external UI frameworks unless explicitly approved.
- Do not duplicate backend moderation decisions as frontend authority.
- Do not hardcode `localhost` as the only usable backend target.
- Do not invent WebSocket `presence.online` or `presence.offline` handling until
  the backend provides those events.
- Do not store raw sensitive moderation matched text in frontend state when a
  hash or visual state is enough.
- Do not make the glass styling so translucent that text loses contrast.
- Do not keep latest-message motion if it distracts from reading.

