# Report template

The critique's single deliverable. Fill top-down; do not reorder — the order is the argument.
Sections that don't apply are marked "n/a — <why>", never deleted silently.

```markdown
# Critique — {Surface}

**Segment:** {who}   **Date:** {YYYY-MM-DD}   **Depth:** quick | comprehensive
**Artifact critiqued:** {path / build / URL / commit}
**Manifest:** {path}   **Prior critique:** {path or none}

## VERDICT

**{SERVES | UNDERSERVES | OVERSERVES | MISSERVES | UNKNOWN}**

{One paragraph. What the product is doing for this segment's job, and where it stands. No hedging,
no second verdict.}

**Evidence basis:** {n} observed · {n} inferred · {n} assumed
**Verdict ceiling:** {met — <the observed L2/L5 finding carrying it> | not met → UNKNOWN}

### Direction change

{The concrete change to the product. A thing to build, deepen, remove, or re-aim — not an adjective.
"None — fix list only" is a valid and common answer.}

**Falsified if:** {what would make this verdict wrong — the pre-mortem}
**Cheapest test:** {test · rough cost · how many `assumed` findings it converts}

---

## L1 — Job

**Job statement:** When {situation}, I want to {motivation}, so I can {expected outcome}.
**Stated vs observed:** {agree | disagree — and what the disagreement implies}

| Stage | Covered | Notes / workaround observed | Evidence |
|---|---|---|---|
| Define | ✓ / ✗ / partial | | observed / inferred / assumed |
| Locate | | | |
| Prepare | | | |
| Confirm | | | |
| Execute | | | |
| Monitor | | | |
| Modify | | | |
| Conclude | | | |

**Forces:** push {…} · pull {…} · **anxiety** {…} · **habit** {…}

---

## L2 — Outcome

`opportunity = importance + max(importance − satisfaction, 0)` — ≥15 underserved · 10–15 held ·
<10 **overserved**.

| # | Desired outcome | Imp | Sat | Opp | Reading | Evidence |
|---|---|---|---|---|---|---|
| 1 | {Minimize the time it takes to …} | | | | underserved / held / overserved | |

**Shape of the table:** {where the ≥15 rows cluster; whether investment is going to <10 rows}
**Invest in:** {outcomes}
**Stop / cut:** {overserved outcomes and what they cost today}

---

## L3 — Journey

| Task | Completed? | Breaks at step | CW question failed | Efficiency cost | Satisfaction | Evidence |
|---|---|---|---|---|---|---|
| {goal} | yes / with-error / no | {step} | Q1 / Q2 / Q3 / Q4 | {steps, fields, time} | {SEQ or observed} | |

**Break stories**
- **{Task} step {n}:** the user looks for {X}, sees only {Y}, concludes {Z}. → {consequence}

---

## L4 — Interface

Only steps flagged above, plus the primary path.

| # | Location (screen · component · step) | Finding + user-visible consequence | Heuristic / SC | Sev | Fix | Evidence |
|---|---|---|---|---|---|---|
| 1 | | | H{n} / SC {x.x.x} | 0–4 | | |

**Working well (don't break these):** {positives worth preserving}
**WCAG 2.2 AA failures:** {list — these go straight to BLOCKERS, unweighed}

---

## L5 — Signal

| HEART | Goal | Signal | Metric | Value | Benchmark | Trend |
|---|---|---|---|---|---|---|
| Happiness | | | SUS / SEQ / CSAT | | 68 / 5.5 / — | ↑ ↓ → |
| Engagement | | | | | | |
| Adoption | | | | | | |
| Retention | | | | | | |
| Task success | | | | | | |

**Contradictions reconciled:** {metric that overruled a finding, and which finding was downgraded}
**Instrumentation to add:** {gaps → filed as inbox action asks}

---

## Fix list

**BLOCKERS** — journey breaks, sev 3–4, AA failures. Fix before shipping.
1. {finding} → {change} · {component/file} · sev {n} · {evidence}

**FRICTION** — recurring cost, doesn't stop completion. Next cycle.
1. …

**POLISH** — quality lift, no task impact. When cheap.
1. …

Ordered by severity × frequency × job-criticality — not by severity alone.

---

## Removal considered

{For each proposed addition: the removal / default / reordering that was weighed against it, and why
the addition won. Prefer removal on a tie. "No additions proposed" is a good outcome.}

---

## Open questions & asks filed

| Ask | Type | Recommended default | Blocking | Inbox record |
|---|---|---|---|---|
| {question} | decision / action / review | {default} | yes / no | {path} |

---

## Routing

- Direction ask → **{codirect | cospecify}**
- Fix list → **coplan** → **cobuild**
- Unknowns → **coresearch**: {the cheapest test}
- Lessons → **colearn**: {e.g. "spec passed cotest but failed the job — <pattern>"}

**SSOT note:** these are findings. They reference the spec and never become it. `STATE.md` gets a
ledger row; the SSOT pointer is untouched.
```
