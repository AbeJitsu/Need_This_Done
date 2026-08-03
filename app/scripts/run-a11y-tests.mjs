import { spawnSync } from 'node:child_process'
import process from 'node:process'

const nodeMajor = Number.parseInt(process.versions.node.split('.')[0], 10)
const childEnvironment = { ...process.env }

// Node 25 exposes Web Storage globally and warns in Vitest workers unless a
// persistence path is supplied. Older CI runtimes reject this flag in
// NODE_OPTIONS, so only set it where Node requires it.
if (nodeMajor >= 25) {
  const storageOption = '--localstorage-file=/tmp/needthisdone-vitest-localstorage'
  childEnvironment.NODE_OPTIONS = [childEnvironment.NODE_OPTIONS, storageOption]
    .filter(Boolean)
    .join(' ')
}

const result = spawnSync(
  process.execPath,
  [
    'node_modules/vitest/vitest.mjs',
    'run',
    '--config',
    'vitest.a11y.config.ts',
  ],
  {
    env: childEnvironment,
    stdio: 'inherit',
  },
)

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 1)
