# Frontend Support Widget Chat Acceptance

## Visitor widget acceptance

- Floating support launcher opens and closes.
- Visitor can start support session.
- Visitor token is stored separately from authenticated user token.
- Visitor can send a message.
- Visitor can resume active support conversation.
- Visitor can request email verification code.
- Visitor can submit verification code.
- UI does not reveal whether account exists.
- Expired/invalid visitor token returns to safe welcome/reset state.

## Agent acceptance

- Authenticated support agent can open support inbox where backend contract supports it.
- Agent can open support conversation.
- Agent can reply to visitor.
- Visitor widget receives agent reply.
- Agent flow uses authenticated messaging access token.

## Security acceptance

- No secrets are placed in frontend env or embed config.
- Visitor token cannot access normal authenticated user chat UI.
- Normal user token is not reused as visitor token.
- Email verification response remains neutral.
- No tokens, OTPs, or magic links are logged.

## UX acceptance

- Widget works on desktop.
- Widget works on mobile.
- Loading, empty, disconnected, and failed-send states are visible.
- Keyboard can open/close widget.
- Widget does not block the host page unnecessarily.

## Check acceptance

Run:

```bash
npm run build
npm run lint
```

If lint is not configured, record it in `.agent/state/HANDOFF.md`.
