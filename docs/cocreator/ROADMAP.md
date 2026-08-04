# Roadmap — the Co-creation loop ecosystem

Durable design doc. This is the spec the work backprops into; it survives across sessions.
Companion reading: `PLAYBOOK.md` (principles), `RESEARCH.md` (sources).

---

## What this is

A reimagining of the repo: from 8 stand-alone "translate-the-old-process" skills into an
**ecosystem of loops for human–AI product co-creation**. One master skill (`/cocreator`)
orchestrates concise `co-*` loop-skills, each a closed mini-loop that self-evaluates and routes.

---

## The loop architecture

```
        ┌──────────────────── colearn (process lessons feed back) ────────────────────┐
        │                                                                              │
   coframe ──▶ coresearch ──▶ coplan ──▶ cospecify ─▶ ╔═══ CORE LOOP ═══╗ ──▶ cochangelog
   (strategy)  (discovery)   (plan)     (design)      ║ cobuild ⇄ coverify║      (record)
        ▲                                             ║      ⇅ codebug    ║           │
        │                                             ╚═══════════════════╝           │
        └──────────── cocritique (does it do the JOB? → direction verdict) ◀───────────┘

   Specialized loops, called on demand from any stage: coconsolidate (logic + visual drift) · coharden (edge cases) · codraw (spec→OD artboards) · cotranslate (design→impl port)
```

**Two feedback edges, not one.** `colearn` closes the loop on *process* — how we work, what keeps
breaking. `cocritique` closes it on *product* — whether what we built does the job it was hired for.
Without the second edge the ecosystem can execute a wrong direction flawlessly, forever: a spec can
pass `coverify` perfectly and still have been the wrong thing to build.

**Core loop = make → check → learn.** Not "write code" (build collapses); the engine is
cobuild → coverify, with codebug on failure, and every failure writing a lesson via colearn
(the backprop reflex). A recurring bug-class graduates into a guardrail.

**Decision tree — every loop ends with a self-eval gate:**
- **PASS** → cross-loop forward.
- **FAIL** → re-loop, bounded retries, then *cancel not extend* (escalate).
- **BLOCKED / needs judgment** → escalate to human (where review budget is spent).
- **DRIFT** → cross-loop to a specialized loop (coconsolidate / coharden / codebug).
- **WRONG THING** → the verdict isn't about conformance at all; `cocritique` routes the direction
  change to coframe (re-frame) or cospecify (deepen / cut), or to coresearch when the evidence
  doesn't yet support a call.

**Independence + cross-reference:** every loop runs standalone (cochangelog needs no prior plan).
When paired, they cross-reference — the plan records a `changelog:` ref, the changelog records a
`plan:` ref. `/cocreator` wires these when running loops in sequence.

---

## The roster — skill (action) ↔ agent (doer)

Convention: **skill = action word**, **agent = the doer**, so the link is obvious.

| Skill | Doer agent | Replaces | Stage / role | Model | Mand/Opt |
|---|---|---|---|---|---|
| `/cocreator` | — (orchestrator) | NEW | Master loop + dispatcher | inherits | — |
| `coframe` | `coframer` | NEW | Framing: frame the problem, set appetite, write the pitch | Opus | Optional |
| `coresearch` | `coresearcher` | NEW | Discovery & evidence; red-team assumptions | Opus | Optional |
| `coplan` | `coplanner` | `planning-todos` | Decompose into tracked, verifiable steps | Sonnet | **Mandatory** |
| `cospecify` | `cospecifier` | NEW | Author the buildable solution spec (screens, states, data, interfaces) | Sonnet | Optional |
| `cobuild` | `cobuilder` | NEW | Build/implement (core, "make") | Sonnet | **Mandatory** |
| `coverify` | `coverifier` | `design-qa` | Test & QA: behavior + visual vs spec (core, "check") | Sonnet | **Mandatory** |
| `codebug` | `codebugger` | `analyzing-problems` | Diagnose root cause on failure | Opus | Optional |
| `cochangelog` | `cochangelogger` | `documenting-implementations` | Record what shipped (changelog list) | Haiku | Optional |
| `colearn` | `colearner` | `documenting-lesson-learned` + `accessing-lessons-learned` (merged) | Capture + recall lessons; guardrails; graduation | Sonnet | **Mandatory** |
| `cocritique` | `cocritic` | NEW | Critique: does the product do the user's job optimally — and what direction change follows | Opus | Optional |
| `coconsolidate` | `coconsolidator` | `consistency-audit` (merged) | Specialized loop: one master, many call sites — logic duplication **and** visual drift | Sonnet | Optional |
| `coharden` | `cohardener` | NEW | Specialized loop: edge-case hardening | Sonnet | Optional |
| `codraw` | `codrawer` | NEW | Specialized loop: render a spec into faithful OD artboards + ledger (feeds cotranslate) | Sonnet | Optional |
| `cotranslate` | `cotranslator` | NEW | Specialized loop: design→impl translation (artboard/spec → native UI), zero drift | Sonnet | Optional |

15 skills (1 master + 14 loops). Model tiers: **Opus** = judgment-heavy
(frame/research/diagnose/critique — where mistakes amplify); **Sonnet** = structured build & review;
**Haiku** = mechanical capture/format.

**Renamed / merged (v0.11.0).** `coport` → **`cotranslate`** — the skill already described itself as
"the design→implementation translation loop"; the name now says so, and `port-manifest.json` becomes
`translate-manifest.json` (the legacy filename is still read). `coaudit` → merged into
**`coconsolidate`** — both sat on the *same axis* (impl vs impl) with the *same fix* (extract one
master, migrate every call site); they differed only in lens (pixels vs logic). One loop, two lenses,
five causes (D1–D5, adding *loose spec* and *bypassed master*). The installer detects both old dirs
and prints a migration hint (`cli.js` `RENAMES`); it never deletes.

`/cocreator` ships as a plain skill; it self-delegates through the **Agent tool** with `model:`
overrides — no separate agent artifact required.

---

## Memory & lessons

- **Per-skill `memory-bank/`** keeps the existing index machinery. Records are
  `YYYY-MM-DD-kebab-title.md` with frontmatter `title`, `date`, `status`, plus optional cross-refs
  (`plan:`, `changelog:`). The title says what the record worked on.
- **Lessons** (`colearn`) are self-learning guardrails. Written by the backprop reflex on failure,
  recalled before new work, updated when superseded. Each carries `tier: lesson|skill|subagent`
  and a hit-count. **Graduation: lesson → skill → sub-agent**, triggered by recurrence.

### Co-working workspace (human ↔ AI ownership)

One workspace at `.agents/workspace/` in the consumer project:

```
.agents/workspace/
  raw/       ← human-owned. AI reads as source of truth, never writes. Briefs, refs, source data.
  STATE.md   ← AI-owned project-state pointer: current SSOT + last loop run + verdict (see below).
  inbox/     ← AI-owned human↔agent handoff queue: decision/action/review asks (see SSOT.md).
  ...        ← AI-owned working area / output (everything else in the workspace).
.agents/skills/<co-*>/memory-bank/   ← AI-owned loop log: records + auto-index.
```

Only `raw/` is yours; the rest is the AI's. Loop records link the `raw/` input they worked from and
the output they produced. The AI creates `workspace/raw/` on first use — nothing to scaffold in this
source repo (the installer copies only `skills/`).

All 14 record-keeping loops follow the same convention: timestamped `YYYY-MM-DD-*.md` records +
an UPPERCASE auto-index regenerated by `index.mjs` (including the richer field sets — `coconsolidate`
carries `lens`/`cause`/`tier`, `cocritique` carries `segment`/`verdict`).
**Status is a frontmatter `status:` field, never a folder or filename** — the per-status view is
generated from the field; path/filename stay stable so cross-refs (`plan:`/`changelog:`/`handoffRef`)
and git history don't break. "Moved on" is a `superseded-by:` link; the only sanctioned move is
coarse terminal `archive/` (rename-only commit). See `SSOT.md`.

## Source of truth (SSOT)

When many loops each emit an artifact, authority is **owned by dimension**, not by one flat winner:
intent (`coframe`) owns *why*, the **spec (`cospecify`) owns *what* + acceptance** — the primary SSOT
executors build and check against — the plan (`coplan`) owns the *work*, design/code are *derived*,
and diagnostic loops (`coverify`/`codebug`/`coconsolidate`/`coharden`/`cocritique`) own only a *signal*:
their findings reference the spec and never become it. A single ranked chain-of-command (PLAYBOOK >
intent > spec > plan > design/code > findings) breaks direct conflicts only; unbreakable ones
escalate to the human. The `.agents/workspace/STATE.md` pointer (head = current SSOT + focus +
blockers; append-only ledger = every loop run + verdict) is read first by every loop and updated on
exit. Full design of record: **`SSOT.md`**. It generalizes the conflict ladder `cotranslate` already ships.

**Human handoff.** Where a cycle needs the human, an `.agents/workspace/inbox/` queue holds typed
asks — **decision** (pick/answer, with a recommended default), **action** (homework only a human can
do: visual QA, register an integration, enter a secret), **review** (approve/edit/reject). The agent
never stalls: proceed on a low-risk default, run independent loops, or **placeholder-and-continue**
on a soft blocker — then a **completion gate resurfaces every stub and unconfirmed default before
anything ships**. Detail in `SSOT.md` § Human handoff.

---

## Native tooling each skill leans on

`/loop` (recurring/self-paced passes) · `TaskCreate`/`TaskUpdate` (track todos) ·
`EnterPlanMode` (shape/plan) · **Agent** (delegation) · `/verify` (coverify) ·
`/code-review` + `/simplify` (coverify/coharden) · `ScheduleWakeup`/`/schedule`.
(`/goal` is not available in this harness — "set goal" maps to `EnterPlanMode` + `coframe`.)

---

## Build sequence (sub-plans)

- **A — Foundation & playbook.** `docs/cocreator/{PLAYBOOK,ROADMAP,RESEARCH}.md`; README + CLAUDE.md framing.
- **B — Rename + memory convention.** Rename 8 dirs to `co-*`; merge lesson skills into `colearn`;
  `YYYY-MM-DD-title.md` records; `tier`/cross-ref frontmatter; `index.mjs` columns; `marketplace.json`;
  validator; `cli.js`; bump `package.json` → 0.2.0.
- **C — `/cocreator` master.** Roster, recommendation, Agent-tool delegation + model routing,
  decision-tree orchestration, cross-ref wiring.
- **D — Gap-closer skills.** `coframe`, `coresearch`, `cospecify`, `cobuild`, `coharden`.
- **E — Lesson graduation + backprop.** Failures → `colearn` records; `tier` promotion; recall-before-work.

Each sub-plan ends with `npm run validate` + `npm run update-indices`.

---

## Decisions locked

- **Clean break** at v0.2.0 (rename dirs outright; README rename table). Repo is early; small blast radius.
- **Sub-agents via the Agent tool**, not shipped agent files. Zero installer change.
- **Pragmatic by default:** mandatory/optional split + standalone skills keep this from becoming
  13-skill ceremony. The full chain is opt-in for high-blast-radius work.
