export type ProspectStatus = 'new' | 'researching' | 'drafted' | 'approved' | 'contacted' | 'replied' | 'bounced' | 'unsubscribed' | 'not_a_fit' | 'closed';
export type OutreachApprovalStatus = 'pending' | 'approved' | 'rejected' | 'deferred' | 'cancelled' | 'sent';

export interface GrowthProfile {
  id: string;
  owner_id: string;
  name: string;
  target_market: string;
  geography: string;
  business_size: string;
  pain_signals: unknown[];
  exclusion_rules: unknown[];
  offer: string;
  sender_name: string | null;
  sender_email: string | null;
  daily_prospect_cap: number;
  daily_send_cap: number;
  working_hours_start: string;
  working_hours_end: string;
  timezone: string;
  follow_up_days: number[];
  model_route: string;
  fallback_model: string;
  selected_model_id: string | null;
  selected_model_rationale: string;
  model_selected_at: string | null;
  emergency_stop: boolean;
}

export interface ProspectSource { id: string; source_url: string; source_type: string; evidence: unknown[]; contact_path: string | null; email_status: string; }
export interface Prospect { id: string; profile_id: string; company_name: string; contact_name: string | null; contact_title: string | null; email: string | null; website_url: string; deduplication_key: string; icp_match_score: number; icp_match_reason: string; outreach_status: ProspectStatus; suppression_status: 'clear' | 'suppressed'; discovered_at: string; last_contacted_at: string | null; last_replied_at: string | null; prospect_sources: ProspectSource[]; }
export interface ProspectDossier { id: string; profile_id: string; prospect_id: string; task_id: string | null; orchestration_task_id?: string | null; agent_artifact_id?: string | null; model_usage_reservation_id?: string | null; worker_id?: string | null; company_name: string; official_website_url: string; icp_reason: string; observed_evidence: Array<{ claim: string; citationUrls: string[] }>; citations: Array<{ url: string; title: string; excerpt: string }>; recommended_offer_angle: string; contact_path: { type: string; value: string; email?: string }; suggested_subject: string; suggested_body: string; model_id: string; review_status: 'pending_review' | 'promoted' | 'rejected'; promoted_message_id: string | null; created_at: string; }
export interface ModelUsageLedgerEntry { id: string; task_id: string | null; usage_kind: 'benchmark' | 'research'; model_id: string; reserved_cost: number; actual_cost: number | null; status: 'reserved' | 'reconciled' | 'released'; local_usage_date: string; created_at: string; }
export interface OutreachMessage { id: string; prospect_id: string; profile_id: string; campaign: string; sequence_step: number; subject: string; body: string; personalization_evidence: unknown[]; approval_status: OutreachApprovalStatus; sender_email: string; recipient_email: string; provider_message_id: string | null; approved_at: string | null; sent_at: string | null; replied_at: string | null; bounced_at: string | null; unsubscribed_at: string | null; follow_up_eligible: boolean; next_action_at: string | null; }
export interface ProspectOutcome { id: string; prospect_id: string; message_id: string | null; outcome_type: string; notes: string; occurred_at: string; }
export interface ProspectingQueue { profile: GrowthProfile | null; prospects: Prospect[]; dossiers: ProspectDossier[]; messages: OutreachMessage[]; outcomes: ProspectOutcome[]; tasks: import('@/lib/prospecting-worker-types').AgentTask[]; usageLedger: ModelUsageLedgerEntry[]; stats: { discoveredToday: number; acceptedDossiersToday: number; approvedToday: number; sentToday: number; pendingDrafts: number; replies: number; bounces: number; unsubscribes: number; modelSpendToday: number; reservedModelSpendToday: number; taskFailures: number }; }
