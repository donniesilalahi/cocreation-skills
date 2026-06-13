#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

// Regenerates every skill's memory-bank index by running each skill's own
// index.js, so there is a single source of truth for the indexing logic.

const skillsRoot = path.join(process.cwd(), 'skills')

for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const indexScript = path.join(skillsRoot, entry.name, 'index.js')
  if (!fs.existsSync(indexScript)) continue
  execSync(`node "${indexScript}"`, { stdio: 'inherit' })
}

console.log('Done.')
