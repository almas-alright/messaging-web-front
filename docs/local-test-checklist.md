# Local Test Checklist

Use this checklist after starting the backend and frontend for a local or LAN
demo.

## Setup

- [ ] Backend is running on `http://<host-ip>:8080`.
- [ ] Frontend is running on `http://<host-ip>:5173`.
- [ ] Browser can open the frontend from the Ubuntu PC.
- [ ] Another device on the same network can open the frontend.
- [ ] Backend CORS allows the frontend origin.

## Backend Settings

- [ ] API base URL is `http://<host-ip>:8080`.
- [ ] WebSocket URL is `ws://<host-ip>:8080/ws`.
- [ ] `Check health` returns ok.
- [ ] `Check ready` returns ok.

## Demo Auth

- [ ] A manually generated JWT is pasted into the demo JWT field.
- [ ] `Check current user` returns `user_id`, `display_name`, and `role`.
- [ ] Clear/reset JWT removes the stored demo token.

## WebSocket And Conversation

- [ ] WebSocket connects with the pasted JWT.
- [ ] `connection.ready` shows the ready user.
- [ ] Conversation ID is set, for example `conv-001`.
- [ ] Join conversation succeeds.
- [ ] Load history renders returned messages.

## Messaging

- [ ] Text message sends and appears after `message.created`.
- [ ] Emoji can be inserted into the composer.
- [ ] Emoji message sends and renders correctly.
- [ ] Enter sends a message.
- [ ] Shift+Enter keeps multiline typing.

## Files

- [ ] File picker selects a file.
- [ ] Upload shows in-progress state.
- [ ] Upload returns an attachment ID.
- [ ] Send creates a file message with `attachment_id`.
- [ ] File message renders an attachment link or metadata card.

## Docker Frontend

- [ ] `docker compose config` passes.
- [ ] `docker compose up --build` serves the frontend.
- [ ] Static frontend opens at `http://<host-ip>:5173`.
- [ ] API and WebSocket URLs are correct for the LAN host.
