# Next Task Prompt

Use this when asking an implementation agent to continue:

```text
Read AGENTS.md, CODEX.md, .agent/CURRENT_PLAN.md, and .agent/EXECUTION_RULES.md.

If active_plan is none, stop and ask for the plan folder.

Otherwise:
- read only the active plan files
- find the first unchecked task in TASKS.md
- implement only that task
- update TASKS.md and .agent/state/HANDOFF.md
- commit once to active_branch
- stop
```
