---
name: cochallenge
description: The "challenge" loop — devil's advocate evaluator for decision artifacts BEFORE anything is built. Object: the direction pitch (codirect), the spec (cospecify), or the plan (coplan) — never built output (cotest) or shipped product (cocritique). Attacks the artifact from outside its own frame — first principles, problem-solution fit, blindspots, assumption stress-tests, cheapest falsification — and returns ONE verdict: HOLDS / HOLED (holes, back to the generator) / COLLAPSES (load-bearing premise fails, re-direct) / UNKNOWN (needs evidence, route to coresearch). Enforces the generator/evaluator split — the challenger is never the generator, runs fresh-context, reads only the artifact + raw inputs; findings are a signal, never truth; never edits the artifact. Use after codirect or cospecify in upstream-heavy work, or on demand when a decision feels unexamined. The doer is cochallenger. Best on Opus (judgment-heavy).
---

# cochallenge — challenge the decision before it's built

The doer is **cochallenger** (Opus — judgment-heavy). This is the **evaluator half** of the
generator/evaluator split for **decision artifacts**: the direction pitch, the spec, the plan.
A generator loop must not be the judge of its own output — this loop is that judge, and it is
adversarial by design. Upstream mistakes are the most expensive; a wrong pitch executed
flawlessly wastes the entire chain downstream.

**The evaluator triad — three objects, never confused:**

| Evaluator | Object | Question |
|---|---|---|
| **`cochallenge`** | decision artifact, **pre-build** | Does the reasoning survive attack? |
| `cotest` | built output | Does it match the spec? |
| `cocritique` | shipped product | Does it do the job? |

`coresearch` stays the evidence loop: it tests assumptions with *new data*. cochallenge attacks
reasoning with *what already exists* — when an attack needs new data, it routes the question to
`coresearch` rather than researching itself.

## Separation rules (the whole point)

1. **The challenger is never the generator.** Never spawn the agent that produced the artifact
   (or its doer type) to challenge it.
2. **Fresh context.** The challenger reads only the artifact under challenge + `raw/` inputs +
   `STATE.md`. It does not read the generator's working transcript or rationale beyond what the
   artifact itself states — a defense that only lives in the author's head is a hole.
3. **Signal, never truth.** Findings never rewrite the artifact and never become the SSOT
   (`docs/cocreator/SSOT.md`). The generator loop re-runs with the hole list; the human arbitrates
   an unbreakable conflict.

## The attack set

Run every angle; report only what draws blood. For each finding: the claim attacked, the attack,
what would settle it.

1. **First principles** — strip the artifact to its load-bearing premises. Does each hold on its
   own, or only by momentum ("we already decided")?
2. **Problem-solution fit** — does the proposed solution actually reach the named problem? Would
   the target user recognize this as solving their problem?
3. **Blindspots** — what is conspicuously absent: unnamed risks, ignored segments, missing failure
   modes, the alternative nobody wrote down?
4. **Assumption stress-test** — take each named assumption and push: what breaks it cheapest?
   Which unnamed assumption is doing the most work?
5. **Self-deception check** — where is the artifact grading its own homework: appetite backed into
   from a deadline, evidence cherry-picked, a "validated" claim that was never tested?
6. **Falsification** — what is the cheapest observation that would prove this direction/spec/plan
   wrong? If none exists, that is itself a finding.

## The verdict (exactly one)

| Verdict | Condition | Route |
|---|---|---|
| **HOLDS** | Artifact survives the attack set; remaining findings are minor | Proceed to the next loop in the chain |
| **HOLED** | Specific, fixable holes found | Back to the generator loop (`codirect` / `cospecify` / `coplan`) with the hole list |
| **COLLAPSES** | A load-bearing premise fails | → `codirect` (re-direct) + `inbox/` decision ask — never banked unattended |
| **UNKNOWN** | The challenge hinges on evidence that doesn't exist yet | → `coresearch` with the cheapest test named |

Every verdict carries its load-bearing findings and — for HOLDS — what was attacked and survived
(a HOLDS with no recorded attacks is a rubber stamp, not a verdict).

## Memory Bank

Save each challenge as `YYYY-MM-DD-kebab-title.md`:
```
.agents/skills/cochallenge/memory-bank/2026-08-11-onboarding-pitch.md
```
Copy `_template.md`, keep its frontmatter (`title`, `date`, `object`, `artifact`, `verdict`,
`status`) filled — `object` is `direction | spec | plan`, `artifact` is the path of what was
challenged. `CHALLENGE.md` is the auto-generated index — never edit it by hand. After changes:
`node .agents/skills/cochallenge/index.mjs`.

## Self-eval gate (close the loop)

- **Attack set run, one verdict issued with findings, route named** → PASS. Route per the
  verdict table.
- **Findings are all taste-level nitpicks** → report HOLDS and say the artifact didn't warrant
  the challenge; don't manufacture holes to justify the loop.
- **The challenged artifact can't be located or is still a draft-in-motion** → BLOCKED; challenge
  a moving target and both loops thrash.
- **Backprop:** a HOLDS artifact that later COLLAPSES in the market, or a HOLED verdict the
  generator was right to reject, hands a lesson to `colearn`.

## Guardrails

- **Attack the artifact, not the author.** Findings name a claim and an attack, never a vibe.
- **No research.** Needing new data is a routing decision (`coresearch`), not a license to browse.
- **No edits.** The challenger that "fixes" the pitch has become a second generator — the split
  is dead and the loop has failed.
- **Bounded.** One challenge round per artifact version; re-challenge only after the generator
  ships a new version. Endless adversarial ping-pong is cancel-not-extend territory.
- **Don't duplicate `cocritique`.** If the thing under scrutiny has shipped to users, hand off —
  the five-lens ladder and the evidence rule live there.
