# Frontend Standalone Chat Alignment Acceptance

## Functional acceptance

- User can register with email/password.
- User can login with email/password.
- User can logout.
- Frontend loads current user with `/auth/me`.
- Frontend no longer depends on manual JWT for main chat.
- User can add/list contacts through authenticated flow.
- User can open one-to-one conversation.
- WebSocket connects using messaging access token.
- User can send/receive message in two browser sessions.
- Message history loads.
- Delivered/seen UI works where backend emits data.
- Attachment upload/send works with messaging token.

## Security acceptance

- No provider secrets are stored in frontend.
- Tokens are not logged.
- Manual JWT demo is not the production/main path.
- `owner_user_id` is not sent from frontend in main authenticated contact/conversation flow.

## Check acceptance

Run:

```bash
npm run build
npm run lint
```

If lint is not configured, record that instead of adding lint tooling.
