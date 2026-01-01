import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Loop State Management
// ============================================================================
// What: Manages the auto-loop state file (.claude/loop-state.json)
// Why: Provides a clean API for reading/writing loop state
// How: Simple file operations with JSON parsing
// NOTE: startTime uses Unix seconds (not milliseconds) for bash compatibility

export interface LoopState {
  active: boolean;
  startTime: number; // Unix seconds (not milliseconds)
  maxHours: number;
  maxConsecutiveFailures: number;
  iterationCount: number;
  failureCounts: Record<string, number>;
  cycleNumber: number;
  tasksCompleted: number;
}

const DEFAULT_STATE: LoopState = {
  active: true,
  startTime: Math.floor(Date.now() / 1000), // Unix seconds
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
    startTime: Math.floor(Date.now() / 1000), // Unix seconds
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

  // Check if time limit exceeded (times in seconds)
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - state.startTime;
  const maxSeconds = state.maxHours * 3600;

  return elapsed < maxSeconds;
}

export function getTimeRemaining(): number {
  const state = readLoopState();
  if (!state) return 0;

  // Returns seconds remaining (times in seconds for bash compatibility)
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - state.startTime;
  const maxSeconds = state.maxHours * 3600;

  return Math.max(0, maxSeconds - elapsed);
}
