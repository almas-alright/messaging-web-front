# Frontend Standalone Chat Alignment Decisions

## Decision 1 — One-to-one chat first

Do standalone WhatsApp-style one-to-one chat before support widget, embedded platform chat, or AI chat.

Reason:

- It proves the core auth + REST + WebSocket flow.
- Later modes can reuse the same API client, token store, message renderer, and WebSocket client.

## Decision 2 — Messaging token only

Frontend REST and WebSocket must use backend messaging-issued access tokens.

Do not use Google token, GitHub token, manual demo JWT, or external platform token directly for chat.

## Decision 3 — Keep provider login simple

Provider buttons may start as backend-compatible hooks or configured placeholders.

Do not add provider secrets to frontend.

## Decision 4 — Keep old demo separate

Old manual JWT demo can remain for development reference only, but it must not be the main standalone chat path.

## Decision 5 — Future modes get separate plans

Later plans:

```text
2026-07-DD-frontend-support-widget-chat
2026-07-DD-frontend-embedded-platform-chat
2026-07-DD-frontend-ai-assisted-chat
```
