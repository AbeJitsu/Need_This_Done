import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHermesSchedulerRuntime } from './index.js';

export async function runHermesScheduler(environment: Record<string, string | undefined> = process.env) {
  const runtime = createHermesSchedulerRuntime(environment);
  let stopping = false;
  const stop = () => { stopping = true; };
  const signals = ['SIGINT', 'SIGTERM'] as const;
  for (const signal of signals) process.once(signal, stop);
  console.log(`[hermes-scheduler] polling every ${runtime.pollIntervalMs}ms; draft-only materialization.`);
  try {
    while (!stopping) {
      try {
        const result = await runtime.scheduler.runOnce();
        if (result.status === 'materialized') {
          console.log(`[hermes-scheduler] materialized ${result.tick.materialized} approval-required run(s).`);
        }
      } catch (error) {
        console.error(`[hermes-scheduler] ${error instanceof Error ? error.message : 'Unknown scheduler error.'}`);
      }
      if (!stopping) await new Promise<void>((done) => setTimeout(done, runtime.pollIntervalMs));
    }
  } finally {
    for (const signal of signals) process.removeListener(signal, stop);
    console.log('[hermes-scheduler] stopped.');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runHermesScheduler().catch((error: unknown) => {
    console.error(`[hermes-scheduler] ${error instanceof Error ? error.message : 'Scheduler startup failed.'}`);
    process.exitCode = 1;
  });
}
