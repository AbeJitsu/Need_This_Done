import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWorkflowSchedulerRuntime } from './index.js';

export async function runWorkflowScheduler(environment: Record<string, string | undefined> = process.env) {
  const runtime = createWorkflowSchedulerRuntime(environment);
  let stopping = false;
  const stop = () => { stopping = true; };
  const signals = ['SIGINT', 'SIGTERM'] as const;
  for (const signal of signals) process.once(signal, stop);
  console.log(`[workflow-scheduler] polling every ${runtime.pollIntervalMs}ms; draft-only materialization.`);
  try {
    while (!stopping) {
      try {
        const result = await runtime.scheduler.runOnce();
        if (result.status === 'materialized') {
          console.log(`[workflow-scheduler] materialized ${result.tick.materialized} approval-required run(s).`);
        }
      } catch (error) {
        console.error(`[workflow-scheduler] ${error instanceof Error ? error.message : 'Unknown scheduler error.'}`);
      }
      if (!stopping) await new Promise<void>((done) => setTimeout(done, runtime.pollIntervalMs));
    }
  } finally {
    for (const signal of signals) process.removeListener(signal, stop);
    console.log('[workflow-scheduler] stopped.');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runWorkflowScheduler().catch((error: unknown) => {
    console.error(`[workflow-scheduler] ${error instanceof Error ? error.message : 'Scheduler startup failed.'}`);
    process.exitCode = 1;
  });
}
