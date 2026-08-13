---
name: coharden
description: A specialized "harden" loop. Systematically enumerate and close edge cases and failure modes after the happy path works — boundaries, nulls, empty/overflow inputs, races, and error paths — so the robust cases get covered, not just the demo. The doer is cohardener. Use after cobuild/cotest pass the happy path, when a surface needs to survive hostile or unusual input before shipping. Optional, on-demand loop; runs standalone or after the core loop. Best on Sonnet (structured enumeration).
---

# coharden — close the edge cases

The doer is **cohardener**. This is the optional, on-demand **harden** loop — structured
enumeration, best run on **Sonnet**. Run it once the happy path works, to systematically close the
failure modes the demo never hit.

## When to Use

- The happy path passes `cotest`, but the surface must survive unusual or hostile input.
- You need to enumerate edge cases deliberately, not discover them in production.
- Before shipping anything with real blast radius (auth, money, data writes, concurrency).

## How to Use

1. **Recall first** — run `colearn` to pull hardening lessons and known failure-mode checklists.
2. **Enumerate the surface** — list every input, state, and path: boundaries, nulls/empties,
   overflow, malformed input, races/concurrency, error/timeout paths, permission edges.
3. **Rank by blast radius × likelihood** and close the worst first.
4. **Close each case** — add the guard, the test, or the error path; re-run `cotest`.
5. **Simplify** — run `/code-review` and `/simplify` so hardening doesn't add accidental
   complexity. A new defect found while hardening jumps to `codebug`.

## Native tooling

`/code-review` (find correctness gaps in the diff) · `/simplify` (keep hardening lean) ·
`/verify` / `cotest` (re-check each closed case) · **Agent** (parallel case sweeps) · hand
defects to `codebug`, the hardened result to `cochangelog`, and recurring failure-classes to
`colearn`.

## Memory Bank

> **Storage:** Resolve `workspaceRoot` from `.agents/workspace/cocreation.yaml` (default `.agents`).
> In `local`, write the full record to `<workspaceRoot>/skills/<name>/memory-bank/` and refresh its
> index. In `linear-primary`, write the human-facing artifact through the active backend and keep
> provider metadata, links, and the local navigation/index cache; never write project records into
> the plugin cache.


Save each hardening pass as `YYYY-MM-DD-kebab-title.md`:
```
.agents/skills/coharden/memory-bank/2026-06-26-payment-webhook.md
```
Copy `_template.md`, keep its frontmatter (`title`, `date`, `status`) filled.
`HARDENING.md` is the auto-generated index — never edit it by hand. After changes:
`node .agents/skills/coharden/index.mjs`.

## Self-eval gate (close the loop)

- **Edge cases enumerated and closed, verify green** → PASS to `cochangelog`.
- **Cases still open or coverage thin** → re-loop: re-harden.
- **Hardening surfaced a real defect** → jump to `codebug`, then resume.
- **Needs a risk/trade-off judgment call** → escalate to the human.

## Principles

- Enumerate deliberately — boundaries, nulls, races, error paths — don't wait for production.
- Rank by blast radius × likelihood; close the worst first.
- Re-verify every closed case; an untested guard is a guess.
- Keep it lean — harden without piling on accidental complexity.
- Close the loop: graduate recurring failure-classes into guardrails via `colearn`.
