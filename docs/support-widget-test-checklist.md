# Support Widget Manual Test Checklist

## Setup

- [ ] Start the messaging backend on port `8080`.
- [ ] Copy `.env.example` to `.env.local` and set the public support widget values.
- [ ] Run `npm install` and `npm run dev`.
- [ ] Open `/support-widget-demo` in a visitor browser.
- [ ] Keep browser storage and network tools free of logged tokens, codes, or secrets.

## Visitor Browser

- [ ] Open the launcher with a pointer and with the keyboard.
- [ ] Confirm focus enters the panel, Escape closes it, and focus returns to the launcher.
- [ ] Confirm the panel fills the viewport on a narrow mobile-sized screen.
- [ ] Start a support session with an email and confirm the response is neutral.
- [ ] Minimize, reopen, reload, and confirm the tenant-scoped visitor session resumes.
- [ ] Request an email code and confirm the UI never reveals whether an account exists.
- [ ] Try an invalid or expired code and confirm only a safe failure message appears.
- [ ] Verify a valid code and confirm the UI reports email verification without claiming an account match.
- [ ] Confirm connection loading, empty, disconnected, retry, sending, sent, and failed states when the dedicated visitor WebSocket backend is available.
- [ ] Start a new conversation and confirm the prior visitor session is removed.

## Agent Browser

The current backend has no support-agent credential, assignment policy, inbox
list endpoint, or reply authorization. Do not substitute a normal user token,
legacy demo JWT, visitor token, or admin moderation route.

After those backend contracts are implemented:

- [ ] Sign in with a dedicated support-agent credential in a separate browser.
- [ ] Confirm the inbox lists only assigned conversations for the agent's tenant.
- [ ] Confirm unverified visitors use a neutral visitor/session label.
- [ ] Confirm verified email is shown only through the agent-safe identity projection.
- [ ] Open the visitor conversation and verify its history loads.
- [ ] Send an agent reply and confirm it appears in both browsers.
- [ ] Confirm an unassigned agent cannot read, join, or send to the conversation.
- [ ] Confirm visitor and agent disconnect/error states do not report false success.
