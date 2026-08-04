# critique-manifest.json — schema + worked example

Project facts live here, never in `SKILL.md`. Lives at `.agents/workspace/critique-manifest.json`.

**Ownership.** A human-authored or human-confirmed manifest is a `raw/`-class input — read as source
of truth, never rewritten by the agent. An AI-drafted manifest is AI-owned and every inferred field
must be marked, until the owner confirms it.

**Missing manifest is not a blocker.** Draft it from what's readable (the pitch, the spec, analytics
config, support tickets, the app itself), mark inferred fields, proceed. The evidence rule
(`SKILL.md` §2) already prevents an under-informed critique from over-claiming — a manifest full of
inferred fields simply can't carry a direction verdict on its own.

---

## Schema

```jsonc
{
  "segment": {
    "name": "string — who this critique is about. ONE segment.",
    "description": "string — their situation, not their demographics",
    "confirmed": true                 // false = AI-inferred, caps the verdict
  },

  "job": {
    "statement": "When [situation], I want to [motivation], so I can [expected outcome]",
    "confirmed": true,
    "stagesInScope": ["define", "locate", "prepare", "confirm",
                      "execute", "monitor", "modify", "conclude"]
  },

  "coreTasks": [
    {
      "id": "kebab-id",
      "goal": "string — a USER GOAL, never a click path",
      "frequency": "daily | weekly | monthly | rare",
      "critical": true,               // sits on the job's critical path
      "entryPoint": "string — where the user starts, cold"
    }
  ],

  "surfaces": [
    {
      "id": "kebab-id",
      "name": "string",
      "platform": "ios | android | web | desktop",
      "source": "path/glob/URL — screens, routes, components, or artboards",
      "viewport": "string — e.g. 393x852, 1440x900"
    }
  ],

  "evidenceSources": {
    "analytics": "string|null — tool + how to query, or null",
    "sessionRecordings": "string|null",
    "supportTickets": "string|null",
    "pastResearch": ["path — prior studies, interviews, tests"],
    "benchmarks": {
      "sus": 0,                       // null when unmeasured — do NOT invent
      "seq": 0,
      "pmfVeryDisappointedPct": 0,
      "coreTaskSuccessPct": 0
    },
    "instrumentationGaps": ["string — known-missing metrics"]
  },

  "constraints": {
    "platformConventions": ["iOS HIG", "Material 3"],
    "accessibilityTarget": "WCAG 2.2 AA",
    "mandatoryElements": ["string — legally/contractually required UI"],
    "technical": ["string — e.g. existing layout system, no new deps"],
    "offLimits": ["string — decisions already made and not reopenable"]
  },

  "priorCritiques": ["path — earlier memory-bank records for this surface"]
}
```

### Field notes

- **`segment` is singular.** A job is served differently for different segments; averaging them
  produces a verdict true of nobody. Multiple segments = multiple critiques.
- **`job.statement` must survive your product not existing.** "When I open the app, I want to see my
  dashboard" is a feature statement — rewrite it.
- **`coreTasks[].goal` is a goal, not a route.** "Send money to someone not in my contacts", not
  "tap Send → pick contact → confirm".
- **`benchmarks` values are `null` when unmeasured.** Never fill an invented number; a fabricated
  benchmark converts an `assumed` finding into a fake `observed` one and breaks the evidence rule.
- **`constraints.mandatoryElements`** stops the critique recommending the removal of something legally
  required. **`offLimits`** stops it re-litigating settled decisions.
- **`instrumentationGaps`** is where L5 writes back: each gap becomes an `inbox/` action ask.

---

## Worked example

```json
{
  "segment": {
    "name": "Solo freelancer, first 90 days on the product",
    "description": "Invoices 3-8 clients a month, no accountant, does billing between other work, on mobile as often as desktop",
    "confirmed": true
  },
  "job": {
    "statement": "When I've finished work for a client, I want to get paid without chasing them, so I can stop thinking about it and go back to working",
    "confirmed": true,
    "stagesInScope": ["prepare", "confirm", "execute", "monitor", "modify", "conclude"]
  },
  "coreTasks": [
    { "id": "first-invoice",   "goal": "Get a first invoice out to a new client",           "frequency": "weekly",  "critical": true,  "entryPoint": "Home, cold start" },
    { "id": "know-if-paid",    "goal": "Find out whether a client has paid, without asking", "frequency": "daily",   "critical": true,  "entryPoint": "Push notification or Home" },
    { "id": "chase-late",      "goal": "Nudge a late payer without damaging the relationship","frequency": "weekly",  "critical": true,  "entryPoint": "Invoice list" },
    { "id": "close-the-month", "goal": "Confirm the month is fully settled",                 "frequency": "monthly", "critical": false, "entryPoint": "Reports" }
  ],
  "surfaces": [
    { "id": "invoice-flow", "name": "Create & send invoice", "platform": "ios", "source": "Sources/App/Invoicing/**", "viewport": "393x852" },
    { "id": "invoice-list", "name": "Invoice list & status", "platform": "ios", "source": "Sources/App/Invoicing/List/**", "viewport": "393x852" }
  ],
  "evidenceSources": {
    "analytics": "Amplitude — chart 'invoice_funnel', events invoice_started/sent/viewed/paid",
    "sessionRecordings": null,
    "supportTickets": ".agents/workspace/raw/support-export-2026-Q2.csv",
    "pastResearch": [".agents/workspace/raw/2026-03-freelancer-interviews.md"],
    "benchmarks": {
      "sus": 71,
      "seq": null,
      "pmfVeryDisappointedPct": 31,
      "coreTaskSuccessPct": 64
    },
    "instrumentationGaps": [
      "No event for opening the invoice list without acting — can't tell 'checked if paid' from 'browsing'",
      "No time-to-first-invoice metric for new accounts"
    ]
  },
  "constraints": {
    "platformConventions": ["iOS HIG"],
    "accessibilityTarget": "WCAG 2.2 AA",
    "mandatoryElements": ["Tax ID field on every invoice", "Payment terms disclosure"],
    "technical": ["Must compose from WLDesignSystem masters", "No new third-party payment SDK"],
    "offLimits": ["Subscription pricing model", "The decision to be mobile-first"]
  },
  "priorCritiques": [".agents/skills/cocritique/memory-bank/2026-02-11-invoice-flow.md"]
}
```

**How this manifest shapes the critique.** PMF at 31% is a `25–40%` read — close, not fit — so a
direction verdict is already live and evidence-backed. SUS 71 is above the 68 average while core-task
success is 64%, the classic *likes it and still fails* split, which points L3 at `know-if-paid` and
`chase-late` before anything else. The two instrumentation gaps both sit on `know-if-paid`, so any
finding there is `inferred` at best and the L5 output is "instrument this first". `offLimits` keeps
the verdict away from pricing and platform — the direction change must be found inside the product.
