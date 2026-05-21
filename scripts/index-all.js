#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const skillsDir = path.dirname(fileURLToPath(import.meta.url))

for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue

  const skillPath = path.join(skillsDir, entry.name)
  const indexScript = path.join(skillPath, 'index.js')

  if (!fs.existsSync(indexScript)) continue

  try {
    execSync(`node "${indexScript}"`, { stdio: 'inherit' })
  } catch {
    // ignore errors from individual skills
  }
}
