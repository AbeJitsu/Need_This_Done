import type { BridgeApiClient, WorkflowScheduleTick } from './bridge-client.js';

export type WorkflowSchedulerResult =
  | { status: 'idle'; tick: WorkflowScheduleTick }
  | { status: 'materialized'; tick: WorkflowScheduleTick };

/**
 * Deliberately separate from AgentBridgeRunner: this process can only turn a
 * durable, due schedule into an approval-required draft run. It never opens a
 * Gateway connection or claims execution work.
 */
export class WorkflowScheduler {
  private running = false;

  constructor(
    private readonly api: Pick<BridgeApiClient, 'schedulerTick'>,
    private readonly limit = 20,
  ) {}

  async runOnce(): Promise<WorkflowSchedulerResult> {
    if (this.running) throw new Error('Workflow scheduler tick is already in progress.');
    this.running = true;
    try {
      const tick = await this.api.schedulerTick(this.limit);
      return tick.materialized > 0 ? { status: 'materialized', tick } : { status: 'idle', tick };
    } finally {
      this.running = false;
    }
  }
}
