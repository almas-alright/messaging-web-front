# Frontend Backend Config Boundary

This repository is frontend-only. It does not own backend storage, membership,
auth validation, moderation, or attachment persistence.

## Frontend-Owned Config

The frontend reads these Vite variables at build/dev-server startup:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080/ws
```

The settings panel can override both values in browser localStorage for local
demo testing:

- `messaging-web-front:config`

Demo JWT is stored separately in browser localStorage:

- `messaging-web-front:demo-jwt`

This is for local demos only. Production auth is expected to come from the
parent application.

## HTTP Calls

The frontend calls:

- `GET /health`
- `GET /ready`
- `GET /auth/me`
- `POST /conversations/{id}/attachments`
- `GET /attachments/{id}` through rendered attachment links

Protected HTTP calls send:

```http
Authorization: Bearer <JWT>
```

## WebSocket Calls

The frontend connects to:

```text
/ws?token=<JWT>
```

Client events used by this frontend:

- `conversation.join`
- `conversation.history`
- `message.send`

Server events rendered by this frontend:

- `connection.ready`
- `conversation.joined`
- `conversation.messages`
- `message.created`
- `error`

## Backend-Owned Behavior

The backend remains responsible for:

- JWT validation
- Conversation membership enforcement
- WebSocket authorization
- Conversation history loading
- Message persistence
- Attachment upload and metadata
- File type and size enforcement
- Message policy status and moderation behavior

## Out Of Scope For This Frontend

- Login/register/password screens
- Production identity provider integration
- Production database setup
- AI bot or AI moderation
- Marketplace business workflows outside messaging
