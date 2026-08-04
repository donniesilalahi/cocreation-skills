# Critique checklists

Two depths. Pick by blast radius, not by how much time you have.

- **Quick (≤ 15 min)** — a sanity read before a small change ships. Produces a fix list and, at
  most, a *provisional* direction signal. **A quick critique may not issue UNDERSERVES / OVERSERVES /
  MISSERVES** — it lacks the outcome table those verdicts rest on. Its honest verdicts are SERVES or
  UNKNOWN.
- **Comprehensive (60+ min)** — before a cycle boundary, a roadmap decision, a repositioning, or
  after a launch underperforms. Required for any direction verdict.

---

## Quick critique (≤ 15 min)

**Scope:** one surface, one core task.

- [ ] Job statement written or read from the manifest — solution-free, survives your product not existing.
- [ ] **One** core task named as a user goal, not a click path.
- [ ] Task walked end-to-end as a first-time user; the step where it breaks (if any) recorded.
- [ ] Four cognitive-walkthrough questions asked at the breaking step, with the failure told as a story.
- [ ] Squint test: the primary action is what survives the blur.
- [ ] Trunk test: where am I / what can I do / how did I get here / where next.
- [ ] Feedback exists for every state-changing action (no silent success, no silent failure).
- [ ] Errors say what happened, why, and what to do next.
- [ ] WCAG 2.2 AA spot-check: focus visible and not obscured, targets ≥ 24×24, contrast, keyboard path.
- [ ] Mobile (if applicable): primary action reachable in the thumb zone.
- [ ] Every finding tagged `observed | inferred | assumed` and given a 0–4 severity.
- [ ] Findings bucketed BLOCKERS / FRICTION / POLISH.
- [ ] Verdict: **SERVES** or **UNKNOWN** only — plus, if UNKNOWN, the cheapest test named.
- [ ] Record written; `STATE.md` ledger row appended.

---

## Comprehensive critique (60+ min)

**Scope:** a product or a whole surface area, 3–7 core tasks.

### L1 — Job
- [ ] Job statement written in `When [situation], I want to [motivation], so I can [outcome]` form.
- [ ] Job statement contains no product name and no solution.
- [ ] All eight job stages mapped; coverage marked per stage.
- [ ] Uncovered stages checked for **workarounds** (spreadsheets, screenshots, a second tool) — an
      externally solved stage is an uncovered stage.
- [ ] Four forces read (push, pull, anxiety, habit); anxiety and habit explicitly named.
- [ ] Stated job (manifest) reconciled against observed behavior; disagreement recorded as a finding.

### L2 — Outcome
- [ ] 8–15 desired outcomes written in `[direction] the [unit] it takes to [object] [context]` form.
- [ ] No outcome contains a solution.
- [ ] Importance and satisfaction scored 0–10 for every outcome, each row carrying its evidence tag.
- [ ] `opportunity = importance + max(importance − satisfaction, 0)` computed per row.
- [ ] Rows ≥ 15 named as the investment direction.
- [ ] Rows < 10 checked against where investment actually goes — **the overserved read**.
- [ ] Table cross-read for shape (clustering by job stage), not just row-by-row.

### L3 — Journey
- [ ] 3–7 core tasks named as user goals.
- [ ] Each walked end-to-end as a first-time user.
- [ ] All four CW questions asked at **every** step, not just the failing one.
- [ ] Each failure recorded as a story ("looks for X, sees Y, concludes Z").
- [ ] Effectiveness / efficiency / satisfaction recorded per task (ISO 9241-11).
- [ ] Journey breaks ranked **by step position**, ahead of downstream interface findings.

### L4 — Interface
- [ ] Run only on flagged steps + the primary path (not a screen-by-screen sweep).
- [ ] All 10 Nielsen heuristics reviewed on those screens — positives recorded too.
- [ ] Every finding: location + user-visible consequence + heuristic/SC + severity 0–4.
- [ ] Severity calibrated (4 requires a loss; not more than ~⅓ of findings at 3–4).
- [ ] Full WCAG 2.2 AA pass including the six new criteria; failures sent straight to BLOCKERS.
- [ ] Interaction laws used to quantify at least the nav/primary-action findings.
- [ ] Every finding cites the task step it sits on.

### L5 — Signal
- [ ] HEART goals → signals → metrics table filled for the rows that matter.
- [ ] Values compared against benchmarks **and** against the product's own trend.
- [ ] Contradictions with L1–L4 reconciled in the metric's favor; downgraded findings marked as such.
- [ ] Missing instrumentation named and filed as an `inbox/` action ask.

### Verdict & close
- [ ] Evidence basis counted: `n observed · n inferred · n assumed`.
- [ ] Evidence ceiling applied — no direction verdict without an `observed` finding on L2 or L5.
- [ ] **Exactly one** verdict issued.
- [ ] Direction change stated as a concrete product change, not an adjective.
- [ ] Removal considered before addition, and preferred on a tie.
- [ ] Falsifier written: "this verdict is wrong if…".
- [ ] Cheapest test named, with what it unblocks.
- [ ] Fix list bucketed and ordered by severity × frequency × job-criticality.
- [ ] Direction ask filed to `inbox/` with a recommended default; routed to `coframe` or `cospecify`.
- [ ] Record written with `verdict:` frontmatter; prior record on this surface marked `superseded-by:`.
- [ ] `STATE.md` ledger row appended. **SSOT pointer NOT edited** — cocritique proposes, it never rewrites.
