# Frontend Standalone Chat Alignment Plan

## Branch

```text
frontend-standalone-chat-alignment
```

## Purpose

Align the frontend with the completed backend auth and email foundation.

Current focus:

```text
Production-style WhatsApp one-to-one chat first
```

Later plans:

```text
Customer support widget chat
Embedded platform chat
Bot / AI-assisted conversations
```

## Direction

Replace old manual JWT demo dependency with backend messaging auth:

```text
email/password or provider login
    -> messaging access token
    -> REST API
    -> WebSocket
    -> authenticated contacts/conversations/messages
```

## In scope

- Frontend agent workflow alignment
- Auth API client
- Register/login/logout/refresh/me
- Google/GitHub UI hooks
- Token storage wrapper
- Authenticated WebSocket connection
- One-to-one contact/conversation flow
- Message history, send, delivered/seen UI
- Attachment flow with messaging token
- README run guide

## Out of scope

- Customer support widget
- Embedded platform token exchange UI
- Bot / AI chat
- Voice message
- Payment/order/project UI
