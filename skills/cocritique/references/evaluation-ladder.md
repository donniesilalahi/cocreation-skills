# The evaluation ladder — five lenses in full

Run **outside-in, top-down**. Each lens narrows the last. The ladder exists so that a critique
cannot start (and therefore cannot end) at the pixel level.

```
L1 Job       ── is the right job being served?          → MISSERVES
L2 Outcome   ── is it served OPTIMALLY?                 → UNDERSERVES / OVERSERVES
L3 Journey   ── can the user complete it end-to-end?    → journey breaks (BLOCKERS)
L4 Interface ── does each screen support its step?      → fix list
L5 Signal    ── what does the evidence actually say?    → confirms or overrules L1–L4
```

**Stop rule.** If L1 fails hard (MISSERVES), L4 findings are noise — record that you stopped and
why. Never go quiet; a truncated ladder is a stated decision, not an omission.

---

## L1 — Job

**Question:** is the product serving the job users actually hire it for?

**Sources:** Christensen's Jobs-to-be-Done; Ulwick's job map; Moesta's Forces of Progress.

### Method

**1. Write the job statement.** One sentence, functional, solution-free:

> When **[situation]**, I want to **[motivation]**, so I can **[expected outcome]**.

A job statement that names your product ("when I open the app…") is a *feature* statement — rewrite
it. The job must survive your product not existing.

**2. Map the job's stages.** Every job runs the same arc. Mark coverage per stage:

| Stage | The user is… | Covered? |
|---|---|---|
| Define | working out what needs doing | |
| Locate | gathering what they need | |
| Prepare | setting up / organizing | |
| Confirm | checking they're ready | |
| Execute | doing the core thing | |
| Monitor | watching it go right | |
| Modify | adjusting / correcting | |
| Conclude | finishing, closing out | |

Products over-invest in **Execute** and abandon **Locate**, **Monitor**, and **Modify**. Gaps at
those stages are where users leak out to workarounds — spreadsheets, screenshots, a second app.
**A stage the user solves outside your product is an uncovered stage**, even if they never complain.

**3. Read the forces.** For the switch into (or away from) this product:

| Force | Question | Direction |
|---|---|---|
| Push | What about the current situation is bad enough to leave? | toward change |
| Pull | What about this product is attractive? | toward change |
| Anxiety | What worries them about switching to it? | against change |
| Habit | What holds them to what they do today? | against change |

Anxiety and habit are the forces teams never design for, and they are usually why a "good" product
doesn't get adopted. **If push and pull are strong and adoption is still weak, the problem is
anxiety/habit — a direction finding, not a UI finding.**

### Verdict trigger

- Product's covered stages ≠ the job's critical stages, or users' actual job differs from the
  manifest's stated job → **MISSERVES**.
- Job correct, coverage incomplete → carry into L2, likely **UNDERSERVES**.

---

## L2 — Outcome  ← the "optimally" lens

**Question:** on each outcome the job requires, is the product over-, under-, or appropriately
serving?

**Source:** Ulwick's Outcome-Driven Innovation opportunity algorithm.

### Method

**1. Write desired outcomes**, not features. The canonical form:

> **[direction]** the **[unit of measure]** it takes to **[object of control]** **[context]**

e.g. "*Minimize the time it takes to confirm a payment landed*". Direction is minimize/increase; the
unit is time, likelihood, or number. **An outcome containing a solution ("add a confirmation
screen") is a feature — rewrite it.** Aim for 8–15 outcomes across the job's stages, weighted toward
the stages L1 flagged.

**2. Score each outcome 0–10:**
- **Importance** — how important is this outcome to getting the job done?
- **Satisfaction** — how well does the current product deliver it today?

With real users, score as *% rating it very/extremely important* and *% very/extremely satisfied*.
With inferred proxy scores (analysts, support tickets, your own walkthrough), say so — every row
carries its own evidence tag, and per SKILL.md §2 an all-`inferred` table cannot carry a direction
verdict on its own.

**3. Compute:**

```
opportunity = importance + max(importance − satisfaction, 0)
```

| Range | Reading | What it means for direction |
|---|---|---|
| **≥ 15** | Underserved | High-value gap. Invest here; this is the roadmap. |
| **12–15** | Attractive in some markets | Watch. Worth it if cheap. |
| **10–12** | Appropriately served | Hold. Leave it alone. |
| **< 10** | **Overserved** | Effort is being spent past the point of user value. **Cut, simplify, or stop investing** — reallocate to the ≥15 rows. |

**4. Cross-read the table.** The direction finding is rarely one row; it's the *shape*:

- Several ≥15 rows clustered in one job stage → that stage is the direction.
- Investment (recent releases, screen real estate, code) concentrated on <10 rows → **OVERSERVES**;
  the product is polishing a solved problem.
- Everything 10–12 → **SERVES**; look for growth outside the product, not inside it.

**Overserved is the finding teams miss.** It doesn't generate complaints — nobody files a ticket
saying "this is better than I need." It shows up only in this table, which is why the table is
mandatory and not optional.

### Verdict trigger

- Any core-job outcome ≥ 15 → **UNDERSERVES** (name the outcome).
- Investment concentrated on < 10 rows → **OVERSERVES** (name what to cut).
- No row above 12, none below 10 → **SERVES** on this lens.

---

## L3 — Journey

**Question:** can a real user actually complete the job, start to finish?

**Sources:** Cognitive walkthrough (Wharton, Rieman, Lewis, Polson); ISO 9241-11:2018; Norman's
gulfs of execution and evaluation.

### Method

**1. Pick the core tasks** — 3–7 from the manifest, each a real job outcome, not a feature tour.
Write each as a user goal ("send money to someone not in my contacts"), never as a click path.

**2. Walk each task as a first-time user**, step by step. At **every** step, all four questions:

| # | Question | Failure signature |
|---|---|---|
| 1 | Will the user try to achieve the right effect? | They don't know this step is theirs to take, or don't know it exists |
| 2 | Will they notice the correct action is available? | The control is off-screen, low-contrast, behind a menu, below the fold |
| 3 | Will they connect that control to the effect they want? | Label/icon doesn't say what it does; jargon; ambiguous icon |
| 4 | After acting, will they see progress toward the goal? | No feedback, ambiguous state, silent success, silent failure |

Q1–Q3 are the **gulf of execution** (knowing what to do). Q4 is the **gulf of evaluation** (knowing
what happened). Record a **story** for each failure — "the user looks for X, sees only Y, concludes
Z" — not a label. The story is what makes the finding actionable.

**3. Score the task (ISO 9241-11:2018):**

| Dimension | Definition | How to record |
|---|---|---|
| **Effectiveness** | Accuracy and completeness of goal achievement | Completed / completed-with-error / abandoned; at which step |
| **Efficiency** | Resources used relative to results | Steps, screens, fields, time, backtracks |
| **Satisfaction** | Physical, cognitive, emotional response vs expectation | SEQ 1–7 if measured; otherwise the observed reaction |

**A journey break outranks every interface finding downstream of it.** Fixing the microcopy on step
6 is worthless if step 3 is where users stop. Order the fix list by the step, not by the severity.

### Verdict trigger

- A core task cannot be completed, or breaks at a step most users hit → **BLOCKER**, and
  **UNDERSERVES** on the direction verdict.
- Completable but with high efficiency cost across tasks → FRICTION; feeds the L2 satisfaction score.

---

## L4 — Interface

**Question:** does each screen support the step it carries?

Runs **only** on the steps L3 flagged plus the primary path. Method, heuristics, the 0–4 severity
scale, the WCAG 2.2 AA floor, and the interaction laws are in
**`heuristics-and-severity.md`**.

Two rules that belong here, not there:

- **Every interface finding cites its step.** A finding not attached to a task step is a checklist
  item — demote it to POLISH or drop it.
- **Accessibility is a floor, not a lens.** A WCAG 2.2 AA failure is a defect whatever the critique
  concludes elsewhere. It goes straight to BLOCKERS without being weighed against other findings.

---

## L5 — Signal

**Question:** what does the evidence say, independent of anyone's opinion — including yours?

**Sources:** Google's HEART + Goals-Signals-Metrics; MeasuringU benchmarks; Sean Ellis PMF test.

### Method

**1. Build the Goals → Signals → Metrics table** across HEART. Only fill the rows that matter for
this surface — HEART is a menu, not a mandate.

| HEART | Goal (what good looks like) | Signal (observable behavior) | Metric (the number) |
|---|---|---|---|
| **Happiness** | attitude/satisfaction | survey response, rating, complaint rate | SUS, UMUX-Lite, SEQ, CSAT |
| **Engagement** | depth of voluntary use | actions per active user, session depth | events/user/week |
| **Adoption** | new users reaching value | first-time completion of the core task | % new users completing core task |
| **Retention** | users still getting the job done | return rate over a job-relevant window | N-week retention, churn |
| **Task success** | the job actually gets done | completion, error, time-on-task | success rate, error rate, task time |

**2. Compare against benchmarks** — and always against the product's own trend, which matters more:

| Instrument | Benchmark | Note |
|---|---|---|
| SUS | **≈ 68 = average** (0–100) across ~500 studies | Below 68 = below-average perceived usability |
| UMUX-Lite | normalizes to the SUS scale; ≈ 68 = average | 2 items; cheap proxy for SUS |
| SEQ | **≈ 5.5 average** (1–7, higher = easier) | Nominal midpoint is 4 — 4.5 is *below* average, not "okay" |
| PMF (Sean Ellis) | **≥ 40% "very disappointed"** = fit; 25–40% = close; < 25% = no fit | A segment-level, not product-level, read |
| Task success | context-dependent; trend and failure *step* beat the absolute | |

**3. Reconcile against L1–L4.** This is the lens's real job:

- **A metric beats a heuristic.** If users complete the task at 94% and you flagged an H6 violation,
  downgrade the finding — the interface is doing something your inspection didn't model.
- **A high SUS with low task success is the classic split**: users like it and still fail. Trust
  task success for direction; trust SUS for satisfaction scoring in L2.
- **A metric with no benchmark and no trend is decoration.** Say what to instrument instead.

### Verdict trigger

- Metrics contradict the ladder's direction → the ladder yields; re-run L2 with observed satisfaction.
- No metric exists for a core task → this is the lens's **output**: name the instrumentation, file it
  as an `inbox/` action ask, and apply the §2 evidence ceiling.

---

## Sources

- Christensen, *Competing Against Luck* — jobs-to-be-done.
- Ulwick, *What Customers Want* / *Jobs to be Done* — job map, desired-outcome statements, the
  opportunity algorithm.
- Moesta, *Demand-Side Sales* — the four forces of progress.
- Wharton, Rieman, Lewis & Polson (1994) — the cognitive walkthrough method.
- ISO 9241-11:2018 — usability: effectiveness, efficiency, satisfaction, in a context of use.
  ISO 9241-210 — the human-centred design process (its 2019 outcomes add accessibility, well-being,
  and reduced adverse effects).
- Norman, *The Design of Everyday Things* — gulfs of execution and evaluation.
- Rodden, Hutchinson & Fu (Google, 2010) — HEART + Goals-Signals-Metrics.
- Sauro & Lewis / MeasuringU — SUS, SEQ, UMUX-Lite benchmarks.
- Ellis (2009) — the 40% product-market-fit test.
