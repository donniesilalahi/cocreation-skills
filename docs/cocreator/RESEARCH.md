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

## C. Product & experience evaluation — the `cocritique` sources

Second research question, added at v0.11.0: **how do you tell whether what shipped actually does the
user's job — and what changes if it doesn't?** The existing loops all measure conformance (impl vs
spec, impl vs impl). None measured fitness. The survey below is what `cocritique` is assembled from.

### The gap in the open-source landscape
A dozen agent skills answer *"audit this UI"* (`ux-audit`, `nielsen-heuristics-audit`,
`ux-heuristics`, `uxui-principles`, `impeccable`, `design-audit`). Nearly all of them share one
shape: **Nielsen's 10 heuristics + a severity rating + a fix list**, occasionally extended with
visual-craft dimensions or a smell taxonomy. Two consequences:

1. **They start at the interface**, which silently concedes that the current product direction is
   correct — the audit only asks whether the right thing is built *neatly*.
2. **They have no evidence discipline.** An agent's heuristic inference is presented in the same
   voice as observed user behavior, so a fluent, plausible, entirely wrong recommendation reads
   identically to a well-founded one. That is Shape Up AI-native's "confident mistake" (§B) applied
   to product direction, where it is at its most expensive.

`cocritique` therefore inverts the order (job → outcome → journey → interface → signal) and adds a
hard **evidence ceiling**: every finding is tagged `observed | inferred | assumed`, and a direction
verdict without an `observed` finding on the outcome/signal lens degrades to **UNKNOWN + the cheapest
test**. Interface heuristics are the *last* lens, not the first — and are kept, because they are
genuinely good at what they do.

### The frameworks adopted, and why each

| Lens | Framework | Why this one |
|---|---|---|
| **Job** | JTBD (Christensen); the **job map** and desired-outcome grammar (Ulwick); **forces of progress** (Moesta) | The job map makes coverage *checkable* stage by stage — products over-invest in Execute and abandon Locate/Monitor/Modify. The forces name why a "good" product still isn't adopted (anxiety and habit), which no heuristic set can surface. |
| **Outcome** | **ODI opportunity algorithm** (Ulwick): `opportunity = importance + max(importance − satisfaction, 0)`; ≥15 underserved · <10 **overserved** | The one framework that answers "optimally" **in both directions**. Overserved outcomes generate no complaints and appear in no bug tracker — they show up only in this table, and they are where the budget for the underserved rows comes from. |
| **Journey** | **Cognitive walkthrough** (Wharton, Rieman, Lewis & Polson, 1994); **ISO 9241-11:2018**; Norman's gulfs | Evidence-backed choice of method: comparative studies (JAMIA 2017) find CW surfaces *fewer* problems at *higher* average severity than heuristic evaluation (major ~2.77 vs minor ~2.34) and is the better instrument for learnability and first-time users. ISO 9241-11 supplies the scoring vocabulary (effectiveness / efficiency / satisfaction) that ISO 9241-210:2019 extends with accessibility and well-being. |
| **Interface** | Nielsen's 10 heuristics + 0–4 severity; **WCAG 2.2 AA**; Fitts / Hick / Jakob / Doherty; Krug's trunk test | Kept, but demoted to fifth position and scoped to steps the journey lens flagged. WCAG 2.2 (W3C Recommendation, Oct 2023) is treated as a **floor, not a lens** — its six new A/AA criteria overlap usability directly (Redundant Entry = form fatigue, Consistent Help = H4, Target Size = Fitts). |
| **Signal** | **HEART + Goals-Signals-Metrics** (Rodden, Hutchinson & Fu, Google); MeasuringU benchmarks (SUS ≈ 68, SEQ ≈ 5.5); **Sean Ellis 40% PMF test** | Gives the loop a way to be *overruled by reality*: where a metric contradicts a heuristic finding, the metric wins. Benchmarks matter because raw scores mislead — SEQ's nominal midpoint is 4 but its empirical average is 5.5, so "4.5" is below average, not "fine". The classic split (SUS > 68 with task success in the 60s) is the exact case heuristic-only audits miss. |
| **Verdict** | Lean Startup **pivot-or-persevere** / innovation accounting; Ellis's PMF tiers (<25% no fit · 25–40% close · ≥40% fit) | Forces the loop to *close* with a decision rather than a report, which is principle 2 (every loop closes itself). The verdict vocabulary stays plain — SERVES / UNDERSERVES / OVERSERVES / MISSERVES / UNKNOWN — per the naming stance below. |

### What we deliberately did not take
- **A composite "UX score."** A single number hides which lens failed and invites gaming. The verdict
  is categorical and carries its load-bearing findings instead.
- **Competitor benchmarking as a finding source.** It outsources direction to a company with
  different users; it only enters the report when a real user actually switched.
- **Visual-craft dimension sweeps** (spacing/type/colour/motion checklists, as in `impeccable` and
  `design-audit`). Real, but they belong to consistency (`coconsolidate`) and conformance
  (`coverify`), not to fitness-for-the-job. Keeping them out is what keeps `cocritique` MECE.

Sources: Christensen, *Competing Against Luck* · Ulwick, *What Customers Want* / jobs-to-be-done.com ·
Moesta, *Demand-Side Sales* · Wharton et al. (1994) · ISO 9241-11:2018, ISO 9241-210:2019 · W3C WCAG
2.2 (2023-10-05) · Rodden, Hutchinson & Fu (2010) · Sauro & Lewis / MeasuringU UX benchmarks ·
Ellis (2009) · Ries, *The Lean Startup* · Khajouei et al., JAMIA 24(e1) 2017 (HE vs CW comparison).

---

## Naming stance (explicit user requirement)

Emulate the clearest source (plain verb-noun). Avoid invented buzzwords. A name that doesn't help
a newcomer guess what the thing does is the wrong name. Our convention: **skill = action word**
(`coplan`), **agent = the doer** (`coplanner`) — so the connection is obvious.
