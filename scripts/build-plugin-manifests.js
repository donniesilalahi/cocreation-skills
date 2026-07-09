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

function writeJson(relPath, obj) {
  const fullPath = path.join(repoRoot, relPath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, JSON.stringify(obj, null, 2) + '\n')
  console.log(`wrote ${relPath}`)
}

// .claude-plugin/plugin.json
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

console.log(`Generated 6 manifests for ${actualSkillCount} skills.`)
