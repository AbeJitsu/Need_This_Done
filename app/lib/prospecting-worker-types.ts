export interface AgentTask {
  id: string;
  profile_id: string;
  task_type: 'discover_prospects' | 'research_prospect' | 'draft_message' | 'send_approved_message' | 'sync_sender_events';
  status: 'queued' | 'leased' | 'succeeded' | 'failed' | 'cancelled';
  input: Record<string, unknown>;
  attempt_count: number;
  max_attempts: number;
  idempotency_key: string;
}
