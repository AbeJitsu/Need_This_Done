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
  kind: 'lead' | 'reply' | 'meeting' | 'project' | 'time_saved';
  value: number;
  notes: string | null;
  occurred_at: string;
}

export interface EmployeeWorkspaceData {
  customer: { id: string; name: string };
  membershipRole: 'owner' | 'manager' | 'viewer';
  scheduledDate: string;
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
}
