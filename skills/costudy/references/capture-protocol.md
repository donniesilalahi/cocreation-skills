# Capture protocol — adapter probe, per-screen recipe, traversal, redaction

The operational heart of `costudy`. Everything here runs inside pipeline step 2 (Capture) of
`SKILL.md`, gated by the manifest (`references/study-manifest.md`) and feeding the ledger
(`references/ledger-and-naming.md`).

## 1. Adapter probe — run this first, every session

Three browser tools exist in this environment. Only two are eligible, and only one is primary.

| Adapter | Session it sees | Use for costudy? |
|---|---|---|
| `browser-use` (CDP) | Attaches to the user's **already-running** Chrome — their real, logged-in profile | **Primary.** Zero credential handling, reaches post-auth screens directly. |
| `chrome-devtools` MCP | Attaches to a live browser **only if** probed and confirmed — otherwise launches its own **isolated profile** | **Opportunistic.** Richer a11y snapshot + network listing, but only when confirmed attached to the same session. |
| Playwright MCP | Always a **fresh profile** | **Excluded.** No session ever reaches a logged-in screen. Never invoke for costudy. |

### Probe sequence

1. **Try `browser-use` first.** It attaches to the running Chrome by construction — confirm the
   session is the target's authenticated one by checking the current page state (account name/avatar
   visible, not a login screen). If confirmed → this is your primary driver for navigation and
   screenshots for the whole session.
2. **Opportunistically check `chrome-devtools`.** Call `list_pages`. Inspect what comes back:
   - **Attached to the live browser** (the returned pages include the target's already-open,
     authenticated tab/URL) → safe to use `chrome-devtools` *in addition* to `browser-use`, for the
     artifacts it does better (a11y snapshot via `take_snapshot`, network via
     `list_network_requests`).
   - **Not attached** — `list_pages` returns a blank/new tab, `about:blank`, or a login screen for a
     URL that should already be authenticated → `chrome-devtools` has launched an **isolated
     profile**. **Do not use it for capture.** This is the silent-logged-out-capture failure mode:
     it will happily screenshot and DOM-dump a real page, just the wrong (unauthenticated) version of
     it, and nothing in the output visibly flags that. Fall back to `browser-use` alone for every
     artifact.
3. **Neither adapter reaches an authenticated live session** → `BLOCKED`. Raise an `inbox/` **action**
   ask: ask the owner to open the target in their own Chrome, confirm they're signed in, and retry.
   Never attempt to log in on the operator's behalf, never prompt for or accept credentials.
4. **State which adapter(s) you got, explicitly, in the run's output** — this is not optional
   bookkeeping. A downstream reader needs to know whether the network/a11y artifacts came from
   `chrome-devtools` or were approximated via `browser-use` script injection (§2).

## 2. Per-screen capture recipe — five artifacts, one pass

Per screen, in the same visit (don't revisit a screen to backfill a missed artifact — that breaks
the "one causing interaction per transition" discipline in §3):

| # | Artifact | `chrome-devtools` (if attached) | `browser-use` (always) |
|---|---|---|---|
| 1 | Full-page screenshot | `take_screenshot({ fullPage: true })` | `browser_screenshot()` |
| 2 | A11y snapshot (landmarks, headings, roles, names) | `take_snapshot()` — native a11y tree | No native tool. Run the JS snippet below via `browser_exec` and treat the result as `inferred` structure, not a native a11y tree. |
| 3 | DOM subtree of main region | `evaluate_script()` running the DOM query below | `browser_exec()` running the same query |
| 4 | Computed-style sample (4 node classes) | `evaluate_script()` running the token-sweep script below | `browser_exec()` running the same script |
| 5 | Network requests during the transition | `list_network_requests()` right after `navigate_page` | No one-call tool. Either hook CDP `Network.requestWillBeSent` from a `browser_exec` script before triggering the transition, or fall back to a `PerformanceObserver`/`performance.getEntriesByType('resource')` read right after it. If neither yields anything usable, record `network: []` and note the gap in the ledger entry — never fabricate it |

**A11y approximation (browser-use, no native tree):**

```js
// returns a flat list approximating landmarks + heading outline + interactive names
[...document.querySelectorAll(
  'header,nav,main,aside,footer,[role],h1,h2,h3,h4,h5,h6,button,a,input,select,textarea'
)].map(el => ({
  tag: el.tagName.toLowerCase(),
  role: el.getAttribute('role') || null,
  name: el.getAttribute('aria-label') || el.innerText?.trim().slice(0, 80) || null,
  level: /^h[1-6]$/i.test(el.tagName) ? el.tagName[1] : null
}));
```

**DOM subtree of main region:**

```js
(document.querySelector('main, [role="main"], #main, #root main') || document.body).outerHTML;
```

**Computed-style token sweep** — run against one representative element per class, not every node:

```js
const classes = {
  text:      document.querySelector('p, .body-text, [class*="text"]'),
  surface:   document.querySelector('.card, [class*="surface"], [class*="panel"]'),
  control:   document.querySelector('button, [class*="btn"], [role="button"]'),
  elevated:  document.querySelector('[class*="modal"], [class*="dropdown"], [class*="tooltip"], [class*="popover"]')
};
const props = ['color','backgroundColor','fontFamily','fontSize','fontWeight','lineHeight',
               'borderRadius','boxShadow','padding','transitionDuration','transitionTimingFunction'];
Object.fromEntries(Object.entries(classes).map(([k, el]) => {
  if (!el) return [k, null];
  const cs = getComputedStyle(el);
  return [k, Object.fromEntries(props.map(p => [p, cs[p]]))];
}));
```

This sample is always the `tokens` field's source. It is **always `inferred`** (§ledger-and-naming) —
never presented as the target's actual design-token values, only as a computed observation of one
node instance.

**Network requests fired during the transition into this screen** — capture the window from the
causing click/nav to the screen settling (short: a few seconds), not the screen's whole lifetime.

## 3. Traversal discipline

- **Human-paced, one session.** No bulk crawl, no parallel tabs hammering the target, no scripted
  link-following loop. Each transition is a deliberate, single navigation.
- **Record the causing interaction, not just the resulting URL.** Every edge in the nav graph is
  `{ element, action }` → resulting screen — e.g. `{ element: "nav > 'Billing' link", action: "click" }
  → billing__overview__default`. A URL-only record collapses the nav graph into a page list and loses
  the thing the flow map (§canvases) exists to show.
- Stay inside `flowsInScope`. A screen reachable but out of scope gets recorded as
  `reachable-unvisited` (§4), not captured.

## 4. Route discovery — `reachable-unvisited`

Beyond what was actually walked, harvest routes from:

- **`sitemap.xml`** — fetch directly, no auth needed for the public parts.
- **Client-side router manifest** — bundled route tables (React Router route config, Next.js
  `_next/static` build manifest, Vue Router config) visible in loaded JS; inspect via
  `evaluate_script`/`browser_exec` reading `window.__NEXT_DATA__` or the router's route array where
  exposed.
- **Nav DOM links** — `[...document.querySelectorAll('a[href]')].map(a => a.href)` on every captured
  screen.
- **In-page anchors** — links inside content, not just chrome/nav.

Every discovered-but-unwalked route is recorded as `reachable-unvisited` in the nav graph — **never
dropped**. It's stated as a count in the self-eval verdict (SKILL §7), not silently absorbed into
"done."

## 5. Redaction pass — hard gate, runs BEFORE anything is written to disk

Not a cleanup step. Nothing — screenshot, DOM, network record — reaches `captureDir` until this pass
runs against it.

**Checklist:**

- [ ] Screenshots: apply `redaction.maskSelectors` (account menu, avatar, any other-user PII surface)
      before saving; blur faces if `redaction.blurFaces` is true.
- [ ] Screenshots: scan for visible other-user PII the selector list didn't anticipate (names, emails,
      addresses in list/table rows) — mask or crop, don't ship "we'll fix it later."
- [ ] DOM subtree: strip any attribute or text node matching other-user data; strip serialized
      cookies/tokens if present in the captured HTML.
- [ ] Network records: strip `Authorization` headers, cookies, and any token-bearing headers before
      persisting; scrub `redaction.scrubQueryParams` (e.g. `token`, `email`, `session_id`) from every
      logged URL and query string.
- [ ] Operator's own identity: mask it too — the operator's account isn't the subject of the study
      either.

If a capture can't be confidently redacted (e.g. a data table full of real other-user rows with no
clean selector boundary), don't ship it partially redacted — skip that artifact for the screen and
note the gap, rather than writing a compromised file and fixing it after the fact.

## 6. Human-gated screens

Login, payment, ToS acceptance, captcha, MFA: costudy cannot and must not cross these. On hitting
one:

1. Raise an `inbox/` **action** ask — the owner completes the step manually in their own browser.
2. Park that flow (`blocking: false`) — it doesn't stall the rest of the study.
3. Continue capturing the other in-scope flows.
4. Never store, request, or transmit credentials; never attempt to script past a captcha or MFA
   prompt.

## 7. iOS / native path — no automation

There is no browser adapter for native iOS. The path is manual:

1. The user collects their own screenshot set (Simulator or device) and drops it into
   `.agents/workspace/raw/<target>-<date>-ios-screenshots/`.
2. costudy ingests the dropped set: rename/verify each file matches the naming convention
   (`references/ledger-and-naming.md`) — `<target>__<flow>__<screen>__<STATE>.png` — renaming here is
   the one time costudy touches filenames, since there was no capture step to name them correctly the
   first time.
3. Downstream passes that work from images alone still run: IA (visual hierarchy read from the
   screenshot), pattern naming (Mobbin taxonomy by eye).
4. Passes that need live DOM/network are **unavailable**: no computed-style sample, no network log.
   The ledger entry's `tokens` and `network` fields stay null; `tag` is `observed` for what's visibly
   true in the screenshot and `assumed` for anything about underlying implementation.
5. **Such studies are `PARTIAL` by construction** — say so in the self-eval verdict, don't present an
   image-only study as equivalent coverage to a web capture.

## Gotchas

1. **The isolated-profile trap is silent.** `chrome-devtools` launching its own profile doesn't error
   — it captures a real, renderable, wrong (logged-out) screen. The probe in §1 is the only defense;
   skipping it produces confidently-wrong captures.
2. **Redaction after the fact is not redaction.** Once a file with PII is written to `captureDir`, the
   damage is the write itself — deleting it later doesn't undo that it existed unmasked on disk even
   briefly. The gate in §5 runs before the write, not after.
3. **URL-only edges collapse the nav graph.** Recording only "screen A then screen B" without the
   causing element+action turns the flow map into an unordered page list — the one artifact costudy
   uniquely produces (that Mobbin can't) is the edge, not the node.
4. **Mobbin is `ios|web` only.** No Android. Don't record Android coverage or gaps against it.
5. **Inferred tokens presented as real tokens is the single most damaging drift.** The token sweep
   (§2) samples one instance per class — always tag `inferred`, always caveat it's a sample, never let
   it read as "Acme's design system says…" downstream.
6. **Bulk-crawl temptation.** A script that walks every discovered link automatically looks more
   thorough than human-paced traversal — it also violates the traversal discipline (§3), risks rate
   limits/ToS, and produces edges with no recorded causing interaction. Resist it even under time
   pressure.
