import type { AgentTask } from '@/lib/prospecting-worker-types';

export interface ProspectingWorkerTransport {
  claim(workerId: string): Promise<AgentTask | null>;
  execute(task: AgentTask): Promise<Record<string, unknown>>;
  submit(task: AgentTask, output: Record<string, unknown>): Promise<void>;
  fail(task: AgentTask, error: string): Promise<void>;
}

/** Small foreground worker loop. The transport is intentionally injected so
 * local tests can use deterministic discovery/sender doubles and production
 * can use the signed HTTP adapter without giving an agent a service key. */
export class ForegroundProspectingWorker {
  private stopped = false;
  constructor(private readonly workerId: string, private readonly transport: ProspectingWorkerTransport) {}

  stop() { this.stopped = true; }

  async runOnce() {
    if (this.stopped) return false;
    const task = await this.transport.claim(this.workerId);
    if (!task) return false;
    try { await this.transport.submit(task, await this.transport.execute(task)); }
    catch (error) { await this.transport.fail(task, error instanceof Error ? error.message : 'Worker task failed.'); }
    return true;
  }
}
