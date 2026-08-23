export type EmployeeQueue = 'morning' | 'midday' | 'evening';
export type EmployeeDecision = 'approve' | 'revise' | 'defer' | 'reject';
export type WorkItemStatus = 'pending' | 'approved' | 'revised' | 'deferred' | 'rejected' | 'completed';

export interface EmployeeWorkItem {
  id: string;
  predecessor_work_item_id: string | null;
  source_type: string | null;
  source_id: string | null;
  queue: EmployeeQueue;
  scheduled_date: string;
  title: string;
  evidence: unknown[];
  proposed_action: string;
  expected_outcome: string | null;
  risk_level: 'low' | 'medium' | 'high';
  priority: number;
  status: WorkItemStatus;
  created_by: string | null;
  completed_by: string | null;
  completed_at: string | null;
  completion_notes: string | null;
  created_at: string;
}

export interface EmployeeDecisionRecord {
  id: string;
  work_item_id: string;
  decision: EmployeeDecision;
  instructions: string | null;
  created_at: string;
}

export interface EmployeeOutcome {
  id: string;
  work_item_id: string | null;
  kind: 'lead' | 'reply' | 'meeting' | 'project' | 'time_saved' | 'revenue' | 'cost';
  value: number;
  amount_cents: number | null;
  currency: string | null;
  cost_category: 'model' | 'tooling' | 'payment' | 'advertising' | 'contractor' | 'delivery' | null;
  notes: string | null;
  recorded_by: string | null;
  occurred_at: string;
}

export interface EmployeeDailyScorecard {
  currency: string;
  grossRevenueCents: number;
  totalCostCents: number;
  netRevenueCents: number;
  goalCents: number;
}

export interface EmployeeWorkspaceData {
  customer: { id: string; name: string };
  availableCustomers: Array<{ id: string; name: string; role: 'operator' }>;
  membershipRole: 'operator';
  scheduledDate: string;
  timezone: string;
  employee: { id: string; name: string; role_name: string; status: 'pilot' | 'managed' | 'paused' };
  brief: {
    responsibilities: unknown[];
    prohibited_actions: unknown[];
    channels: unknown[];
    tone: string | null;
    approval_rules: unknown[];
  } | null;
  schedules: Array<{ check_in_type: EmployeeQueue; local_time: string; timezone: string; enabled: boolean }>;
  workItems: EmployeeWorkItem[];
  decisions: EmployeeDecisionRecord[];
  outcomes: EmployeeOutcome[];
  dailyScorecards: EmployeeDailyScorecard[];
  funnel: { leads: number; replies: number; meetings: number; projects: number };
  operatorMinutes: number;
}
