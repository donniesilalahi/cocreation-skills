#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

// Generates every plugin/marketplace manifest (Claude Code, Codex, Cursor)
// from a single source: package.json + a scan of skills/*/SKILL.md. This is
// the single source of truth for the manifest layer — do not hand-edit the
// generated files, they get overwritten on every run. See
// docs/cocreator/PACKAGING.md for the design of record.
//
// Idempotent by construction: fixed key order + JSON.stringify(obj, null, 2)
// + trailing newline means re-running with no source change produces byte-
// identical output, so this is safe to wire into `prepack` / pre-commit
// without spurious diffs.

const repoRoot = process.cwd()

const PLUGIN_NAME = 'cocreation'
const MARKETPLACE_NAME = 'cocreation-skills'
const OWNER = { name: 'Donnie Silalahi', email: 'donniesilalahi@gmail.com' }

const pkg = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'),
)

const REPO_URL = pkg.repository.url
  .replace(/^git\+/, '')
  .replace(/\.git$/, '')

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const data = {}
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (m) data[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return data
}

const skillsRoot = path.join(repoRoot, 'skills')
const skillNames = []
for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const skillFile = path.join(skillsRoot, entry.name, 'SKILL.md')
  if (!fs.existsSync(skillFile)) continue
  const content = fs.readFileSync(skillFile, 'utf8')
  const frontmatter = parseFrontmatter(content)
  skillNames.push(frontmatter.name || entry.name)
}

// The doer roster — skill (loop) -> doer (sub-agent) -> model tier. cocreator
// is the orchestrator, not a doer, so it has no entry here. Order is stable
// (matches skills/cocreator/SKILL.md's roster table) so regeneration is
// deterministic.
const ROSTER = [
  ['codirect', 'codirector', 'opus'],
  ['coresearch', 'coresearcher', 'opus'],
  ['costudy', 'costudier', 'sonnet'],
  ['coplan', 'coplanner', 'sonnet'],
  ['cospecify', 'cospecifier', 'sonnet'],
  ['cochallenge', 'cochallenger', 'opus'],
  ['cobuild', 'cobuilder', 'sonnet'],
  ['cotest', 'cotester', 'haiku'],
  ['codebug', 'codebugger', 'opus'],
  ['cochangelog', 'cochangelogger', 'haiku'],
  ['colearn', 'colearner', 'sonnet'],
  ['cocritique', 'cocritic', 'opus'],
  ['coconsolidate', 'coconsolidator', 'sonnet'],
  ['coharden', 'cohardener', 'sonnet'],
  ['codraw', 'codrawer', 'sonnet'],
  ['cotranslate', 'cotranslator', 'sonnet'],
]

// Short hand-summary purpose clauses (<=15 words), one per roster skill —
// pulled from each skill's SKILL.md description frontmatter.
const PURPOSES = {
  codirect:
    'set product + design direction, fix the appetite, and write a tight pitch',
  cochallenge:
    'devil-advocate the direction/spec/plan pre-build — stress-test reasoning, surface blindspots',
  coresearch:
    'gather evidence and red-team the riskiest load-bearing assumption first',
  costudy:
    "reverse-engineer another product's UI/UX into a git-tracked study ledger + OD canvases",
  coplan: 'break a non-trivial task into clear, tracked, verifiable steps',
  cospecify:
    'author the buildable solution spec — screens, states, data shapes, interfaces',
  cobuild: 'implement against the plan in small, reviewable increments',
  cotest: 'systematic QA testing of built output against design artboards or specs',
  codebug:
    'systematically diagnose root causes for bugs and unexpected behavior',
  cochangelog: 'record what shipped as a simple, dated changelog list',
  colearn: 'capture, recall, and graduate lessons into guardrails',
  cocritique:
    'judge whether the product does the user’s job optimally, and what direction change that implies',
  coconsolidate:
    'fold duplicated logic — and drifted UI elements — into one customizable master',
  coharden:
    'enumerate and close edge cases and failure modes after the happy path works',
  codraw:
    'render a design spec into faithful, state-by-state OD artboards + a git-tracked ledger',
  cotranslate:
    'faithfully port a design source into native UI with zero drift',
}

// Extra numbered steps inserted before the closing "return only the verdict"
// step, for loops whose guardrails are load-bearing enough that the doer must
// carry them even before it opens its SKILL.md. Keep each to one or two lines —
// the SKILL.md remains the full operating guide.
const EXTRA_STEPS = {
  cochallenge: [
    'You are the evaluator, never the generator: challenge only artifacts you did not produce, from fresh context — read the artifact + raw inputs, not its author’s reasoning.',
    'Issue exactly one verdict — HOLDS / HOLED / COLLAPSES / UNKNOWN — with the findings that carry it. Never edit the artifact; route instead (generator re-run, codirect, or coresearch).',
  ],
  cocritique: [
    'Walk the ladder outside-in (job → outcome → journey → interface → signal); never open at the interface.',
    'Tag every finding `observed | inferred | assumed` and respect the verdict ceiling — a direction verdict needs an `observed` finding on the outcome or signal lens; otherwise issue **UNKNOWN** with the cheapest test. Never bank a direction change on inspection alone.',
    'You **propose**; you never rewrite. Do not edit the pitch, the spec, or `STATE.md`’s SSOT pointer — file an `inbox/` decision ask and route.',
  ],
}

// agents/<doer>.md — one doer sub-agent per roster entry. Deterministic
// (stable roster order, fixed template) so re-running is idempotent.
const agentsDir = path.join(repoRoot, 'agents')
fs.mkdirSync(agentsDir, { recursive: true })
const opencodeAgentsDir = path.join(repoRoot, '.opencode', 'agents')
fs.mkdirSync(opencodeAgentsDir, { recursive: true })
for (const [skill, doer, model] of ROSTER) {
  const purpose = PURPOSES[skill]
  const steps = [
    `Read \`\${CLAUDE_PLUGIN_ROOT}/skills/${skill}/SKILL.md\` — that is your full operating guide.`,
    `Run the \`${skill}\` loop on the task you are given.`,
    ...(EXTRA_STEPS[skill] || []),
    `Write your memory-bank record under the consumer project's \`.agents/skills/${skill}/memory-bank/\` (create it if missing) — never inside the plugin.`,
    'Return ONLY your self-eval verdict + artifact pointers (record path, files touched) — not your full working transcript.',
  ]
  const content = `---
name: ${doer}
description: Doer sub-agent for the ${skill} loop — ${purpose}. Spawn from cocreator to run the ${skill} loop. Runs on ${model}.
model: ${model}
---

You are **${doer}**, the doer sub-agent for the \`${skill}\` loop.

${steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
`
  fs.writeFileSync(path.join(agentsDir, `${doer}.md`), content)
  console.log(`wrote agents/${doer}.md`)

  const extraSteps = EXTRA_STEPS[skill] || []
  const opencodeContent = `---
name: ${doer}
description: Doer sub-agent for the ${skill} loop — ${purpose}. Spawn from cocreator to run the ${skill} loop.
mode: subagent
---

You are **${doer}**, the doer sub-agent for the \`${skill}\` loop.

1. Read \`.agents/skills/${skill}/SKILL.md\` — that is your full operating guide. If it is not installed, read \`skills/${skill}/SKILL.md\` from this repository.
2. Run the \`${skill}\` loop on the task you are given.
${extraSteps.map((step, i) => `${i + 3}. ${step}`).join('\n')}${extraSteps.length ? '\n' : ''}${extraSteps.length + 3}. Write your memory-bank record under the consumer project's \`.agents/skills/${skill}/memory-bank/\` (create it if missing) — never inside the plugin.
${extraSteps.length + 4}. Return ONLY your self-eval verdict + artifact pointers (record path, files touched) — not your full working transcript.
`
  fs.writeFileSync(path.join(opencodeAgentsDir, `${doer}.md`), opencodeContent)
  console.log(`wrote .opencode/agents/${doer}.md`)
}

function writeJson(relPath, obj) {
  const fullPath = path.join(repoRoot, relPath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, JSON.stringify(obj, null, 2) + '\n')
  console.log(`wrote ${relPath}`)
}

// .claude-plugin/plugin.json
// NOTE: no "agents" field here — Claude Code's plugin.json schema rejects it
// (validated: `claude plugin validate .` errors "agents: Invalid input").
// Like skills/, components at the plugin root auto-discover: an agents/ dir
// is picked up with no manifest entry needed (confirmed against other
// installed plugins' cache, e.g. code-simplifier, posthog — neither
// declares "agents" in plugin.json despite shipping an agents/ dir).
writeJson('.claude-plugin/plugin.json', {
  name: PLUGIN_NAME,
  version: pkg.version,
  description: pkg.description,
  author: pkg.author,
  homepage: REPO_URL,
  repository: REPO_URL,
  license: pkg.license,
  keywords: pkg.keywords,
})

// .claude-plugin/marketplace.json (overwrites the old hand-written version)
writeJson('.claude-plugin/marketplace.json', {
  name: MARKETPLACE_NAME,
  owner: OWNER,
  metadata: { description: pkg.description, version: pkg.version },
  plugins: [
    {
      name: PLUGIN_NAME,
      source: './',
      description: pkg.description,
      strict: false,
    },
  ],
})

// .codex-plugin/plugin.json
writeJson('.codex-plugin/plugin.json', {
  name: PLUGIN_NAME,
  version: pkg.version,
  description: pkg.description,
  author: pkg.author,
  homepage: REPO_URL,
  repository: REPO_URL,
  license: pkg.license,
  keywords: pkg.keywords,
  skills: './skills/',
  agents: './agents/',
  interface: {
    displayName: 'Cocreation Skills',
    shortDescription:
      'The co-* loop ecosystem for human-AI product co-creation.',
    category: 'Productivity',
  },
})

// .agents/plugins/marketplace.json (Codex marketplace index)
writeJson('.agents/plugins/marketplace.json', {
  name: MARKETPLACE_NAME,
  interface: { displayName: 'Cocreation Skills' },
  plugins: [
    {
      name: PLUGIN_NAME,
      source: { source: 'local', path: './' },
      policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
      category: 'Productivity',
    },
  ],
})

// .cursor-plugin/plugin.json
writeJson('.cursor-plugin/plugin.json', {
  name: PLUGIN_NAME,
  displayName: 'Cocreation Skills',
  version: pkg.version,
  description: pkg.description,
  author: OWNER,
  homepage: REPO_URL,
  repository: REPO_URL,
  license: pkg.license,
  keywords: pkg.keywords,
  category: 'productivity',
  tags: ['skills', 'workflow', 'co-creation'],
  skills: './skills/',
  agents: './agents/',
})

// .cursor-plugin/marketplace.json
writeJson('.cursor-plugin/marketplace.json', {
  name: MARKETPLACE_NAME,
  owner: OWNER,
  metadata: { description: pkg.description },
  plugins: [
    { name: PLUGIN_NAME, source: '.', description: pkg.description },
  ],
})

const actualSkillCount = fs
  .readdirSync(skillsRoot, { withFileTypes: true })
  .filter(
    (e) =>
      e.isDirectory() &&
      fs.existsSync(path.join(skillsRoot, e.name, 'SKILL.md')),
  ).length

if (skillNames.length !== actualSkillCount || actualSkillCount === 0) {
  console.error(
    `Skill count mismatch: scanned ${skillNames.length}, found ${actualSkillCount} SKILL.md files.`,
  )
  process.exit(1)
}

console.log(
  `Generated 6 manifests for ${actualSkillCount} skills and ${ROSTER.length} agents for Claude/Codex/Cursor/OpenCode.`,
)
