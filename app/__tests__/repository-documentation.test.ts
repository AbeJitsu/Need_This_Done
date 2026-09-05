import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_ROOT = resolve(__dirname, '..');
const ROOT = resolve(APP_ROOT, '..');

const retainedMarkdown = [
  'AGENTS.md',
  'README.md',
  'ROADMAP.md',
  'app/AGENTS.md',
  'app/lib/AGENTS.md',
  'bridge/README.md',
  'docs/COMMUNICATION_FRAMEWORKS.md',
  'docs/PROJECT_STATUS.md',
  'docs/RELEASE_EVIDENCE.md',
  'docs/launch/LAUNCH_CHECKLIST.md',
  'docs/plans/2026-09-04-emotion-first-public-journey.md',
  'supabase/AGENTS.md',
  'supabase/README.md',
];

function source(path: string) {
  return readFileSync(resolve(ROOT, path), 'utf8');
}

function trackedMarkdown() {
  return execFileSync('git', ['ls-files', '*.md'], { cwd: ROOT, encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean)
    .sort();
}

describe('current repository documentation', () => {
  it('keeps only the current operating record tracked', () => {
    expect(trackedMarkdown()).toEqual(retainedMarkdown);
  });

  it('keeps the README as the single assistant and operating vision', () => {
    expect(source('README.md')).toContain(
      'This is the canonical assistant and operating vision for NeedThisDone.',
    );
    expect(source('ROADMAP.md')).toContain(
      '[canonical assistant and operating vision](README.md#the-assistant-vision--start-here)',
    );
    expect(source('ROADMAP.md')).not.toContain('## The assistant vision');
  });

  it('keeps agent instructions focused on canonical sources and stable boundaries', () => {
    const instructions = source('AGENTS.md');

    expect(instructions).toContain('canonical assistant and operating vision');
    expect(instructions).not.toContain('Website Fix: a $500');
    expect(instructions).not.toContain('Managed Automation: a proposal-based 30-day pilot');
  });
});
