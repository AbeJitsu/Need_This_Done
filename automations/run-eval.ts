#!/usr/bin/env tsx
// ============================================================================
// Auto-Eval Runner
// ============================================================================
// What: Spawns Claude Code sessions to audit and fix the codebase
// Why: Automated quality maintenance without manual intervention
// How: Rotates through 4 eval types (frontend, backend, functionality, memory),
//      spawns `claude --print` with the appropriate prompt, logs results
//
// Usage:
//   tsx automations/run-eval.ts                    # Auto-rotate through types
//   tsx automations/run-eval.ts --type frontend    # Specific type
//   tsx automations/run-eval.ts --all              # Run all 4 types sequentially
//   tsx automations/run-eval.ts --dry-run          # Show what would run

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';

// ============================================================================
// Configuration
// ============================================================================

const EVAL_TYPES = ['frontend', 'backend', 'functionality', 'memory'] as const;
type EvalType = (typeof EVAL_TYPES)[number];

const PROJECT_ROOT = join(dirname(new URL(import.meta.url).pathname), '..');
const AUTOMATIONS_DIR = join(PROJECT_ROOT, 'automations');
const LOCK_FILE = join(AUTOMATIONS_DIR, '.eval-lock');
const INDEX_FILE = join(AUTOMATIONS_DIR, '.eval-index');
const LOG_FILE = join(AUTOMATIONS_DIR, 'eval-log.json');
const TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes

// ============================================================================
// CLI Argument Parsing
// ============================================================================

interface CliArgs {
  type?: EvalType;
  all: boolean;
  dryRun: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = { all: false, dryRun: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--type' && args[i + 1]) {
      const type = args[i + 1] as EvalType;
      if (!EVAL_TYPES.includes(type)) {
        console.error(`Invalid eval type: ${type}. Must be one of: ${EVAL_TYPES.join(', ')}`);
        process.exit(1);
      }
      result.type = type;
      i++;
    } else if (args[i] === '--all') {
      result.all = true;
    } else if (args[i] === '--dry-run') {
      result.dryRun = true;
    }
  }

  if (result.all && result.type) {
    console.error('Cannot use --all with --type. Pick one.');
    process.exit(1);
  }

  return result;
}

// ============================================================================
// Lock Management
// ============================================================================

function acquireLock(): boolean {
  if (existsSync(LOCK_FILE)) {
    const lockContent = readFileSync(LOCK_FILE, 'utf-8');
    const lockTime = parseInt(lockContent, 10);

    // If lock is older than timeout, it's stale — remove it
    if (Date.now() - lockTime > TIMEOUT_MS) {
      console.log('[AutoEval] Removing stale lock file');
      unlinkSync(LOCK_FILE);
    } else {
      console.log('[AutoEval] Another eval is running (lock file exists). Skipping.');
      return false;
    }
  }

  writeFileSync(LOCK_FILE, String(Date.now()));
  return true;
}

function releaseLock(): void {
  if (existsSync(LOCK_FILE)) {
    unlinkSync(LOCK_FILE);
  }
}

// ============================================================================
// Rotation Index
// ============================================================================

function getCurrentIndex(): number {
  if (!existsSync(INDEX_FILE)) return 0;
  const content = readFileSync(INDEX_FILE, 'utf-8').trim();
  const index = parseInt(content, 10);
  return isNaN(index) ? 0 : index;
}

function incrementIndex(): void {
  const current = getCurrentIndex();
  const next = (current + 1) % EVAL_TYPES.length;
  writeFileSync(INDEX_FILE, String(next));
}

// ============================================================================
// Logging
// ============================================================================

interface EvalLogEntry {
  timestamp: string;
  type: EvalType;
  exitCode: number | null;
  durationMs: number;
  error?: string;
}

function appendLog(entry: EvalLogEntry): void {
  let log: EvalLogEntry[] = [];

  if (existsSync(LOG_FILE)) {
    try {
      log = JSON.parse(readFileSync(LOG_FILE, 'utf-8'));
    } catch {
      log = [];
    }
  }

  log.push(entry);

  // Keep last 100 entries
  if (log.length > 100) {
    log = log.slice(-100);
  }

  writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

// ============================================================================
// Git Operations
// ============================================================================

function ensureDevBranch(): boolean {
  try {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
    }).trim();

    if (currentBranch !== 'dev') {
      console.log(`[AutoEval] Not on dev branch (on ${currentBranch}). Switching to dev.`);
      execSync('git checkout dev', { cwd: PROJECT_ROOT, encoding: 'utf-8' });
    }

    // Pull latest
    try {
      execSync('git pull --ff-only', { cwd: PROJECT_ROOT, encoding: 'utf-8' });
    } catch {
      console.warn('[AutoEval] Git pull failed (may have local changes). Continuing.');
    }

    return true;
  } catch (err) {
    console.error('[AutoEval] Git operation failed:', err);
    return false;
  }
}

// ============================================================================
// Prompt Loading
// ============================================================================

function loadPrompt(type: EvalType): string {
  const promptPath = join(AUTOMATIONS_DIR, 'prompts', `${type}.md`);
  if (!existsSync(promptPath)) {
    throw new Error(`Prompt file not found: ${promptPath}`);
  }
  return readFileSync(promptPath, 'utf-8');
}

// ============================================================================
// Claude Execution
// ============================================================================

function runClaude(prompt: string): Promise<{ exitCode: number | null; error?: string }> {
  return new Promise((resolve) => {
    // Remove CLAUDECODE env var so nested sessions don't get blocked
    const env = { ...process.env };
    delete env.CLAUDECODE;

    const child = spawn('claude', ['--print', '--dangerously-skip-permissions', '--model', 'haiku', '-p', prompt], {
      cwd: PROJECT_ROOT,
      stdio: ['pipe', 'inherit', 'inherit'],
      timeout: TIMEOUT_MS,
      env,
    });

    const timer = setTimeout(() => {
      console.warn('[AutoEval] Timeout reached, killing process');
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5000);
    }, TIMEOUT_MS);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ exitCode: code });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ exitCode: null, error: err.message });
    });
  });
}

// ============================================================================
// Single Eval Execution
// ============================================================================

function previewPrompt(type: EvalType): void {
  const prompt = loadPrompt(type);
  console.log(`\n--- ${type} Prompt Preview (${prompt.length} chars) ---`);
  console.log(prompt.substring(0, 500));
  if (prompt.length > 500) console.log(`... (${prompt.length - 500} more chars)`);
  console.log(`--- End ${type} Preview ---\n`);
}

async function runSingleEval(type: EvalType): Promise<void> {
  console.log(`\n[AutoEval] === Running ${type} eval ===`);

  // Acquire lock per eval (so one failure doesn't block the rest in --all mode)
  if (!acquireLock()) {
    console.log(`[AutoEval] Skipping ${type} — another eval is running.`);
    return;
  }

  const startTime = Date.now();

  try {
    if (!ensureDevBranch()) {
      console.error(`[AutoEval] Failed to switch to dev branch for ${type}. Skipping.`);
      return;
    }

    const prompt = loadPrompt(type);
    console.log(`[AutoEval] Prompt loaded (${prompt.length} chars)`);
    console.log(`[AutoEval] Starting Claude session...`);

    const result = await runClaude(prompt);
    const durationMs = Date.now() - startTime;

    console.log(`[AutoEval] ${type} completed in ${(durationMs / 1000).toFixed(1)}s (exit code: ${result.exitCode})`);

    appendLog({
      timestamp: new Date().toISOString(),
      type,
      exitCode: result.exitCode,
      durationMs,
      error: result.error,
    });
  } finally {
    releaseLock();
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = parseArgs();

  // --all mode: run all 4 evals sequentially
  if (args.all) {
    console.log(`[AutoEval] Running all evals${args.dryRun ? ' (dry run)' : ''}: ${EVAL_TYPES.join(' → ')}`);

    if (args.dryRun) {
      for (const type of EVAL_TYPES) {
        previewPrompt(type);
      }
      console.log('[AutoEval] Dry run complete. No changes made.');
      return;
    }

    for (const type of EVAL_TYPES) {
      await runSingleEval(type);
    }

    // Don't increment rotation index — --all shouldn't affect auto-rotate position
    console.log('\n[AutoEval] All evals complete.');
    return;
  }

  // Single eval mode (auto-rotate or explicit --type)
  const evalType = args.type || EVAL_TYPES[getCurrentIndex()];
  console.log(`[AutoEval] Type: ${evalType}${args.dryRun ? ' (dry run)' : ''}`);

  if (args.dryRun) {
    previewPrompt(evalType);
    console.log('[AutoEval] Dry run complete. No changes made.');
    return;
  }

  await runSingleEval(evalType);

  // Increment rotation index only for auto-rotate (not --type or --all)
  if (!args.type) {
    incrementIndex();
  }
}

main().catch((err) => {
  console.error('[AutoEval] Fatal error:', err);
  releaseLock();
  process.exit(1);
});
