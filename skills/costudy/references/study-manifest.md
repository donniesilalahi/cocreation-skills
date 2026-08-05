# `study-manifest.json` — schema + worked example

The manifest carries every **study-specific fact** `costudy` deliberately keeps out of `SKILL.md`:
the target, the job being studied, the bounded flow list, where captures and the ledger live, the
naming convention + state vocab, redaction rules, and what Mobbin already covers. The skill is the
generic method; the manifest is your study. Mirror of codraw's `design-manifest.md`.

## Where it lives & who owns it

`.agents/workspace/study-manifest.json`. Human-written → it's a `raw/` input (source of truth).
costudy-drafted (SKILL §0) → AI-owned **until the owner confirms**. Never capture against an
unconfirmed manifest — an unbounded study is the failure mode this file exists to prevent.

## Schema

```jsonc
{
  "target": {
    "name":     "Acme",                          // display name, used in every artifact filename
    "platform": "web",                            // web | ios — no android
    "entryUrl": "https://acme.example.com/app",    // where traversal starts
    "version":  "captured 2026-08-05"              // NOT the target's version — the date YOU captured
  },

  "job":  "Get an invoice paid without chasing the client — JTBD phrasing, one sentence",

  "flowsInScope": ["onboarding", "checkout", "invoice-status"],  // 3–7. Not 'everything'.

  "authMode": "live-session",                      // only supported value; never credentials

  "captureDir": ".agents/workspace/studies/acme-2026-08-05/",   // AI working area, gitignored
  "ledgerPath": "docs/studies/acme.study.json",     // git-tracked, in the CODE repo, not the OD workspace

  "odProjectId": null,                              // optional; omit/null → HTML/CSS fallback

  "namingConvention": "<target>__<flow>__<screen>__<STATE>",     // STATE last, closed vocab
  "stateVocab": ["default", "empty", "loading", "error", "success", "filled", "disabled"],

  "redaction": {
    "maskSelectors":    ["[data-testid=account-menu]", ".user-avatar", ".billing-address"],
    "blurFaces":        true,
    "scrubQueryParams": ["token", "email", "session_id"]
  },

  "mobbin": { "searched": false, "coveredScreens": 0, "gaps": [] }   // filled by pipeline step 1
}
```

## Field notes

| Field | What | Why it exists | Good value | Breaks without it |
|---|---|---|---|---|
| `target.name` | Display name of the studied product | Stamped into every capture filename, ledger `id`, and canvas title | `"Acme"` — short, kebab-safe | Filenames and ledger `id`s have nothing stable to key on |
| `target.platform` | `web` \| `ios` | Gates which artifacts are even possible (network/tokens need a browser) | `"web"` | Agent can't pick the right adapter or set the right verdict cap |
| `target.entryUrl` | Where traversal starts | Single deterministic starting point for a human-paced session | The signed-in app root, not the marketing site | Every session starts somewhere different — nav graph roots drift |
| `target.version` | When *you* captured, not the target's release | Products change; a screen recaptured six months later is a different study, not an update to this one | `"captured 2026-08-05"` | Stale evidence gets silently treated as current |
| `job` | One JTBD sentence — what the target is being studied *for* | The single biggest guardrail in this file (see below) | `"Get an invoice paid without chasing the client"` | Capture sprawls to every screen in the product — "study everything" |
| `flowsInScope` | 3–7 named flows | Bounds the work order; forces prioritization before capture starts | `["onboarding","checkout","invoice-status"]` | Either nothing gets captured (paralysis) or everything does (sprawl) |
| `authMode` | Always `"live-session"` | The one supported auth path — the user's own browser session, zero credential handling | `"live-session"` | Any other value implies costudy should touch credentials — it never does |
| `captureDir` | AI working area for raw captures | Screenshots/DOM/network dumps are binary-heavy and gitignored by default | `.agents/workspace/studies/<target>-<date>/` | Captures land in an ungoverned or accidentally-tracked location |
| `ledgerPath` | Git-tracked ledger location, in the **code** repo | Durable seam `cospecify`/`codraw`/`cocritique` read from later | `docs/studies/<target>.study.json` | Findings live only in a gitignored workspace and vanish with it |
| `odProjectId` | Open Design project id | Present → render OD canvases; absent/null → HTML/CSS fallback | a real OD project id, or `null` | Ambiguous whether to look for an OD MCP or use the fallback path |
| `namingConvention` | The segmented template | Makes captures greppable and lets a capture become a canvas node with zero renaming | `<target>__<flow>__<screen>__<STATE>` | Capture names and ledger `id`s drift apart; canvases need a renaming pass |
| `stateVocab` | Closed state list | STATE is always the last segment and always from this set | ship the default in the schema above; extend per study | An inline state name (`"weird-empty"`) breaks grep and drifts from codraw's vocab discipline |
| `redaction.maskSelectors` | CSS selectors to mask before any write | Hard gate — see `capture-protocol.md` | Account menu, avatar, billing fields | Other users' PII or the operator's own identity ships in a capture |
| `redaction.blurFaces` | Blur faces in screenshots | Photos of real people (avatars, testimonials) are PII | `true` by default | Faces of real, non-consenting people land in a git-adjacent artifact |
| `redaction.scrubQueryParams` | URL params to strip | Tokens/emails leak through query strings, not just visible UI | `["token","email","session_id"]` | Auth tokens or emails get recorded verbatim in the nav graph or network log |
| `mobbin.searched` / `coveredScreens` / `gaps` | Prime-pass results | Records what Mobbin already covers so browser capture targets the gap, not everything | filled after step 1 (Prime) | Browser capture duplicates what a pattern library already had for free |

### Why `job` + `flowsInScope` is the load-bearing constraint

Studying "everything" is the default failure mode of reverse-engineering a competitor: no natural
stopping point, no prioritization, and a capture set nobody can act on. `job` forces the study to
answer *for what purpose*, and `flowsInScope` forces a bounded, front-loaded prioritization call —
3 to 7 flows, not a crawl budget. If a flow doesn't serve the job, it doesn't go in scope; discovered
but out-of-job routes still get recorded (`reachable-unvisited`, see `capture-protocol.md`), they
just aren't captured.

## Bootstrap — draft, then owner-confirm

`costudy` is an **entry point** (fed by nothing) — unlike codraw, there's no upstream spec to draft
`job`/`flowsInScope` from. Missing manifest is not a blocker; it's a draft-then-confirm step:

1. **Never invent `job` or `flowsInScope` silently** — these are the two fields with no safe default.
   If the request that triggered costudy names them ("study Acme's checkout"), use that. If not,
   raise an `inbox/` **decision** ask: propose a job statement + a 3–7 flow list inferred from the
   target's own nav (visible top-level nav items, marketing site structure) and a Mobbin category
   scan, with a **recommended default**, per the SSOT inbox contract. Proceed on the recommended
   default only if it's a genuinely low-risk read; otherwise wait — this decision sets the entire
   study's blast radius.
2. **Everything else drafts freely and cheaply**: `target.*` from the entry URL and a page-title/meta
   check, `captureDir`/`ledgerPath` from the naming defaults above, `namingConvention`/`stateVocab`
   from this file's shipped defaults, `redaction` from the shipped default selectors (extend once real
   screens are seen — a first pass may under-specify `maskSelectors`; that's expected, not a blocker).
3. **Hand the full draft back for confirmation** before capture starts. A confirmed/human-authored
   manifest is a `raw/` input; an AI-drafted one stays AI-owned, and every inferred field should read
   as inferred (not silently presented as settled) until confirmed.
4. **Require the confirmation, not just its absence of objection.** Capturing against an unconfirmed
   `job` is exactly the "everything" failure mode this file exists to prevent — even a plausible-looking
   default needs the explicit nod before the browser starts moving.
