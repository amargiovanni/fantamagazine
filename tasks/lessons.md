# Lessons

## 2026-08-20 — Shut down finished subagents immediately
- What went wrong: ~26 idle subagent panes accumulated during the 12-task build; finished agents were left alive "just in case".
- Why: the controller never sent shutdown_request after closing a task; idle agents cost attention and resources.
- Rule: after ledgering "Task N: complete", send shutdown_request to that task's implementer, reviewer and re-reviewer before dispatching the next task. Keep an implementer alive only while its fix loop can still resume it. Before ending a session, list agents and close leftovers.
