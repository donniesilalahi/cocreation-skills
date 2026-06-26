# Research — sources behind the ecosystem

Two questions drove this rework: (1) what does a healthy AI-tooling *ecosystem* look like, and
(2) how does human–AI collaboration change the old product-development process? Findings below;
the conclusions live in `PLAYBOOK.md` and `ROADMAP.md`.

---

## A. The Caveman ecosystem (Julius Brussee)

A family of token-efficiency tools unified by a shared "caveman grammar" (compressed output that
keeps code/paths/errors byte-for-byte). What matters for us is the **ecosystem shape**, not the
compression:

| Piece | Role | Lesson we took |
|---|---|---|
| **caveman** | Shared foundation/identity reused by the rest | An ecosystem needs a foundation doc + identity. Ours is `PLAYBOOK.md` + the `co-` family. |
| **cavecrew** | Role-bounded sub-agents; delegation = context compression + model routing | `/cocreator` delegates to doer sub-agents with model tiers. |
| **cavekit** | Spec-driven build loop; durable `SPEC.md`; **backprop reflex** (test failures → spec, bug-classes → invariants) | Our core make→check→learn loop; failures write lessons; recurring bug-classes graduate to guardrails. |
| **cavemem** | Cross-session persistent memory store | Per-skill `memory-bank/` + `colearn` recall and graduation. |

**Most important borrowed principle:** pragmatism is explicit — *"one file, one loop, zero
sub-agents; the full chain is only for uncertain, high-blast-radius work."* We copied this
restraint: most work runs one loop; the full ecosystem is opt-in, not mandatory ceremony.

Sources: `raw.githubusercontent.com/JuliusBrussee/{caveman,cavekit,cavemem}/main/README.md`;
caveman plugin `agents/cavecrew-*.md`.

---

## B. AI-native product development

### Shape Up AI-native (sergiolindolfoferreira/shape-up-ai-native)
Adapts Basecamp's Shape Up to agents. Keeps the risk-management principles; compresses the cycle
(6-week build → 1–2 week build + 1–2 day review). The sharp reframe: **"Review Budget = Cycle
Capacity"** — the constraint is human review time, not build time. Named guardrails: circuit
breaker, "default: cancel not extend," anti-patterns (vague shaping, 100+ task backlogs,
end-of-cycle integration, blind agent trust / "confident mistakes"). Core insight: **automate
execution, not judgment; garbage in = garbage out at 100x speed.**

### PM-skill libraries (phuryn, product-on-purpose, deanpeters)
Three libraries encoding PM frameworks as skills. What we took:

- **phuryn/pm-skills** — clearest naming (plain verb-noun: `create-prd`, `identify-assumptions`).
  `red-team-prd` (name load-bearing assumptions, rank by cheapest test) and `intended-vs-implemented`
  (audit shipped code vs. spec with cited evidence) shaped our risk-forward + verify principles.
- **product-on-purpose/pm-skills** — strongest engineering rigor: output-quality evals,
  trigger-accuracy evals in CI, Builder→Validator→Iterator lifecycle, sub-agents (critic, auditor,
  changelog curator). Validated our self-eval-gate and sub-agent ideas.
- **deanpeters/Product-Manager-Skills** — useful frameworks but the **cautionary example on
  naming**: "Adaptive Decision Ladder," "Pedagogic & Functional Duality," opaque `pol-probe`.
  This is the vanity-jargon we deliberately avoid.

### The cross-cutting thesis
All sources agree: **AI changes velocity, not principles.** Because agents amplify mistakes at
speed, human effort concentrates at the **two ends** — shaping upstream and review at the gate —
while the manual middle collapses. Shaping becomes *more* critical, not less. This is the spine
of `PLAYBOOK.md`.

---

## Naming stance (explicit user requirement)

Emulate the clearest source (plain verb-noun). Avoid invented buzzwords. A name that doesn't help
a newcomer guess what the thing does is the wrong name. Our convention: **skill = action word**
(`coplan`), **agent = the doer** (`coplanner`) — so the connection is obvious.
