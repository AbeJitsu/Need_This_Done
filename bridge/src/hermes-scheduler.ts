import type { BridgeApiClient, HermesScheduleTick } from './bridge-client.js';

export type HermesSchedulerResult =
  | { status: 'idle'; tick: HermesScheduleTick }
  | { status: 'materialized'; tick: HermesScheduleTick };

/**
 * Deliberately separate from AgentBridgeRunner: this process can only turn a
 * durable, due schedule into an approval-required draft run. It never opens a
 * Gateway connection or claims execution work.
 */
export class HermesScheduler {
  private running = false;

  constructor(
    private readonly api: Pick<BridgeApiClient, 'schedulerTick'>,
    private readonly limit = 20,
  ) {}

  async runOnce(): Promise<HermesSchedulerResult> {
    if (this.running) throw new Error('Hermes scheduler tick is already in progress.');
    this.running = true;
    try {
      const tick = await this.api.schedulerTick(this.limit);
      return tick.materialized > 0 ? { status: 'materialized', tick } : { status: 'idle', tick };
    } finally {
      this.running = false;
    }
  }
}
