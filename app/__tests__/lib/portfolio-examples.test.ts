import { describe, expect, it } from 'vitest';
import { initialTasks, parseSavedTasks } from '@/lib/portfolio-examples';

describe('task board storage recovery', () => {
  it('restores valid saved tasks and an intentionally empty board', () => {
    expect(parseSavedTasks(JSON.stringify(initialTasks))).toEqual(initialTasks);
    expect(parseSavedTasks('[]')).toEqual([]);
  });

  it.each(['broken JSON', 'null', '{}', '[null]'])('rejects corrupt saved data: %s', (raw) => {
    expect(parseSavedTasks(raw)).toBeNull();
  });

  it('rejects repeated identities rather than rendering ambiguous controls', () => {
    expect(parseSavedTasks(JSON.stringify([initialTasks[0], initialTasks[0]]))).toBeNull();
  });

  it('rejects unsupported status, blank titles, and oversized storage', () => {
    for (const task of [{ ...initialTasks[0], status: 'unknown' }, { ...initialTasks[0], title: '   ' }]) {
      expect(parseSavedTasks(JSON.stringify([task]))).toBeNull();
    }
    expect(parseSavedTasks(JSON.stringify(Array.from({ length: 31 }, (_, index) => ({ ...initialTasks[0], id: String(index) }))))).toBeNull();
  });
});
