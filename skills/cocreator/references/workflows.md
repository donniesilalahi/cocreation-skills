# Workflows — the named loop chains

A **workflow** is a named, pre-wired chain of loops for a recurring situation. It exists so nobody
has to re-derive "which loops does a bug fix need?" every time, and so the loops that are easy to
skip under pressure (the check, the lesson) are already in the chain.

**Workflows are defaults, not rails.** The loop-level decision tree still governs what happens
*inside* one: a `coverify` FAIL inside `ship` drops into `fix`'s `codebug` and comes back. Naming
the workflow says where you started and what "done" means — not that the path is fixed.

---

## Choosing one

Two questions pick the workflow. Ask them in order.

**1. What is the trigger?**

```
nothing to build yet, direction unclear ......... discover
something is broken ............................. fix
a new capability, uncertain or high blast radius . feature
a small, well-understood change ................. ship
the UI itself is the deliverable ................ design-first
"is this any good?" ............................. evaluate
about to put it in front of users ............... release-prep
the code/UI is a mess, behavior shouldn't change . cleanup
```

**2. What is "done" measured against?** This is the question that picks *inside* `evaluate`, and it
is the one most often answered wrong:

| Reference point | Question | Loop |
|---|---|---|
| **the spec** | did we build what we said? | `coverify` |
| **itself, across screens** | do the N copies agree? | `coconsolidate` |
| **the job** | was it worth building? | `cocritique` |

Running the wrong one gives a confident answer to a question nobody asked. A screen can pass
`coverify` perfectly, be flawlessly consistent, and still fail `cocritique`.

---

## The catalog

Each workflow lists its **entry condition**, the **chain**, what it **deliberately skips**, and its
**exit gate** — the condition that means the *workflow* is done, not just its last loop.

### `discover` — direction is unclear

**Enter when:** there's a problem worth solving but no agreement on what it is, or a load-bearing
assumption is unverified. Also where `cocritique` routes a MISSERVES or UNKNOWN verdict.

```
colearn(recall) → coframe → coresearch → ┬ verdict holds → coplan (hand off to feature/ship)
                                          └ verdict fails → stop. Not building is the result.

[costudy] runs in parallel, optional — reverse-engineers a comparable shipped product as evidence.
```

**`costudy` alongside `coresearch`.** Same stage (discovery), same entry-point shape (fed by
nothing) — but a different object of study: `coresearch` red-teams *our* load-bearing assumptions,
`costudy` reverse-engineers *someone else's* shipped product (screens, flows, IA, inferred design
system) from the user's own live authenticated session, primed by Mobbin. **Skipped when** no
comparable product exists worth studying, or the open question doesn't turn on how others solve it.
**Hands off** its study ledger to `cospecify`/`codraw` once the workflow reaches design (primary
feed — see `design-first` below), and to `cocritique`/`coframe` as comparative evidence only
(secondary — competitors are not the bar, per PLAYBOOK).
**Exit gate (costudy):** verdict `COMPLETE | PARTIAL | BLOCKED` with coverage numbers — flows
captured / in scope, screens captured / Mobbin-covered, `reachable-unvisited` count, assumed-tag
ratio. `PARTIAL` is a legitimate pass-through **if it names what's missing** (iOS studies are
`PARTIAL` on network/token evidence by construction — screenshots carry no computed styles).
`BLOCKED` halts `costudy` itself but not the rest of `discover`, since the two run in parallel.

**Skips:** everything downstream. Nothing is built here, on purpose.
**Exit gate:** a pitch with a fixed appetite and its load-bearing assumptions named — each either
tested or explicitly accepted as a risk. "We decided not to build this" is a successful exit.

---

### `ship` — a small, well-understood change

**Enter when:** the change is clear enough that writing a spec would take longer than making it, and
its blast radius is small. The most common workflow; treat it as the default until something makes
it insufficient.

```
colearn(recall) → cobuild ⇄ coverify → cochangelog
```

**Skips:** `coframe` (the framing is the request), `coresearch` (nothing unverified),
`coplan` (one step doesn't need decomposing), `cospecify` (see below).
**Exit gate:** the change is built, `coverify` PASSes, the changelog line exists, and no inbox stub
is unresolved.

> **Why `cospecify` is out and `coverify` is in.** A spec's job is to stop an executor inventing
> decisions mid-stream — on a change with no decisions to invent, it's ceremony. The check is the
> opposite: it's the whole thesis of the playbook (build collapses, review becomes the constraint),
> so it's the last thing to drop, not the first. If you find yourself wanting a spec here, that's the
> signal to escalate to `feature`, not to bolt one on.

---

### `feature` — a new capability

**Enter when:** the work is a real capability, the shape isn't obvious, or getting it wrong is
expensive. The full chain. Earn it — don't impose it on `ship`-sized work.

```
colearn(recall) → coframe → coresearch → coplan → cospecify → [codraw] →
                  cobuild ⇄ coverify (↘ codebug) → coharden → cochangelog → colearn(capture)
```

**Skips:** nothing by default. Drop `coresearch` when no assumption is load-bearing; drop `codraw`
when there's no visual surface; drop `coharden` only if `release-prep` will run before users see it.
**Exit gate:** every plan step is closed, `coverify` PASSes against the spec, edge cases are covered
or explicitly deferred, the changelog cross-references the plan, and a lesson is recorded.

---

### `design-first` — the UI is the deliverable

**Enter when:** what's being delivered is a screen or surface, and fidelity to a design is the
acceptance criterion. Also the workflow for "here's a Figma/mock, build it."

```
[costudy] → cospecify → codraw → cotranslate → coverify → cochangelog
                                       ↘ drift across screens → coconsolidate
```

**`costudy` is optional, upstream of `cospecify`.** Run it first when the deliverable has a direct
competitive analog worth studying — its study ledger (`ledgerPath`) is cited by `cospecify` as
`study:<id>`, and `codraw`'s `design-manifest.json` resolves it directly via the optional
`referenceLedger` field, so neither loop has to re-derive reference evidence. **Skipped when** no
comparable product exists, or the screen has no useful external analog.
**Exit gate (costudy):** verdict `COMPLETE | PARTIAL | BLOCKED`, same coverage numbers as in
`discover` above. `PARTIAL` passes through as long as what's missing is named; `BLOCKED` halts
`costudy` only — `design-first` still proceeds from the spec + design-system SSOT alone.

**Skips:** `coplan` for a single surface (the artboard set *is* the decomposition); scale back up to
`feature` for a multi-screen flow.
**Exit gate:** every depicted element and state is implemented from shared masters, token parity
passes, every control has a live interaction, and `coverify` accepts the screen against its artboard.

> **Order matters here, twice.** `codraw` *renders* a spec — it does not invent one, so `cospecify`
> comes first even when the design already exists (the spec is where states, data, and edge behavior
> get pinned). And `cotranslate` reports `implemented | blocked` and is forbidden from self-accepting,
> so `coverify` is not optional garnish — it is the only thing that can close the workflow.

---

### `fix` — something is broken

**Enter when:** a defect is reported, a test fails, or `coverify` FAILs inside another workflow.

```
colearn(recall) → codebug → cobuild → coverify → colearn(capture)
                                          ↘ still failing → back to codebug (bounded)
```

**Skips:** `coplan` unless the fix fans out across files; `cospecify` always (a fix conforms to the
existing spec — if it needs a new one, the "bug" is a missing decision, so re-enter `feature`).
**Exit gate:** root cause named (not just the symptom suppressed), the fix verified, and **a lesson
written**.

> **`colearn` capture is not optional in this one.** It is the backprop reflex: a bug fixed without a
> lesson is how the same bug class comes back. Recurrence is what promotes a lesson into a guardrail
> — skip the capture and the ecosystem stops learning.

---

### `evaluate` — "is this any good?"

**Enter when:** someone asks for a review, a surface underperforms, a cycle boundary is coming, or
the next roadmap bet needs justifying.

**This is a router, not a chain.** Pick by reference point (see *Choosing one*, question 2). Run more
than one when more than one question is genuinely open — but name which is which, because their
findings are not comparable.

```
vs the spec  → coverify      → fix list          → fix / ship
vs itself    → coconsolidate → one master        → cleanup
vs the job   → cocritique    → direction verdict → discover (MISSERVES) · feature (UNDERSERVES)
                                                 · cleanup/cut (OVERSERVES) · discover (UNKNOWN)
```

**Skips:** all building. Evaluation produces findings and a route, never edits.
**Exit gate:** a verdict exists with its evidence, findings are prioritized, and the next workflow is
named. For `cocritique` specifically, **UNKNOWN is a valid exit** — it means the evidence didn't
support a direction call, and it hands the cheapest test to `discover`.

---

### `release-prep` — about to face users

**Enter when:** the happy path works and it's about to reach people who didn't build it.

```
coharden → coverify → [coconsolidate sweep] → cochangelog → completion gate
```

**Skips:** `cobuild` beyond what hardening requires. This workflow does not add capability — scope
growth here is how releases slip.
**Exit gate:** edge cases and failure paths covered, `coverify` PASSes, **and the completion gate is
clean** — no inbox item still `open` and blocking, no unconfirmed `placeholder` or `default-applied`
left in the build. That gate is the actual deliverable of this workflow; the rest is preparation
for it.

---

### `cleanup` — the mess, not the behavior

**Enter when:** duplication or drift has accumulated, and nothing about behavior should change.

```
coconsolidate → coverify
```

**Skips:** `cochangelog` when nothing user-visible changed (record it in the consolidation record
instead); `cospecify` unless a `C0` spec tightening is the fix, in which case the spec change goes
through `cospecify` and this workflow conforms the code to it afterwards.
**Exit gate:** one master per cluster, every call site migrated, dead copies deleted, and behavior
provably unchanged per site.

---

## Chaining

Workflows compose. The common sequences:

```
discover ──▶ feature ──▶ release-prep ──▶ evaluate(cocritique) ──┐
   ▲                                                              │
   └────────────── MISSERVES / UNKNOWN ◀──────────────────────────┘

evaluate(coverify)      ──▶ fix
evaluate(coconsolidate) ──▶ cleanup
evaluate(cocritique)    ──▶ UNDERSERVES ──▶ feature   (deepen)
                            OVERSERVES  ──▶ cleanup   (cut)
```

The outer loop is the point: `evaluate` → `discover` is what stops a team executing a wrong
direction flawlessly.

---

## Rules that hold across every workflow

1. **`coverify` is never skipped on anything that changes behavior.** Build collapsed; review is the
   constraint. Dropping the check to go faster optimizes the part that was never the bottleneck.
2. **A failure always writes a lesson.** `colearn` capture is mandatory in `fix` and after any FAIL
   anywhere else.
3. **Recall before work.** `colearn` recall opens every workflow that builds. It is cheap and it is
   the only thing that stops a known mistake being repeated.
4. **Escalate the workflow, don't bolt loops onto it.** Wanting a spec inside `ship` means the work
   is `feature`-sized. Re-enter at the right workflow instead of growing a small one.
5. **Diagnostic loops never edit the source of truth.** `coverify`, `coconsolidate`, `codebug`,
   `coharden`, `cocritique` emit findings and route. Spec changes go through `cospecify`; intent
   changes go through `coframe` + the human.
6. **The completion gate applies to every workflow, not just `release-prep`.** Nothing reports done
   while an inbox item is open-and-blocking or a placeholder is unconfirmed.
7. **One workflow at a time per surface.** Two in flight on the same surface produce contradictory
   verdicts and a STATE ledger nobody can read.
8. **The chain carries itself.** A workflow advances on PASS without asking permission between steps
   — naming it *was* the permission. It halts on four things only: exit gate met, hard-block,
   retries exhausted, or a direction change. `STATE.md`'s `Workflow:` / `Next:` is what makes that
   survive a session boundary. See `SKILL.md` §8.
