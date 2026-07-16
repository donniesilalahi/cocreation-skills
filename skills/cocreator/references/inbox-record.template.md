---
# --- the agent writes this block (the ask) ---
kind: decision            # decision | action | review
status: open              # open | resolved | done | approved | changes-requested | blocked | superseded
blocking: false           # true = on the critical path (halts dependent work); false = parked
interim: none             # none | default-applied | placeholder  (what the agent did to keep moving)
must-reconcile: false     # true if interim ≠ none — the completion gate will resurface it
raised-by: cospecify      # the loop that needs this
owner: <human>            # who should answer/do it
due: YYYY-MM-DD
on-timeout: proceed-on-default   # proceed-on-default | escalate | re-nudge
links:                    # provenance + where the agent parked
  raw: .agents/workspace/raw/<brief>
  output: <the parked/stubbed artifact>
  state: .agents/workspace/STATE.md
# for kind: decision — always ship options + a recommended default (draft-and-confirm)
options:
  - A: <option + tradeoff>
  - B: <option + tradeoff>
recommended-default: A
---

# <one-line title of the ask>

**Context (why this needs you):** 1–2 lines. Link the `raw/` input or the artifact in question.

**What the agent did to keep moving:** waiting | proceeded on default A (see `interim`) | inserted a
placeholder at `<link>` (`must-reconcile`). Nothing here ships until you confirm below.

**Exact next step when resolved:** <so a fresh session can resume idempotently from this file>

<!-- ─────────── the human writes below this line (the answer) ─────────── -->

**answer:**
**decided-by:**   **date:**

<!--
  Resolution = flip `status` (open→resolved for a decision, →done for an action, →approved/
  changes-requested for a review) and fill answer/decided-by/date. The agent re-reads inbox/ at the
  start of every loop and picks up whatever is now resolved. Consequential decisions: ratify via a
  commit/PR so the approval is timestamped + auditable. Closed stays closed — supersede with a new
  record + a `superseded-by:` link, never reopen/edit. Design: docs/cocreator/SSOT.md § Human handoff.
-->
