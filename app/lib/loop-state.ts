import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Loop State Management
// ============================================================================
// What: Manages the auto-loop state file (.claude/loop-state.json)
// Why: Provides a clean API for reading/writing loop state
// How: Simple file operations with JSON parsing

export interface LoopState {
  active: boolean;
  startTime: number;
  maxHours: number;
  maxConsecutiveFailures: number;
  iterationCount: number;
  failureCounts: Record<string, number>;
  cycleNumber: number;
  tasksCompleted: number;
}

const DEFAULT_STATE: LoopState = {
  active: true,
  startTime: Date.now(),
  maxHours: 5,
  maxConsecutiveFailures: 3,
  iterationCount: 0,
  failureCounts: {},
  cycleNumber: 1,
  tasksCompleted: 0,
};

function getLoopStatePath(): string {
  // Go up from app/ to project root, then into .claude/
  return path.join(process.cwd(), '..', '.claude', 'loop-state.json');
}

export function readLoopState(): LoopState | null {
  const statePath = getLoopStatePath();

  if (!fs.existsSync(statePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(statePath, 'utf-8');
    return JSON.parse(content) as LoopState;
  } catch {
    return null;
  }
}

export function writeLoopState(state: LoopState): void {
  const statePath = getLoopStatePath();
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

export function startLoop(): LoopState {
  const state: LoopState = {
    ...DEFAULT_STATE,
    startTime: Date.now(),
  };
  writeLoopState(state);
  return state;
}

export function pauseLoop(): LoopState | null {
  const state = readLoopState();
  if (!state) return null;

  state.active = false;
  writeLoopState(state);
  return state;
}

export function incrementIteration(): LoopState | null {
  const state = readLoopState();
  if (!state) return null;

  state.iterationCount += 1;
  writeLoopState(state);
  return state;
}

export function markTaskComplete(): LoopState | null {
  const state = readLoopState();
  if (!state) return null;

  state.tasksCompleted += 1;
  writeLoopState(state);
  return state;
}

export function isLoopActive(): boolean {
  const state = readLoopState();
  if (!state) return false;
  if (!state.active) return false;

  // Check if time limit exceeded
  const elapsed = Date.now() - state.startTime;
  const maxMs = state.maxHours * 3600000;

  return elapsed < maxMs;
}

export function getTimeRemaining(): number {
  const state = readLoopState();
  if (!state) return 0;

  const elapsed = Date.now() - state.startTime;
  const maxMs = state.maxHours * 3600000;

  return Math.max(0, maxMs - elapsed);
}
