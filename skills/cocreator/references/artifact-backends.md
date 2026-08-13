# Artifact backends

The co-creation system has one workflow and multiple storage backends. The backend changes where
an artifact is persisted; it does not change the artifact's owner, lifecycle, or review gate.

## Project boundary

Every consuming project owns a configuration file at:

```text
.agents/workspace/cocreation.yaml
```

The file records the human's storage choice and the product's external location. It is project
configuration, not plugin state. If `workspaceRoot` is omitted, use `.agents`.

Resolve the roots once at workflow start:

```text
<workspaceRoot>/workspace/   STATE.md · inbox/ · raw/ · working files
<workspaceRoot>/skills/      project-owned memory-bank records and indexes
```

This supports a shared product workspace outside a repository. Each repository keeps a small
`.agents/workspace/cocreation.yaml` pointer, while multiple repositories may point at the same
`workspaceRoot`.

## Storage modes

| Mode | Canonical content | Local files |
| --- | --- | --- |
| `local` | Markdown records in the resolved workspace | Full records and generated indexes |
| `linear-primary` | Linear documents, comments, issues, and updates | State, metadata, links, and a navigation/index cache |
| `mirror` | Both, with explicit conflict detection | Full records plus Linear copies; migration mode only |

Missing configuration means `local`. Never infer `linear-primary` from the presence of a Linear
URL, and never silently switch modes.

## Artifact-store contract

Loops address semantic operations, not provider-specific calls:

1. `resolveContext` — load the config, workspace root, product scope, and current project.
2. `readHead` — read `STATE.md`, the open handoff queue, and the current SSOT pointer.
3. `readIndex(kind)` — read the relevant skill index or Linear catalog.
4. `readArtifact(ref)` — fetch one record/document by its stable reference.
5. `writeArtifact(kind, content, refs)` — create or update the artifact through the active backend.
6. `writeHandoff(ask)` — persist a decision, action, or review ask.
7. `recordLink` — store provider IDs, URLs, revisions, and content hashes.
8. `checkConflict` — refuse an overwrite when the human or another run changed the artifact.

`FilesystemStore` implements the current behavior. `LinearStore` maps these operations to Linear
documents, issues/comments, and project/initiative updates. The skills should not hard-code a
Linear tool name because hosts expose the connector differently.

## Index-first invariant

Index-first survives every backend:

1. Read the resolved `STATE.md` and inbox.
2. Read the relevant local skill index or generated Linear catalog.
3. Open only the records needed for the next loop.
4. Write the artifact, then refresh the index/catalog.

In `linear-primary`, the local index is a cache of Linear metadata and links, not a second copy of
the full document. Human edits in Linear are authoritative. A changed revision or content hash
must produce a proposed revision or review handoff instead of a silent overwrite.

## Record metadata

Local records may carry provider metadata in flat frontmatter so existing indexers remain usable:

```yaml
provider: linear
linearDocument: https://linear.app/acme/document/...
linearRevision: 42
linearContentHash: sha256:...
```

Provider metadata is optional in `local` mode. Stable record filenames and lifecycle fields remain
unchanged; status is still a field, never a folder or filename.
