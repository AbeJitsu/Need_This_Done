import type { GrowthProfile } from '@/lib/prospecting-types';

export type WeeklyPriorityStatus = 'active' | 'completed' | 'dropped';
export type CockpitActionStatus = 'open' | 'completed' | 'deferred';
export type CockpitActionType = 'big_rock' | 'employee' | 'draft' | 'reply' | 'follow_up' | 'outcome';

export interface WeeklyPriority {
  id: string;
  owner_id: string;
  week_start: string;
  position: number;
  outcome: string;
  owner_name: string;
  due_date: string;
  status: WeeklyPriorityStatus;
  next_action: string;
  created_at: string;
  updated_at: string;
}

export interface CockpitAction {
  id: string;
  owner_id: string;
  week_start: string;
  priority_id: string | null;
  source_type: string;
  source_id: string;
  action_type: CockpitActionType;
  title: string;
  description: string;
  due_date: string | null;
  rank: number;
  status: CockpitActionStatus;
  deferred_until: string | null;
  completed_at: string | null;
  completion_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CockpitSignal {
  id: string;
  title: string;
  description: string;
  kind: 'waiting' | 'reply' | 'follow_up';
  due_date: string | null;
  status: string;
  source_id: string;
}

export interface DailyReflection {
  id: string;
  owner_id: string;
  reflection_date: string;
  reflection: string;
  created_at: string;
  updated_at: string;
}

export interface CockpitSummary {
  openActions: number;
  waitingItems: number;
  replies: number;
  followUps: number;
}

export interface DailyCockpitData {
  mission: string;
  today: string;
  weekStart: string;
  weeklyPriorities: WeeklyPriority[];
  actions: CockpitAction[];
  todayActions: CockpitAction[];
  completedActions: CockpitAction[];
  waitingItems: CockpitSignal[];
  replies: CockpitSignal[];
  followUps: CockpitSignal[];
  growthProfile: GrowthProfile | null;
  reflection: DailyReflection | null;
  summary: CockpitSummary;
}
