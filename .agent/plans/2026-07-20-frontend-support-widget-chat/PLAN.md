# Frontend Support Widget Chat Plan

## Branch

```text
frontend-support-widget-chat
```

## Purpose

Build customer-support widget chat on top of the completed standalone chat foundation.

This is the second product mode:

```text
1. Standalone one-to-one chat — done
2. Customer-support widget chat — current plan
3. Embedded platform chat — later
4. Bot / AI-assisted conversations — later
```

## Product goal

A business can embed a support chat widget into any website.

A visitor can open the widget, enter email/name, start a support conversation, receive verification email/code, continue chat using visitor token, and optionally claim/link the conversation after verification.

A support agent can login to the main app, see support conversations, reply to visitors, and continue conversation in the authenticated chat interface.

## Backend contracts expected

Use existing backend contracts where available:

```text
POST /support/sessions/start
POST /support/email/send-code
POST /support/email/verify-code
GET  /auth/me
/ws?token=<visitor-or-user-token>
```

For support-agent inbox, prefer existing authenticated conversation APIs. If backend does not expose enough support inbox filtering/listing, record blocker in `.agent/state/HANDOFF.md`; do not invent backend behavior in frontend.

## In scope

- Widget config/env foundation
- Floating launcher UI
- Visitor support session start
- Visitor token storage
- Visitor WebSocket connection
- Visitor message panel
- Email send-code and verify-code UI
- Conversation claim/verified state display
- Support agent inbox UI in main app
- Agent reply flow using authenticated user token
- Responsive widget behavior
- Local embed demo page
- Documentation and checks

## Out of scope

- Backend changes
- AI/bot automation
- Embedded marketplace token exchange
- Payment/order/project-specific flows
- Multi-agent routing logic
- Admin assignment workflow
- Push notifications
