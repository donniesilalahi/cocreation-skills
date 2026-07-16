# Source of truth — the SSOT model for the loop ecosystem

Durable design doc. Companion to `PLAYBOOK.md` (principles) and `ROADMAP.md` (architecture). This
is the design of record for **which artifact is authoritative when many loops each produce output**,
and how a fresh session or a downstream doer always knows the current source of truth and where the
work stands. Grounded in a survey of spec-driven / agentic systems (GitHub Spec Kit, OpenSpec, AWS
Kiro, BMAD, Cline/Roo memory banks, the OpenAI Model Spec) and file-based decision records
(ADR/PEP/RFC).

## The problem

Many loops emit artifacts — `coframe` a pitch, `coresearch` evidence, `coplan` a task list,
`cospecify` a spec, `codraw` an artboard set + ledger, `cobuild` code, `coverify` a QA report. Two
failures follow:

1. **Ambiguity:** a downstream doer (`cobuild`, `coport`) doesn't know *which* artifact it must
   build and check against. Is the truth the pitch? the plan? the spec?
2. **Blur under specialized loops:** jumping into `codebug` / `coverify` / `coaudit` / `coharden`
   seems to move the source of truth to their local output (a bug repro, a QA checklist), when it
   must not.

## The law: no single SSOT — ownership by dimension, one ranked chain-of-command as tie-breaker

Every system that scaled past a single spec file uses **per-dimension ownership**, not one flat
winner (Spec Kit ranks Constitution → Spec → Plan → Tasks → Code; Cline runs brief → context →
active → progress; BMAD gives each story *section* an owner). So:

**1. Each loop is authoritative only over its own dimension, and conforms upward.**

| Dimension (the question) | Owner = SSOT for it | Conforms to |
|---|---|---|
| WHY / intent / appetite | `coframe` (the pitch) | the PLAYBOOK (constitution) |
| **WHAT + acceptance criteria** | **`cospecify` (the spec)** | intent |
| the WORK & its order | `coplan` (tracked steps) | the spec |
| rendered design | `codraw` (artboards + ledger) | the spec |
| shipped implementation | `cobuild` (code + `cochangelog`) | the spec |
| conformance signal | `coverify` / `coaudit` / `codebug` / `coharden` (**findings**) | never owns truth (§below) |

The **spec (`cospecify`)** is the primary SSOT downstream executors build and check against. The
pitch is its *rationale layer* (it governs, but once the spec exists the spec is what you build; the
spec traces back to the pitch). The plan sequences *building* the spec; it does not define it.

**2. A single ranked chain-of-command exists only as a tie-breaker** — invoked when two artifacts
contradict on the *same* claim, never in normal operation:

```
PLAYBOOK (constitution)  >  intent (coframe)  >  spec (cospecify)  >  plan (coplan)
                         >  design/draw (codraw)  >  code (cobuild)  >  findings (verify/audit/debug)
```

Higher authority overrides lower **on a direct conflict only**. An **unbreakable** conflict is
**escalated to the human**, not auto-resolved (the OpenAI Model Spec rule: "on unresolved conflict,
default to inaction"). The PLAYBOOK already declares itself the top authority ("if a skill and this
playbook disagree, the playbook wins") — that is the constitution at the head of the chain.

This is the generalization of the **conflict ladder `coport` already ships** (design wins visual,
copy wins strings, unresolved → STOP and ask the owner). Same shape, ecosystem-wide.

## Diagnostic loops emit findings that REFERENCE the SSOT — they never become it

`codebug` / `coverify` / `coaudit` / `coharden` produce **findings about conformance**, not a new
source of truth. A bug diagnosis is not a new spec; it is a signal that code diverged from the spec.
Three clean mechanisms — each loop states which one it uses:

- **Isolate** — write findings only into a bounded, separately-owned slot (BMAD: the QA agent may
  write *only* the "QA Results" section + a side gate file). Our memory-bank records already do this.
- **Read-only analyze** — emit a report and touch nothing (Spec Kit `/analyze`: "do not modify any
  files").
- **Absorb via reviewed merge** — a finding becomes a change proposal folded into the spec by an
  explicit step (OpenSpec never hand-edits specs — changes flow through a `changes/` dir merged at
  archive; Tessl: "update the spec first, then re-verify").

**The rule that kills the blur:** the SSOT changes only through a **reviewed channel** (re-run
`cospecify`) — never silently by a debug/verify/audit loop. This is why `coport` reports
`implemented|blocked` and hands acceptance to `coverify`; why `codebug` re-verifies against the full
spec, not the last symptom.

## The pointer: `STATE.md` — always know the current SSOT and where work stands

No surveyed system keeps a first-class "the SSOT right now is X" pointer — that is the gap this
fills. One well-known file, read first by every loop:

**Location:** `.agents/workspace/STATE.md` (AI-owned; lives beside the human-owned `raw/`).

**Two parts** (mirrors Cline's `activeContext` + `progress` split):

- **Head — the active context (overwritten each session):**
  - `Authoritative spec: <path> (cospecify, <date>)` — the one-line SSOT pointer.
  - Current focus · in-flight loop · open decisions · blockers.
  - `Last updated: <date>` + a `[State: fresh|stale]` token so a downstream doer can distrust a
    stale head.
- **Progress ledger — history (append-only, immutable):** one row per loop run —
  `timestamp · loop · agent/model · verdict · record path · commit/artifact`. Never rewrite a past
  row; supersede it.

**Ritual:** every loop **reads `STATE.md` first** (before its own artifacts) and **writes its ledger
row on exit** as part of the work, like a commit — not an afterthought. The orchestrator
(`cocreator`) owns keeping the head's SSOT pointer current. Template:
`skills/cocreator/references/STATE.template.md`.

## Status lives in a field — never in a folder or a filename

For tracking a record's status (the `3.2` question), the answer is unanimous across ADR / PEP / RFC
and file-based task tools (Backlog.md, kanban-md, Dendron, Taskwarrior): **status is a frontmatter
field; any board/per-status view is *generated* from it.**

- Records are cross-referenced by **path** (`handoffRef`, ledger `odArtifact`) and **filename**
  (`plan:` / `changelog:`), and indexed from frontmatter. Path and filename are **load-bearing
  identifiers**. Status is the most-mutable attribute.
- **Folder-per-status and status-in-filename both put a mutable value into an immutable identifier**
  → every transition becomes a rename → breaks cross-references, truncates `git log`/`blame`, churns
  the generated indexes, and creates rename-vs-rename merge conflicts. (Jekyll's `_drafts/`→`_posts/`
  move+rename is the cautionary counter-example; even it added a `published:` field to escape.)

**Standard:**
- **Status is a frontmatter `status:` field** (already the repo convention; the memory-bank indexer
  reads it). The per-status view is generated by `index.mjs`, never stored as a directory layout.
- **Canonical lifecycle enum** for the `STATE.md` ledger and cross-loop normalization:
  `todo · active · blocked · review · done · superseded`. A loop's own record may carry a
  loop-native verdict too (`implemented`, `drawn`, `pass`) — that is the *verdict*, distinct from the
  shared *lifecycle status*; both can coexist (BMAD/task-master pattern).
- **"Moved on" is a forward link, not a relocation:** add `supersedes:` / `superseded-by:`
  cross-reference fields (ADR/RFC supersede semantics). Never edit or delete a superseded record.
- **The one sanctioned physical move is coarse terminal archival:** relocating a `done`/`superseded`
  record into an `archive/` subdir, in a **rename-only commit with no content edits** (so Git's
  rename detection stays intact), only after it is no longer an active cross-reference target.
  Everything short of archival lives entirely in the `status:` field.

## Human handoff — the inbox

A cycle repeatedly needs things only the human can give. They come in **three kinds that resume
differently** (the BPMN User-Task / Manual-Task / approval split — the mature model for human work in
automated flows):

| Kind | What | Agent behavior | "Done" signal |
|---|---|---|---|
| **decision** | pick an option / answer / preference | proposes a **recommended default**; branches on the answer | filled `answer:` → `resolved` |
| **action** (homework) | a thing only a human can do — visual QA, register an integration, enter a secret, a legal/physical step | **can't verify it** — trusts the ack; hard-blocks the dependent work | `status: done` (+ artifact link) |
| **review** | approve what was built | draft-and-confirm: **approve / edit / reject-with-reason** | `approved` / `changes-requested` |

### The artifact
`.agents/workspace/inbox/` (AI-owned, beside the human-owned `raw/`): one dated record per ask + an
agent-maintained `INBOX.md` worklist. Each record — **the agent writes the ask; the human writes the
answer** (the ownership boundary lives *inside* the record). Frontmatter: `kind`, `status`,
`blocking`, `raised-by` (the loop), `owner`, `due`, `on-timeout`, `links` (raw input · parked output ·
`STATE.md`), plus `options` + `recommended-default` for decisions. `STATE.md`'s Blockers / open
decisions link to these records (STATE summarizes; the inbox holds detail). Templates:
`skills/cocreator/references/`.

### Never stall — park, parallelize, or placeholder
When a loop needs human input it does **not** halt the pipeline. In order of preference:

1. **Proceed on the recommended default** if the decision is low-risk — log it (`interim:
   default-applied`) and keep going. **Wait** only if it is high-blast-radius (the SSOT escalation bar).
2. **Run independent loops/plans/specs** that don't depend on the blocked item — park it
   (`blocking: false`) and parallelize. Block only the *true* critical path.
3. **Placeholder-and-continue** for a soft blocker on the critical path: insert a clearly-marked
   placeholder/stub, log it (`interim: placeholder`, `must-reconcile: true`), and build around it.
4. **Hard-block** only when the work genuinely can't proceed even with a stub (an action-homework
   like registering an integration, or a high-blast-radius decision) — park the dependent work and
   surface the blocker.

### The completion gate — nothing ships with a hidden stub
A cycle may **not** be reported done, advance to `cochangelog`, or be marked accepted while any inbox
item is `status: open` (blocking) or carries an unconfirmed `interim: placeholder | default-applied`.
The final gate **resurfaces every outstanding placeholder and unconfirmed default as "still
pending"** — so a temporary stub or an agent-picked default can never silently become the shipped
answer. (The no-silent-caps discipline, applied to the human handoff.)

### Mechanics (from HITL practice)
- **Resume off a written marker, never poll.** A `resolved`/`done` status or a filled `answer:` is
  the git-native `Command(resume)`; every loop re-reads `inbox/` at start. No "did you do it yet?" turns.
- **Idempotent resume.** The parked step re-runs on resume — put side effects *after* the ask; the
  record stores enough context (ask · options · links · exact next step) that a fresh session resumes
  from the file, not chat memory.
- **SLA + fallback.** `due:` + `on-timeout:` (re-nudge / escalate / fall back to the default) so the
  queue can't deadlock silently.
- **Ratify consequential decisions via git/PR; closed stays closed** (supersede, never reopen).
- **Interactive fast path:** in a live session use `AskUserQuestion`; still log the outcome to the
  inbox / `STATE.md` for the trail. The inbox is the durable fallback for async homework and
  cross-session resume.

### Steering vs transactional
This inbox is the **transactional** channel (per-item asks that drain). The **standing steering**
channel — human-owned rules always in context — already exists here: `raw/` briefs, `CLAUDE.md` /
`AGENTS.md`, and `colearn` lessons. Keep the two separate; standing rules never live in the inbox.

## See also

- `PLAYBOOK.md` — principle 7 ("One source of truth, owned by dimension") states the law; this doc is
  its design.
- `ROADMAP.md` — where `STATE.md` and the ladder sit in the architecture.
- `skills/coport/references/port-manifest.md` — the per-dimension conflict ladder this generalizes.
