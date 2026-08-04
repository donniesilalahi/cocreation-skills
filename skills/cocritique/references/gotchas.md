# Gotchas — how a critique goes wrong

Two families: **failure modes of the critic** (§A — the ones that make a critique worthless or
harmful) and **UX smells** (§B — the failure modes to look *for*). §A is the more important list;
§B is findable with any checklist, §A is not.

---

## A. Failure modes of the critic

### A1 — Starting at the interface
The most common failure. Opening on button placement silently ratifies the current product
direction: you've assumed the right thing is being built and are only asking whether it's built
neatly. **Tell:** the report's first section is a screen. **Fix:** ladder order is mandatory —
job, outcome, journey, *then* interface.

### A2 — Confident direction change from inspection alone
An agent can produce a fluent, plausible, entirely wrong direction verdict from a screenshot. This
is the playbook's "confident mistake" at full speed and it is the single most expensive error this
loop can make — a bad UI finding costs a day; a bad pivot costs a quarter. **Fix:** the §2 evidence
ceiling. No `observed` finding on L2/L5 → the verdict is UNKNOWN. Not "UNDERSERVES (low confidence)".

### A3 — Confirming the brief
The manifest says the job is X; you evaluate against X; you conclude the product serves X. Circular.
**Fix:** treat the stated job as a *hypothesis*. When observed behavior disagrees with it, the
behavior wins and the disagreement is usually the most valuable finding in the report.

### A4 — Taste dressed as usability
"Feels cluttered", "typography is weak", "not modern". None are findings unless they attach to a
heuristic, a walkthrough step, a success criterion, or a metric. **Fix:** every finding cites one.
If it can't, it's POLISH — or it's dropped.

### A5 — Severity inflation
Everything rated 3–4 so the report feels urgent. It destroys the ordering the fix list exists to
provide. **Fix:** severity 4 requires a *loss*. More than a third of findings at 3–4 = re-rate.

### A6 — Manufacturing problems
A critique that must find problems will find them. A healthy surface is a valid, useful result.
**Fix:** report SERVES plainly. Say the surface didn't warrant a deeper critique.

### A7 — Additions as the default fix
Nearly every finding *can* be answered by adding something — a tooltip, a step, an onboarding
overlay, a help link. Additions compound; they're how a clean product becomes bloated one reasonable
decision at a time. **Fix:** for every proposed addition, first ask what removal, default, or
reordering solves the same finding. Prefer removal on a tie.

### A8 — Benchmarking against competitors
"Competitor X has this" is not a finding — it says nothing about whether *this* job needs it, and it
outsources direction to a company with different users. **Fix:** benchmark against the job (L2) and
against published usability benchmarks (L5). Competitors are evidence only when a user actually
switched to one, and then the finding is about the switch, not the feature.

### A9 — Ignoring the overserved side
Reporting only gaps produces a roadmap that only ever grows. Opportunity scores under 10 are where
the budget for the ≥15 rows comes from. **Fix:** the L2 table is not complete until you've named
what to *stop* doing.

### A10 — Critiquing three things at once
A verdict that covers a whole product plus two sub-surfaces is not actionable for any of them.
**Fix:** one verdict per surface, one record per verdict.

### A11 — Rewriting the spec
The critique concludes the spec is wrong and edits it, or updates `STATE.md`'s SSOT pointer. That
silently bypasses the reviewed channel and destroys the trail. **Fix:** cocritique **proposes** —
files an `inbox/` decision ask and routes to `coframe`/`cospecify`. The human decides.

### A12 — Stalling for evidence
Refusing to produce anything until metrics arrive. The workspace protocol forbids this. **Fix:**
critique at the ceiling the evidence allows, file the missing evidence as an `inbox/` action ask,
and continue.

### A13 — Walking the happy path only
Walking the flow you already know completes tells you nothing. **Fix:** walk as a *first-time* user;
include the empty state, the error path, the interrupted-and-resumed path, and the state a user
lands in after a failure.

### A14 — Treating accessibility as a scoring dimension
Weighing a WCAG failure against other findings and concluding it "isn't a priority this cycle."
**Fix:** AA is a floor. Failures go to BLOCKERS without being weighed.

---

## B. UX smells to look for

Named failure patterns. Each maps to a heuristic so it lands in the report with a citation.

| Smell | Signature | Cites |
|---|---|---|
| **Hidden primary action** | The main task carries secondary or tertiary visual weight; fails the squint test | H8, Fitts |
| **Overloaded navigation** | Many equally weighted items, no grouping; users scan everything before choosing | H6, Hick |
| **Form fatigue** | Long forms with required fields whose purpose isn't obvious to the user | H5, SC 3.3.7 |
| **Silent failure** | Action appears to do nothing — no feedback, no state change, no error | H1, H9 |
| **Silent success** | It worked, but nothing confirms it, so the user repeats or abandons | H1 |
| **Mode confusion** | Can't tell whether they're viewing, editing, or confirming | H1, H4 |
| **Destructive without undo** | Irreversible action with only a confirm dialog defending it | H3, H5 |
| **Recall tax** | Information from an earlier step required later with no reminder | H6, SC 3.3.7 |
| **Jargon labels** | Internal or database vocabulary surfaced as UI copy | H2 |
| **Inconsistent naming** | The same action named differently across surfaces | H4 |
| **Dead end** | A state with no forward action and no way back (empty, error, expired) | H3, H9 |
| **Novelty over convention** | A platform-standard pattern replaced for distinctiveness alone | H4, Jakob |
| **Premature signup wall** | Value gated before the user can judge whether it's worth it | forces: anxiety |
| **Spinner-only latency** | Long waits with no skeleton, progress, or optimistic state | H1, Doherty |
| **AI slop** | Auto-generated UI with inconsistent spacing, colour, and labels — off-system tokens | H4, H8 |
| **Feature museum** | Surfaces built for outcomes scoring < 10, still occupying prime real estate | L2 overserved |
| **Workaround in the wild** | Users maintain a spreadsheet/screenshot/second tool to finish the job | L1 uncovered stage |

The last two are direction findings, not interface findings — they belong in the verdict, not the
fix list. They are also the two most easily missed, because neither generates a complaint.

---

## C. Cross-loop confusions

| Symptom | That's not cocritique — it's |
|---|---|
| "This doesn't match the artboard/spec" | `coverify` (impl vs spec) |
| "This button is 18pt here and 16pt there" | `coconsolidate` (impl vs impl drift) |
| "Port this design into native UI faithfully" | `cotranslate` (design → impl) |
| "This crashes / returns the wrong value" | `codebug` (defect) |
| "What happens on empty/overflow/offline?" | `coharden` (edge cases) |
| "Is this assumption true?" | `coresearch` (evidence) |
| "The job itself is wrong; re-frame it" | `coframe` — cocritique *routes* there, it doesn't do it |

If the question is "does this match what we decided", it is never cocritique. cocritique only asks
"was what we decided worth deciding".
