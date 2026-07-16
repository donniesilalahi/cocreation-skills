# The Co-creation Playbook

How human–AI teams build products differently — and why the old process has to change shape,
not just run faster.

This is the foundation document of the ecosystem. Every skill in this repo is an instance of
the principles below. If a skill and this playbook disagree, the playbook wins.

---

## The one idea

**AI changes velocity, not principles. Because it changes velocity so much, the *shape* of the
work changes.**

When an agent can build in hours what used to take weeks, the build step stops being the
bottleneck. The new bottleneck is **human judgment** — deciding what's worth building, and
checking that what got built is actually right. Mistakes don't get cheaper; they get *faster and
bigger*. Garbage in, garbage out — at 100x speed.

So the work re-shapes around two ends:

```
  OLD (human-only)                         NEW (co-creation)

  thin shaping                             ████ heavy shaping  ← judgment moves here
  ░░░░░░░░░░ long manual build  ░░░░░░░░    · fast build ·     ← collapses
  thin review                              ████ heavy review   ← judgment moves here
```

Effort concentrates at **shaping (upstream)** and **review (the gate)**. The slow middle —
manual execution — collapses. This is the whole playbook in one picture.

---

## Seven principles

### 1. One big loop, many small loops
Product work is not a pipeline you traverse once. It's a loop that closes and repeats: shape →
build → check → learn → reshape. Inside it sit smaller loops (the core make/check/learn engine,
plus specialized loops like hardening and consistency). Each small loop is a **skill**. You enter
where the work needs you, not at a fixed "step 1."

### 2. Every loop closes itself
A loop is not done when output exists. It's done when the output has been **evaluated** and the
loop has decided what happens next: advance, repeat, escalate to a human, or jump to a
specialized loop. A skill that produces an artifact but doesn't judge it is half a loop.

### 3. Judgment concentrates at the two ends
Spend human attention where mistakes amplify: **shaping** (is this the right thing, and is it
framed tightly enough that an agent can't wander?) and **review** (did we get what we asked for?).
Automate execution. Do not automate judgment. The constraint is now **review capacity, not build
capacity** — protect it. Capture that judgment through a structured handoff — typed asks
(decision / action / review), each with a recommended default — and **never stall waiting**: proceed
on a low-risk default, run independent loops, or placeholder-and-continue on a soft blocker, then
resurface every stub before shipping (`SSOT.md` § Human handoff).

### 4. Pull risk forward
The cheapest bug is the one you named before building. Red-team the plan, list the assumptions
that are load-bearing, name what would make each fail, and test the cheapest one first. A
pre-mortem at shaping time is worth more than a post-mortem at ship time.

### 5. Default to cancel, not extend
A loop that isn't converging is a signal, not a reason to grind. Bounded retries, then stop and
escalate. Runaway agent work is the failure mode AI introduces — a circuit breaker is how you
contain it. Fixed appetite, variable scope: cut scope to fit the box, don't grow the box.

### 6. Close the verify loop automatically
"Did we build what we specified?" should not be a manual, end-of-cycle chore. Check intent
against what actually shipped, continuously, with cited evidence on both sides. The faster the
build, the more this matters.

### 7. One source of truth, owned by dimension
When many loops each produce an artifact, "what is authoritative?" must have an answer. There is no
single winner — each loop owns **one dimension** of truth and conforms to the ones above it: intent
owns *why* (`coframe`), the **spec owns *what* + acceptance** (`cospecify`, the primary thing
executors build and check against), the plan owns the *work*, design/code are *derived*, and
diagnostic loops (`coverify`/`codebug`/`coaudit`/`coharden`) own only a **conformance signal** —
they emit findings that *reference* the spec and **never become the source of truth**. A single
ranked chain-of-command (this playbook > intent > spec > plan > design/code > findings) fires only
to break a direct conflict; an unbreakable one escalates to the human. The source of truth changes
only through a reviewed channel, never silently. A `.agents/workspace/STATE.md` pointer names the
current authoritative artifact and the last loop run, so anyone — human or agent — knows the state
at a glance. Full design: `SSOT.md`.

---

## How each old loop gets shorter

| Old human-only loop | What co-creation does to it |
|---|---|
| **Build is the long pole** (weeks) | Build collapses to hours. Human effort moves *upstream* (shaping) and *to the gate* (review). The constraint becomes review capacity. |
| **Integrate at the end → find problems late** | Continuous small increments; review happens *while* the agent builds, not after. |
| **Every artifact starts from a blank prompt** | Skills encode the method once, so the first draft is already structured — the draft→redraft loop shrinks. |
| **"Did we build the right thing?" checked late, by hand** | Verify is a closed loop: intent vs. shipped, checked every cycle, evidence on both sides. |
| **Risk surfaces in the retro** | Risk is pulled forward: red-team, pre-mortem, circuit breaker, named anti-patterns — failure modes enumerated *before* building. |
| **Lessons live in someone's head** | Lessons are written by the loop itself on failure, recalled before new work, and **graduated** into guardrails when they recur. |

---

## Lessons as guardrails, with a graduation path

Knowledge in this ecosystem is **self-learning and self-updating**. A failure in the check step
doesn't just get fixed — it gets *recorded* as a lesson, and that lesson becomes a guardrail that
makes the same mistake harder next time. Lessons are updated when superseded, not just piled up.

Guardrails earn their weight by promotion:

1. **Lesson** — a single recorded insight. Advisory. Recalled before related work.
2. **Skill** — when a lesson (or a class of bug) **recurs**, it graduates into a reusable
   checklist or a dedicated mini-skill. Now it's applied by default, not remembered by luck.
3. **Sub-agent** — when a guardrail needs **autonomous enforcement on every run** (e.g. an
   always-on reviewer), it graduates into a dispatched doer.

Promotion is data-driven: each lesson tracks how often it has fired. Recurrence is the trigger,
not opinion.

---

## A note on language

This playbook avoids invented vocabulary. Where an established term exists with a real definition
(appetite, circuit breaker, pre-mortem), we use it. Where plain words work, we use plain words
(shape, build, check, learn). We do not coin proprietary jargon to make ordinary ideas sound new.
Clarity is a feature; vanity words are a bug. If a name doesn't help a newcomer guess what the
thing does, it's the wrong name.

---

## See also

- `ROADMAP.md` — the ecosystem design and how the skills wire together.
- `RESEARCH.md` — the sources this playbook is built from.
