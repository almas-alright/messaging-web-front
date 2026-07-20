# Agent Workflow

This directory is the active execution system for agentic frontend development.

Think of it like a CD player:

```text
.agent/CURRENT_PLAN.md = inserted disk
.agent/plans/<dated-plan>/ = disk content
User says "next" = play next unchecked task
```

## Required first read

Agents must start with:

```text
AGENTS.md
CODEX.md
.agent/CURRENT_PLAN.md
.agent/EXECUTION_RULES.md
```

Then read only the active plan files referenced by `.agent/CURRENT_PLAN.md`.

## Plan folder shape

```text
.agent/plans/YYYY-MM-plan-slug/
├── PLAN.md
├── TASKS.md
├── DECISIONS.md
└── ACCEPTANCE.md
```

Optional plan files may be added only when useful:

```text
RISKS.md
UI_CONTRACT.md
API_CONTRACT.md
TESTING.md
```

## State folder

```text
.agent/state/CURRENT_TASK.md
.agent/state/DONE.md
.agent/state/BLOCKERS.md
.agent/state/HANDOFF.md
```

`HANDOFF.md` must be updated after each completed task.

## Legacy workflows

Old `.workflows/*` files are no longer active. They are preserved as historical context only.
