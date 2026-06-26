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
| `coshape` | coshaper | shape/strategy | **opus** | frame the problem, set appetite, write the pitch |
| `coresearch` | coresearcher | discovery | **opus** | gather evidence, red-team the riskiest assumption |
| `coplan` | coplanner | plan | **sonnet** | decompose into tracked, verifiable steps *(mandatory)* |
| `codesign` | codesigner | design | **sonnet** | design UI/UX + the spec to build |
| `cobuild` | cobuilder | build (make) | **sonnet** | implement in small increments *(mandatory, core)* |
| `coverify` | coverifier | verify (check) | **sonnet** | test behavior + visuals vs spec *(mandatory, core)* |
| `codebug` | codebugger | diagnose | **opus** | find root cause when verify fails |
| `cochangelog` | cochangelogger | record | **haiku** | changelog list of what shipped |
| `comarket` | comarketer | market/GTM | **haiku** | marketing assets / screenshot capture |
| `colearn` | colearner | learn | **sonnet** | recall before work; capture lessons; graduate guardrails *(mandatory, core)* |
| `coaudit` | coauditor | specialized | **haiku** | consistency drift across screens |
| `coharden` | cohardener | specialized | **sonnet** | edge-case hardening after the happy path works |

Model tiers: **opus** = judgment-heavy (shape/research/diagnose, where mistakes amplify);
**sonnet** = structured build & review; **haiku** = mechanical capture/format.

## How to use

### 1. Recommend
Given a request, name which loops to run and in what order. Don't force the full chain — most work
needs one or a few loops (pragmatic by default). Use the macro order as a guide, not a mandate:

```
coshape → coresearch → coplan → codesign → ╔ cobuild ⇄ coverify (↘codebug) ╗ → cochangelog → comarket
                                            ╚════════ colearn (learn) ══════╝
specialized, on demand: coaudit (drift) · coharden (edge cases)
```

- **Mandatory in a full cycle:** `coplan`, the core `cobuild`+`coverify`, `colearn`.
- **Optional:** everything else — call only when the work needs it.
- **Every loop also runs standalone** — `cochangelog` needs no prior plan. When you run two that
  pair, wire their cross-references (below).

### 2. Recall first
Before new work, run `colearn` (recall mode) to pull relevant lessons/guardrails. Apply and cite them.

### 3. Delegate with model assignment
Self-delegate each loop to its doer via the **Agent tool**, passing the model override from the
roster. Sketch:

Each doer's prompt must tell it to **read its skill file first** (a fresh `general-purpose` agent
won't auto-load it), then run the loop and return its verdict:

```
Agent(subagent_type: "general-purpose", model: "opus",
      prompt: "Read .agents/skills/coshape/SKILL.md, then run the coshape loop on … Return the self-eval verdict + record path.")
Agent(subagent_type: "general-purpose", model: "sonnet",
      prompt: "Read .agents/skills/coplan/SKILL.md, then run the coplan loop on … ")
Agent(subagent_type: "general-purpose", model: "haiku",
      prompt: "Read .agents/skills/cochangelog/SKILL.md, then run the cochangelog loop on … ")
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
- **DRIFT / defect** → cross-loop to a specialized loop: `coaudit` (inconsistency),
  `coharden` (edge cases), `codebug` (defect).

### 5. Wire cross-references
When you run paired loops in sequence, link their records both ways:
- `coplan` ↔ `cochangelog`: plan record gets `changelog:`, changelog record gets `plan:`.
- Any input/output: point the record at the human's `workspace/raw/` input and the AI's output.

### 6. Backprop on failure
Every `coverify`/`codebug` failure should hand a lesson to `colearn`. A lesson that keeps firing
graduates: lesson → skill → sub-agent (see `colearn`). This is how the ecosystem self-learns.

## Co-working workspace

One workspace at `.agents/workspace/`. **`raw/` is the human's** — read it as source of truth,
never write there. **Everything else is the AI's** (the rest of the workspace + every
`skills/<name>/memory-bank/`). Create `workspace/raw/` on first use.

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
