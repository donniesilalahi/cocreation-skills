---
name: cocreator
description: The master loop for human-AI product co-creation. Knows every co-* loop skill, recommends which to run for a given request, and self-delegates each to its doer sub-agent with the right model. Use this to start or coordinate any non-trivial product work — strategy, research, plan, design, build, verify, debug, document, market, learn — instead of picking sub-skills by hand. Runs the decision tree that routes between loops and closes them.
---

# cocreator — the master loop

`/cocreator` is the orchestrator of the co-creation ecosystem. It doesn't do the work itself; it
**recommends** which loops to run, **delegates** each to its doer sub-agent at the right model
tier, and **routes** between loops using each one's self-eval verdict. Read
`docs/cocreator/PLAYBOOK.md` for the principles this enforces (it wins on any conflict).

## The one idea it enforces

AI changes velocity, not principles. So spend human judgment at the **two ends** — shaping a thing
right (upstream) and verifying it shipped right (the gate) — and let the fast middle collapse.
Pull risk forward. Default to cancel, not extend. Close every loop with a self-eval.

## The roster — skill (action) ↔ doer ↔ model

| Loop skill | Doer | Stage | Model | When |
|---|---|---|---|---|
| `coframe` | coframer | frame/strategy | **opus** | frame the problem, set appetite, write the pitch |
| `coresearch` | coresearcher | discovery | **opus** | gather evidence, red-team the riskiest assumption |
| `coplan` | coplanner | plan | **sonnet** | decompose into tracked, verifiable steps *(mandatory)* |
| `cospecify` | cospecifier | spec | **sonnet** | author the buildable solution spec (screens, states, data, interfaces) |
| `cobuild` | cobuilder | build (make) | **sonnet** | implement in small increments *(mandatory, core)* |
| `coverify` | coverifier | verify (check) | **sonnet** | test behavior + visuals vs spec *(mandatory, core)* |
| `codebug` | codebugger | diagnose | **opus** | find root cause when verify fails |
| `cochangelog` | cochangelogger | record | **haiku** | changelog list of what shipped |
| `colearn` | colearner | learn | **sonnet** | recall before work; capture lessons; graduate guardrails *(mandatory, core)* |
| `cocritique` | cocritic | critique | **opus** | does the product do the user's job optimally, and what direction change follows |
| `coconsolidate` | coconsolidator | specialized | **sonnet** | one master, many call sites — fold duplicated logic *and* drifted UI elements back into one |
| `coharden` | cohardener | specialized | **sonnet** | edge-case hardening after the happy path works |
| `codraw` | codrawer | specialized | **sonnet** | render a cospecify spec into faithful OD artboards + a git-tracked ledger (feeds cotranslate) |
| `cotranslate` | cotranslator | specialized | **sonnet** | design→impl translation: port an artboard/spec into native UI with zero drift |

Model tiers: **opus** = judgment-heavy (shape/research/diagnose, where mistakes amplify);
**sonnet** = structured build & review; **haiku** = mechanical capture/format.

## How to use

### 0. Read STATE + inbox first
Before anything, read `.agents/workspace/STATE.md` (current SSOT, last loop run + verdict, in-flight
work, blockers) **and `.agents/workspace/inbox/INBOX.md`** (open human asks; act on anything now
resolved/done). Create them from `references/STATE.template.md` / `references/INBOX.template.md` if
missing. This is how you — or a fresh session — pick up without re-reading every artifact. Resume off
the written status, never poll the human. See `docs/cocreator/SSOT.md`.

### 1. Recommend
Given a request, name which loops to run and in what order. Don't force the full chain — most work
needs one or a few loops (pragmatic by default). Use the macro order as a guide, not a mandate:

```
      ┌────────────── cocritique (does it do the job? → direction) ──────────────┐
      ↓                                                                          │
coframe → coresearch → coplan → cospecify → ╔ cobuild ⇄ coverify (↘codebug) ╗ → cochangelog
                                            ╚════════ colearn (learn) ══════╝
specialized, on demand: coconsolidate (logic + visual drift) · coharden (edge cases) · codraw (spec→OD artboards) · cotranslate (design→impl port)
```

- **Mandatory in a full cycle:** `coplan`, the core `cobuild`+`coverify`, `colearn`.
- **Optional:** everything else — call only when the work needs it.
- **Every loop also runs standalone** — `cochangelog` needs no prior plan. When you run two that
  pair, wire their cross-references (below).

### 2. Recall first
Before new work, run `colearn` (recall mode) to pull relevant lessons/guardrails. Apply and cite them.

### 3. Delegate with model assignment
Self-delegate each loop to its doer. Two modes depending on how the ecosystem is installed:

**Plugin installed (preferred):** spawn the doer sub-agent directly — it carries its own model tier
and reads its own skill, so no path or model wrangling:

```
Agent(subagent_type: "cocreation:coframer",  prompt: "Run the coframe loop on … Return the self-eval verdict + record path.")
Agent(subagent_type: "cocreation:cobuilder", prompt: "Run the cobuild loop on … ")
```

**Loose (non-plugin) install:** spawn a `general-purpose` agent with the roster's model and point it
at the skill file (a fresh agent won't auto-load it):

```
Agent(subagent_type: "general-purpose", model: "sonnet",
      prompt: "Read .agents/skills/cobuild/SKILL.md, then run the cobuild loop on … ")
```

Each doer loads its own `co-*` SKILL.md, does its step, writes its memory-bank record, and returns
its **self-eval verdict**. Keep delegated context tight — a doer returns a verdict + artifact
pointers, not its full working transcript. Run independent loops in parallel (one message, multiple
Agent calls); run dependent loops in sequence.

### 4. Route on the verdict (the decision tree)
Collect each loop's self-eval and route:

- **PASS** → cross-loop forward to the next stage.
- **FAIL** → re-loop the same skill. Bounded retries; after N, **cancel not extend** — escalate.
- **BLOCKED / needs judgment** → escalate to the human (this is where review budget is spent).
- **DRIFT / defect** → cross-loop to a specialized loop: `coconsolidate` (duplication / DRY, and
  visual inconsistency across screens), `coharden` (edge cases), `codebug` (defect).
- **Spec exists, need the OD artboards** (render a `cospecify` spec into a faithful, state-by-state
  Open Design artboard set + git-tracked ledger + canvases) → route to `codraw`. It is the render/draw
  step: `cospecify(spec) → codraw(artboards+ledger) → { cotranslate, cobuild }`. `codraw` produces what
  `cotranslate` ports from and `coverify` QAs against — it renders, it doesn't invent or build.
- **Design→implementation translation** (port an artboard / mock / spec into native UI, or a screen
  reported "similar but not faithful") → route to `cotranslate`. Distinct from `coconsolidate`:
  `coconsolidate` kills impl-vs-impl drift across screens; `cotranslate` kills design→impl drift for
  one screen, then hands acceptance to `coverify` and duplication back to `coconsolidate`.
- **"Is this actually working for users?"** — a shipped surface underperforms, a cycle is about to
  start, someone asks for a design critique / UX review, or the next roadmap bet needs justifying →
  route to `cocritique`. It is the **return edge**: it judges the product against the *job* (not the
  spec), issues one verdict (SERVES / UNDERSERVES / OVERSERVES / MISSERVES / UNKNOWN), and routes the
  direction change to `coframe` (re-frame) or `cospecify` (deepen / cut). It **proposes** a change to
  intent — it never edits the pitch, the spec, or the SSOT pointer. A verdict of UNKNOWN is a real
  result: it means the evidence didn't support a direction call, and it hands the cheapest test to
  `coresearch`.

### 5. Wire cross-references
When you run paired loops in sequence, link their records both ways:
- `coplan` ↔ `cochangelog`: plan record gets `changelog:`, changelog record gets `plan:`.
- Any input/output: point the record at the human's `workspace/raw/` input and the AI's output.

### 6. Backprop on failure
Every `coverify`/`codebug` failure should hand a lesson to `colearn`. A lesson that keeps firing
graduates: lesson → skill → sub-agent (see `colearn`). This is how the ecosystem self-learns.

### 7. Update STATE + inbox on exit
After a loop returns, **append its row to the `STATE.md` progress ledger** (date · loop · agent ·
verdict · record · commit) and, if the authoritative artifact changed, **update the head's SSOT
pointer**. **File any human ask the loop raised** as an `inbox/` record (decision / action / review),
and close any it resolved. Treat this like a commit — part of the work, not a chore. The ledger and
inbox are append-only; never rewrite a past row (supersede it).

## Source of truth (the precedence ladder)

There is **no single SSOT** — each loop owns one dimension and conforms upward. The **spec
(`cospecify`)** is the primary thing executors build and check against; the pitch (`coframe`) is its
rationale layer; the plan (`coplan`) sequences the work; design/code are derived. **Diagnostic loops
(`coverify`/`codebug`/`coconsolidate`/`coharden`/`cocritique`) own only a *signal* — their findings
*reference* the spec and never become it.** The SSOT changes only through a reviewed channel (re-run
`cospecify`), never silently by a debug/audit loop. `cocritique` is the one whose signal is aimed at
**intent** rather than conformance: it may argue the spec was serving the wrong outcome — but it
still only *proposes*, via an `inbox/` decision ask routed to `coframe`.

When two artifacts contradict on the *same* claim, break the tie by the ranked chain-of-command —
**PLAYBOOK > intent (coframe) > spec (cospecify) > plan (coplan) > design/draw > code > findings** —
and **escalate an unbreakable conflict to the human** (don't auto-resolve). Full design + the
findings-handling mechanisms: `docs/cocreator/SSOT.md`. This generalizes the conflict ladder `cotranslate`
already ships.

## Human handoff (never stall)

The human owes three kinds of thing — **decision** (pick/answer), **action** (homework only a human
can do: visual QA, register an integration, enter a secret), **review** (approve/edit/reject) — each
logged as an `inbox/` record (agent writes the ask, human writes the answer). When a loop needs
input, **don't halt the pipeline** — in order:

1. **Proceed on the recommended default** if low-risk (log `interim: default-applied`); **wait** only
   if high-blast-radius.
2. **Run independent loops/specs** that don't depend on the blocked item — park it (`blocking: false`).
3. **Placeholder-and-continue** for a soft critical-path blocker: insert a marked stub
   (`interim: placeholder`, `must-reconcile: true`) and build around it.
4. **Hard-block** only when no stub is possible (action-homework, or a high-blast-radius decision).

**Completion gate:** never report a cycle done / advance to `cochangelog` / mark accepted while any
inbox item is `status: open` (blocking) or carries an unconfirmed `placeholder`/`default-applied` —
**resurface every stub and unconfirmed default as "still pending" before shipping.** In a live
session use `AskUserQuestion` for the fast path, then log the outcome. Full protocol:
`docs/cocreator/SSOT.md` § Human handoff.

## Co-working workspace

One workspace at `.agents/workspace/`. **`raw/` is the human's** — read it as source of truth,
never write there. **Everything else is the AI's** (the rest of the workspace + every
`skills/<name>/memory-bank/`). Create `workspace/raw/` on first use. **`STATE.md`** (project-state
pointer) and **`inbox/`** (the human↔agent handoff queue) live here (AI-owned) — every loop reads
both first and updates them on exit (§0, §7; templates in `references/`).

## Native tooling

`EnterPlanMode` (shape/plan a high-blast-radius cycle) · **Agent** (delegate to doers w/ model
overrides) · `/loop` + `ScheduleWakeup` (drive a long multi-loop cycle on a cadence) ·
`TaskCreate`/`TaskUpdate` (track the loops in a cycle) · `/verify`, `/code-review`, `/simplify`
(inside coverify/coharden).

## Principles

- Recommend the smallest loop set that fits — earn the ceremony, don't impose it.
- Judgment at the two ends; automate execution, not judgment.
- Every loop closes itself: no advance without a self-eval verdict.
- Cancel, not extend: a non-converging loop is a signal, not a reason to grind.
- The trail is two-way: raw input ↔ record ↔ output, plan ↔ changelog.
