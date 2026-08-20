# Lessons

## 2026-08-20 — Shut down finished subagents immediately
- What went wrong: ~26 idle subagent panes accumulated during the 12-task build; finished agents were left alive "just in case".
- Why: the controller never sent shutdown_request after closing a task; idle agents cost attention and resources.
- Rule: after ledgering "Task N: complete", send shutdown_request to that task's implementer, reviewer and re-reviewer before dispatching the next task. Keep an implementer alive only while its fix loop can still resume it. Before ending a session, list agents and close leftovers.

## 2026-08-20 — Display typeface legibility check before shipping
- What went wrong: headlines shipped in Bodoni Moda 800 (a didone with hairline serifs); at article-title sizes the thin strokes vanish and titles were unreadable.
- Why: the face was chosen for masthead character and applied to all headings without checking stroke contrast at real heading sizes in both themes.
- Rule: before shipping a heading typeface, render it at the smallest heading size used (h3/h4, mobile) in light and dark; a high-contrast didone/Didot face is allowed only at masthead scale. Screenshot review of real pages is part of the design gate.
