export type WorkspaceStatus =
  | 'awaiting_approval'
  | 'approved'
  | 'queued'
  | 'in_progress'
  | 'awaiting_review'
  | 'completed'
  | 'needs_attention'
  | 'cancelled'
  | 'rejected';

export type WorkspaceEvent = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  tone: 'neutral' | 'positive' | 'warning' | 'danger';
};

export type WorkspaceArtifact = {
  id: string;
  title: string;
  artifactType: string;
  status: string;
  statusLabel: string;
  content: string | null;
  contentTruncated: boolean;
  hasPrivateFile: boolean;
  references: string[];
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceWorkflow = {
  id: string;
  planId: string | null;
  runId: string | null;
  title: string;
  request: string;
  instruction: string | null;
  workflowType: string;
  planStatus: string | null;
  runStatus: string | null;
  status: WorkspaceStatus;
  statusLabel: string;
  nextAction: string;
  approvalRequired: boolean;
  estimatedCostUsd: number | null;
  createdAt: string;
  updatedAt: string;
  summary: string | null;
  checks: string[];
  blockers: string[];
  references: string[];
  artifacts: WorkspaceArtifact[];
  events: WorkspaceEvent[];
};

export type WorkspaceData = {
  configured: true;
  workflows: WorkspaceWorkflow[];
  counts: {
    active: number;
    needsAttention: number;
    completed: number;
  };
};
