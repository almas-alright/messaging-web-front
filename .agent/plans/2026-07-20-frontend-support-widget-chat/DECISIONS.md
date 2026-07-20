# Frontend Support Widget Chat Decisions

## Decision 1 — Support widget is second product mode

Standalone one-to-one chat proves the core messaging foundation.

Support widget comes next because it uses visitor token, support session, email verification, and agent reply. These are already prepared by backend auth/email work.

## Decision 2 — Frontend-only plan

This plan must not change backend code.

If backend lacks a required support inbox/listing endpoint, record it as blocker instead of inventing frontend-only fake behavior.

## Decision 3 — Visitor token is separate from user token

Visitor support token must be stored separately from authenticated user token.

Use tenant-scoped storage keys.

Do not mix standalone user session, support visitor session, and embedded platform session.

## Decision 4 — Neutral account-existence language

Never show account exists, account not found, or email belongs to a user.

Use neutral wording:

```text
If this email can receive messages, a verification code has been sent.
```

## Decision 5 — Widget config is public

Allowed public config:

```text
tenant id
API base URL
WebSocket URL
brand name
theme
```

Not allowed in widget config:

```text
SMTP password
backend signing secret
provider secret
refresh token
admin token
```

## Decision 6 — Agent inbox may expose backend gaps

The visitor side can be built with support session APIs.

The support-agent side may need backend support inbox/list filters. If missing, stop and record a backend requirement for the next backend plan.
