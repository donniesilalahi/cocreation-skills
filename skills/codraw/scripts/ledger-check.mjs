#!/usr/bin/env node
// ledger-check.mjs — mechanical guardrail for the codraw design ledger.
//
// Enforces the invariant naming rules (SKILL §4/§5) so a mistyped or drifted artboard name can't
// slip into the ledger unnoticed: every entry's `name` matches the convention's segment arity, its
// last segment is the `state`, and that state is in the controlled vocabulary. It NEVER edits the
// ledger — it only reports. Exit 0 = clean · 1 = at least one violation · 2 = manifest/ledger unusable.
//
// Usage:
//   node ledger-check.mjs [--manifest PATH] [--ledger PATH]
//   COCREATION_WORKSPACE_ROOT=../product-cocreation node ledger-check.mjs
//
// The ledger is self-describing (it embeds its own `convention` + `stateVocab`), so those are used
// as authoritative; the manifest is only read to locate the ledger when --ledger isn't given.

import fs from 'node:fs'
import path from 'node:path'

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag)
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

function fail(msg, code) {
  process.stderr.write(`error: ${msg}\n`)
  process.exit(code)
}

const workspaceRoot = process.env.COCREATION_WORKSPACE_ROOT || '.agents'
const manifestPath = arg(
  '--manifest',
  path.join(workspaceRoot, 'workspace', 'design-manifest.json'),
)
let ledgerPath = arg('--ledger', null)

if (!ledgerPath) {
  if (!fs.existsSync(manifestPath)) {
    fail(
      `no ledger given and no manifest at ${manifestPath}. codraw SKILL §0 — draft a ` +
        `design-manifest (references/design-manifest.md) or pass --ledger PATH.`,
      2,
    )
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  ledgerPath = manifest.ledgerPath
  if (!ledgerPath) fail(`manifest has no "ledgerPath". See references/design-manifest.md.`, 2)
}

if (!fs.existsSync(ledgerPath)) fail(`no ledger at ${ledgerPath}.`, 2)

let ledger
try {
  ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'))
} catch (e) {
  fail(`ledger at ${ledgerPath} is not valid JSON: ${e.message}`, 2)
}

const convention = ledger.convention
if (!convention || !convention.includes('__')) {
  fail(`ledger has no usable "convention" (expected a "{a}__{b}__…__{state}" template).`, 2)
}
// arity = number of "__"-joined segments in the template's name part (strip any trailing prose after a space/em-dash)
const conventionArity = convention.split(/\s|—/)[0].split('__').length
const stateVocab = new Set(ledger.stateVocab || [])
if (stateVocab.size === 0) fail(`ledger has an empty "stateVocab".`, 2)

const artboards = Array.isArray(ledger.artboards) ? ledger.artboards : []
const violations = []

for (const [i, a] of artboards.entries()) {
  const where = a.name || a.id || `#${i}`
  if (!a.name) {
    violations.push([where, 'missing "name"'])
    continue
  }
  const segs = a.name.split('__')
  if (segs.length !== conventionArity) {
    violations.push([a.name, `has ${segs.length} segments, convention expects ${conventionArity}`])
  }
  const last = segs[segs.length - 1]
  if (!stateVocab.has(last)) {
    violations.push([a.name, `trailing state "${last}" not in stateVocab`])
  }
  if (a.state != null && a.state !== last) {
    violations.push([a.name, `name ends in "${last}" but state field is "${a.state}"`])
  }
  if (a.state != null && !stateVocab.has(a.state)) {
    violations.push([a.name, `state field "${a.state}" not in stateVocab`])
  }
  if (!a.id) {
    violations.push([a.name, 'missing "id" (traceability to the hand-off spec)'])
  }
}

console.log(`=== codraw ledger check: ${ledgerPath} ===`)
console.log(`  entries: ${artboards.length}   convention arity: ${conventionArity}   vocab: ${stateVocab.size}\n`)
if (violations.length === 0) {
  console.log(`  OK — every entry matches the convention and state vocab.`)
  process.exit(0)
}
console.log(`  VIOLATIONS (${violations.length}):`)
for (const [name, why] of violations) console.log(`    ✗ ${name}\n        ${why}`)
process.exit(1)
