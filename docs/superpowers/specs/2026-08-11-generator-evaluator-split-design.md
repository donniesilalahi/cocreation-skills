# Generator/evaluator split — codirect · cotest · cochallenge

Date: 2026-08-11 · Status: approved by owner (this doc records the approved design)

## Why

Loop-engineering best practice: the evaluator must not be the agent that generated the work.
The ecosystem already half-follows this (doer sub-agents per loop, cocritique as outside-in
judge), but the stage map shows holes — no evaluator exists for upstream decision artifacts:

| Stage | Generator | Evaluator (before) | Reference point |
|---|---|---|---|
| Direction (upstream) | coframe | **none** | first principles, problem-solution fit |
| Spec | cospecify | **none** | direction |
| Plan | coplan | **none** | spec + appetite |
| Build | cobuild | coverify | spec |
| Design render | codraw | coverify (visual) | spec/artboard |
| Shipped product | — | cocritique | the JOB |

Upstream mistakes are the most expensive; that is where an adversarial evaluator pays most.

## Decisions

### 1. coframe → codirect

- Skill `codirect`, doer `codirector`, index `DIRECTION.md` (was `FRAME.md`).
- Root: Shape Up "shaping" / "Director of Product". Owns **direction-level decisions only**:
  - Product direction: problem framing, appetite, pitch (inherited from coframe unchanged).
  - Design direction: design principles, mood, references, brand positioning — the *direction*
    of the design, not its execution.
- Execution detail (tokens, screens, states, data shapes) stays in cospecify / codraw /
  design-manifest. codirect does not own the design-system SSOT.
- Model: Opus. Optional loop, same position in the architecture as coframe today.

### 2. coverify → cotest

- Skill `cotest`, doer `cotester`, index `TEST.md` (was `QA.md`).
- Pure rename — behavior unchanged: systematic QA of built output **against the spec/artboard**
  (two passes: code vs checklist, visual vs artboard). Scope is explicitly limited to
  cross-checking against spec; anything beyond spec conformance belongs to cochallenge or
  cocritique.
- Model: **Haiku** (was Sonnet) — checklist cross-checking is mechanical. The
  "verification traps" guardrails (false-PASS hunting, content assertions, reset-not-idempotent
  harness) stay in the skill. If Haiku proves false-PASS-prone in practice, bumping back to
  Sonnet is a one-line roster change.
- Still **Mandatory** (core "check" leg).

### 3. New loop: cochallenge

- Skill `cochallenge`, doer `cochallenger`, index `CHALLENGE.md`. Model: Opus. Optional.
- **Object: decision artifacts pre-build** — the direction pitch, the spec, the plan. Not the
  shipped product (cocritique), not new-evidence gathering (coresearch).
- **Method: devil's advocate.** Attack the artifact from outside its own frame: first
  principles, problem-solution fit, blindspot hunting, stress-testing assumptions, "what would
  make this wrong", cheapest falsification. When an attack needs new data, route the question
  to coresearch — cochallenge does not research.
- **Verdict (exactly one):**
  - `HOLDS` — artifact survives; proceed.
  - `HOLED` — specific holes found; back to the generator loop with the hole list.
  - `COLLAPSES` — a load-bearing premise fails; route to codirect (re-direct).
  - `UNKNOWN` — the challenge hinges on missing evidence; route to coresearch with the
    cheapest test.
- **Separation rules:** the cochallenger must not be the agent that generated the artifact;
  it runs with fresh context and reads only the artifact + `raw/` inputs, never the
  generator's reasoning. Per SSOT, its findings are a signal — they never become truth and it
  never edits the artifact.

### 4. Evaluator triad (distinct-by-object)

| Evaluator | Object | Question |
|---|---|---|
| cochallenge | decision artifact, pre-build | Does the reasoning survive attack? |
| cotest | built output | Does it match the spec? |
| cocritique | shipped product | Does it do the job? |

coresearch stays the evidence loop (tests assumptions with new data). cocritique and
coresearch are unchanged.

### 5. Workflow wiring

- Upstream-heavy chains — **discover, feature, design-first** — get cochallenge wired in
  after codirect and after cospecify. fix/cleanup/ship do not pay the challenge overhead.
- The **evaluate** router grows a 4th reference point: cotest (vs spec) · coconsolidate
  (vs itself) · cocritique (vs job) · **cochallenge (vs reasoning)**.

### 6. Migration mechanics (precedent: v0.11 coport→cotranslate)

- `git mv skills/coframe skills/codirect`, `git mv skills/coverify skills/cotest`; new
  `skills/cochallenge/` from template (SKILL.md, memory-bank/_template.md, index.mjs,
  CHALLENGE.md).
- Rename memory-bank indices: `FRAME.md` → `DIRECTION.md`, `QA.md` → `TEST.md`; update each
  `index.mjs` and `_template.md`.
- `cli.js` RENAMES gains `coframe→codirect`, `coverify→cotest` (migration hint only — the
  installer never deletes).
- Update: `.claude-plugin/marketplace.json`, generated plugin manifests/agent roster
  (coframer→codirector, coverifier→cotester, +cochallenger with model tiers), cocreator
  SKILL.md + `references/workflows.md`, `docs/cocreator/ROADMAP.md` (diagram, roster,
  renames log), every cross-reference in docs/ and skills/ (grep coframe|coframer|coverify|
  coverifier).
- `npm run validate` + `npm run update-indices`; bump `package.json` → 0.14.0.
- Branch + PR (substantive change).

## Out of scope

- No behavior change to cotest beyond the rename + model tier.
- cocritique, coresearch, and all other loops unchanged except cross-reference text.
- No changes to consumer projects' installed skills (the installer's RENAMES hint covers them).
