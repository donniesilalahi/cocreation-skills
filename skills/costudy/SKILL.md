---
name: costudy
description: The "study" loop — build our own UI/UX pattern library for a product no gallery covers: screens, flows, IA, an inferred design system, reverse-engineered into buildable input. THE LIVE PRODUCT IS THE ONLY SOURCE, never a third-party gallery — costudy replaces those and goes past them: post-login screens, real nav graphs, a11y + token evidence. Captured from the user's OWN Chrome (browser-use CDP primary; chrome-devtools MCP only if a probe confirms same browser; Playwright excluded). Read-only against a real account, human-paced, ONE driver — never parallel agents on one tab. Produces a nav graph (reachable-unvisited counted), a ledger, memory-bank record, five OD canvases (HTML/CSS fallback). Tagged observed|inferred|assumed. Feeds cospecify (study:<id>) and codraw (referenceLedger). Doer: costudier. NOT coresearch (OUR assumptions), NOT cocritique (OUR product vs the job). Never credentials, never mutates the account; human-gated screens → inbox action ask; no adapter or forbidden terms → BLOCKED.
---

# costudy — reverse-engineer someone else's shipped product

The doer is **costudier** (Sonnet). This is the optional **discovery** loop, an entry point like
`coresearch` — fed by nothing, priming downstream design work:

```
costudy(ledger + canvases) ──▶ cospecify (cites study:<id>)
                           └─▶ codraw (referenceLedger)
                           └─▶ cocritique / codirect (comparative evidence, never the bar)
```

**Object of study, three loops:**

| | object of study |
|---|---|
| `coresearch` | our load-bearing assumptions |
| `cocritique` | our shipped product vs the user's job |
| **`costudy`** | **someone else's shipped product** |

**costudy is the pattern library.** Third-party UI galleries index the popular, pre-login, mobile
surface of the web and stop there. costudy builds the same artifacts — screens, flows, sections,
pattern cards — for the product *we* care about, from the running product itself, and carries what
a screenshot library structurally cannot: post-login screens, the nav graph's causing-interaction
edges, the a11y tree, and computed design tokens.

**The live product is the only source.** Never seed, prime, or fill a study from a third-party
gallery — not Mobbin, not Refero, not a competitor's press kit. A gallery hit would be someone
else's crop of a screen we can capture properly ourselves, undated, unlabelled, with no structure
behind it.

## When to Use

- Speccing or drawing a surface where a real shipped product is the reference and you need its
  actual screens, flows, and system — not a vibe and not a gallery thumbnail.
- Any target a gallery won't have: niche products, B2B tools, post-login flows, regional apps.
- Building a reusable pattern library of a category we keep designing in.
- NOT for judging our own product (`cocritique`) or testing our own assumptions (`coresearch`).
- If the human explicitly asks for third-party gallery research, that's `coresearch` — run it there,
  as its own loop, and never let it gate or feed a costudy capture.

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

### 1 — Capture (the live product is the study)
**Start here. Nothing gates this step.** Walk the manifest's `flowsInScope` in the live session and,
per screen, in one pass: full-page **screenshot** · **a11y snapshot** (landmarks, headings, roles,
names) · **DOM subtree** of the main region · **computed-style sample** on representative nodes ·
**network requests** fired during the transition into the screen. Files land in `captureDir` under
the manifest's segmented, STATE-last naming convention — same discipline as codraw, so a capture
name maps 1:1 to a later artboard name.

**One driver, one session.** The live browser has a single focus. Capture runs in **one** agent
walking one tab — never fanned out to parallel sub-agents, however "serial" they claim to be:
concurrent drivers interleave navigation, and an interleaved walk destroys the causing-interaction
edge that step 2 exists to record. Human-paced; no bulk crawl, no parallel hammering.

**Read-only.** See guardrail #1. Full recipe + selectors/scripts + the redaction pass:
`references/capture-protocol.md`.

### 2 — Orient (nav graph)
Nodes = screens; edges = the **interaction that caused the transition** (element + action), not
just "these two pages exist." Discover routes beyond what was walked — `sitemap.xml`, client-side
router manifest, nav DOM links, in-page anchors. Every discovered-but-unwalked route is recorded as
**`reachable-unvisited`** and stated as a count in the verdict, never quietly dropped.

### 3 — Understand (three passes)
1. **IA / hierarchy** — a11y landmarks + heading outline per screen.
2. **Pattern** — name each screen's pattern in OUR taxonomy (kebab-case, functional,
   reused across studies; a genuinely new one is flagged provisional); inventory primitives
   (button, field, card, sheet, nav, …) with variants observed.
3. **System (inferred)** — derive color ramp, type scale, spacing rhythm, radii, elevation, and
   motion from computed styles. **Always tagged `inferred`** — the highest-value, least-certain
   output; never presented as the target's real tokens.

### 4 — Synthesize
Write the **study ledger** (git-tracked JSON at `ledgerPath`, in the code repo, mirroring codraw's
ledger shape so codraw consumes it directly — entries are never deleted, only status-marked) and
the **memory-bank record**. Every finding carries **`observed | inferred | assumed`** (borrowed
from cocritique); a conclusion resting on `assumed` is no stronger than its weakest input. Full
schema, naming convention, and the codraw handoff: `references/ledger-and-naming.md`.

### 5 — Render (five canvases)
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

### 6 — Self-eval gate
See below.

## Guardrails (non-negotiable)

1. **Read-only against a real account.** The session is the operator's own live, logged-in account
   with their real money/health/work data in it. Navigate and observe only: never Save, Submit,
   Add, Delete, Apply, or Confirm; never type into a field that persists; never create, mutate, or
   delete a scenario, record, or setting. A destructive click is not recoverable by re-running the
   study. When a state can only be reached by mutating (a success screen after a real submit),
   record it `reachable-unvisited` and move on.
2. The user's **own** session only. Never request, store, or transmit credentials.
3. **Human-paced**, single-session traversal, **one driver**. No bulk crawling, no scraping at
   scale, no parallel agents sharing the live tab.
4. **Redaction pass before write** — mask other users' PII and the operator's own account
   identifiers in screenshots, DOM, and network records; scrub tokens from URLs. This applies to
   **anything returned out of the study too**: a sub-agent's summary, a ledger field, a canvas
   caption. Real figures become placeholder shapes (`$X,XXX`); the shape is the finding, the value
   never is.
5. Captures are **gitignored by default** (binary bloat + IP hygiene) — on first run, add
   `.agents/workspace/studies/` to the consumer project's `.gitignore` if it isn't there. Only the
   ledger and the memory-bank record are committed; canvases are a render of the ledger, not an
   artifact to commit.
6. Honor ToS and `robots.txt`. Do not defeat bot protection, rate limits, or paywalls.
7. Output is **reference for informed design decisions**, not a clone-and-ship asset. Pattern cards
   carry "what to avoid" precisely to keep this a design input, not a copy machine.
8. If a target's terms forbid this kind of inspection, say so and stop — `BLOCKED`, not a
   workaround.

## Self-eval gate (close the loop)

Verdict: **`COMPLETE | PARTIAL | BLOCKED`**, with four coverage numbers:

- flows captured / flows in scope
- screens captured / screens discovered
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
- **The live product is the only source** — never seed a study from a third-party gallery.
- **Read-only against a real account** — a destructive click is not undone by re-running the study.
- **One driver, one tab** — parallel capture agents interleave and turn the nav graph into fiction.
- **Never silently drop a route** — `reachable-unvisited` is a stated count, not an omission.
- **Inferred is not observed** — the design-system sheet is a hypothesis about tokens, always
  labelled as one.
- **Reference, not clone** — every pattern card names what to avoid, not just what to copy.
- **Never handle credentials, never outrun ToS** — the user's own session, human-paced, or stop.
