'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import Link from 'next/link';
import { Play, Pencil, Trash2, Pause, Check } from 'lucide-react';

// ============================================================================
// Workflow Automation Dashboard - /admin/automation
// ============================================================================
// What: Displays all workflows with execution statistics and controls
// Why: Admins need visibility and control over automated workflows
// How: Fetches from workflows API, displays list with actions and stats

interface WorkflowStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  lastRun: string | null;
}

interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  trigger_type: string;
  created_at: string;
  updated_at: string;
  stats: WorkflowStats;
}

interface DashboardStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
}

export default function WorkflowAutomationDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
  // Fetch workflows and stats
  // ========================================================================
  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/workflows', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch workflows');
      }

      const data = await response.json();
      setWorkflows(data.workflows || []);

      // Calculate stats
      const activeCount = (data.workflows || []).filter(
        (w: Workflow) => w.status === 'active'
      ).length;
      const totalExecutions = (data.workflows || []).reduce(
        (sum: number, w: Workflow) => sum + w.stats.totalExecutions,
        0
      );
      const totalSuccessful = (data.workflows || []).reduce(
        (sum: number, w: Workflow) => sum + w.stats.successfulExecutions,
        0
      );
      const successRate =
        totalExecutions > 0
          ? Math.round((totalSuccessful / totalExecutions) * 100)
          : 0;

      setStats({
        totalWorkflows: data.workflows?.length || 0,
        activeWorkflows: activeCount,
        totalExecutions,
        successRate,
      });
    } catch (err) {
      console.error('Failed to load workflows:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchWorkflows();
  }, [isAdmin, fetchWorkflows]);

  // ========================================================================
  // Handle workflow actions
  // ========================================================================
  const handleToggleStatus = async (workflowId: string, currentStatus: string) => {
    try {
      setActionLoading(workflowId);

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const newStatus = currentStatus === 'active' ? 'paused' : 'active';

      const response = await fetch(`/api/workflows/${workflowId}`, {
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

      // Refresh workflows list
      await fetchWorkflows();
    } catch (err) {
      console.error('Failed to update workflow:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to update workflow'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (workflowId: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(workflowId);

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete workflow');
      }

      // Refresh workflows list
      await fetchWorkflows();
    } catch (err) {
      console.error('Failed to delete workflow:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to delete workflow'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunNow = async (workflowId: string) => {
    try {
      setActionLoading(workflowId);

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
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

      // Show success and refresh
      setError('');
      await fetchWorkflows();
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

  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <p className={mutedTextColors.normal}>Loading workflows...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className={`text-3xl font-bold ${headingColors.primary} mb-2`}>
            Workflow Automation
          </h1>
          <p className={mutedTextColors.normal}>
            Automate your e-commerce operations with visual workflows
          </p>
        </div>
        <Link href="/admin/automation/builder">
          <Button variant="green" size="md">
            Create Workflow
          </Button>
        </Link>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Workflows"
          value={stats.totalWorkflows.toString()}
          color="green"
          icon="📊"
        />
        <StatCard
          label="Active Workflows"
          value={stats.activeWorkflows.toString()}
          color="blue"
          icon="▶️"
          accent={stats.activeWorkflows > 0}
        />
        <StatCard
          label="Total Executions"
          value={stats.totalExecutions.toString()}
          color="purple"
          icon="⚙️"
        />
        <StatCard
          label="Success Rate"
          value={`${stats.successRate}%`}
          color="gold"
          icon="✅"
          isPercentage={true}
          successRate={stats.successRate}
        />
      </div>

      {/* Workflows List */}
      {workflows.length === 0 ? (
        <Card hoverEffect="none">
          <div className="p-8 text-center">
            <div className={`inline-block p-3 ${containerBg.page} rounded-full mb-4`}>
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className={mutedTextColors.normal}>
              No workflows yet. Create your first automation to get started.
            </p>
            <Link href="/admin/automation/builder" className="mt-4 inline-block">
              <Button variant="green">Create Your First Workflow</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${dividerColors.border}`}>
                <th className={`text-left py-3 px-4 font-semibold ${headingColors.secondary}`}>
                  Name
                </th>
                <th className={`text-left py-3 px-4 font-semibold ${headingColors.secondary}`}>
                  Trigger
                </th>
                <th className={`text-left py-3 px-4 font-semibold ${headingColors.secondary}`}>
                  Status
                </th>
                <th className={`text-left py-3 px-4 font-semibold ${headingColors.secondary}`}>
                  Last Run
                </th>
                <th className={`text-left py-3 px-4 font-semibold ${headingColors.secondary}`}>
                  Executions
                </th>
                <th className={`text-right py-3 px-4 font-semibold ${headingColors.secondary}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((workflow) => (
                <tr
                  key={workflow.id}
                  className={`border-b ${dividerColors.border} hover:${containerBg.elevated} transition-colors`}
                >
                  {/* Name */}
                  <td className={`py-4 px-4`}>
                    <div>
                      <p className={`font-medium ${headingColors.primary}`}>
                        {workflow.name}
                      </p>
                      {workflow.description && (
                        <p className={`text-xs ${mutedTextColors.normal} mt-1`}>
                          {workflow.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Trigger Type */}
                  <td className={`py-4 px-4 ${mutedTextColors.normal}`}>
                    <span className="inline-block px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs">
                      {workflow.trigger_type || 'Manual'}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className={`py-4 px-4`}>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(workflow.status)}`}
                    >
                      {getStatusLabel(workflow.status)}
                    </span>
                  </td>

                  {/* Last Run */}
                  <td className={`py-4 px-4 ${mutedTextColors.normal}`}>
                    {formatRelativeTime(workflow.stats.lastRun)}
                  </td>

                  {/* Executions */}
                  <td className={`py-4 px-4`}>
                    <div className="text-sm">
                      <p className={`font-medium ${headingColors.primary}`}>
                        {workflow.stats.totalExecutions}
                      </p>
                      {workflow.stats.totalExecutions > 0 && (
                        <p className={`text-xs ${coloredLinkText.green}`}>
                          {workflow.stats.successfulExecutions} successful
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className={`py-4 px-4`}>
                    <div className="flex justify-end gap-2">
                      {/* Run Now */}
                      <button
                        onClick={() => handleRunNow(workflow.id)}
                        disabled={actionLoading === workflow.id}
                        className={`p-2 rounded hover:${accentColors.blue.bg} transition-colors disabled:opacity-50`}
                        title="Run workflow now"
                        aria-label={`Run ${workflow.name} now`}
                      >
                        <Play className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <Link href={`/admin/automation/${workflow.id}`}>
                        <button
                          className={`p-2 rounded hover:${accentColors.blue.bg} transition-colors`}
                          title="View details"
                          aria-label={`View ${workflow.name} details`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </Link>

                      {/* Toggle Status */}
                      <button
                        onClick={() =>
                          handleToggleStatus(workflow.id, workflow.status)
                        }
                        disabled={
                          actionLoading === workflow.id ||
                          workflow.status === 'archived'
                        }
                        className={`p-2 rounded hover:${accentColors.purple.bg} transition-colors disabled:opacity-50`}
                        title={
                          workflow.status === 'active'
                            ? 'Pause workflow'
                            : 'Activate workflow'
                        }
                        aria-label={`Toggle ${workflow.name} status`}
                      >
                        {workflow.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(workflow.id)}
                        disabled={actionLoading === workflow.id}
                        className={`p-2 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors disabled:opacity-50 text-red-600 dark:text-red-400`}
                        title="Delete workflow"
                        aria-label={`Delete ${workflow.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

interface StatCardProps {
  label: string;
  value: string;
  color: 'green' | 'blue' | 'purple' | 'gold';
  icon: string;
  accent?: boolean;
  isPercentage?: boolean;
  successRate?: number;
}

function StatCard({
  label,
  value,
  color,
  icon,
  accent = false,
  isPercentage = false,
  successRate = 0,
}: StatCardProps) {
  const colorMap = {
    green: softBgColors.green,
    blue: softBgColors.blue,
    purple: softBgColors.purple,
    gold: 'bg-gold-100 dark:bg-gold-800',
  };

  const getStatusColor = () => {
    if (!isPercentage) return colorMap[color];
    if (successRate >= 95) return colorMap.green;
    if (successRate >= 80) return colorMap.blue;
    if (successRate >= 70) return colorMap.gold;
    return colorMap.purple;
  };

  return (
    <Card hoverEffect={accent ? 'lift' : 'none'}>
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-full text-2xl ${getStatusColor()} flex items-center justify-center`}
          >
            {icon}
          </div>
          <div>
            <p className={`text-sm ${mutedTextColors.normal}`}>{label}</p>
            <p className={`text-2xl font-bold ${headingColors.primary}`}>
              {value}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
