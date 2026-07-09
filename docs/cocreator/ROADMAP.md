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
        ┌──────────────────── colearn (lessons feed back upstream) ───────────────────┐
        │                                                                              │
   coshape ──▶ coresearch ──▶ coplan ──▶ codesign ──▶ ╔═══ CORE LOOP ═══╗ ──▶ cochangelog ──▶ comarket
   (strategy)  (discovery)   (plan)     (design)      ║ cobuild ⇄ coverify║      (record)      (GTM)
                                                      ║      ⇅ codebug    ║
                                                      ╚═══════════════════╝
   Specialized loops, called on demand from any stage: coaudit (visual consistency) · coconsolidate (code DRY) · coharden (edge cases)
```

**Core loop = make → check → learn.** Not "write code" (build collapses); the engine is
cobuild → coverify, with codebug on failure, and every failure writing a lesson via colearn
(the backprop reflex). A recurring bug-class graduates into a guardrail.

**Decision tree — every loop ends with a self-eval gate:**
- **PASS** → cross-loop forward.
- **FAIL** → re-loop, bounded retries, then *cancel not extend* (escalate).
- **BLOCKED / needs judgment** → escalate to human (where review budget is spent).
- **DRIFT** → cross-loop to a specialized loop (coaudit / coharden / codebug).

**Independence + cross-reference:** every loop runs standalone (cochangelog needs no prior plan).
When paired, they cross-reference — the plan records a `changelog:` ref, the changelog records a
`plan:` ref. `/cocreator` wires these when running loops in sequence.

---

## The roster — skill (action) ↔ agent (doer)

Convention: **skill = action word**, **agent = the doer**, so the link is obvious.

| Skill | Doer agent | Replaces | Stage / role | Model | Mand/Opt |
|---|---|---|---|---|---|
| `/cocreator` | — (orchestrator) | NEW | Master loop + dispatcher | inherits | — |
| `coshape` | `coshaper` | NEW | Strategy & shaping: frame, appetite, pitch | Opus | Optional |
| `coresearch` | `coresearcher` | NEW | Discovery & evidence; red-team assumptions | Opus | Optional |
| `coplan` | `coplanner` | `planning-todos` | Decompose into tracked, verifiable steps | Sonnet | **Mandatory** |
| `codesign` | `codesigner` | NEW | Design the solution (UI/UX) | Sonnet | Optional |
| `cobuild` | `cobuilder` | NEW | Build/implement (core, "make") | Sonnet | **Mandatory** |
| `coverify` | `coverifier` | `design-qa` | Test & QA: behavior + visual vs spec (core, "check") | Sonnet | **Mandatory** |
| `codebug` | `codebugger` | `analyzing-problems` | Diagnose root cause on failure | Opus | Optional |
| `cochangelog` | `cochangelogger` | `documenting-implementations` | Record what shipped (changelog list) | Haiku | Optional |
| `comarket` | `comarketer` | `marketing-capture` | Marketing assets / GTM capture | Haiku | Optional |
| `colearn` | `colearner` | `documenting-lesson-learned` + `accessing-lessons-learned` (merged) | Capture + recall lessons; guardrails; graduation | Sonnet | **Mandatory** |
| `coaudit` | `coauditor` | `consistency-audit` | Specialized loop: visual consistency drift | Haiku | Optional |
| `coconsolidate` | `coconsolidator` | NEW | Specialized loop: code/logic DRY consolidation | Sonnet | Optional |
| `coharden` | `cohardener` | NEW | Specialized loop: edge-case hardening | Sonnet | Optional |

14 skills (1 master + 13 loops). Model tiers: **Opus** = judgment-heavy (shape/research/diagnose);
**Sonnet** = structured build & review; **Haiku** = mechanical capture/format.

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
  raw/   ← human-owned. AI reads as source of truth, never writes. Briefs, refs, source data.
  ...    ← AI-owned working area / output (everything else in the workspace).
.agents/skills/<co-*>/memory-bank/   ← AI-owned loop log: records + auto-index.
```

Only `raw/` is yours; the rest is the AI's. Loop records link the `raw/` input they worked from and
the output they produced. The AI creates `workspace/raw/` on first use — nothing to scaffold in this
source repo (the installer copies only `skills/`).

All 12 record-keeping loops follow the same convention: timestamped `YYYY-MM-DD-*.md` records +
an UPPERCASE auto-index regenerated by `index.mjs` (coaudit included, with its richer audit fields).

---

## Native tooling each skill leans on

`/loop` (recurring/self-paced passes) · `TaskCreate`/`TaskUpdate` (track todos) ·
`EnterPlanMode` (shape/plan) · **Agent** (delegation) · `/verify` (coverify) ·
`/code-review` + `/simplify` (coverify/coharden) · `ScheduleWakeup`/`/schedule`.
(`/goal` is not available in this harness — "set goal" maps to `EnterPlanMode` + `coshape`.)

---

## Build sequence (sub-plans)

- **A — Foundation & playbook.** `docs/cocreator/{PLAYBOOK,ROADMAP,RESEARCH}.md`; README + CLAUDE.md framing.
- **B — Rename + memory convention.** Rename 8 dirs to `co-*`; merge lesson skills into `colearn`;
  `YYYY-MM-DD-title.md` records; `tier`/cross-ref frontmatter; `index.mjs` columns; `marketplace.json`;
  validator; `cli.js`; bump `package.json` → 0.2.0.
- **C — `/cocreator` master.** Roster, recommendation, Agent-tool delegation + model routing,
  decision-tree orchestration, cross-ref wiring.
- **D — Gap-closer skills.** `coshape`, `coresearch`, `codesign`, `cobuild`, `coharden`.
- **E — Lesson graduation + backprop.** Failures → `colearn` records; `tier` promotion; recall-before-work.

Each sub-plan ends with `npm run validate` + `npm run update-indices`.

---

## Decisions locked

- **Clean break** at v0.2.0 (rename dirs outright; README rename table). Repo is early; small blast radius.
- **Sub-agents via the Agent tool**, not shipped agent files. Zero installer change.
- **Pragmatic by default:** mandatory/optional split + standalone skills keep this from becoming
  13-skill ceremony. The full chain is opt-in for high-blast-radius work.
