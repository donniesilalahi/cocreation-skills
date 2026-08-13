---
name: cocritique
description: The "critique" loop. Answers one question — does the product, as it stands, do the user's job optimally, and if not what has to change in the product's DIRECTION? Evaluates a current/shipped experience outside-in across five lenses — job (JTBD job map), outcome (ODI opportunity score), journey (cognitive walkthrough, ISO 9241-11), interface (Nielsen heuristics + 0–4 severity, WCAG 2.2 AA), signal (HEART, SUS/SEQ benchmarks, PMF) — and returns ONE verdict (SERVES / UNDERSERVES / OVERSERVES / MISSERVES / UNKNOWN) plus the direction change it implies and a prioritized fix list. Every finding is tagged observed|inferred|assumed; a verdict resting on assumptions can be no stronger than UNKNOWN and must name the cheapest test instead. Use for design critique, UX/HCI review, "is this actually working for users", post-ship evaluation, or before committing to the next cycle. NOT cotest (impl vs spec) and NOT coconsolidate (impl vs impl drift) — cocritique checks the product against the JOB. The doer is cocritic.
---

# cocritique — is the product doing the job?

The doer is **cocritic** (Opus — judgment-heavy). This is the **return edge of the big loop**: it
evaluates what exists against the job it was hired to do, and hands a direction verdict back
upstream to `codirect`. Where `colearn` feeds back *process* lessons, `cocritique` feeds back
*product direction*.

**The line vs siblings — three different reference points:**

| Loop | Compares | Answers |
|---|---|---|
| `cochallenge` | decision artifact **pre-build** | Did the reasoning survive attack before we built it? |
| `cotest` | impl **vs the spec** | Did we build what we said? |
| `coconsolidate` | impl **vs itself** across screens | Is it consistent / DRY? |
| **`cocritique`** | product **vs the JOB** | Did what we said turn out to be worth building? |

A screen can pass `cotest` perfectly and still fail here — faithful to a spec that was serving the
wrong outcome. That gap is this loop's whole reason to exist.

## 0. Bootstrap — the critique-manifest

Project facts do not live in this skill. If `<workspaceRoot>/workspace/critique-manifest.json` is missing,
draft it and get it confirmed rather than guessing (schema + worked example:
`references/critique-manifest.md`). It names: the **user segment**, the **job statement**, the
**core tasks**, the **surfaces** in scope, the **evidence sources** available (analytics, session
recordings, support tickets, past research, benchmarks), and any **constraints** (platform,
regulatory, business-mandatory elements).

Read the resolved `<workspaceRoot>/workspace/STATE.md` first, and `<workspaceRoot>/workspace/raw/` for human-owned briefs — those are source of
truth and never rewritten. A human-authored/confirmed manifest is a `raw/` input; an AI-drafted one
stays AI-owned until confirmed.

**Missing manifest is not a blocker.** Draft it, mark the fields you inferred, and proceed — the
evidence rule (§2) already prevents an under-informed critique from over-claiming.

## 1. Prime directive — critique the OUTCOME, not the pixels

Two absolutes:

1. **Start outside-in, at the job — never at the screen.** A critique that opens on button placement
   has already conceded that the current product direction is correct. Walk the ladder top-down (§3);
   interface findings are the *last* lens, not the first.
2. **Separate what you saw from what you assumed.** Tag every finding `evidence: observed |
   inferred | assumed`, and let that cap the verdict (§2). Heuristic inspection is a *cheap proxy*
   for user behavior, not a substitute for it. The failure mode this loop must not commit is a
   confident direction change built on nothing but inspection.

## 2. The evidence rule (the honesty gate)

| Tag | Means | Examples |
|---|---|---|
| `observed` | Recorded behavior or a direct user statement | Analytics funnel, session recording, support ticket, usability-test result, benchmark score |
| `inferred` | Deduced from an artifact by an expert method, traceable to a named heuristic/step | Cognitive walkthrough failure at step 3, Nielsen H5 violation, WCAG 2.2 AA failure |
| `assumed` | Belief about users with no artifact and no data behind it | "Users probably want…", "this segment cares about speed" |

**Verdict ceiling:** a verdict may only be as strong as the evidence carrying its *load-bearing*
findings.

- A **direction verdict** (UNDERSERVES / OVERSERVES / MISSERVES) requires at least one `observed`
  finding on the outcome or signal lens. Without it → **UNKNOWN**.
- A **fix list** may rest on `inferred` — heuristic and walkthrough findings are legitimate on their
  own for interface-level fixes.
- Anything `assumed` is a **hypothesis, never a finding**. Move it to the test queue.

When the ceiling forces UNKNOWN, that *is* the deliverable: name the **cheapest test that unblocks
the most assumptions** and route to `coresearch`. This is the playbook's "pull risk forward" and
"automate execution, not judgment" applied literally — see `PLAYBOOK.md` §3, §4.

Never stall for evidence. Produce the full critique at the ceiling the evidence allows, file the
missing evidence as an `inbox/` **action** ask, and continue.

## 3. The evaluation ladder — five lenses, outside-in

Run top-down. Stop early only when a higher lens already fails hard enough to make lower ones moot
(a MISSERVES verdict makes button placement irrelevant) — say so explicitly rather than going quiet.
Full method per lens: `references/evaluation-ladder.md`.

### L1 — Job · *is the right job being served?*
Write the job as `When [situation], I want to [motivation], so I can [expected outcome]`. Map the
job's stages end-to-end (define → locate → prepare → confirm → execute → monitor → modify →
conclude), then mark which stages the product actually covers. Check the **forces**: what pushes the
user toward this product, what pulls them, what anxiety and habit hold them back. **Tell:** the
product serves a *different* job than users hire it for → MISSERVES.

### L2 — Outcome · *is the job served OPTIMALLY?* ← the core question
For each desired outcome of the job, score **importance** and **satisfaction** (0–10), then:

```
opportunity = importance + max(importance − satisfaction, 0)
```

| Score | Reading | Direction |
|---|---|---|
| **≥ 15** | Underserved — high importance, low satisfaction | **Invest / deepen** here |
| **10–15** | Appropriately served for most markets | Hold |
| **< 10** | **Overserved** — effort spent where users are already satisfied | **Remove / simplify / stop investing** |

This is the only lens that answers "optimally" in both directions. **Overserved outcomes are the
finding teams miss** — the product isn't broken, it's over-built somewhere and starved elsewhere.
Prefer scores from real users; with an inferred proxy score, say so and cap the verdict per §2.

### L3 — Journey · *can the user complete the job end-to-end?*
Walk each core task as a first-time user. At **every step**, the four cognitive-walkthrough
questions:

1. Will the user try to achieve the right effect?
2. Will they notice the correct action is available?
3. Will they connect that control to the effect they want?
4. After acting, will they see progress toward the goal?

Score the task on ISO 9241-11: **effectiveness** (did they complete it, completely and correctly),
**efficiency** (resource cost — steps, time, input burden), **satisfaction** (physical/cognitive/
emotional response). A failure at any step is a **journey break** — it outranks every interface
finding downstream of it, because polishing a screen the user never reaches is wasted work.

### L4 — Interface · *does each screen support its step?*
Only for steps L3 flagged, plus the primary path. Nielsen's 10 heuristics with **0–4 severity**,
visual hierarchy and cognitive load, interaction cost (Fitts / Hick), microcopy, and **WCAG 2.2 AA
as a floor, not a lens** — an AA failure is a defect regardless of how the critique scores.
Reference: `references/heuristics-and-severity.md`.

### L5 — Signal · *what does the evidence actually say?*
Map goals → signals → metrics across **HEART** (Happiness, Engagement, Adoption, Retention, Task
success). Compare against published benchmarks — SUS ≈ 68 average, SEQ ≈ 5.5 average, PMF ≈ 40%
"very disappointed" — and against the product's own trend, which matters more than the absolute.
**Where a metric contradicts a heuristic finding, the metric wins and the finding is downgraded.**
Absent metrics are not a failure of this lens; they are its output — name what to instrument.

## 4. The verdict (the deliverable)

Exactly **one** verdict for the product/surface under critique. Never hedge across two.

| Verdict | Condition | Direction change |
|---|---|---|
| **SERVES** | Right job, outcomes appropriately served, no journey break | None. Ship the fix list — friction only. |
| **UNDERSERVES** | Right job, ≥1 outcome scoring ≥15, or a journey break on a core task | **Deepen within the frame.** Name the outcome to invest in. → `cospecify` |
| **OVERSERVES** | Effort concentrated on outcomes scoring <10 while others starve | **Remove / reallocate.** Name what to cut. → `cospecify` |
| **MISSERVES** | Users hire the product for a different job than it serves | **Re-frame.** → `codirect` (segment / scope / job change) |
| **UNKNOWN** | Evidence ceiling not met for a direction verdict (§2) | **Test first.** Name the cheapest test. → `coresearch` |

Each verdict carries: the load-bearing findings + their evidence tags, what would **falsify** it
(the pre-mortem — "this verdict is wrong if…"), and the direction change stated as a concrete change
to the product, not an adjective.

**The default recommendation is removal.** When two directions score equally, prefer the one that
takes something away. Additions are the expensive default that teams reach for reflexively.

## 5. Prioritize the fix list

Every non-direction finding lands in one of three buckets, ranked by
`severity × frequency × job-criticality` (job-criticality = does this sit on a core task's path):

- **BLOCKERS** — journey breaks, severity 3–4, WCAG 2.2 AA failures. Fix before shipping.
- **FRICTION** — recurring cost that doesn't stop completion. Fix next cycle.
- **POLISH** — quality lift with no task impact. Fix when cheap.

Findings name a component/file/step, not a vibe. "Make it cleaner" is not a finding.

## 6. SSOT position — findings, never truth

cocritique emits a **signal about the job**, and like every diagnostic loop **its findings never
become the source of truth** (`docs/cocreator/SSOT.md`). What makes it unusual: it is the one loop
whose escalation target is **intent (`codirect`)** rather than the spec, because it is licensed to
challenge the *why*, not just conformance to it.

So it **proposes**, it never rewrites:

- A verdict that implies a direction change files an `inbox/` **decision** ask with a recommended
  default, and routes to `codirect` (MISSERVES) or `cospecify` (UNDER/OVERSERVES).
- It never edits the pitch, the spec, or `STATE.md`'s SSOT pointer. The human + `codirect` decide.
- It appends its run + verdict to the `STATE.md` ledger like any other loop.

## 7. Report format

The single deliverable. Full template: `references/report-template.md`.

```text
Surface: <what was critiqued>   Segment: <who>   Date: <YYYY-MM-DD>
VERDICT: SERVES | UNDERSERVES | OVERSERVES | MISSERVES | UNKNOWN
Evidence basis: <n> observed · <n> inferred · <n> assumed

Job: When <situation>, I want to <motivation>, so I can <outcome>.
Stages covered: <…>   Stages missing: <…>

Outcome table:
| Outcome | Imp | Sat | Opportunity | Reading | Evidence |

Journey table (per core task):
| Task | Step that breaks | CW question failed | Effectiveness | Efficiency | Evidence |

Interface findings:
| Location | Finding | Heuristic / SC | Severity 0–4 | Fix | Evidence |

Signal:
| HEART goal | Signal | Metric | Value vs benchmark | Trend |

DIRECTION CHANGE: <concrete change, or "none — fix list only">
Falsified if: <what would make this verdict wrong>
Cheapest test: <test · cost · how many assumed findings it unblocks>
Fix list: BLOCKERS <n> · FRICTION <n> · POLISH <n>
Open asks filed: <inbox record paths>
```

## Memory bank

> **Storage:** Resolve `workspaceRoot` from `.agents/workspace/cocreation.yaml` (default `.agents`).
> In `local`, write the full record to `<workspaceRoot>/skills/<name>/memory-bank/` and refresh its
> index. In `linear-primary`, write the human-facing artifact through the active backend and keep
> provider metadata, links, and the local navigation/index cache; never write project records into
> the plugin cache.


**Directory:** `.agents/skills/cocritique/memory-bank/` · **Records:**
`YYYY-MM-DD-{surface-slug}.md` (copy `_template.md`, fill frontmatter `title` / `date` / `verdict` /
`segment` / `status`). **Index:** `CRITIQUE.md` — auto-generated; never hand-edit. After a record:
`node .agents/skills/cocritique/index.mjs` (or `npm run update-indices`).

A record links the `raw/` input it read and the artifact it critiqued, plus a `frame:` cross-ref to
the `codirect` pitch when the verdict re-opens intent. Re-critiquing the same surface later writes a
**new dated record** and adds `superseded-by:` to the old one — the trend across records is itself
evidence.

## Guardrails

- **Never open at the interface.** Ladder order is the method; L4 findings without L1–L3 context are
  a checklist, not a critique.
- **A verdict is not a mood.** No verdict without its load-bearing findings, evidence tags, and a
  falsifier.
- **Don't confirm the brief.** If the manifest's stated job and observed behavior disagree, the
  behavior wins — that disagreement is often the whole finding.
- **Competitors are not the bar.** Benchmark against the job, not against a rival's feature list.
  "Competitor X has it" is not a finding.
- **Aesthetic preference is not usability.** If a finding can't name a heuristic, a walkthrough step,
  a success criterion, or a metric, it's taste — label it POLISH or drop it.
- **Overserved is a real finding.** Report it as loudly as underserved; it is where the freed budget
  comes from.
- **No fixes applied here.** cocritique diagnoses and recommends. Implementation is `cobuild` /
  `cotranslate`; consistency is `coconsolidate`.
- **One verdict, one surface.** Critiquing three surfaces = three records.

## Self-eval gate (close the loop)

- **Ladder walked, one verdict issued with evidence tags + falsifier, fix list prioritized, direction
  ask filed** → PASS. Route per §4: `codirect` (MISSERVES), `cospecify` (UNDER/OVERSERVES),
  `coplan` + `cobuild` (fix list), `coresearch` (UNKNOWN).
- **Evidence ceiling blocks a direction verdict** → issue **UNKNOWN** with the cheapest test. That is
  a PASS, not a failure — the loop closed honestly.
- **The manifest's job statement can't be confirmed, or the critique implies killing/repositioning
  the product** → escalate to the human (`inbox/` decision ask). Never bank a pivot unilaterally.
- **Findings are all severity 0–1 taste calls** → re-loop once with a tighter task scope; if still
  thin, report SERVES and say the surface didn't warrant a critique.
- **Backprop:** a verdict that later proves wrong, and any spec that passed `cotest` yet failed
  here, hands a lesson to `colearn` — that pattern is exactly the "confident mistake" the playbook
  warns about.

## References

- `references/evaluation-ladder.md` — the five lenses in full, with how to run each and its sources.
- `references/heuristics-and-severity.md` — Nielsen's 10, the 0–4 severity scale, WCAG 2.2 AA floor,
  interaction laws.
- `references/checklists.md` — quick critique (≤15 min) and comprehensive critique (60+ min).
- `references/gotchas.md` — critique anti-patterns + the UX smell taxonomy.
- `references/critique-manifest.md` — manifest schema + a worked example.
- `references/report-template.md` — the full report skeleton.
