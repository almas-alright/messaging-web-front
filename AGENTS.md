# AGENTS.md

## Scope

Messaging Web Front is a React + TypeScript frontend for the reusable messaging backend. Keep authentication, token handling, WebSocket connection, conversation permissions, and user-facing chat flows clean and isolated.

## Minimal Startup

Before selecting work, read only:

1. `AGENTS.md`
2. `.agent/CURRENT_PLAN.md`
3. The active plan's `TASKS.md`

Read only the first unchecked task and the source/test files directly related to it.

Do not read `CODEX.md`, `EXECUTION_RULES.md`, `PLAN.md`, `ACCEPTANCE.md`, `DECISIONS.md`, `.context/`, `.workflows/`, all docs, or archived plans by default. Open one only when the current task requires information not available in the startup files or relevant code.

## Workflow

- `.agent/CURRENT_PLAN.md` is the source of truth. If `active_plan` is `none`, stop and ask for a plan.
- One plan uses one branch; one task uses one commit.
- Do only the first unchecked task, update `.agent/state/HANDOFF.md`, commit, and stop.
- Do not redesign completed work or jump to later tasks.
- Commit format: `task(<plan-id>.<task-number>): <short summary>`.

## Implementation Safety

- Never hardcode or log secrets, access tokens, refresh tokens, OTPs, or magic links.
- Do not put backend-only secrets in frontend code.
- Use messaging-issued access tokens for REST and WebSocket.
- Keep backend URL and WebSocket URL configurable.
- Do not implement support widget, embedded platform chat, or AI chat unless the active task requests it.
- Keep shared client code reusable for later support widget and embedded platform phases.

## Checks

Run only checks applicable to changed code:

```bash
npm run build
npm run lint
```

If lint is not configured, do not add lint tooling unless the active task requests it.

## Communication

Work silently. Do not send preambles, narration, discoveries, plans, or progress updates.

Speak before completion only when:
- user input is required
- approval is required
- destructive confirmation is required
- a blocker prevents progress

## Final Response Style

Final report: exactly six short lines:

```text
Branch: <branch>
Commit: <commit-or-none>
Files: <changed-files-or-none>
Checks: <checks-or-none>
Blockers: <blockers-or-none>
Next: <next-task-or-none>
```

Use `none` when empty and stop until approval or `next`.
