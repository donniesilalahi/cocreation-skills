# L4 — heuristics, severity, and the accessibility floor

Everything needed to run the interface lens. Applies **only** to steps L3 flagged plus the primary
path — a sweep of every screen produces a checklist, not a critique.

---

## Nielsen's 10 usability heuristics

For each, record **what works** (so the fix list doesn't break it) and **what violates it**, with a
location and a severity.

| # | Heuristic | The question | Common violation |
|---|---|---|---|
| **H1** | Visibility of system status | Does the user always know what's happening? | No loading/saved state; silent success; stale data with no timestamp |
| **H2** | Match between system and the real world | Does it speak the user's language? | Internal jargon, DB field names as labels, icons meaning nothing outside the team |
| **H3** | User control and freedom | Can they get out, undo, go back? | No undo on destructive action; back loses input; modal with no exit |
| **H4** | Consistency and standards | Same thing = same word, look, place? | Same action labeled three ways; platform convention violated for novelty |
| **H5** | Error prevention | Is the mistake made impossible, or just reported? | Free-text where a picker belongs; no confirm on irreversible action; no constraint on format |
| **H6** | Recognition rather than recall | Is what they need visible when they need it? | Info from step 2 required at step 5 with no reminder; hidden shortcuts |
| **H7** | Flexibility and efficiency of use | Can experts go faster without confusing novices? | No shortcuts/defaults/recents; identical path for the 1st and 100th time |
| **H8** | Aesthetic and minimalist design | Does every element earn its space? | Competing CTAs; decoration outweighing the primary action |
| **H9** | Help users recognize, diagnose, recover from errors | Does the error say what happened, why, and what to do? | "Something went wrong"; error codes; error far from its cause |
| **H10** | Help and documentation | Is help findable at the point of need? | Docs in a separate portal; no inline help on the hardest step |

**Every violation must name a location and a user-visible consequence.** "H4 violation" is not a
finding; "the same action is 'Send' in the header and 'Confirm' in the sheet, so users hesitate at
step 4" is.

---

## Severity scale (0–4)

Nielsen's scale. Assign to every interface finding — the fix list is ordered by it.

| Severity | Meaning | Test |
|---|---|---|
| **0** | Not a usability problem | Disagreement about taste only |
| **1** | Cosmetic | Fix if there's spare time. No behavioral effect. |
| **2** | Minor | Users are slowed or annoyed; they recover on their own |
| **3** | Major | Users are blocked or take a wrong path; recovery needs effort or help |
| **4** | Catastrophic | The task cannot be completed, or data/money/trust is lost |

Rate **severity × frequency × job-criticality**, not severity alone: a severity-2 problem on the
main path of a daily task outranks a severity-3 problem in a setting nobody opens.

**Calibration guards:**
- Severity 4 requires a *loss* — blocked completion, data loss, wrong irreversible outcome. Not
  "very annoying."
- If more than a third of your findings are 3–4, you are inflating. Re-rate against the test above.
- If nothing is above 2, say so plainly and report the surface as healthy. A critique that must find
  problems will manufacture them.

---

## WCAG 2.2 Level AA — the floor

**Not a lens, a floor.** An AA failure is a defect regardless of everything else in this report; it
goes straight to BLOCKERS without being weighed. WCAG 2.2 became a W3C Recommendation in October
2023 and is backward-compatible with 2.1 and 2.0.

Perennial AA failures, worth checking every time:

| Area | Check |
|---|---|
| Contrast | Text ≥ 4.5:1 (large text ≥ 3:1); UI components and graphical objects ≥ 3:1 |
| Keyboard | Every interactive element reachable and operable; no keyboard trap; visible focus |
| Names/labels | Every control has an accessible name; the visible label is part of it |
| Structure | Real headings, lists, landmarks; not styled `div`s |
| Errors | Errors identified in text (not colour alone) and described |
| Motion/orientation | No orientation lock; motion-triggered behavior has an alternative |

**New in WCAG 2.2 at A/AA** — the six that existing products most often miss:

| SC | Level | What it requires |
|---|---|---|
| **2.4.11 Focus Not Obscured (Minimum)** | AA | The focused element isn't fully hidden behind sticky headers, cookie bars, or chat widgets |
| **2.5.7 Dragging Movements** | AA | Anything drag-operated has a single-pointer alternative (tap, buttons) |
| **2.5.8 Target Size (Minimum)** | AA | Targets ≥ 24×24 CSS px, or adequately spaced |
| **3.2.6 Consistent Help** | A | Help (contact, chat, self-help) appears in the same relative place across pages |
| **3.3.7 Redundant Entry** | A | Don't ask for the same information twice in one process — auto-populate or offer selection |
| **3.3.8 Accessible Authentication (Minimum)** | AA | No cognitive function test (puzzle, memorization, transcription) without an alternative |

Note the overlap with usability: *Redundant Entry* is form fatigue, *Consistent Help* is H4, *Target
Size* is Fitts's law. Where a finding is both, cite the success criterion — it carries more weight
than a heuristic.

---

## Interaction laws (use for quantity, not vibes)

| Law | Statement | Use it to |
|---|---|---|
| **Fitts's law** | Acquisition time grows with distance and shrinks with target size | Justify promoting/enlarging a primary action; explain misclicks on adjacent small targets; size mobile thumb-zone controls |
| **Hick's law** | Decision time grows with the number and complexity of choices | Argue for fewer top-level options, progressive disclosure, a defaulted choice |
| **Miller / cognitive load** | Working memory is small; recognition beats recall | Flag steps demanding info carried from an earlier screen |
| **Jakob's law** | Users spend most of their time on *other* products | Justify following a platform convention over a novel pattern |
| **Doherty threshold** | Interaction stays engaged under ~400ms response | Demand a skeleton/optimistic state instead of a spinner |
| **Peak–end rule** | An experience is remembered by its peak and its end | Explain why the confirmation/exit step deserves disproportionate investment |

Laws **explain** findings; they don't replace them. "Hick's law" alone is not a finding — "nine
equally weighted nav items with no grouping, so users scan all of them before choosing (Hick)" is.

---

## Visual hierarchy and cognitive load

Quick structural checks that regularly produce severity-3 findings:

- **Squint test.** Blur the screen. What's still visible should be the primary action. If a
  decorative element or a secondary CTA dominates, that's a hidden-primary-action finding.
- **Trunk test.** Dropped onto this screen cold, can the user answer: where am I, what can I do
  here, how did I get here, where can I go next? A no on any is a nav finding.
- **First three fixations.** Name what the eye hits 1st, 2nd, 3rd. Compare to what the step needs.
- **Element budget.** Count the simultaneous decisions on screen. More than ~5 competing choices at
  one step is a Hick finding.
- **Input burden.** Count required fields and typed characters on the core task. Every one is a
  drop-off risk — ask what would happen if it were removed, defaulted, or deferred.

---

## Sources

- Nielsen (1994, updated 2020) — the 10 usability heuristics; the 0–4 severity scale.
- W3C — *Web Content Accessibility Guidelines (WCAG) 2.2*, Recommendation 5 October 2023.
- Fitts (1954); Hick (1952); Miller (1956); Card, Moran & Newell — interaction laws.
- Krug, *Don't Make Me Think* — the trunk test; users scan, satisfice, muddle through.
- Morville — the UX honeycomb (useful, usable, findable, credible, accessible, desirable, valuable),
  a useful cross-check when a finding doesn't fit a heuristic.
