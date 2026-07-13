# AGENTS.md

Global rules for this frontend repository.

## Project

Messaging Web Front is a frontend-only chat application for the reusable messaging backend service.

Backend repo:

```text
https://github.com/almas-alright/messaging-service
```

## Stack

- Vite
- React
- TypeScript
- Browser Fetch API
- Browser WebSocket
- Configurable backend API and WebSocket URLs

## Agent Entry Point

Start with only:

1. `CODEX.md`
2. `.agent/CURRENT_PLAN.md`
3. `.agent/EXECUTION_RULES.md`
4. The active plan files named by `.agent/CURRENT_PLAN.md`

Read other files only when required by the current task.
Do not read every `docs/`, `.workflows/`, archived plan, or source file by default.

## Current Plan Rule

`.agent/CURRENT_PLAN.md` is the single source of truth for active work.

If `active_plan` is `none`, do not implement anything. Ask for a plan folder to be inserted.

Legacy `.workflows/*` files are no longer the execution source. They are historical references only.

## Frontend Boundary

This repo owns:

- chat UI
- frontend state
- API/WebSocket client code
- local configuration UX
- auth UI and token storage UX
- future support widget UI

This repo does not own:

- backend API implementation
- message persistence
- OAuth provider verification
- token issuing
- conversation permission enforcement
- production moderation logic

## Workflow Rules

- One dated/named plan = one working branch unless the plan explicitly says otherwise.
- All phases/tasks under that plan are committed to that plan branch.
- One task = one commit.
- Stop after each task or phase, matching the current plan instruction.
- Do not jump to later tasks.
- Do not redesign completed work unless the active task explicitly requires refactor.

Branch format for plan branches:

```text
<plan-slug>
```

Example:

```text
auth-ui-foundation
```

Commit format:

```text
task(<plan-id>.<task-number>): <short task summary>
```

Example:

```text
task(auth-ui-foundation.01): add login route shell
```

## Required Checks

For implementation phases, run when applicable:

```bash
npm install
npm run build
npm run lint
```

If lint is not configured yet, do not invent extra tooling unless the active task asks for it.

## Stop Rule

After a task or phase, report:

- Branch
- Commit
- Files changed
- Checks run
- Blockers
- Next task

Do not continue without approval or a fresh `next` instruction.
