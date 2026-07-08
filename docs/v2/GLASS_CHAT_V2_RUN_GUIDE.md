# Glass Chat V2 Run Guide

Glass Chat V2 is the new WhatsApp-like chat surface with macOS glass styling.
It lives beside the current demo UI and does not replace it.

## Branches

Use these branches together:

- Backend: `upgrade-phase-v2`
- Frontend: `upgrade-phase-glass-chat-v2`

The current demo UI remains available at:

```text
http://localhost:5173/
```

The Glass Chat V2 page is available at:

```text
http://localhost:5173/glass-chat
```

## Backend Setup

Start the backend from the backend repository:

```bash
cd ../messaging-service
git status --short --branch
docker compose up --build
```

The backend should be reachable at:

```text
http://localhost:8080
```

For this guide, the backend should be on branch `upgrade-phase-v2` so the V2
identity, contact, conversation, presence, and receipt APIs are available.

## Frontend Setup

Start the frontend from this repository:

```bash
cd ../messaging-web-front
git status --short --branch
cp .env.example .env.local
npm install
npm run dev -- --host 0.0.0.0
```

The frontend reads these Vite environment variables:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080/ws
```

For LAN testing, replace `localhost` with the host machine IP:

```env
VITE_API_BASE_URL=http://<host-ip>:8080
VITE_WS_BASE_URL=ws://<host-ip>:8080/ws
```

## Demo Token Note

Glass Chat V2 does not show the technical JWT textarea in its main UI. The
current WebSocket flow still uses the local demo JWT from browser storage.

For message sending in V2:

1. Open the current demo UI at `/`.
2. Paste or generate the local demo JWT used by the backend demo.
3. Save/check the current user through the existing demo controls.
4. Open `/glass-chat`.

Identity and contact HTTP calls do not use a password or real auth in this demo
phase.

## V2 Flow

### 1. Create Demo Identity

Open:

```text
http://localhost:5173/glass-chat
```

If no active V2 demo user is stored locally, the page shows an identity setup
card.

Enter:

```json
{
  "email": "akash@example.com",
  "username": "akash",
  "display_name": "Akash"
}
```

The frontend calls:

```http
POST /demo/users
```

The backend requires unique `email` and `username`. The frontend stores the
created user in localStorage for the browser demo session. Use `Reset identity`
in the V2 header to clear the local active identity.

### 2. Add Contacts

After identity setup, use the sidebar add-contact field.

You can enter either:

```text
akash@example.com
```

or:

```text
akash
```

The frontend calls:

```http
POST /contacts
GET /contacts?owner_user_id=<active-user-id>
```

The contact list shows a placeholder avatar, display name, username, email, and
presence dot area. Duplicate contacts should not create duplicate rows.

### 3. Open Direct Conversation

Click a contact row in the sidebar.

The frontend calls:

```http
POST /contacts/{contact_user_id}/conversation
```

Request body:

```json
{
  "owner_user_id": "user-001"
}
```

The backend returns a stable direct conversation id for that pair of users. The
main chat header updates to the selected contact and conversation state.

### 4. Send Messages

When the direct conversation is ready, the frontend connects to:

```text
GET /ws?token=<stored-demo-jwt>
```

It joins the resolved conversation and sends:

```json
{
  "type": "message.send",
  "conversation_id": "conv-direct-000001",
  "client_message_id": "client-msg-001",
  "body": "Hello"
}
```

Incoming `message.created` events render in the message timeline. Own messages
align right and contact messages align left.

## Presence

The sidebar and selected chat header show avatar-corner presence dots:

- Green: `online`
- Gray: `offline`
- Yellow: `away`, if the backend returns it

The frontend reads:

```http
GET /contacts/presence?owner_user_id=<active-user-id>
GET /presence/users/{user_id}
```

Presence is demo-level and in-memory on the backend. A backend restart can reset
presence state.

## Delivered And Seen Indicators

Own messages show small status marks near the timestamp:

- `...`: sending
- single check: sent
- double check: delivered
- double check with `seen`: seen

The frontend listens for:

```text
message.delivered
message.seen
```

When contact messages become visible, the frontend marks them seen through:

```http
PATCH /messages/{id}/seen
```

Receipt handling is intentionally simple for the demo and does not model
multi-device delivery accuracy.

## Moderation-Aware Bubble Colors

Backend moderation remains authoritative for `message.send`.

The V2 bubble colors are:

- Normal: greenish semi-transparent glass
- Warning: yellow semi-transparent glass when frontend advisory warning state is available
- Alert, flagged, or blocked: red semi-transparent glass

For backend events, `policy_status: "clean"` renders as normal, while
`policy_status: "flagged"` or `"blocked"` renders as alert styling. If the
backend blocks a message, the UI shows the WebSocket error and does not treat
that message as a confirmed delivered message.

## Known Demo Limitations

- No real auth yet.
- Demo identity uses email and username only.
- Contact owner id is demo-driven and stored locally.
- In-memory backend storage may reset on backend restart.
- Presence is in-memory and demo-level.
- Delivered and seen receipts are simple demo-level signals.
- Message history may not be permanent unless the current backend storage keeps it.
- Glass Chat V2 depends on the stored local demo JWT for WebSocket messaging.
- AI bot is not included yet.
- Support, business, and industry-specific variants are future product modes.

## Quick Verification

Run the frontend build after changes:

```bash
npm run build
```

Manual smoke test:

1. Start backend branch `upgrade-phase-v2`.
2. Start frontend branch `upgrade-phase-glass-chat-v2`.
3. Open `/` and store a local demo JWT.
4. Open `/glass-chat`.
5. Create two demo users in separate browsers or profiles.
6. Add one user as a contact by email or username.
7. Open the direct conversation.
8. Send a message.
9. Confirm presence dots and delivered/seen indicators update where practical.
