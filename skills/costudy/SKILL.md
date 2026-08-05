---
name: costudy
description: The "study" loop — reverse-engineer someone else's shipped product into buildable input: screens, flows, IA, an inferred design system. Captured via the user's OWN Chrome session (browser-use CDP primary; chrome-devtools MCP only if a probe confirms same browser; Playwright excluded). Primes with Mobbin for priors + gaps, captures the gaps — screenshot, a11y, DOM, styles, network — human-paced. Produces a nav graph (reachable-unvisited counted), a git-tracked ledger, memory-bank record, and five OD canvases (HTML/CSS fallback). Tagged observed|inferred|assumed. Feeds cospecify (study:<id>) and codraw (referenceLedger); cocritique/coframe read it as comparative evidence only. Doer: costudier. Use for evidence from a competitor/reference product Mobbin doesn't fully cover — post-login screens, niche products. NOT coresearch (OUR assumptions) and NOT cocritique (OUR product vs the job). Never handles credentials; human-gated screens become an inbox action ask; no adapter or forbidden terms → BLOCKED.
---

# costudy — reverse-engineer someone else's shipped product

The doer is **costudier** (Sonnet). This is the optional **discovery** loop, an entry point like
`coresearch` — fed by nothing, priming downstream design work:

```
costudy(ledger + canvases) ──▶ cospecify (cites study:<id>)
                           └─▶ codraw (referenceLedger)
                           └─▶ cocritique / coframe (comparative evidence, never the bar)
```

**Object of study, three loops:**

| | object of study |
|---|---|
| `coresearch` | our load-bearing assumptions |
| `cocritique` | our shipped product vs the user's job |
| **`costudy`** | **someone else's shipped product** |

Fills the gap Mobbin leaves: niche products, post-login screens, and structural evidence (a11y
tree, computed tokens, network) a screenshot library can't carry.

## When to Use

- Speccing or drawing a surface with a strong reference product and Mobbin doesn't cover it (niche
  product, post-login flow, or you need structural evidence beyond a screenshot).
- Before `cospecify`/`codraw` need concrete pattern evidence instead of a vibe.
- NOT for judging our own product (`cocritique`) or testing our own assumptions (`coresearch`).

## 0. Bootstrap — the study-manifest

Project facts don't live in this skill. If `.agents/workspace/study-manifest.json` is missing,
draft it and get owner confirmation before capturing anything — same pattern as codraw's
`design-manifest.json`. It fixes the **target**, the **job** being studied for (one sentence, JTBD
phrasing), a bounded **flowsInScope** (3–7, never "everything"), `authMode: live-session` (the only
supported value), the naming convention + state vocab, and the ledger/capture paths. Schema +
worked example: `references/study-manifest.md`.

**Missing manifest is not a blocker for drafting it** — but capture never starts against an
unconfirmed target/job/scope.

## Session adapter

**Primary: `browser-use` (CDP).** Attaches to the user's *running* Chrome — the existing logged-in
profile reaches post-auth screens with zero credential handling.

**Opportunistic: `chrome-devtools` MCP** — richer a11y snapshots and network listing. Use **only**
if a `list_pages` probe confirms it's attached to that same live browser; otherwise it launches an
isolated profile and sees a logged-out product.

**Excluded: Playwright MCP.** Fresh profile, no session — never used for costudy.

Run the probe first. **State in every study's output which adapter it got.** Neither available →
`BLOCKED`, file an inbox **action** ask (get a session reachable) and stop that study.

A screen that needs the human (login, pay, ToS, captcha) is never driven around: raise an
`inbox/` **action** ask, park that flow, and continue the other flows in scope. Never stall the
whole study on one screen; never request, store, or transmit credentials.

## How to Use — the pipeline

### 0 — Recall & orient
Read `STATE.md`, `raw/`, the manifest, and recall relevant lessons via `colearn`.

### 1 — Prime (Mobbin first)
`search_screens` / `search_flows` for the target **and** its category; `search_sections` for web
marketing surfaces. Two outputs: free pattern priors (vocabulary + category baseline), and an
explicit **gap list** — what Mobbin does not cover for this target. The gap list is the capture
step's work order. Record `mobbin.coveredScreens` and `mobbin.gaps` in the manifest. Mobbin
platform is `ios|web` only — no Android.

### 2 — Capture
Per screen, in one pass: full-page **screenshot** · **a11y snapshot** (landmarks, headings, roles,
names) · **DOM subtree** of the main region · **computed-style sample** on representative nodes ·
**network requests** fired during the transition into the screen. Files land in `captureDir` under
the manifest's segmented, STATE-last naming convention — same discipline as codraw, so a capture
name maps 1:1 to a later artboard name. Human-paced; no bulk crawl, no parallel hammering. Full
recipe + selectors/scripts + the redaction pass: `references/capture-protocol.md`.

### 3 — Orient (nav graph)
Nodes = screens; edges = the **interaction that caused the transition** (element + action), not
just "these two pages exist." Discover routes beyond what was walked — `sitemap.xml`, client-side
router manifest, nav DOM links, in-page anchors. Every discovered-but-unwalked route is recorded as
**`reachable-unvisited`** and stated as a count in the verdict, never quietly dropped.

### 4 — Understand (three passes)
1. **IA / hierarchy** — a11y landmarks + heading outline per screen.
2. **Pattern** — name each screen with the Mobbin taxonomy where it applies; inventory primitives
   (button, field, card, sheet, nav, …) with variants observed.
3. **System (inferred)** — derive color ramp, type scale, spacing rhythm, radii, elevation, and
   motion from computed styles. **Always tagged `inferred`** — the highest-value, least-certain
   output; never presented as the target's real tokens.

### 5 — Synthesize
Write the **study ledger** (git-tracked JSON at `ledgerPath`, in the code repo, mirroring codraw's
ledger shape so codraw consumes it directly — entries are never deleted, only status-marked) and
the **memory-bank record**. Every finding carries **`observed | inferred | assumed`** (borrowed
from cocritique); a conclusion resting on `assumed` is no stronger than its weakest input. Full
schema, naming convention, and the codraw handoff: `references/ledger-and-naming.md`.

### 6 — Render (five canvases)
Open Design canvases, degrading to HTML/CSS artboards on disk when the OD MCP is absent — same
fallback contract as codraw (identical naming, ledger, canvas set either way):

| Canvas | Shows |
|---|---|
| **Gallery** | every captured screen, grouped by flow, state-labelled |
| **Flow map** | the nav graph — nodes + causing-interaction edges + `reachable-unvisited` stubs |
| **IA sitemap** | data-driven hierarchy outline per screen, generated from the ledger |
| **Design-system sheet** | inferred ramp / scale / rhythm / radii / elevation / motion, `inferred`-tagged |
| **Pattern cards** | one card per pattern: what it does, what to steal, what to avoid, evidence link |

Detail + fallback mechanics: `references/canvases.md`.

### 7 — Self-eval gate
See below.

## Guardrails (non-negotiable)

1. The user's **own** session only. Never request, store, or transmit credentials.
2. **Human-paced**, single-session traversal. No bulk crawling, no scraping at scale.
3. **Redaction pass before write** — mask other users' PII and the operator's own account
   identifiers in screenshots, DOM, and network records; scrub tokens from URLs.
4. Captures are **gitignored by default** (binary bloat + IP hygiene) — on first run, add
   `.agents/workspace/studies/` to the consumer project's `.gitignore` if it isn't there. Only the
   ledger and the memory-bank record are committed; canvases are a render of the ledger, not an
   artifact to commit.
5. Honor ToS and `robots.txt`. Do not defeat bot protection, rate limits, or paywalls.
6. Output is **reference for informed design decisions**, not a clone-and-ship asset. Pattern cards
   carry "what to avoid" precisely to keep this a design input, not a copy machine.
7. If a target's terms forbid this kind of inspection, say so and stop — `BLOCKED`, not a
   workaround.

## Self-eval gate (close the loop)

Verdict: **`COMPLETE | PARTIAL | BLOCKED`**, with four coverage numbers:

- flows captured / flows in scope
- screens captured / Mobbin-covered screens
- `reachable-unvisited` count
- assumed-tag ratio

`PARTIAL` is a legitimate exit and must name what is missing and why — never hide it in a clean
verdict. **iOS studies are `PARTIAL` by construction** on network/token evidence: screenshots carry
no computed styles and no network trace. State that; don't route around it.

- **All flows in scope captured, ledgered, canvases rendered, coverage numbers reported** →
  `COMPLETE`, PASS forward to `cospecify` / `codraw`.
- **Some flows captured, gaps named with a reason (adapter, human-gated screen, iOS evidence
  ceiling)** → `PARTIAL`, PASS with the gap named — not a failure.
- **No usable session adapter, or the target's terms forbid inspection** → `BLOCKED`, inbox action
  ask, stop.
- **Backprop:** a capture/redaction gotcha that would bite the next study hands a lesson to
  `colearn`.

On exit, append the run + verdict to the `.agents/workspace/STATE.md` ledger like any other loop.
costudy never edits `STATE.md`'s SSOT pointer — a competitor's product is evidence, never our
source of truth.

## Handoff contract

- `cospecify` cites a pattern as **`study:<id>`** in its spec.
- `codraw`'s `design-manifest.json` gains an optional **`referenceLedger`** pointer at a study
  ledger, so reference artboards resolve without re-deriving anything.
- `cocritique` may read the ledger as comparative evidence — tagged as competitor evidence, never
  as the bar (competitors are not the bar, per `PLAYBOOK.md`).

## Memory Bank

**Directory:** `.agents/skills/costudy/memory-bank/` · **Records:**
`YYYY-MM-DD-<target>-<flow>.md` (copy `_template.md`; frontmatter `title` / `date` / `target` /
`platform` / `job` / `coverage` / `status`, plus `ledger:` / `manifest:` cross-refs). **Index:**
`STUDIES.md` — auto-generated; never hand-edit. After a record: `node
.agents/skills/costudy/index.mjs` (or `npm run update-indices`).

A record links the `raw/` brief (if any), the manifest, and the ledger it produced. Re-studying the
same target later writes a **new dated record** and adds `superseded-by:` to the old one — never
overwrite a past study.

## References

- `references/study-manifest.md` — manifest field reference + bootstrap dialogue.
- `references/capture-protocol.md` — per-screen capture recipe, adapter probe, selectors/scripts,
  the redaction pass.
- `references/ledger-and-naming.md` — naming convention, state vocab, full ledger schema, codraw
  handoff.
- `references/canvases.md` — the five canvases + HTML fallback.

## Principles

- **A job and a bounded scope before any capture** — studying "everything" is the failure mode.
- **Mobbin first, browser only for the gap** — never re-capture what a pattern library already has.
- **Never silently drop a route** — `reachable-unvisited` is a stated count, not an omission.
- **Inferred is not observed** — the design-system sheet is a hypothesis about tokens, always
  labelled as one.
- **Reference, not clone** — every pattern card names what to avoid, not just what to copy.
- **Never handle credentials, never outrun ToS** — the user's own session, human-paced, or stop.
