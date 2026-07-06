# UI Plan

## First Demo UI

The first UI should be simple and useful for testing.

Recommended layout:

```text
+------------------------------------------------+
| Header: Messaging Demo + connection status     |
+----------------------+-------------------------+
| Settings/Auth panel  | Chat area               |
| - API URL            | - conversation title    |
| - WS URL             | - message list         |
| - JWT textarea       | - file messages        |
| - Current user       | - composer             |
| - Conversation ID    | - emoji button         |
| - Connect/join       | - file button          |
+----------------------+-------------------------+
```

On mobile/small screen, stack settings above chat.

## Message Composer

The composer should include:

- text input
- send button
- emoji button
- file picker button
- disabled state when not connected or not joined

## Emoji Support

Initial emoji support should be simple:

- a small built-in emoji list
- click emoji to insert into text input
- no heavy emoji library unless needed later

Example emoji set:

```text
😀 😃 😂 😊 😍 👍 🙏 🔥 🎉 ❤️ ✅
```

## File Support

Initial file support:

1. User picks file.
2. Frontend uploads file to backend attachment endpoint.
3. Backend returns `attachment_id`.
4. Frontend sends WebSocket `message.send` with `attachment_id`.
5. UI renders file message as a clickable file card.

## Future Widget UI

Future widget version should support:

- floating launcher
- compact chat window
- iframe or script embed
- brand color configuration
- closed/minimized/open states
- mobile-friendly dimensions

Not part of first demo.

## Future Voice Message UI

Future voice message version should support:

- hold/click to record
- recording timer
- cancel recording
- upload audio as attachment
- render audio player bubble

Not part of first demo.

## Future AI Bot / Human Takeover UI

Future version should support:

- bot active indicator
- human active indicator
- takeover button for support agent
- system message when human takes over

Not part of first demo.
