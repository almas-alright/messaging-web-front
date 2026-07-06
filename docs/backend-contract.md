# Backend Contract

The frontend connects to the messaging backend service.

Backend repository:

```text
https://github.com/almas-alright/messaging-service
```

## Configurable URLs

The frontend must not hardcode backend URLs.

Required environment variables:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080/ws
```

For LAN demo:

```env
VITE_API_BASE_URL=http://192.168.1.10:8080
VITE_WS_BASE_URL=ws://192.168.1.10:8080/ws
```

## HTTP Endpoints

Public:

```http
GET /health
GET /ready
```

Authenticated:

```http
GET /auth/me
POST /conversations/{id}/attachments
GET /attachments/{id}
```

All authenticated HTTP calls require:

```http
Authorization: Bearer <JWT>
```

## WebSocket

Connect:

```text
ws://<backend-host>:8080/ws?token=<JWT>
```

Client events:

```json
{"type":"conversation.join","conversation_id":"conv-001"}
```

```json
{"type":"conversation.history","conversation_id":"conv-001"}
```

```json
{"type":"message.send","conversation_id":"conv-001","client_message_id":"uuid","body":"Hello"}
```

File message:

```json
{"type":"message.send","conversation_id":"conv-001","client_message_id":"uuid","attachment_id":"att-000001"}
```

Server events:

- `connection.ready`
- `conversation.joined`
- `conversation.messages`
- `message.created`
- `error`

## CORS / LAN Requirement

The backend must allow frontend origins during local testing:

```text
http://localhost:5173
http://127.0.0.1:5173
http://<ubuntu-lan-ip>:5173
```

Production must restrict CORS to approved domains only.
