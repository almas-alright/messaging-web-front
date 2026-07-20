# Frontend Support Widget Chat Tasks

Working branch: `frontend-support-widget-chat`

## FE-SUPPORT-01 — Support widget boundary and config

- [x] FE-SUPPORT-01.01 Inspect current frontend structure and standalone chat client modules
- [x] FE-SUPPORT-01.02 Add support widget config module
- [x] FE-SUPPORT-01.03 Add env placeholders for widget tenant, API base URL, WS URL, brand name, and theme
- [x] FE-SUPPORT-01.04 Keep widget code isolated from standalone chat page while reusing shared API/token/WebSocket utilities
- [x] FE-SUPPORT-01.05 Update `.agent/state/HANDOFF.md`

Expected env:

```env
VITE_MESSAGING_API_BASE_URL=http://localhost:8080
VITE_MESSAGING_WS_URL=ws://localhost:8080/ws
VITE_SUPPORT_WIDGET_TENANT_ID=demo-tenant
VITE_SUPPORT_WIDGET_BRAND_NAME=Support
VITE_SUPPORT_WIDGET_THEME=light
```

Commit:

```text
task(frontend-support.01): add support widget config boundary
```

---

## FE-SUPPORT-02 — Floating widget shell

- [x] FE-SUPPORT-02.01 Add floating support launcher component
- [x] FE-SUPPORT-02.02 Add collapsed, opening, open, minimized states
- [x] FE-SUPPORT-02.03 Add widget panel layout with header/body/footer
- [x] FE-SUPPORT-02.04 Make widget responsive for desktop and mobile
- [x] FE-SUPPORT-02.05 Add local demo route/page for testing widget inside the app

Commit:

```text
task(frontend-support.02): add floating support widget shell
```

---

## FE-SUPPORT-03 — Visitor session start flow

- [x] FE-SUPPORT-03.01 Add support API client for `POST /support/sessions/start`
- [x] FE-SUPPORT-03.02 Add visitor welcome form with name/email/message fields where backend contract allows
- [x] FE-SUPPORT-03.03 Start visitor support session and store visitor token/conversation id
- [x] FE-SUPPORT-03.04 Scope stored visitor session by tenant id
- [x] FE-SUPPORT-03.05 Show neutral success/error states without revealing account existence

Commit:

```text
task(frontend-support.03): add visitor support session start
```

---

## FE-SUPPORT-04 — Visitor widget message flow

- [x] FE-SUPPORT-04.01 Connect widget WebSocket using visitor token
- [x] FE-SUPPORT-04.02 Join visitor support conversation after `connection.ready`
- [x] FE-SUPPORT-04.03 Render visitor and agent messages in widget panel
- [x] FE-SUPPORT-04.04 Send visitor text message
- [x] FE-SUPPORT-04.05 Show sending/sent/failed state without false success

Commit:

```text
task(frontend-support.04): add visitor widget message flow
```

---

## FE-SUPPORT-05 — Visitor history and resume

- [x] FE-SUPPORT-05.01 Restore visitor session from local storage when widget opens
- [x] FE-SUPPORT-05.02 Load support conversation history where backend contract allows
- [x] FE-SUPPORT-05.03 Handle expired/invalid visitor token by returning to welcome state
- [x] FE-SUPPORT-05.04 Add “start new conversation” reset action
- [x] FE-SUPPORT-05.05 Keep visitor session isolated from normal authenticated user session

Commit:

```text
task(frontend-support.05): add visitor session resume
```

---

## FE-SUPPORT-06 — Email verification UI

- [ ] FE-SUPPORT-06.01 Add support API client for `POST /support/email/send-code`
- [ ] FE-SUPPORT-06.02 Add support API client for `POST /support/email/verify-code`
- [ ] FE-SUPPORT-06.03 Add “verify email” UI inside widget
- [ ] FE-SUPPORT-06.04 Show neutral send-code response
- [ ] FE-SUPPORT-06.05 Show verified/claim-pending/failed states safely

Commit:

```text
task(frontend-support.06): add support email verification ui
```

---

## FE-SUPPORT-07 — Support agent inbox

- [ ] FE-SUPPORT-07.01 Add authenticated support inbox route or section in main app
- [ ] FE-SUPPORT-07.02 List support conversations using existing authenticated conversation APIs where possible
- [ ] FE-SUPPORT-07.03 Open selected support conversation
- [ ] FE-SUPPORT-07.04 Show visitor identity safely: verified email if verified, otherwise visitor/session label
- [ ] FE-SUPPORT-07.05 If backend lacks support inbox/list filter, record blocker and stop this task without inventing fake API

Commit:

```text
task(frontend-support.07): add support agent inbox
```

---

## FE-SUPPORT-08 — Agent reply flow

- [ ] FE-SUPPORT-08.01 Connect agent WebSocket using authenticated messaging access token
- [ ] FE-SUPPORT-08.02 Join selected support conversation
- [ ] FE-SUPPORT-08.03 Send agent replies
- [ ] FE-SUPPORT-08.04 Render replies in both agent inbox and visitor widget
- [ ] FE-SUPPORT-08.05 Preserve permission/error handling from standalone chat

Commit:

```text
task(frontend-support.08): add support agent reply flow
```

---

## FE-SUPPORT-09 — Widget embed demo

- [ ] FE-SUPPORT-09.01 Add local embed demo page/documentation
- [ ] FE-SUPPORT-09.02 Show how a host site would initialize the widget config
- [ ] FE-SUPPORT-09.03 Keep secrets out of embed config
- [ ] FE-SUPPORT-09.04 Document required public config only: tenant id, API URL, WS URL, brand/theme

Example embed idea:

```html
<div id="messaging-support-widget"></div>
<script>
  window.MessagingSupportWidgetConfig = {
    tenantId: "demo-tenant",
    apiBaseUrl: "http://localhost:8080",
    wsUrl: "ws://localhost:8080/ws",
    brandName: "Support"
  }
</script>
```

Commit:

```text
task(frontend-support.09): add support widget embed demo
```

---

## FE-SUPPORT-10 — Polish, accessibility, and responsive states

- [ ] FE-SUPPORT-10.01 Add keyboard accessible open/close behavior
- [ ] FE-SUPPORT-10.02 Add focus management for widget panel
- [ ] FE-SUPPORT-10.03 Add empty/loading/error states
- [ ] FE-SUPPORT-10.04 Add mobile full-height panel behavior
- [ ] FE-SUPPORT-10.05 Keep visual style consistent with current frontend

Commit:

```text
task(frontend-support.10): polish support widget ux
```

---

## FE-SUPPORT-11 — Documentation and final checks

- [ ] FE-SUPPORT-11.01 Update README with support widget run/demo instructions
- [ ] FE-SUPPORT-11.02 Add manual test checklist: visitor browser + agent browser
- [ ] FE-SUPPORT-11.03 Run `npm run build`
- [ ] FE-SUPPORT-11.04 Run `npm run lint` if configured
- [ ] FE-SUPPORT-11.05 Record final result in `.agent/state/HANDOFF.md`

Commit:

```text
task(frontend-support.11): document support widget chat
```
