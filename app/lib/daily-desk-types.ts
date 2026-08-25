export type DailyDeskBrief = {
  id: string;
  owner_id: string;
  revision: number;
  region: string;
  offer: string;
  target_segment: string;
  pain_focus: string;
  timezone: string;
  created_at: string;
};

export type DailyDeskRun = {
  id: string;
  owner_id: string;
  brief_id: string;
  local_date: string;
  status: 'queued' | 'leased' | 'succeeded' | 'shortfall' | 'failed';
  target_prospect_count: 2;
  produced_prospect_count: number;
  shortfall_reason: string | null;
  selected_model_id: string | null;
  route_estimated_cost: number | string | null;
  route_rationale: string | null;
  provider_policy: Record<string, unknown>;
  provider_usage: Record<string, unknown>;
  completed_at: string | null;
  created_at: string;
};

export type DailyDeskProspectCard = {
  id: string;
  owner_id: string;
  run_id: string;
  company_name: string;
  official_website_url: string;
  consultant_role: string;
  contact_path: string;
  observed_evidence: Array<{ claim: string; citationUrls: string[] }>;
  citations: Array<{ url: string; title: string; excerpt: string }>;
  created_at: string;
};

export type DailyDeskFollowUp = {
  id: string;
  owner_id: string;
  run_id: string;
  prospect_card_id: string;
  subject: string;
  body: string;
  state: 'draft' | 'ready' | 'deferred' | 'completed' | 'rejected';
  deferred_until: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DailyDeskSocialVersion = {
  id: string;
  owner_id: string;
  asset_id: string;
  version_number: number;
  storage_path: string;
  caption: string;
  alt_text: string;
  graphic_sha256: string;
  graphic_tokens: Record<string, unknown>;
  created_at: string;
};

export type DailyDeskSocialAsset = {
  id: string;
  owner_id: string;
  run_id: string;
  status: 'draft' | 'ready_for_manual_posting' | 'rejected';
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
  currentVersion?: DailyDeskSocialVersion | null;
};

export type DailyDeskOutcome = {
  id: string;
  prospect_card_id: string;
  follow_up_id: string | null;
  outcome_type: 'qualified_sales_conversation' | 'reply' | 'meeting' | 'not_a_fit' | 'customer' | 'note';
  notes: string;
  occurred_at: string;
};

export type DailyDeskCostReservation = {
  id: string;
  run_id: string;
  model_id: string;
  estimated_cost: number | string;
  reserved_cost: number | string;
  actual_cost: number | string | null;
  status: 'reserved' | 'reconciled' | 'actual_cost_missing' | 'released' | 'blocked' | 'overage';
  provider_policy: Record<string, unknown>;
  route_rationale: string;
  provider_usage: Record<string, unknown>;
  local_date: string;
  created_at: string;
};

export type DailyDeskData = {
  brief: DailyDeskBrief | null;
  run: DailyDeskRun | null;
  prospectCards: DailyDeskProspectCard[];
  followUps: DailyDeskFollowUp[];
  socialAsset: DailyDeskSocialAsset | null;
  outcomes: DailyDeskOutcome[];
  costReservations: DailyDeskCostReservation[];
  qualifiedSalesConversations: number;
};
