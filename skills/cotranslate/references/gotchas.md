# cotranslate — cross-project translation gotchas

The traps that recur across every design→implementation port, independent of framework. Each maps
back to a SKILL section.

## 1. Copying a number instead of translating a meaning (§3)

The dominant subtle failure. A param with the same name and an inverted range (`frost`, `opacity`
conventions, `0=off` vs `1=off` flags) reads fine and renders wrong. **Verify the meaning in both
sources.** Record every known inverted param in the manifest's `invertedParams` so the next porter
doesn't re-learn it. Casing and color format count too — normalize before comparing (the parity
script does this for colors; do it by eye for everything else).

## 2. Dropped elements read as "done" (§4)

A screen that renders 8 of 11 depicted children looks finished at a glance. **Enumerate every
depicted child and every depicted state first, check each off.** The failures are whole missing
right-columns, dropped labels/captions, a segmented bar collapsed to a plain one, a missing
empty/dark state — not wrong pixels. Interaction is part of the depiction: a control that looks
right but does nothing FAILS.

## 3. Silent scope reduction (§4)

"macOS static walkthrough," "cosmetic-only," "close enough for this platform" — any unilateral
shrink is a parity violation. A real platform-idiom adaptation is allowed **only flagged for owner
sign-off.** Never self-document a deviation and ship it.

## 4. Forking a primitive because you couldn't find the master (§5, §6)

The porter's rule is "grep for a master; if none, write one." The trap is trusting a tool that fails
silently: `findReferences` / `workspaceSymbol` return empty on an unindexed project, which reads as
"no master exists" → you write a duplicate → you manufacture the exact drift the skill exists to
kill. **`grep` is authoritative for existence. `documentSymbol` is always safe. Reference-counting
is gated behind an index probe** (manifest `lspProbe`). An empty LSP reference result is *unknown*,
not *zero*.

## 5. "Missing knobs" mistaken for "needs a new view" (§5)

When a screen needs a variant the master can't express, the fix is to **extend the master's
customization surface**, not fork. Missing knobs are the tell that the master is under-built, not
that a second view is warranted. Dump the master's real init signature with `documentSymbol`, diff
against what the screen needs, add the knob.

## 6. Single-writer scope blocks the core move (§8)

Extending a master and updating its call sites is inherently multi-file. A "one writer per file"
rule makes the port's central fix unfixable. Scope is **per span** — a master + its call sites are
one unit with one owner.

## 7. Re-implementing sibling loops (§9)

The verify gate is `cotest`. The DRY fold is `coconsolidate`. Carrying copies of either inside the
port is the very duplication `coconsolidate` exists to prevent. Hand off; keep only the
port-specific acceptance criteria.

## 8. Self-accepting the port (§8)

The porter reports `implemented` or `blocked` — never `done`/`fixed`/`accepted`/`pass`. Build and
capture require an orchestrator-granted exclusive runtime lock; independent `cotest` owns
acceptance. A porter that grades its own work is how "similar but not faithful" ships.
