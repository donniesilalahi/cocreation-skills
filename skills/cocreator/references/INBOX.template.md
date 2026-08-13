<!--
  INBOX.md — the human↔agent handoff worklist. Copy into `<workspaceRoot>/workspace/inbox/INBOX.md`.
  AI-maintained summary of every open ask FOR the human (detail lives in the per-item records
  beside it). Design: docs/cocreator/SSOT.md § Human handoff. One record per ask:
  `<workspaceRoot>/workspace/inbox/YYYY-MM-DD-<slug>.md` (copy inbox-record.template.md).

  The agent writes/updates this table; the human answers in the RECORD (not here). Every loop reads
  this worklist at start and acts on whatever is now resolved/done.
-->

# Human inbox

**Last updated:** YYYY-MM-DD

## Blocking — on the critical path (resolve to unblock)

| Item | Kind | Raised by | Due | Status |
|------|------|-----------|-----|--------|
| [<slug>](YYYY-MM-DD-<slug>.md) | action | codraw | 2026-07-18 | open |

## Parked — non-blocking (work continues around these)

| Item | Kind | Interim | Must reconcile? | Status |
|------|------|---------|-----------------|--------|
| [<slug>](YYYY-MM-DD-<slug>.md) | decision | default-applied | yes | open |
| [<slug>](YYYY-MM-DD-<slug>.md) | decision | placeholder | yes | open |

## Resolved / done (kept for the trail; supersede, never delete)

| Item | Kind | Answer / result | Decided by | Date |
|------|------|-----------------|------------|------|
| [<slug>](YYYY-MM-DD-<slug>.md) | decision | option A | <human> | 2026-07-16 |

<!--
  COMPLETION GATE: a cycle may not be reported done / advance to cochangelog / be accepted while any
  row above is `status: open` (blocking) or carries an unconfirmed `interim: placeholder |
  default-applied`. Resurface all such rows as "still pending" before shipping. See SSOT.md.
-->
