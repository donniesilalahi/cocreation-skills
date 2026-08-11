# Changelog

All notable changes to `@donniesilalahi/cocreation-skills`. Format follows
[Keep a Changelog](https://keepachangelog.com/); this project uses [SemVer](https://semver.org/)
(pre-1.0, so minor bumps may include renames). Versions before 0.6.0 predate this file — see the
git history.

## [0.15.0] — 2026-08-11 — generator/evaluator split: codirect · cotest · cochallenge

### Added
- **New `cochallenge` loop** (`cochallenger`, Opus, index `CHALLENGE.md`) — the devil's-advocate
  evaluator for decision artifacts *pre-build* (direction pitch / spec / plan). Attack set: first
  principles, problem-solution fit, blindspots, assumption stress-tests, cheapest falsification.
  One verdict: HOLDS / HOLED / COLLAPSES / UNKNOWN. Enforces the generator/evaluator split — the
  challenger is never the generator, runs fresh-context, and its findings are signal, never truth.
- Wired into `discover`, `feature`, `design-first` (after codirect and after cospecify); the
  `evaluate` router gains a fourth reference point: **vs the reasoning**.

### Changed
- **`coframe` → `codirect`** (`coframer → codirector`, index `FRAME.md → DIRECTION.md`) — the
  Director-of-Product seat: product direction *and* design direction at direction level
  (execution detail stays in cospecify/codraw).
- **`coverify` → `cotest`** (`coverifier → cotester`, index `QA.md → TEST.md`) — QA testing
  strictly against the spec; scope is cross-checking only. Model tier moved to **Haiku**
  (checklist cross-checking is mechanical; verification-trap guardrails unchanged).
- Installer `RENAMES` covers `coframe → codirect` and `coverify → cotest` (nothing auto-deleted).

## [0.13.1] — 2026-08-05 — costudy: correct the gallery-as-source inversion

### Fixed
- **costudy no longer treats a third-party UI/UX gallery (Mobbin, Refero, or any other) as an input
  source, a prime step, or a taxonomy authority.** costudy exists to **BE** the pattern library for
  products a gallery doesn't cover — not to consume one. The live product is now the only source,
  full stop.
- **Deleted the "Prime (Mobbin first)" pipeline step.** In production, an agent ran it as a barrier
  before capture and burned ~370k tokens on Mobbin sweeps while zero screens were ever captured. The
  pipeline is now: 0 Recall & orient → 1 Capture → 2 Orient (nav graph) → 3 Understand →
  4 Synthesize → 5 Render → 6 Self-eval gate — capture starts first, always, and nothing gates it.
- **Coverage denominator changed to screens captured / screens discovered**, replacing "screens
  captured / Mobbin-covered screens." The studied target routinely doesn't exist in Mobbin at all —
  that's the expected case, since costudy exists precisely for products galleries don't cover — and
  the old denominator read a normal, complete study as a failure (`n/0`).
- **New guardrail: read-only against the operator's real, logged-in account.** Added after a study
  ran against a live authenticated account holding real financial data — navigate and observe only,
  never Save/Submit/Add/Delete/Apply/Confirm, never mutate a record or setting. Guardrails
  renumbered: gitignore is now #5, clone-and-ship is now #7, terms-forbid is now #8.
- **New rule: one driver, one session.** Added after a study fanned capture out across parallel
  sub-agents sharing one live tab, interleaving navigation so screenshots landed on the wrong screen
  and the causing-interaction edges became fiction. Capture now runs as a single agent walking a
  single tab, always.
- Pattern naming now uses costudy's own taxonomy (kebab-case, functional, reused across studies; a
  genuinely new name is flagged provisional) instead of a gallery's vocabulary. The `mobbin` field is
  removed from the study manifest; the ledger's `evidence` object drops `mobbinUrl`.
- Design of record updated: `docs/cocreator/specs/2026-08-05-costudy.md`.

## [0.13.0] — 2026-08-05 — costudy: reverse-engineer someone else's shipped product

The ecosystem could red-team our own assumptions (`coresearch`) and critique our own shipped
product against the user's job (`cocritique`), but had no loop for the third object of study:
**someone else's** shipped product. This adds it.

### Added
- **`costudy` / `costudier`** (Sonnet) — reverse-engineers another product's UI/UX (screens, flows,
  information hierarchy, and an inferred design system) into buildable input, captured from the
  user's own live authenticated Chrome session and primed by Mobbin MCP. Renders to a git-tracked
  study ledger + Open Design canvases (gallery, flow map, IA sitemap, design-system sheet, pattern
  cards), mirroring `codraw`'s ledger shape so both are consumable by the same downstream reader.
  Session adapter: `browser-use` (CDP, attaches to the running Chrome so the existing logged-in
  profile reaches post-auth screens) primary, `chrome-devtools` MCP opportunistic when it shares the
  same live browser, **Playwright MCP excluded** (fresh profile, no session). Closes with a verdict —
  **`COMPLETE | PARTIAL | BLOCKED`** — carrying coverage numbers (flows captured / in scope, screens
  vs. Mobbin-covered, `reachable-unvisited` count, assumed-tag ratio); `PARTIAL` is a legitimate
  pass-through as long as what's missing is named (iOS studies are `PARTIAL` on token evidence by
  construction — screenshots carry no computed styles).
- **Entry-point loop, discovery stage** (fed by nothing, like `coresearch`) — runs in parallel with
  it, optional, in the `discover` workflow. Feeds `cospecify` (cited as `study:<id>`) and `codraw`
  (primary) upstream of it in `design-first`; feeds `cocritique`/`coframe` only as *comparative*
  evidence, never as the bar (competitors are not the bar, per PLAYBOOK).
- **Guardrails, non-negotiable:** the user's own session only (never credentials); human-paced,
  single-session traversal (no bulk crawling); a redaction pass before write (mask PII, scrub token
  query params); captures gitignored by default (only the ledger + memory-bank record are committed);
  honor ToS/`robots.txt` (never defeat bot protection or paywalls); output is reference for design
  decisions, never a clone-and-ship asset — pattern cards name "what to avoid" precisely to keep it
  that way.
- **`codraw`'s `design-manifest.json` gains an optional `referenceLedger` field** — a pointer at a
  `costudy` study ledger, so `codraw` resolves reference artboards directly without re-deriving
  anything. Read-only; `codraw` never writes to it.
- Design of record: `docs/cocreator/specs/2026-08-05-costudy.md`.

### Changed
- Roster is **16 skills** (1 master + 15 loops): +`costudy`.

## [0.12.0] — 2026-08-04 — Workflows: named loop chains that drive themselves

The roster was a *vocabulary* — every request began by re-deriving which loops apply, and the two
loops that get dropped under time pressure (`coverify`, `colearn`) are exactly the two the playbook
says can't be. This adds the layer above the loops, and makes a chain survive a session boundary
without a human re-driving it.

### Added
- **Eight workflows** — `discover` · `ship` · `feature` · `design-first` · `fix` · `evaluate` ·
  `release-prep` · `cleanup`. Each names an **entry condition**, the **chain**, the loops it
  **deliberately skips and why**, and an **exit gate** — the condition that means the *chain* closed,
  not merely that its last loop ran. Catalog: `skills/cocreator/references/workflows.md`; selector
  table in `cocreator` SKILL.md §1. Enter one directly with
  `/cocreator <workflow> "<request>"`.
- **`evaluate` is a router, not a chain.** The three review loops answer different questions against
  different reference points — `coverify` (vs the **spec**) · `coconsolidate` (vs **itself**, across
  screens) · `cocritique` (vs the **job**) — and read as interchangeable until named apart. Picking
  by reference point is now the documented first step; running the wrong one gives a confident answer
  to a question nobody asked.
- **`cocreator` §8 "Run it unattended".** A workflow **auto-advances on PASS** — naming the workflow
  *was* the approval for the sequence, so it does not stop to report progress and wait for
  "continue". It halts on **four stop conditions only**: the exit gate is met, a hard-block (§Human
  handoff step 4), bounded retries exhausted, or a **direction change** (`cocritique` MISSERVES, or
  any verdict re-opening intent — never banked unattended). Everything else keeps moving via the
  existing default / park / placeholder ladder, with the completion gate resurfacing stubs before
  anything ships. Includes the cadence guidance (`/loop`, `ScheduleWakeup`, `TaskCreate`) and a
  three-step resume protocol.
- **`STATE.md` gains `Workflow:` and `Next:`** in the head, plus a `Workflow` column in the ledger.
  This is the mechanism that makes long runs self-driving: the pointer already recorded what is
  authoritative and what happened; these add **what happens next**. `Next:` is written on *every*
  loop exit — including the last, where it reads `workflow closed — exit gate met`. A stale or empty
  `Next:` is where an unattended run dies: the following session finds a finished loop, no idea what
  follows, and stops to ask. Design of record: `SSOT.md` § "`Workflow:` + `Next:`".

### Changed
- **`cocreator` §1 replaced, not extended.** The old "Recommend — use the macro order as a guide"
  prose was the only prior form of this idea; it is now the workflow selector, so there is one place
  that says which loops to run.
- **`cocreator` §4 trimmed** to verdict→action routing. The per-loop chain explanations it had
  accumulated (codraw → cotranslate → coverify, cocritique's routing) are covered by the catalog and
  by each loop's own *Relationship to other skills* section — they are no longer restated three
  times. §4 now also names "a different question surfaced" as a **workflow switch**, not a detour.
- **`cocreator` §0 and §7** wired to the new fields: read `Workflow:`/`Next:` first and resume
  without re-selecting; rewrite them on exit as part of the ledger update.
- `ROADMAP.md` gains a "workflow layer" section explaining what the layer buys over the roster;
  README gains a workflow table.

### Notes
- Existing `STATE.md` files keep working — the new head fields and ledger column are additive. A
  session that finds no `Workflow:` treats the run as standalone and selects one normally.

## [0.11.0] — 2026-08-04 — cocritique (the return edge) + coport/coaudit restructure

The ecosystem could verify *that we built what we specified* but never *whether that was worth
specifying*. This adds the missing feedback edge and tidies the two loops whose names and boundaries
had drifted.

### Added
- **`cocritique` / `cocritic`** (Opus) — the **return edge of the big loop**: judge whether the
  product, as it stands, does the user's job **optimally**, and what change in **product direction**
  follows. Evaluates outside-in across five lenses — **job** (JTBD job map + forces of progress),
  **outcome** (ODI opportunity score `importance + max(importance − satisfaction, 0)`; ≥15
  underserved, <10 **overserved**), **journey** (cognitive walkthrough's 4 questions + ISO
  9241-11 effectiveness/efficiency/satisfaction), **interface** (Nielsen's 10 + 0–4 severity, with
  WCAG 2.2 AA as a floor rather than a lens), **signal** (HEART + Goals-Signals-Metrics against
  published benchmarks: SUS ≈ 68, SEQ ≈ 5.5, PMF ≥ 40%). Closes with exactly one verdict —
  **SERVES / UNDERSERVES / OVERSERVES / MISSERVES / UNKNOWN** — plus the direction change, a
  falsifier, and a prioritized fix list (BLOCKERS / FRICTION / POLISH).
- **The evidence ceiling** — the guardrail that separates this from a heuristic checklist. Every
  finding is tagged `observed | inferred | assumed`; a **direction** verdict requires at least one
  `observed` finding on the outcome or signal lens, otherwise it degrades to **UNKNOWN** and names
  the cheapest test instead (routed to `coresearch`). A wrong UI finding costs a day; a wrong pivot
  costs a quarter — so inspection alone may never bank one.
- **`cocritique` proposes, never rewrites.** It is the only loop whose signal points *up* the SSOT
  ladder at **intent** rather than at conformance, so a direction verdict files an `inbox/` decision
  ask and routes to `coframe`/`cospecify`. It never edits the pitch, the spec, or `STATE.md`'s SSOT
  pointer. Design of record: `docs/cocreator/SSOT.md` § "The one loop that points UP the ladder".
- Ships six references (`evaluation-ladder`, `heuristics-and-severity`, `checklists`, `gotchas`,
  `critique-manifest`, `report-template`), a `memory-bank/` keyed on `segment` + `verdict`, and a
  `critique-manifest.json` for project facts — same "no project facts in the skill" convention as
  `codraw`/`cotranslate`.
- **`docs/cocreator/RESEARCH.md` § C** — the survey behind all of it, including why the existing
  open-source UX-audit skills (`ux-audit`, `nielsen-heuristics-audit`, `impeccable`, `uxui-principles`,
  `design-audit`) all start at the interface and carry no evidence discipline, and what was
  deliberately *not* adopted (composite UX scores, competitor benchmarking, visual-craft sweeps).

### Changed
- **`coport` → `cotranslate`** (`coporter` → `cotranslator`). The skill's own first line already read
  "the design→implementation translation loop"; the name now matches. `port-manifest.json` →
  **`translate-manifest.json`** — the legacy filename is still read, so existing consumers keep
  working.
- **`coaudit` merged into `coconsolidate`.** Both compared many implementations of one thing against
  *each other* (the horizontal axis) and both fixed it the same way (extract one master, migrate every
  call site); they differed only in lens — pixels vs logic. `coconsolidate` now runs a **logic lens**
  and a **visual lens** over one machinery, with a unified five-cause taxonomy: D1 copy-paste ·
  D2 parallel reimplementation · D3 forked-and-drifted · **D4 loose spec** (the spec permits a range,
  so the drift is *spec-compliant* — fix the spec first, tier C0) · **D5 bypassed master** (a master
  exists and call sites hardcode around it — tier C4 surgical adopt). Records gain a `lens` field.
- The merge also removed the project-specific leakage `coaudit` shipped with (hardcoded
  `Sources/WiseLifeUI` paths and `DESIGN.md §7.x` references). Element registries now live in the
  consumer's memory bank, where project facts belong.
- **`scripts/build-plugin-manifests.js`** gains an `EXTRA_STEPS` map so a doer agent can carry
  load-bearing guardrails in its generated body (used by `cocritic` for the ladder order, the
  evidence ceiling, and propose-don't-rewrite) without breaking deterministic regeneration.
- Roster is **15 skills** (1 master + 14 loops): +`cocritique`, −`coaudit`.

### Migration
- The installer's `RENAMES` map now covers `coport → cotranslate` and `coaudit → coconsolidate`, so
  `npx` installs print a migration hint for stale directories. **Nothing is deleted for you** —
  `.agents/skills/` is shared. Move `<old>/memory-bank/*.md` into `<new>/memory-bank/`, delete the old
  dir, then run `<new>/index.mjs`. `coaudit` records carry `cause: R1|R2|R3` / `tier: T1|T2|T3`; map
  them to `cause: D4|D1|D5` / `tier: C0|C1|C4` and add `lens: visual`.
- Plugin installs (Claude Code / Cursor / Codex) re-sync cleanly on update.

## [0.10.1] — 2026-07-16 — Rename migration for existing installs

### Added
- **Installer detects renamed skills and prints a migration hint.** After the `0.8.0` rename
  (`coshape → coframe`, `codesign → cospecify`), npx installs left the old dirs behind (the installer
  never prunes — `.agents/skills/` is shared, so blanket deletion there is unsafe). The installer now
  spots a stale old dir and tells you how to migrate — **detect-and-instruct, it never deletes**.
- **README "Updating an existing install"** section covering both channels: plugin installs re-sync
  cleanly (renamed skills replace the old automatically); npx installs get the migration steps
  (move `memory-bank/` records to the new skill, delete the old dir, rebuild the index).

### Notes
- Plugin (Claude Code / Cursor / Codex) installs are unaffected — updating the plugin re-syncs the
  whole set from the repo, so the rename needs no manual cleanup.

## [0.10.0] — 2026-07-16 — Human ↔ agent handoff

The ecosystem now has a structured way for humans and agents to divide the work without the agent
stalling.

### Added
- **Human handoff inbox** — `.agents/workspace/inbox/`: one record per ask, three typed kinds —
  **decision** (pick/answer, ships with a recommended default), **action** (homework only a human
  can do: visual QA, register an integration, enter a secret), **review** (approve / edit /
  reject-with-reason). The ownership boundary lives *inside* each record: the agent writes the ask,
  the human writes the answer. Templates in `skills/cocreator/references/`.
- **Never-stall policy** — proceed on a low-risk default → run independent loops (park &
  parallelize) → **placeholder-and-continue** on a soft blocker → hard-block only when no stub is
  possible. A **completion gate** resurfaces every outstanding stub and unconfirmed default as
  "still pending" before anything ships — a temporary answer can never silently become the shipped
  one.
- `docs/cocreator/SSOT.md` § Human handoff (design of record); `cocreator` reads the inbox at start
  and files/closes items on exit; PLAYBOOK principle 3 gained a handoff clause.

## [0.9.0] — 2026-07-16 — Source-of-truth model

Answers "which loop's output is authoritative, and how does anyone know the current state?"

### Added
- **SSOT precedence ladder** — no single source of truth; ownership is per dimension (intent →
  spec → plan → design/code → findings), the **spec (`cospecify`) is the primary SSOT** executors
  build and check against, and a ranked chain-of-command breaks only direct conflicts (unbreakable
  ones escalate to the human). Diagnostic loops (`coverify`/`codebug`/`coaudit`/`coharden`) emit
  findings that reference the spec and **never become it**.
- **`STATE.md` pointer** — `.agents/workspace/STATE.md` names the current authoritative artifact +
  last loop run + verdict in one place; read first by every loop, updated on exit. Template in
  `skills/cocreator/references/`.
- **Status is a field, never a folder/filename** — the per-status view is generated from a
  frontmatter `status:`; "moved on" is a `superseded-by:` link; the only sanctioned move is coarse
  terminal `archive/`. `docs/cocreator/SSOT.md` design of record; PLAYBOOK principle 7.

## [0.8.0] — 2026-07-16 — Clearer upstream names

### Changed
- Renamed **`coshape → coframe`** ("frame the problem") and **`codesign → cospecify`** ("write the
  buildable spec") — names a non-native speaker gets on first read, each mapped to real practice and
  to a distinct object: **coframe** = the *problem*, **coplan** = the *work*, **cospecify** = the
  *solution*. Doers: `coshaper → coframer`, `codesigner → cospecifier`. Back-compat note in the README.
- Sharpened **cospecify**'s charter now that `codraw` owns visual rendering: it authors the buildable
  spec (screens, states, data shapes, interfaces) and cedes the pixels to `codraw`.

## [0.7.0] — 2026-07-16 — codraw (spec → artboards)

### Added
- **`codraw` / `codrawer`** (Sonnet) — render a `cospecify` spec into a faithful, state-by-state
  Open Design artboard set + a git-tracked ledger cross-referencing artboard↔code + three canvases
  (gallery, primitives, data-driven sitemap). Project facts live in a `design-manifest.json`;
  graceful-degrades to HTML/CSS on disk when the OD MCP is absent. Ships `ledger-check.mjs` (validates
  every ledger name against the convention + state vocab) and three harvested render-verify
  guardrails. Feeds `coport`.

## [0.6.0] — 2026-07-16 — coport (design → implementation)

### Added
- **`coport` / `coporter`** (Sonnet) — faithfully port a design source (artboard / mock / spec) into
  native UI (SwiftUI now; Compose owner-gated) with **zero drift**: verify token value *and*
  semantics in both sources (the inversion trap), port every element + state, build one customizable
  master and compose from it, give every control a real interaction contract. Project facts in a
  `port-manifest.json`; manifest-driven parity script; an LSP gate (`documentSymbol` safe,
  `findReferences` probe-gated). Hands acceptance to `coverify`, duplication to `coconsolidate`.
### Changed
- Harvested three general lessons upstream into siblings: **coverify** (false-PASS asymmetry,
  distinctness ≠ correctness, reset-don't-idempotent capture harness) and **codebug** (re-verify
  against the full spec, not the last symptom).

[0.10.1]: https://github.com/donniesilalahi/cocreation-skills/releases/tag/v0.10.1
[0.10.0]: https://github.com/donniesilalahi/cocreation-skills/compare/v0.10.0...v0.10.1
[0.9.0]: https://github.com/donniesilalahi/cocreation-skills/compare/v0.9.0...v0.10.0
[0.8.0]: https://github.com/donniesilalahi/cocreation-skills/compare/v0.8.0...v0.9.0
[0.7.0]: https://github.com/donniesilalahi/cocreation-skills/compare/v0.7.0...v0.8.0
[0.6.0]: https://github.com/donniesilalahi/cocreation-skills/compare/v0.6.0...v0.7.0
