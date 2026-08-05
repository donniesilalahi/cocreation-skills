---
name: cocreator
description: The master loop for human-AI product co-creation. Picks a named WORKFLOW — discover · ship · feature · design-first · fix · evaluate · release-prep · cleanup — and runs its pre-wired chain of co-* loops, self-delegating each to its doer sub-agent at the right model tier. Use this to start or coordinate any non-trivial product work (strategy, research, plan, design, build, verify, debug, document, learn) instead of picking sub-skills by hand; `/cocreator <workflow> "<request>"` enters one directly. Runs the decision tree that routes between loops, and advances the chain unattended on PASS — halting only on the exit gate, a hard block, exhausted retries, or a direction change. Carries `Workflow:` / `Next:` in STATE.md so a fresh session resumes a long-running chain instead of asking what to do next.
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
| `costudy` | costudier | discovery | **sonnet** | reverse-engineer another product's UI/UX from your live session into a study ledger |
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

**The head names the active workflow and the next step** (`Workflow:` / `Next:`). If one is in
flight, you are resuming it — **do not re-select a workflow and do not ask what to do next**; run
`Next:` and carry on (§8).

### 1. Pick the workflow
Don't assemble a loop chain from scratch each time. **Name the workflow** — a pre-wired chain for a
recurring situation — then run it. Full catalog with entry conditions, skips, and exit gates:
**`references/workflows.md`**.

```
      ┌────────────── cocritique (does it do the job? → direction) ──────────────┐
      ↓                                                                          │
coframe → coresearch → coplan → cospecify → ╔ cobuild ⇄ coverify (↘codebug) ╗ → cochangelog
          + costudy                         ╚════════ colearn (learn) ══════╝
specialized, on demand: coconsolidate (logic + visual drift) · coharden (edge cases) · codraw (spec→OD artboards) · cotranslate (design→impl port)
```

| Workflow | Enter when | Chain | Exit gate |
|---|---|---|---|
| **discover** | direction unclear, nothing to build yet | `colearn`(recall) → `coframe` → `coresearch`, optionally alongside `costudy` (competitor UI evidence) | pitch + appetite; assumptions tested or accepted. *"Don't build it" is a valid exit.* |
| **ship** | small, well-understood change *(the default)* | `colearn`(recall) → `cobuild` ⇄ `coverify` → `cochangelog` | verify PASS + changelog line + no open stub |
| **feature** | new capability, uncertain or high blast radius | `colearn` → `coframe` → `coresearch` → `coplan` → `cospecify` → [`codraw`] → `cobuild` ⇄ `coverify` → `coharden` → `cochangelog` → `colearn` | plan closed, verify PASS vs spec, lesson recorded |
| **design-first** | the UI itself is the deliverable | [`costudy`] → `cospecify` → `codraw` → `cotranslate` → `coverify` → `cochangelog` | every element + state from shared masters; coverify accepts vs artboard |
| **fix** | something is broken | `colearn`(recall) → `codebug` → `cobuild` → `coverify` → `colearn`(capture) | root cause named, fix verified, **lesson written** |
| **evaluate** | "is this any good?" — *a router, see below* | `coverify` \| `coconsolidate` \| `cocritique` | verdict + evidence + the next workflow named |
| **release-prep** | about to face users | `coharden` → `coverify` → [`coconsolidate`] → `cochangelog` → completion gate | edge cases closed **and the completion gate is clean** |
| **cleanup** | duplication/drift; behavior must not change | `coconsolidate` → `coverify` | one master per cluster, behavior provably unchanged |

**`evaluate` is a router, not a chain** — pick by what "good" is measured *against*. This is the
distinction most often got wrong; running the wrong one answers a question nobody asked:

| Reference point | Question | Loop | Then |
|---|---|---|---|
| the **spec** | did we build what we said? | `coverify` | → fix / ship |
| **itself**, across screens | do the N copies agree? | `coconsolidate` | → cleanup |
| the **job** | was it worth building? | `cocritique` | → discover (MISSERVES/UNKNOWN) · feature (UNDERSERVES) · cleanup (OVERSERVES) |

**Rules that outrank any workflow:**
- **`coverify` is never skipped on anything that changes behavior.** Build collapsed; review is the
  constraint. Dropping the check optimizes the part that was never the bottleneck.
- **A failure always writes a lesson** (`colearn` capture) — mandatory in `fix`, and after any FAIL.
- **Escalate the workflow, don't bolt loops onto it.** Wanting a spec inside `ship` means the work is
  `feature`-sized. Re-enter at the right workflow.
- **Every loop still runs standalone** — `cochangelog` needs no prior plan. The workflow is the
  default path, not a rail; the decision tree (§4) still governs routing *inside* it.

`/cocreator <workflow> "<request>"` enters one directly (`/cocreator fix "checkout 500s on retry"`).
With no workflow named, pick one from the table, **say which and why in one line**, then run it.

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
Collect each loop's self-eval and route. This governs movement *inside* a workflow — the chain in §1
is the default path; the verdict is what actually decides the next step.

- **PASS** → advance to the workflow's next loop. At the end of the chain, check the **exit gate**
  (§1) — a chain that ran isn't a workflow that closed.
- **FAIL** → re-loop the same skill. Bounded retries; after N, **cancel not extend** — escalate.
- **BLOCKED / needs judgment** → the handoff protocol, not a halt (§Human handoff). Escalate only
  what genuinely can't be defaulted or stubbed.
- **DRIFT / defect** → leave the chain for the workflow that owns it: `fix` (defect), `cleanup`
  (duplication or visual drift), or `coharden` inline (edge cases). Come back to where you left.
- **A different question surfaced** → that's a workflow switch, not a detour. Name it, log it, run
  it. The three that most often surface mid-chain: needing artboards → `design-first`; a screen
  "similar but not faithful" → `design-first` from `cotranslate`; "was this worth building at
  all?" → `evaluate`/`cocritique`.

Loop-level detail (what each loop hands to which sibling, and why) lives in each SKILL.md's
*Relationship to other skills* and its self-eval gate — not restated here.

### 5. Wire cross-references
When you run paired loops in sequence, link their records both ways:
- `coplan` ↔ `cochangelog`: plan record gets `changelog:`, changelog record gets `plan:`.
- Any input/output: point the record at the human's `workspace/raw/` input and the AI's output.

### 6. Backprop on failure
Every `coverify`/`codebug` failure should hand a lesson to `colearn`. A lesson that keeps firing
graduates: lesson → skill → sub-agent (see `colearn`). This is how the ecosystem self-learns.

### 7. Update STATE + inbox on exit
After a loop returns, **append its row to the `STATE.md` progress ledger** (date · **workflow** ·
loop · agent · verdict · record · commit) and rewrite the head's **`Workflow:` / `Next:`** line so the
chain is resumable. If the authoritative artifact changed, **update the head's SSOT pointer**. **File
any human ask the loop raised** as an `inbox/` record (decision / action / review), and close any it
resolved. Treat this like a commit — part of the work, not a chore. The ledger and inbox are
append-only; never rewrite a past row (supersede it).

**`Next:` is the whole self-driving mechanism.** A ledger row with no updated `Next:` is where an
unattended run dies — the following session finds a finished loop, no idea what follows, and asks
the human. Write it even when the answer is "workflow closed".

### 8. Run it unattended (the long run)
A workflow is designed to advance without a human between steps. Three mechanisms, already in the
ecosystem — this section just wires them to the chain:

**Auto-advance.** On a PASS, run the next loop immediately. Do not report progress and wait for
"continue" — the chain in §1 already *is* the approval for the whole sequence, granted when the
workflow was named. Ask again only for what §Human handoff says must be asked.

**Stop conditions — the circuit breaker.** Auto-advance halts on exactly these, and no others:
1. The workflow's **exit gate** is met (it closed — say so and stop).
2. A **hard-block**: action-homework only a human can do, or a high-blast-radius decision (§Human
   handoff step 4).
3. **Bounded retries exhausted** on a FAIL — cancel, don't extend. Report the state, don't grind.
4. A **direction change** — `cocritique` returning MISSERVES, or any verdict that re-opens intent.
   Re-framing is never banked unattended; that is the one call always worth the review budget.

Everything else keeps moving: proceed on a low-risk default, run independent loops, or
placeholder-and-continue (§Human handoff steps 1–3), then let the **completion gate** resurface every
stub before anything ships.

**Cadence for work that outlives a session.** Use `/loop` or `ScheduleWakeup` to re-enter, and
`TaskCreate`/`TaskUpdate` to track the chain's steps as todos. On each wake: read `STATE.md`, run
`Next:`, update the head. Never poll the human for status and never `sleep` waiting on a person —
park the ask in `inbox/` and do something independent instead.

**Resume protocol (a fresh session, mid-workflow).**
1. Read `STATE.md` head → `Workflow:` + `Next:` + blockers, and `inbox/INBOX.md` for anything now
   answered.
2. If the head is `[State: stale]`, distrust it: reconcile against the last few ledger rows and the
   loops' memory-bank records before advancing.
3. Run `Next:`. Re-select a workflow **only** if the head says the last one closed, or the human's
   request is plainly about something else.

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
