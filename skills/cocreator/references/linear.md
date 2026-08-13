# Linear backend

Linear is an optional artifact backend. Use the project configuration's `product.type` to choose
the product root explicitly:

- `initiative` — the product is a strategic objective that groups projects, possibly across
  multiple execution teams.
- `team` — the product is a durable team or work area with its own team documents and projects.

Do not ask every loop to rediscover this choice. `cocreator` resolves it once and passes the same
`ProductContext` to every doer:

```text
product.type · product.id · product.url · product.name
linear.workspaceUrl · linear.project · linear.executionTeams
```

## Mapping by loop

| Loop | Linear-native representation | Source-of-truth boundary |
| --- | --- | --- |
| `codirect` | Product-root document | Intent remains owned by direction |
| `coresearch` | Product/project research document; evidence links | Evidence is signal, not intent |
| `costudy` | Study document with screenshots/canvas links | Open Design/local ledger owns captured structure |
| `coplan` | Project plan document plus child issues | Plan owns work order |
| `cospecify` | Project or issue document | Spec owns solution and acceptance |
| `cochallenge` | Challenge document plus decision/review issue | Findings never rewrite the artifact |
| `codraw` | Artboard links, screenshots, and design ledger reference | Open Design/Figma and the ledger own pixels |
| `cobuild` | Issue comments, PR links, project updates | Code remains in the repository |
| `cotest` | QA document, captures, and linked fix issues | QA is a conformance signal |
| `codebug` | Diagnosis comment/document and linked defect issue | Diagnosis is not a replacement spec |
| `coharden` | Hardening document plus edge-case issues | Hardening closes failure modes |
| `coconsolidate` | One-master map plus migration issues | The selected master remains explicit |
| `cotranslate` | Translation manifest document with design/code links | Design/code conflict ladder remains intact |
| `cocritique` | Critique document plus human decision issue | Direction changes require review |
| `cochangelog` | Project/initiative update and optional release document | Changelog stays a concise record |
| `colearn` | Team/product lessons document | Lessons remain atomic and searchable |

Use project or initiative status updates for concise health, progress, risks, and next steps. Do
not put the complete artifact history only in a status update; keep the durable document and link
the update to it.

## Human handoffs

Represent `inbox/` asks as Linear issues with a stable `cocreation-*` label and a link to the
artifact that needs attention:

- `decision` — human chooses between options; resolve with a comment or explicit status.
- `action` — human completes external setup or review; resolve with a confirmation comment.
- `review` — human approves or requests changes; preserve the review trail.

Never mark a workflow complete while a blocking handoff or an unconfirmed default remains open.

## Write safety

Before updating a Linear document, read its latest revision and compare the stored
`linearRevision`/`linearContentHash`. If it changed outside the current run, preserve the human
edit and create a proposed revision or review issue. Do not overwrite it just because the local
record is older.

Do not store API keys or OAuth tokens in `cocreation.yaml`; authentication belongs to the host's
Linear connector or agent installation.
