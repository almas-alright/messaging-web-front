# Agent Execution Rules

## Main rule

Execute only the active task from `.agent/CURRENT_PLAN.md`.

## Branch rule

- The active plan defines `active_branch`.
- Use that branch for all tasks under the plan.
- Do not create per-phase branches unless the active plan explicitly says so.

## Task rule

- First unchecked task only.
- One task = one commit.
- Update task checkbox after completion.
- Update `.agent/state/HANDOFF.md` after completion.
- Stop after the commit.

## Context rule

Read minimum necessary context:

1. entry files
2. active plan files
3. directly relevant source files
4. directly relevant tests or build config

Do not read archive folders or old workflow files unless the active task requires historical comparison.

## Safety rule

Never log or expose:

- access tokens
- refresh tokens
- OAuth codes
- OTP values
- magic links
- client secrets
- HMAC secrets

## Quality rule

Run applicable checks before committing:

```bash
npm install
npm run build
npm run lint
```

If lint is not configured, write that in `.agent/state/HANDOFF.md` instead of adding tooling unless the active task asks for it.

## Handoff rule

Each task handoff must include:

```text
Plan:
Branch:
Task:
Commit:
Files changed:
Checks run:
Blockers:
Next task:
```
