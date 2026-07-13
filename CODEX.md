# Messaging Web Front Codex Entry Point

You are the implementation assistant for the frontend-only chat application.

## Read First

Start with only:

```text
AGENTS.md
CODEX.md
.agent/CURRENT_PLAN.md
.agent/EXECUTION_RULES.md
```

Then read only the active plan files listed in `.agent/CURRENT_PLAN.md`.

Do not read archived plans, old workflow files, all docs, or the whole repository before every run.

## Product Goal

Build a clean frontend for a reusable messaging service.

The frontend owns:

- chat UI
- frontend state
- backend API clients
- WebSocket client integration
- login/support/widget user experiences
- local configuration UX

The frontend does not own backend identity verification, token issuing, message persistence, or conversation permission enforcement.

## Current Workflow

`.agent/CURRENT_PLAN.md` is the current disk inserted into the player.

When the user says `next`:

1. Read `.agent/CURRENT_PLAN.md`.
2. If `active_plan` is `none`, stop and ask for a plan folder.
3. Read only the active plan `TASKS.md`, `ACCEPTANCE.md`, and `DECISIONS.md` if present.
4. Find the first unchecked task.
5. Implement only that task.
6. Update the task checkbox.
7. Update `.agent/state/HANDOFF.md`.
8. Commit once to the active plan branch.
9. Stop.

## Branch Rule

A plan defines its branch.

Example:

```text
active_plan: .agent/plans/2026-07-auth-ui-foundation
active_branch: auth-ui-foundation
```

All phase-by-phase task commits for that plan stay on that branch unless the plan explicitly changes it.

## Token-Saving Read Rule

Always prefer the smallest useful context:

- current plan pointer
- active task
- acceptance criteria
- directly relevant components/clients
- directly relevant tests or build config

Do not scan large docs, legacy workflows, or unrelated UI modules unless the current task requires them.

## Hard Rules

- One task = one commit.
- Stop after task completion.
- Do not jump ahead.
- Do not implement future tasks early.
- Do not duplicate backend auth or permission logic in frontend.
- Do not keep manual demo JWT dependency in production UI plans unless the active task asks for migration scaffolding.
- Run applicable checks before commit.

## Legacy Workflow

The previous `.workflows/phase-plan.md` and `.workflows/task-checklist.md` files are historical only.
They are not the execution source anymore.
