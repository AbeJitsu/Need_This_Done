'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import Button from '@/components/Button';
import {
  alertColors,
  accentColors,
  softBgColors,
  statusBadgeColors,
  containerBg,
  headingColors,
  mutedTextColors,
  coloredLinkText,
  dividerColors,
} from '@/lib/colors';
import { ChevronLeft, Play, Edit2, ToggleRight, ToggleLeft } from 'lucide-react';
import Link from 'next/link';

// ============================================================================
// Workflow Detail Page - /admin/automation/[id]
// ============================================================================
// What: Shows workflow details with execution history and test run capability
// Why: Admins need to monitor workflow health and performance
// How: Fetches workflow + executions, allows test runs and status updates

interface WorkflowStep {
  id: string;
  label: string;
  type: string;
  config: Record<string, unknown>;
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  triggered_by: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  duration_ms?: number;
  total_actions?: number;
  error?: string;
}

interface TestRunResult {
  id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  steps: Array<{
    id: string;
    label: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    error?: string;
    duration_ms?: number;
  }>;
  error?: string;
}

interface WorkflowDetail {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  trigger_type: string;
  trigger_config?: Record<string, unknown>;
  steps: WorkflowStep[];
  created_at: string;
  updated_at: string;
  created_by: string;
  last_modified_by: string;
}

export default function WorkflowDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workflowId = params?.id as string;
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [testRunResult, setTestRunResult] = useState<TestRunResult | null>(null);
  const [testRunExpanded, setTestRunExpanded] = useState(false);
  const [expandedExecution, setExpandedExecution] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showTestRun, setShowTestRun] = useState(false);

  // ========================================================================
  // Auth protection
  // ========================================================================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // ========================================================================
  // Fetch workflow and executions
  // ========================================================================
  const fetchWorkflowData = useCallback(async () => {
    if (!workflowId) return;

    try {
      setLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const workflowResponse = await fetch(`/api/workflows/${workflowId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!workflowResponse.ok) {
        if (workflowResponse.status === 404) {
          router.push('/admin/automation');
          return;
        }
        const data = await workflowResponse.json();
        throw new Error(data.error || 'Failed to fetch workflow');
      }

      const workflowData = await workflowResponse.json();
      setWorkflow(workflowData.workflow);

      // Fetch executions
      const executionsResponse = await fetch(
        `/api/workflows/${workflowId}/executions?limit=10`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (executionsResponse.ok) {
        const executionsData = await executionsResponse.json();
        setExecutions(executionsData.executions || []);
      }
    } catch (err) {
      console.error('Failed to load workflow:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workflow');
    } finally {
      setLoading(false);
    }
  }, [workflowId, router]);

  useEffect(() => {
    if (!isAdmin || !workflowId) return;
    fetchWorkflowData();
  }, [isAdmin, workflowId, fetchWorkflowData]);

  // ========================================================================
  // Handle test run
  // ========================================================================
  const handleTestRun = async () => {
    if (!workflow) return;

    try {
      setActionLoading('test-run');
      setShowTestRun(true);

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/workflows/${workflow.id}/test-run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Test run failed');
      }

      const result = await response.json();
      setTestRunResult(result.result);
      setTestRunExpanded(true);
    } catch (err) {
      console.error('Test run failed:', err);
      setError(err instanceof Error ? err.message : 'Test run failed');
    } finally {
      setActionLoading(null);
    }
  };

  // ========================================================================
  // Handle run now
  // ========================================================================
  const handleRunNow = async () => {
    if (!workflow) return;

    try {
      setActionLoading('run-now');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/workflows/${workflow.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to execute workflow');
      }

      setError('');
      // Refresh executions
      await fetchWorkflowData();
    } catch (err) {
      console.error('Failed to execute workflow:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to execute workflow'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ========================================================================
  // Handle status toggle
  // ========================================================================
  const handleToggleStatus = async () => {
    if (!workflow) return;

    try {
      setActionLoading('toggle-status');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const newStatus = workflow.status === 'active' ? 'paused' : 'active';

      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update workflow');
      }

      await fetchWorkflowData();
    } catch (err) {
      console.error('Failed to update workflow:', err);
      setError(err instanceof Error ? err.message : 'Failed to update workflow');
    } finally {
      setActionLoading(null);
    }
  };

  // ========================================================================
  // Format helpers
  // ========================================================================
  const getStatusBadgeClasses = (status: string) => {
    const statusKey = status as keyof typeof statusBadgeColors;
    const colors = statusBadgeColors[statusKey] || statusBadgeColors.draft;
    return `${colors.bg} ${colors.text}`;
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (authLoading || loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <p className={mutedTextColors.normal}>Loading workflow...</p>
      </div>
    );
  }

  if (!isAdmin || !workflow) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Back Link */}
      <Link
        href="/admin/automation"
        className={`inline-flex items-center gap-2 mb-6 ${coloredLinkText.blue} hover:opacity-80 transition-opacity`}
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Workflows
      </Link>

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className={`text-3xl font-bold ${headingColors.primary} mb-2`}>
              {workflow.name}
            </h1>
            {workflow.description && (
              <p className={mutedTextColors.normal}>{workflow.description}</p>
            )}
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeClasses(workflow.status)}`}
          >
            {getStatusLabel(workflow.status)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Button
            variant="green"
            size="md"
            onClick={handleTestRun}
            disabled={actionLoading === 'test-run'}
            isLoading={actionLoading === 'test-run'}
            loadingText="Running test..."
          >
            <Play className="w-4 h-4 mr-2" />
            Test Run
          </Button>

          <Button
            variant="blue"
            size="md"
            onClick={handleRunNow}
            disabled={actionLoading === 'run-now'}
            isLoading={actionLoading === 'run-now'}
            loadingText="Running..."
          >
            <Play className="w-4 h-4 mr-2" />
            Run Now
          </Button>

          <Link href={`/admin/automation/${workflow.id}/edit`}>
            <Button variant="purple" size="md">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Workflow
            </Button>
          </Link>

          <button
            onClick={handleToggleStatus}
            disabled={actionLoading === 'toggle-status'}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              workflow.status === 'active'
                ? `${accentColors.gold.bg} ${accentColors.gold.text}`
                : `${accentColors.green.bg} ${accentColors.green.text}`
            }`}
          >
            {workflow.status === 'active' ? (
              <>
                <ToggleRight className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4" />
                Activate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className={`mb-6 p-4 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}
        >
          <p className={`text-sm ${alertColors.error.text}`}>{error}</p>
          <button
            onClick={() => setError('')}
            className={`mt-2 text-sm ${alertColors.error.link}`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Workflow Info Card */}
      <Card className="mb-8" hoverEffect="none">
        <div className="p-6">
          <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
            Workflow Details
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className={`text-xs font-medium ${mutedTextColors.normal} mb-1`}>
                Trigger Type
              </p>
              <p className={`font-medium ${headingColors.primary}`}>
                {workflow.trigger_type || 'Manual'}
              </p>
            </div>

            <div>
              <p className={`text-xs font-medium ${mutedTextColors.normal} mb-1`}>
                Status
              </p>
              <p className={`font-medium ${headingColors.primary}`}>
                {getStatusLabel(workflow.status)}
              </p>
            </div>

            <div>
              <p className={`text-xs font-medium ${mutedTextColors.normal} mb-1`}>
                Created
              </p>
              <p className={`font-medium ${headingColors.primary}`}>
                {formatDate(workflow.created_at)}
              </p>
            </div>

            <div>
              <p className={`text-xs font-medium ${mutedTextColors.normal} mb-1`}>
                Last Modified
              </p>
              <p className={`font-medium ${headingColors.primary}`}>
                {formatDate(workflow.updated_at)}
              </p>
            </div>
          </div>

          {/* Steps */}
          {workflow.steps && workflow.steps.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className={`text-sm font-medium ${headingColors.primary} mb-4`}>
                Workflow Steps ({workflow.steps.length})
              </p>
              <div className="space-y-2">
                {workflow.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-3 ${softBgColors.blue} rounded-lg flex items-start gap-3`}
                  >
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${accentColors.blue.text}`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className={`font-medium ${headingColors.primary}`}>
                        {step.label}
                      </p>
                      <p className={`text-xs ${mutedTextColors.normal}`}>
                        Type: {step.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Test Run Panel */}
      {showTestRun && (
        <Card className="mb-8" hoverEffect="none">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${headingColors.primary}`}>
                Test Run Result
              </h2>
              <button
                onClick={() => setTestRunExpanded(!testRunExpanded)}
                className={`text-sm ${coloredLinkText.blue} hover:opacity-80`}
              >
                {testRunExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {testRunResult && (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className={mutedTextColors.normal}>Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClasses(testRunResult.status)}`}
                  >
                    {getStatusLabel(testRunResult.status)}
                  </span>
                </div>

                {/* Timing */}
                <div className="flex items-center justify-between">
                  <span className={mutedTextColors.normal}>Started</span>
                  <span className={`font-medium ${headingColors.primary}`}>
                    {formatDate(testRunResult.started_at)}
                  </span>
                </div>

                {/* Steps */}
                {testRunExpanded && testRunResult.steps.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className={`text-sm font-medium ${headingColors.primary} mb-4`}>
                      Step Execution
                    </p>
                    <div className="space-y-3">
                      {testRunResult.steps.map((step, index) => (
                        <div
                          key={step.id}
                          className={`p-3 ${softBgColors.purple} rounded-lg`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium ${headingColors.primary}`}>
                              Step {index + 1}: {step.label}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClasses(step.status)}`}
                            >
                              {getStatusLabel(step.status)}
                            </span>
                          </div>
                          {step.duration_ms && (
                            <p className={`text-xs ${mutedTextColors.normal}`}>
                              Duration: {formatDuration(step.duration_ms)}
                            </p>
                          )}
                          {step.error && (
                            <p className={`text-xs ${coloredLinkText.red} mt-2`}>
                              Error: {step.error}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error */}
                {testRunResult.error && (
                  <div
                    className={`mt-4 p-3 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}
                  >
                    <p className={`text-sm ${alertColors.error.text}`}>
                      {testRunResult.error}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Execution History */}
      <Card hoverEffect="none">
        <div className="p-6">
          <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
            Execution History
          </h2>

          {executions.length === 0 ? (
            <p className={`text-center py-8 ${mutedTextColors.normal}`}>
              No executions yet. Run the workflow to see history.
            </p>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:${containerBg.elevated} ${dividerColors.border}`}
                  onClick={() =>
                    setExpandedExecution(
                      expandedExecution === execution.id ? null : execution.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`font-medium ${headingColors.primary}`}>
                        Execution {execution.id.slice(0, 8)}...
                      </p>
                      <p className={`text-sm ${mutedTextColors.normal} mt-1`}>
                        {formatDate(execution.started_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {execution.duration_ms && (
                        <span className={`text-sm ${mutedTextColors.normal}`}>
                          {formatDuration(execution.duration_ms)}
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClasses(execution.status)}`}
                      >
                        {getStatusLabel(execution.status)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedExecution === execution.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {execution.total_actions && (
                        <p className={`text-sm ${mutedTextColors.normal}`}>
                          Actions executed: {execution.total_actions}
                        </p>
                      )}
                      {execution.error && (
                        <p className={`text-sm ${coloredLinkText.red} mt-2`}>
                          Error: {execution.error}
                        </p>
                      )}
                      {execution.completed_at && (
                        <p className={`text-xs ${mutedTextColors.normal} mt-2`}>
                          Completed: {formatDate(execution.completed_at)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
