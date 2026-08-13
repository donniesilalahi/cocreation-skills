---
name: coresearch
description: The "research" loop. Gather evidence and test the assumptions a plan rests on — red-teaming the riskiest one first by ranking assumptions by the cheapest test, so the load-bearing belief gets disproven (or confirmed) before anyone builds on it. The doer is coresearcher. Use at the discovery/evidence stage when a decision hinges on an unverified claim or a load-bearing assumption from codirect. Optional loop; runs standalone or hands a verdict back to coplan or codirect. Best on Opus (judgment-heavy).
---

# coresearch — test the assumptions

The doer is **coresearcher**. This is the optional **research** loop at the discovery/evidence
stage — judgment-heavy, best run on **Opus**. Pull risk forward: disprove the load-bearing
assumption cheaply, before the build rests on it.

## When to Use

- A decision hinges on an unverified claim or a load-bearing assumption (often from `codirect`).
- `cochallenge` returned UNKNOWN — its challenge hinges on evidence that doesn't exist yet; the
  cheapest test it named enters this loop's queue.
- You need evidence — facts, prior art, feasibility — before committing a plan.
- The riskiest assumption could sink the work if it's wrong.

## How to Use

1. **Recall first** — run `colearn` to pull lessons relevant to this question.
2. **List the assumptions** the work rests on; mark which are load-bearing.
3. **Rank by cheapest test** — the one that's both riskiest and quickest to check goes first.
4. **Red-team the riskiest first** — try to disprove it, not confirm it. Gather evidence with
   `WebSearch` / `WebFetch`, or the `deep-research` skill for multi-source, fact-checked depth.
5. **Record a verdict** per question (confirmed / refuted / inconclusive) with cited evidence.

## Native tooling

`WebSearch` / `WebFetch` (gather + verify sources) · `deep-research` skill (fan-out, adversarial
verification, cited report) · **Agent** (parallel probes) · hand the verdict to `coplan` or
`codirect`, and any recurring research lesson to `colearn`.

## Memory Bank

> **Storage:** Resolve `workspaceRoot` from `.agents/workspace/cocreation.yaml` (default `.agents`).
> In `local`, write the full record to `<workspaceRoot>/skills/<name>/memory-bank/` and refresh its
> index. In `linear-primary`, write the human-facing artifact through the active backend and keep
> provider metadata, links, and the local navigation/index cache; never write project records into
> the plugin cache.


Save each question as `YYYY-MM-DD-kebab-title.md`:
```
.agents/skills/coresearch/memory-bank/2026-06-26-webhook-rate-limits.md
```
Copy `_template.md`, keep its frontmatter (`title`, `date`, `verdict`, `status`) filled.
`RESEARCH.md` is the auto-generated index — never edit it by hand. After changes:
`node .agents/skills/coresearch/index.mjs`.

## Self-eval gate (close the loop)

- **Riskiest assumptions tested, verdict cited** → PASS to `coplan` or back to `codirect`.
- **Evidence is thin or contradictory** → re-loop: dig deeper / widen sources.
- **Needs a judgment call the evidence can't settle** → escalate to the human.

## Principles

- Red-team, don't cheerlead: try to break the assumption, not bless it.
- Test the cheapest-riskiest first — order by expected information per minute.
- Cite both sides; an unsourced verdict is an opinion.
- The cheapest bug is the one you refuted before building.
- Close the loop: feed durable findings to `colearn`.
