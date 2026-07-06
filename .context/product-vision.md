# Product Vision

## Purpose

Messaging Web Front is a simple chat frontend that connects to the reusable Go messaging backend.

The first version is a local demo app for testing buyer/seller chat from office computers.

## Initial Demo Scope

The frontend should feel simple and familiar, similar to common web chat apps:

- configuration area
- current user display
- conversation ID input
- message list
- message bubbles
- emoji support
- file send support
- connection status
- error display

## Local Network Goal

Both backend and frontend will run on one Ubuntu PC.

Other computers on the same Wi-Fi/LAN should be able to open the frontend through the Ubuntu PC IP address.

Example:

```text
Frontend: http://192.168.1.10:5173
Backend API: http://192.168.1.10:8080
Backend WS: ws://192.168.1.10:8080/ws
```

## Future Product Direction

In the future, this frontend may become an embeddable website chat widget.

Future capabilities:

- customer website embeds chat with iframe or script
- floating launcher button
- compact chat window size
- voice message sending
- optional AI bot on a specific chat side
- human support agent can take over from bot

These future capabilities are not part of the first local demo.
