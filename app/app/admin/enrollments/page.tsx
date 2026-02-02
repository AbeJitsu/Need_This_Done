'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import { formatPrice } from '@/lib/format';
import { headingColors, mutedTextColors, alertColors } from '@/lib/colors';

// ============================================================================
// Admin Enrollments Dashboard - /admin/enrollments
// ============================================================================
// What: Manages and views all user enrollments
// Why: Admins need visibility and control over course enrollments
// How: Displays enrollment list with filters, stats, and management actions

// ============================================================================
// Types
// ============================================================================

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_type: 'free' | 'paid';
  payment_id?: string;
  amount_paid: number;
  progress: number;
  completed_at?: string;
  enrolled_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    raw_user_meta_data?: {
      full_name?: string;
    };
  };
}

interface EnrollmentSummary {
  total: number;
  free: number;
  paid: number;
  completed: number;
  totalRevenue: number;
  averageProgress: number;
}

// ============================================================================
// Component
// ============================================================================

export default function EnrollmentsAdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [summary, setSummary] = useState<EnrollmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'paid'>('all');

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
  // Fetch enrollments
  // ========================================================================
  useEffect(() => {
    if (!isAdmin) return;

    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError('');

        const session = await getSession();
        if (!session?.access_token) {
          throw new Error('Not authenticated');
        }

        const params = new URLSearchParams();
        if (filterType !== 'all') {
          params.set('enrollment_type', filterType);
        }

        const response = await fetch(`/api/admin/enrollments?${params}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch enrollments');
        }

        const data = await response.json();
        setEnrollments(data.enrollments || []);
        setSummary(data.summary || null);
      } catch (err) {
        console.error('Failed to load enrollments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load enrollments');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [isAdmin, filterType]);

  // ========================================================================
  // Delete enrollment handler
  // ========================================================================
  const handleDelete = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to remove this enrollment? This cannot be undone.')) {
      return;
    }

    try {
      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/enrollments?id=${enrollmentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete enrollment');
      }

      // Remove from local state
      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
      alert('Enrollment removed successfully');
    } catch (err) {
      console.error('Failed to delete enrollment:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete enrollment');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite" aria-busy="true">
        <p className={mutedTextColors.normal}>Loading enrollments...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${headingColors.primary} mb-2`}>
          Enrollments Management
        </h1>
        <p className={mutedTextColors.normal}>
          View and manage all user course enrollments
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className={`mb-6 p-4 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}>
          <p className={`text-sm ${alertColors.error.text}`}>{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <MetricCard label="Total Enrollments" value={summary.total.toString()} icon="📚" color="purple" />
          <MetricCard label="Free Enrollments" value={summary.free.toString()} icon="🎓" color="blue" />
          <MetricCard label="Paid Enrollments" value={summary.paid.toString()} icon="💳" color="green" />
          <MetricCard label="Completed" value={summary.completed.toString()} icon="✅" color="teal" />
          <MetricCard label="Total Revenue" value={formatPrice(summary.totalRevenue)} icon="💰" color="gold" />
          <MetricCard label="Avg Progress" value={`${summary.averageProgress}%`} icon="📊" color="purple" />
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="filter" className={`text-sm font-medium ${headingColors.secondary}`}>
          Filter:
        </label>
        <select
          id="filter"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'free' | 'paid')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Enrollments</option>
          <option value="free">Free Only</option>
          <option value="paid">Paid Only</option>
        </select>
        <span className={`text-sm ${mutedTextColors.normal}`}>
          {enrollments.length} {enrollments.length === 1 ? 'enrollment' : 'enrollments'}
        </span>
      </div>

      {/* Enrollments Table */}
      <Card hoverEffect="none">
        <div className="p-6">
          <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
            Enrollment Records
          </h2>
          {enrollments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${headingColors.secondary}`}>
                      User
                    </th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${headingColors.secondary}`}>
                      Course ID
                    </th>
                    <th className={`text-center py-3 px-4 text-sm font-semibold ${headingColors.secondary}`}>
                      Type
                    </th>
                    <th className={`text-center py-3 px-4 text-sm font-semibold ${headingColors.secondary}`}>
                      Progress
                    </th>
                    <th className={`text-right py-3 px-4 text-sm font-semibold ${headingColors.secondary}`}>
                      Amount
                    </th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${headingColors.secondary}`}>
                      Enrolled
                    </th>
                    <th className={`text-center py-3 px-4 text-sm font-semibold ${headingColors.secondary}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className={`py-3 px-4 text-sm ${headingColors.primary}`}>
                        <div>
                          <div className="font-medium">
                            {enrollment.user?.raw_user_meta_data?.full_name || 'Unknown User'}
                          </div>
                          <div className={`text-xs ${mutedTextColors.normal}`}>
                            {enrollment.user?.email}
                          </div>
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-sm ${mutedTextColors.normal} font-mono text-xs`}>
                        {enrollment.course_id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                            enrollment.enrollment_type === 'free'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {enrollment.enrollment_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                          <span className={`text-xs ${mutedTextColors.normal}`}>
                            {enrollment.progress}%
                          </span>
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-right text-sm ${headingColors.primary} font-medium`}>
                        {formatPrice(enrollment.amount_paid)}
                      </td>
                      <td className={`py-3 px-4 text-sm ${mutedTextColors.normal}`}>
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(enrollment.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                          aria-label="Remove enrollment"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className={`${mutedTextColors.normal} mb-4`}>
                No enrollments found
              </p>
              <p className={`text-sm ${mutedTextColors.normal}`}>
                Enrollments will appear here when users sign up for courses
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: 'purple' | 'blue' | 'green' | 'teal' | 'gold';
}) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    teal: 'bg-teal-100 text-teal-600',
    gold: 'bg-gold-100 text-gold-600',
  };

  return (
    <Card hoverEffect="lift">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className={`text-3xl p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <p className={`text-sm ${mutedTextColors.normal}`}>{label}</p>
            <p className={`text-2xl font-bold ${headingColors.primary}`}>{value}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
