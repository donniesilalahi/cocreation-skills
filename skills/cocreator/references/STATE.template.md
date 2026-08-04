<!--
  STATE.md — the co-creation project-state pointer. Copy this into `.agents/workspace/STATE.md`
  in the consumer project. It is AI-owned (lives beside the human-owned `raw/`). Every loop reads
  it FIRST and appends its ledger row on exit. Design: docs/cocreator/SSOT.md.

  Two parts: the HEAD is overwritten each session (the current picture); the LEDGER is
  append-only (never rewrite a past row — supersede it).
-->

# Project state

**Last updated:** YYYY-MM-DD · `[State: fresh]`  <!-- flip to [State: stale] if untouched across sessions; a downstream loop should distrust a stale head -->

## Head — active context (overwrite each session)

- **Authoritative spec (SSOT):** `<path>` — produced by `cospecify`, YYYY-MM-DD
  <!-- the one-line pointer: the artifact executors build & check against. Update via the reviewed channel only. -->
- **Current focus:** <what we're working on right now>
- **Workflow:** <discover | ship | feature | design-first | fix | evaluate | release-prep | cleanup> — step <n>/<total>, entered YYYY-MM-DD
  <!-- the active chain (cocreator §1). "none — last workflow closed YYYY-MM-DD" when idle. -->
- **Next:** `<loop>` — <what it should do>
  <!-- THE resume instruction. A fresh session runs this without asking. Rewrite it on every loop
       exit, even when the answer is "workflow closed — exit gate met". A stale or empty Next: is
       where an unattended run dies. -->
- **In-flight loop:** <loop> (<agent/model>) — <what it's doing>
- **Open decisions:** <defaulted-and-awaiting-owner, per SSOT §decision-review>
- **Blockers:** <needs eng/legal/owner; or "none">
  <!-- A blocker here should be a HARD-block only (cocreator §8 stop conditions). A soft one gets
       defaulted, parked, or placeholdered — it belongs in inbox/, not here. -->

## Progress ledger — history (append-only; never rewrite a row)

| Date | Workflow | Loop | Agent/model | Verdict | Record | Commit/artifact |
|------|----------|------|-------------|---------|--------|-----------------|
| YYYY-MM-DD | feature | coframe | coframer/opus | done | `.agents/skills/coframe/memory-bank/…` | `<sha>` |
| YYYY-MM-DD | feature | cospecify | cospecifier/sonnet | done | `.agents/skills/cospecify/memory-bank/…` | `<sha>` |
| YYYY-MM-DD | design-first | codraw | codrawer/sonnet | blocked | `.agents/skills/codraw/memory-bank/…` | — |

<!--
  Workflow = the chain this loop ran as part of (cocreator §1 / references/workflows.md). It makes
  the ledger readable as a story rather than a list of loops, and lets a resuming session see where
  the current chain started. "—" for a loop run standalone, outside any workflow.

  Verdict = the shared lifecycle enum: todo | active | blocked | review | done | superseded.
  A loop-native verdict (implemented / drawn / pass) may appear in the loop's own record; normalize
  to the lifecycle enum here for the cross-loop view.
  Status lives in this field and in each record's `status:` frontmatter — NEVER in a folder or
  filename (that would break cross-refs + git history; see SSOT.md). "Moved on" = a superseded row +
  a `superseded-by:` link, not a deleted/renamed file.
-->
