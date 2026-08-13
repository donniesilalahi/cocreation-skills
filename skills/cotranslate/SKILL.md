---
name: cotranslate
description: The design→implementation translation loop. Faithfully port a design source (an Open Design / Figma artboard, a JSX/HTML mock, or a written spec) into native UI (SwiftUI now; Kotlin/Compose owner-gated) with ZERO drift. Verify each token's value AND semantics in both sources (inverted params like `frost` are the trap), port EVERY depicted element and state, build each shared primitive as ONE customizable master and compose screens from it, and give every depicted control a real interaction contract. Use when translating a design or spec into real UI, or when a screen is reported "similar but not faithful." Project-specific facts (tokens, masters, capture commands) live in a `translate-manifest.json`, not this skill. NOT coconsolidate — coconsolidate kills impl-vs-impl drift across screens (horizontal); cotranslate kills design→impl drift for one screen (vertical). Hands visual/interaction acceptance to cotest and duplication cleanup to coconsolidate. The doer is cotranslator. Formerly named coport.
---

# cotranslate — faithful design→implementation port (zero drift)

The doer is **cotranslator** (Sonnet). This is a specialized **translation** loop, callable from any
stage: take a design source (artboard / mock / spec) and produce native UI that matches it exactly.

**The line vs siblings:** `coconsolidate` compares many implementations of one thing against *each
other* (impl-vs-impl drift). `cotranslate` compares one implementation against its *design source*
(design→impl drift). It is the build+translate cousin of `cotest` — it *produces* the port, then
hands visual/interaction acceptance to `cotest` and duplication cleanup to `coconsolidate`. It
does not re-implement either (see §9).

This skill ships only **generic mechanism**. Every project-specific fact — token sources, the
masters registry, scaffolding to strip, inverted-param traps, capture and parity commands — lives
in a **`translate-manifest.json`** the consumer keeps in the resolved `<workspaceRoot>/workspace/`
(default `.agents/workspace/`; see `references/translate-manifest.md`). Load it first.

## 0. Bootstrap — the translate-manifest (do this before anything)

> **Migrating from `coport`:** a legacy `.agents/workspace/port-manifest.json` is still valid — read
> it if `translate-manifest.json` is absent, and rename it on the next confirmed edit.

If `<workspaceRoot>/workspace/translate-manifest.json` does not exist, **do not proceed on guessed project
facts.** Don't punt back to the owner empty-handed — draft the manifest, then get it confirmed:

1. Inventory the design system — the token source and the shared primitives/components.
2. Run LSP `documentSymbol` on each candidate master (§6) to capture its real customization surface.
3. Fill the manifest schema (`references/translate-manifest.md`) and hand it to the owner to confirm.

An owner-confirmed (or human-authored) manifest is a `raw/` input; an AI-drafted one is AI-owned
until confirmed. Only proceed once the design-source glob, token source, and masters registry resolve.

## 1. Prime directive — reproduce the SYSTEM, verify against the SOURCE

A mature design source is **already a design system**, not loose mocks. Two absolutes:

1. **Port the system as reusable masters ONCE, then COMPOSE every screen from them** (§5).
   Re-implementing a primitive per screen is exactly how drift diverges.
2. **Verify each token's value AND semantics in BOTH sources before translating** (§3). Never
   trust a cached parity result; re-run the check per increment.

## 2. SSOT & the conflict ladder

Each source can be stale. Know which wins per dimension. **When they conflict in a way the ladder
doesn't resolve — STOP and ask the owner. NEVER silently pick.**

| Dimension | Winner | Why |
|---|---|---|
| Layout, visual, structure, tokens, spacing, frame, iconography, states | **Design source WINS** | It is the visual SSOT. Port exact values. |
| Copy / strings / casing / terminology | **Copy source WINS** (the manifest's `copySource`, e.g. a `WRITING.md`) | Copy is often rewritten after the design was drawn; the design is stale on strings. Where they differ, fix the *design*, not the impl. |
| Canvas scaffolding — mock window frames, fake status bars, board captions, device chrome | **Neither — STRIP it** | It is canvas presentation, not app UI. Preserve real functional app chrome; never render mock chrome inside it. |

**Scaffolding is not design.** The classic bug: reproducing the mock's titlebar *inside* the real
app window → "window inside a window." Strip mock chrome; never port it as literal UI, and never
replace a real functional control with a decorative canvas stand-in.

**When all sources conflict or any is ambiguous → STOP and ask.** A design decision must precede
either side being "wrong."

## 3. Verify semantics, not names — the inversion trap

The archetype: a parameter with the **same name** in source and target but an **opposite range or
sense**. Copying the number silently inverts the result. Any param can be inverted — verify meaning
in BOTH before translating, and record known traps in the manifest's `invertedParams`.

> Worked example (`frost`): design `frost` is `0…1`, default `1` = *clear*. Target `frost` is
> `[0, 0.5]`, default `0` = *clear*. The senses are opposite. A screen shipped washed-out because
> impl copied the design's `frost=1` (which means clear) as `0.4`. Translate by **meaning**, not
> by number: design-clear → target-clear, regardless of the literal value.

Also verify in both: color casing/format (`rgba()` → hex8, lowercased), label casing, default fills
vs. cream/white, gradient stops vs. flat fill, tracking as points (target has no `em`). The parity
script (§7) mechanizes the color checks; everything else is a read-both-sides discipline.

## 4. Element + interaction completeness

**Dropped elements are the dominant failure mode — not wrong pixels.** Before writing code,
enumerate every depicted child and every depicted state, and check each off:

- Port ALL of them: right-column visuals, labels/captions, segmented/zone bars, chips, badges,
  masonry variance, pagination dots, glow/backdrop layers, every light/dark/empty/filled state.
- **NO unilateral "intentional deviation" / "static walkthrough" / reinvent-smaller.** A legitimate
  platform-idiom adaptation (full-width mobile CTA vs. side-by-side desktop pills) is allowed **only
  when flagged for owner sign-off** — never assumed.

**Interaction completeness is equally mandatory.** Write one row per depicted control before editing:

| Control | Bound state | Action | Expected transition | Persistence | Pointer / keyboard / a11y path |
|---|---|---|---|---|---|

A visual match with dead interaction **FAILS**. One depicted slider = one native control + one
binding (never a decorative track plus a second slider). Input-looking content is a real input,
never a display-only label. Every state must be reachable via production state or a deterministic
QA seam.

## 5. Port the SYSTEM, not the screen

Build each shared primitive as **ONE customizable master**, then compose screens from it. Legitimate
per-screen variance passes through the master's **customization surface** (params), never a copy.

**Missing knobs are the tell.** If a screen needs a variant the master can't express, **extend the
master's customization surface** — do not fork a second view. Before writing any new view:

1. **Search for an existing master first** — `grep` the component name/shape across the source tree
   (see §6 for why `grep`, not LSP references, is authoritative here).
2. If one exists, extend it via its params. If duplication already exists, **hand it to
   `coconsolidate`** — do not re-implement the DRY pass here (§9).

Treat a master and its call sites as **one span with one owner** — extending a master necessarily
touches multiple files, so scope is per-span, not per-file (§8).

## 6. Inspecting masters with LSP — safe vs. gated

- **`documentSymbol` is always safe** — no index, no build required. Use it to dump a master's full
  init signature (every knob), diff it against what the screen needs, and extend. This is the
  mechanical form of "missing knobs are the tell."
- **`findReferences` / `workspaceSymbol` fail SILENTLY without an index.** On an unindexed project
  they return "no references" for a symbol used everywhere. **An empty result is NOT evidence of
  absence** — it is indistinguishable from a missing index.
- **The trap:** if you swap `grep`→`findReferences` for the "search for a master first" step, an
  empty result reads as "no master exists" → you fork a duplicate → LSP manufactures the exact drift
  this skill exists to kill.
- **Rule:** `grep` stays authoritative for master-existence. Reference-counting may back a decision
  **only after a probe passes**: wire the index (per the manifest's `lspProbe`), run
  `findReferences` on a known-used master, and confirm it returns non-empty. Until then, treat every
  empty LSP reference result as unknown, not zero.

## 7. Token parity (mechanical)

`scripts/token-parity-check.py` diffs the design-source token block against the target token source
(both paths + formats read from `translate-manifest.json`) and flags every value mismatch. Run it
**before translating any color** and in CI:

```bash
COCREATION_WORKSPACE_ROOT=<workspaceRoot> python3 skills/cotranslate/scripts/token-parity-check.py
# exit 0 = parity; exit 1 = drift
```

It is a **guardrail only** — it never edits either file, and cached counts are never proof. Tokens
that live in target *code* (type scale, frame, radius, spacing) rather than the token file are
reported as INFO, not drift — verify those by reading, per §3.

## 8. Role boundary & scope

- The porter reports **`implemented` or `blocked` ONLY.** It never self-accepts (`done`/`fixed`/
  `accepted`/`pass` are forbidden self-verdicts).
- **Scope is per span** (a master + its call sites), not single-writer-per-file — the central move
  is inherently multi-file.
- **`implementation-only` mode:** edit + static-check only. Do not launch, capture, or claim visual
  proof.
- **`integrated-exclusive` mode:** build/capture **only** when the orchestrator confirms an
  exclusive runtime lock. Still never mark `accepted`.
- Missing source, an owner decision, or a dependency → `blocked`.

## 9. Acceptance & DRY — cross-loop, don't re-implement

- **Visual + interaction acceptance is `cotest`'s job.** After porting, hand off to `cotest`
  (doer `cotester`) for the side-by-side gate and the interaction contract. cotranslate does not carry
  a copy of that gate.
- **Folding duplicate/forked views into one master is `coconsolidate`'s job.** Flag duplication;
  route it there. Acceptance criteria specific to a port: built from shared masters · every depicted
  element + state present · tokens verified (script + read) · copy matches the copy source ·
  interactions proven · deviations owner-approved · independent `cotest` review recorded.

## 10. Report format (the porter's single deliverable)

Defined once, here. Do not restate it in the agent shim.

```text
Design source: <glob/ids>   Target: <platform>   Porter status: implemented | blocked
Execution mode: implementation-only | integrated-exclusive
Source fingerprint: HEAD=<sha>; dirty=<paths>; diff hash=<hash>
Masters reused/extended: <list>   Files touched: <list>

Element report:
| Element | Design value | Impl value | Match? | Fix-side | Master |

Interaction report:
| Control | Action | Expected state/persistence | Evidence or pending verifier |

Token parity command/result: <current output>   States implemented: <light/dark/…>
Duplication flagged for coconsolidate: <…>   Owner escalations: <…>
Next required gate: build | visual | interaction | independent cotest review
```

## Memory bank

> **Storage:** Resolve `workspaceRoot` from `.agents/workspace/cocreation.yaml` (default `.agents`).
> In `local`, write the full record to `<workspaceRoot>/skills/<name>/memory-bank/` and refresh its
> index. In `linear-primary`, write the human-facing artifact through the active backend and keep
> provider metadata, links, and the local navigation/index cache; never write project records into
> the plugin cache.


**Directory:** `.agents/skills/cotranslate/memory-bank/` · **Records:** `YYYY-MM-DD-{board-slug}.md`
(copy `_template.md`, fill frontmatter `title`/`date`/`platform`/`status`). **Index:** `TRANSLATE.md` —
auto-generated; never hand-edit. After a record: `node .agents/skills/cotranslate/index.mjs` (or
`npm run update-indices`). A record may link its `raw/` design input and the output it produced.

## Self-eval gate (close the loop)

- **Every depicted element + state ported from shared masters, tokens verified, interactions
  contracted, status `implemented`** → PASS forward to `cotest` for acceptance.
- **A depicted element or state can't be reproduced faithfully** → re-loop (bounded); do not ship a
  smaller version.
- **Sources conflict unresolvably, or an owner design decision is needed** → escalate to the human.
- **Duplication found, or the same element drifted across screens** → cross-loop to `coconsolidate`
  (logic lens / visual lens). **A logic defect** → `codebug`.
- **Backprop:** every faithfulness failure hands a lesson to `colearn`.

## References

- `references/swiftui-mapping.md` — CSS/JSX→SwiftUI cheatsheet + SwiftUI-pitfall checklist.
- `references/compose-mapping.md` — Kotlin/Compose stub (owner-gated).
- `references/translate-manifest.md` — manifest schema + a worked example.
- `references/gotchas.md` — cross-project translation traps.
