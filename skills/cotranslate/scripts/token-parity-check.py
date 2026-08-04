#!/usr/bin/env python3
"""
token-parity-check.py — manifest-driven drift detector for design→implementation ports.

Diffs the DESIGN token source against the IMPLEMENTATION token source and flags every value
mismatch. Both sides — paths, formats, and which token groups to compare — are read from a
`translate-manifest.json`, so this script carries ZERO project-specific facts (that is the whole point
of generalizing it out of any one project).

This is the "verify each token's SEMANTICS in BOTH sources before translating" step (SKILL §3),
done mechanically so a stale/placeholder token can't slip through an eyeball pass. It is a
GUARDRAIL, not a fixer — it never edits either file. Exit 0 = full parity on shared keys; exit 1 =
at least one DRIFT (CI-friendly); exit 2 = the manifest itself is missing/unusable.

Manifest `parity` block (see references/translate-manifest.md):

    "parity": {
      "source": { "path": "<design token file>", "format": "jsx-object",
                  "blocks": ["zone", "onArt", "light", "dark"] },
      "target": { "path": "<impl token file>",   "format": "json",
                  "groups": { "zone": "zone", "onArt": "onArt",
                              "light": ["surface.light", "ink.light"],
                              "dark":  ["surface.dark",  "ink.dark"] } }
    }

Supported formats (either side):
  - "jsx-object": extract named object literals from a JS/JSX file. `blocks` lists the object keys;
    each block's group name IS the block key, so it aligns with the other side by name.
  - "json": load a JSON file. `groups` maps a group name to a dotted path (or list of paths) whose
    leaf string values are the tokens. Multiple paths are merged (e.g. surface+ink → "light").

Groups are compared by NAME across the two sides. A key present on the target side but not found on
the source side is reported as INFO (naming / manual-review), never as DRIFT — those often live in
impl code (type scale, frame, radius, spacing), not the shared token file.
"""
import argparse
import json
import os
import re
import sys


def norm(color: str) -> str:
    """Normalize a CSS color literal to lowercase #rrggbb or #rrggbbaa for comparison."""
    c = str(color).strip().strip("'\"").lower()
    m = re.match(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)", c)
    if m:
        r, g, b = int(m.group(1)), int(m.group(2)), int(m.group(3))
        out = f"#{r:02x}{g:02x}{b:02x}"
        if m.group(4) is not None:
            a = round(float(m.group(4)) * 255)
            out += f"{a:02x}"
        return out
    return c


def is_color_leaf(val) -> bool:
    if not isinstance(val, str):
        return False
    c = val.strip().strip("'\"").lower()
    return c.startswith("#") or c.startswith("rgb")


# --- jsx-object extraction ---------------------------------------------------

def extract_block(src: str, key: str) -> dict:
    """Grab a `key: { ... }` object literal from a JS/JSX file → {name: normColor}."""
    i = src.find(f"{key}: {{")
    if i < 0:
        i = src.find(f"{key}:{{")
    if i < 0:
        return {}
    brace = src.find("{", i)
    depth, j = 0, brace
    while j < len(src):
        if src[j] == "{":
            depth += 1
        elif src[j] == "}":
            depth -= 1
            if depth == 0:
                break
        j += 1
    body = src[brace + 1 : j]
    out = {}
    for name, val in re.findall(
        r"(\w+)\s*:\s*('(?:[^']*)'|\"(?:[^\"]*)\"|#[0-9A-Fa-f]+|rgba?\([^)]*\))", body
    ):
        out[name] = norm(val)
    return out


def load_jsx_object(spec: dict) -> dict:
    src = open(spec["path"], encoding="utf-8").read()
    return {block: extract_block(src, block) for block in spec.get("blocks", [])}


# --- json extraction ---------------------------------------------------------

def dig(obj, dotted: str):
    cur = obj
    for part in dotted.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return {}
        cur = cur[part]
    return cur if isinstance(cur, dict) else {}


def leaves(obj: dict) -> dict:
    return {
        k: norm(v)
        for k, v in obj.items()
        if not k.startswith("$") and k != "note" and is_color_leaf(v)
    }


def load_json_groups(spec: dict) -> dict:
    raw = json.load(open(spec["path"], encoding="utf-8"))
    out = {}
    for group, paths in spec.get("groups", {}).items():
        if isinstance(paths, str):
            paths = [paths]
        merged = {}
        for p in paths:
            merged.update(leaves(dig(raw, p)))
        out[group] = merged
    return out


def load(spec: dict, side: str) -> dict:
    fmt = spec.get("format")
    if fmt == "jsx-object":
        return load_jsx_object(spec)
    if fmt == "json":
        return load_json_groups(spec)
    sys.stderr.write(
        f"error: {side}.format '{fmt}' unsupported (use 'jsx-object' or 'json'). "
        f"A project whose token shape fits neither needs a per-project adapter — see "
        f"references/translate-manifest.md.\n"
    )
    sys.exit(2)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--manifest", default=".agents/workspace/translate-manifest.json")
    args = ap.parse_args()

    if not os.path.exists(args.manifest):
        sys.stderr.write(
            f"error: no manifest at {args.manifest}. cotranslate SKILL §0 — draft a translate-manifest "
            f"(references/translate-manifest.md) and get owner confirmation before porting.\n"
        )
        return 2
    manifest = json.load(open(args.manifest, encoding="utf-8"))
    parity = manifest.get("parity")
    if not parity or "source" not in parity or "target" not in parity:
        sys.stderr.write(
            "error: manifest has no usable `parity.source` / `parity.target` block. "
            "See references/translate-manifest.md.\n"
        )
        return 2

    design = load(parity["source"], "source")
    impl = load(parity["target"], "target")

    drifts, oks, infos = [], [], []
    for group in impl:
        d, s = design.get(group, {}), impl.get(group, {})
        for name, sval in s.items():
            dval = d.get(name)
            if dval is None:
                infos.append((group, name, sval, "not-found-in-design-source"))
            elif dval == sval:
                oks.append((group, name, sval))
            else:
                drifts.append((group, name, dval, sval))

    src_p, tgt_p = parity["source"]["path"], parity["target"]["path"]
    print(f"=== token parity: design {src_p}  vs  impl {tgt_p} ===\n")
    print(f"  PASS: {len(oks)}   DRIFT: {len(drifts)}   INFO: {len(infos)}\n")
    if drifts:
        print("  DRIFT (design SSOT vs impl — reconcile before translating):")
        for group, name, dval, sval in drifts:
            print(f"    ✗ {group}.{name:14}  design={dval:12}  impl={sval}")
        print()
    if infos:
        print("  INFO (in impl, not matched in design source — check naming / read manually):")
        for group, name, sval, why in infos:
            print(f"    · {group}.{name:14}  impl={sval:12}  ({why})")
        print()
    if oks:
        print(f"  PASS: {', '.join(f'{g}.{n}' for g, n, _ in oks)}")
    print()
    return 1 if drifts else 0


if __name__ == "__main__":
    sys.exit(main())
