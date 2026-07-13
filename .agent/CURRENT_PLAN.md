# Current Agent Plan

Status: awaiting plan.

```yaml
active_plan: none
active_branch: none
active_phase: none
active_task: none
mode: one-plan-branch-one-task-commit-stop
```

## Meaning

No implementation plan is currently inserted.

When a new plan is ready, update this file like:

```yaml
active_plan: .agent/plans/2026-07-auth-ui-foundation
active_branch: auth-ui-foundation
active_phase: AUTH-UI-01
active_task: next unchecked
mode: one-plan-branch-one-task-commit-stop
```

## Read order when active

1. `AGENTS.md`
2. `CODEX.md`
3. `.agent/CURRENT_PLAN.md`
4. `.agent/EXECUTION_RULES.md`
5. `<active_plan>/PLAN.md`
6. `<active_plan>/TASKS.md`
7. `<active_plan>/ACCEPTANCE.md`
8. `<active_plan>/DECISIONS.md` only if task needs decisions

## Stop rule

If `active_plan` is `none`, stop. Do not implement old workflow tasks.
