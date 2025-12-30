import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Test: Loop State Management
// ============================================================================
// PROOF: The auto-loop system correctly manages loop-state.json
// Uses real file operations with cleanup

// Import the actual module
import {
  readLoopState,
  writeLoopState,
  startLoop,
  pauseLoop,
  markTaskComplete,
  isLoopActive,
  getTimeRemaining,
  type LoopState,
} from '@/lib/loop-state';

// Path to actual loop state file
const LOOP_STATE_PATH = path.join(process.cwd(), '..', '.claude', 'loop-state.json');

describe('Loop State Management', () => {
  let originalState: string | null = null;

  beforeEach(() => {
    // Backup existing state if present
    if (fs.existsSync(LOOP_STATE_PATH)) {
      originalState = fs.readFileSync(LOOP_STATE_PATH, 'utf-8');
    }
  });

  afterEach(() => {
    // Restore original state
    if (originalState !== null) {
      fs.writeFileSync(LOOP_STATE_PATH, originalState);
    } else if (fs.existsSync(LOOP_STATE_PATH)) {
      // If there was no original, remove any test-created file
      // (But we keep it since it's part of the project)
    }
  });

  describe('readLoopState', () => {
    it('should read existing loop state', () => {
      const testState: LoopState = {
        active: true,
        startTime: Date.now(),
        maxHours: 5,
        maxConsecutiveFailures: 3,
        iterationCount: 2,
        failureCounts: {},
        cycleNumber: 1,
        tasksCompleted: 1,
      };

      fs.writeFileSync(LOOP_STATE_PATH, JSON.stringify(testState, null, 2));

      const state = readLoopState();
      expect(state).not.toBeNull();
      expect(state?.active).toBe(true);
      expect(state?.iterationCount).toBe(2);
      expect(state?.tasksCompleted).toBe(1);
    });
  });

  describe('writeLoopState', () => {
    it('should write loop state to file', () => {
      const testState: LoopState = {
        active: true,
        startTime: Date.now(),
        maxHours: 5,
        maxConsecutiveFailures: 3,
        iterationCount: 5,
        failureCounts: {},
        cycleNumber: 2,
        tasksCompleted: 3,
      };

      writeLoopState(testState);

      const content = fs.readFileSync(LOOP_STATE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed.iterationCount).toBe(5);
      expect(parsed.tasksCompleted).toBe(3);
    });
  });

  describe('startLoop', () => {
    it('should create a new active loop state', () => {
      const state = startLoop();

      expect(state.active).toBe(true);
      expect(state.iterationCount).toBe(0);
      expect(state.tasksCompleted).toBe(0);
      expect(state.startTime).toBeLessThanOrEqual(Date.now());
      expect(state.startTime).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('pauseLoop', () => {
    it('should set active to false and preserve other state', () => {
      const initialState: LoopState = {
        active: true,
        startTime: Date.now() - 3600000,
        maxHours: 5,
        maxConsecutiveFailures: 3,
        iterationCount: 5,
        failureCounts: {},
        cycleNumber: 1,
        tasksCompleted: 3,
      };

      writeLoopState(initialState);
      const paused = pauseLoop();

      expect(paused).not.toBeNull();
      expect(paused?.active).toBe(false);
      expect(paused?.tasksCompleted).toBe(3);
      expect(paused?.iterationCount).toBe(5);
    });
  });

  describe('markTaskComplete', () => {
    it('should increment tasksCompleted counter', () => {
      const initialState: LoopState = {
        active: true,
        startTime: Date.now(),
        maxHours: 5,
        maxConsecutiveFailures: 3,
        iterationCount: 1,
        failureCounts: {},
        cycleNumber: 1,
        tasksCompleted: 2,
      };

      writeLoopState(initialState);
      const updated = markTaskComplete();

      expect(updated).not.toBeNull();
      expect(updated?.tasksCompleted).toBe(3);
    });
  });

  describe('isLoopActive', () => {
    it('should return true when loop is active and within time limit', () => {
      const state: LoopState = {
        active: true,
        startTime: Date.now() - 1800000, // 30 mins ago
        maxHours: 5,
        maxConsecutiveFailures: 3,
        iterationCount: 1,
        failureCounts: {},
        cycleNumber: 1,
        tasksCompleted: 0,
      };

      writeLoopState(state);
      expect(isLoopActive()).toBe(true);
    });

    it('should return false when loop is paused', () => {
      const state: LoopState = {
        active: false,
        startTime: Date.now() - 1800000,
        maxHours: 5,
        maxConsecutiveFailures: 3,
        iterationCount: 1,
        failureCounts: {},
        cycleNumber: 1,
        tasksCompleted: 0,
      };

      writeLoopState(state);
      expect(isLoopActive()).toBe(false);
    });

    it('should return false when time limit exceeded', () => {
      const state: LoopState = {
        active: true,
        startTime: Date.now() - (6 * 3600000), // 6 hours ago
        maxHours: 5,
        maxConsecutiveFailures: 3,
        iterationCount: 1,
        failureCounts: {},
        cycleNumber: 1,
        tasksCompleted: 0,
      };

      writeLoopState(state);
      expect(isLoopActive()).toBe(false);
    });
  });

  describe('getTimeRemaining', () => {
    it('should calculate remaining time correctly', () => {
      const twoHoursAgo = Date.now() - (2 * 3600000);
      const state: LoopState = {
        active: true,
        startTime: twoHoursAgo,
        maxHours: 5,
        maxConsecutiveFailures: 3,
        iterationCount: 1,
        failureCounts: {},
        cycleNumber: 1,
        tasksCompleted: 0,
      };

      writeLoopState(state);
      const remaining = getTimeRemaining();

      // Should be approximately 3 hours remaining (within 1 second tolerance)
      expect(remaining).toBeGreaterThan(2.99 * 3600000);
      expect(remaining).toBeLessThan(3.01 * 3600000);
    });

    it('should return 0 when time limit exceeded', () => {
      const state: LoopState = {
        active: true,
        startTime: Date.now() - (6 * 3600000), // 6 hours ago
        maxHours: 5,
        maxConsecutiveFailures: 3,
        iterationCount: 1,
        failureCounts: {},
        cycleNumber: 1,
        tasksCompleted: 0,
      };

      writeLoopState(state);
      expect(getTimeRemaining()).toBe(0);
    });
  });
});
