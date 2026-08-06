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
  sender_name: string;
  sender_email: string;
  daily_prospect_cap: number;
  daily_send_cap: number;
  working_hours_start: string;
  working_hours_end: string;
  timezone: string;
  follow_up_days: number[];
  model_route: string;
  fallback_model: string;
  per_run_model_cap: number;
  daily_model_cap: number;
  emergency_stop: boolean;
}

export interface ProspectSource { id: string; source_url: string; source_type: string; evidence: unknown[]; contact_path: string | null; email_status: string; }
export interface Prospect { id: string; profile_id: string; company_name: string; contact_name: string | null; contact_title: string | null; email: string | null; website_url: string; deduplication_key: string; icp_match_score: number; icp_match_reason: string; outreach_status: ProspectStatus; suppression_status: 'clear' | 'suppressed'; discovered_at: string; last_contacted_at: string | null; last_replied_at: string | null; prospect_sources: ProspectSource[]; }
export interface OutreachMessage { id: string; prospect_id: string; profile_id: string; campaign: string; sequence_step: number; subject: string; body: string; personalization_evidence: unknown[]; approval_status: OutreachApprovalStatus; sender_email: string; recipient_email: string; provider_message_id: string | null; approved_at: string | null; sent_at: string | null; replied_at: string | null; bounced_at: string | null; unsubscribed_at: string | null; follow_up_eligible: boolean; next_action_at: string | null; }
export interface ProspectOutcome { id: string; prospect_id: string; message_id: string | null; outcome_type: string; notes: string; occurred_at: string; }
export interface ProspectingQueue { profile: GrowthProfile | null; prospects: Prospect[]; messages: OutreachMessage[]; outcomes: ProspectOutcome[]; tasks: unknown[]; stats: { discoveredToday: number; approvedToday: number; sentToday: number; pendingDrafts: number; replies: number; bounces: number; unsubscribes: number; modelSpendToday: number }; }
