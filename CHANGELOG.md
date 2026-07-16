# Changelog

All notable changes to `@donniesilalahi/cocreation-skills`. Format follows
[Keep a Changelog](https://keepachangelog.com/); this project uses [SemVer](https://semver.org/)
(pre-1.0, so minor bumps may include renames). Versions before 0.6.0 predate this file — see the
git history.

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

[0.10.0]: https://github.com/donniesilalahi/cocreation-skills/releases/tag/v0.10.0
[0.9.0]: https://github.com/donniesilalahi/cocreation-skills/compare/v0.9.0...v0.10.0
[0.8.0]: https://github.com/donniesilalahi/cocreation-skills/compare/v0.8.0...v0.9.0
[0.7.0]: https://github.com/donniesilalahi/cocreation-skills/compare/v0.7.0...v0.8.0
[0.6.0]: https://github.com/donniesilalahi/cocreation-skills/compare/v0.6.0...v0.7.0
