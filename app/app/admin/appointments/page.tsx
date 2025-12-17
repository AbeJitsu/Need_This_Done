'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { filterButtonColors } from '@/lib/colors';

// ============================================================================
// Appointments Dashboard - /admin/appointments
// ============================================================================
// What: Displays appointment requests from customers
// Why: Admins need to review, approve, modify, or cancel appointment requests
// How: Fetches from Supabase, shows status filters, and provides action buttons

interface AppointmentRequest {
  id: string;
  order_id: string;
  customer_email: string;
  customer_name: string | null;
  preferred_date: string;
  preferred_time_start: string;
  preferred_time_end: string;
  alternate_date: string | null;
  alternate_time_start: string | null;
  alternate_time_end: string | null;
  duration_minutes: number;
  notes: string | null;
  status: 'pending' | 'approved' | 'modified' | 'canceled';
  admin_notes: string | null;
  google_event_id: string | null;
  created_at: string;
  updated_at: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'modified' | 'canceled';

export default function AppointmentsDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
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
  // Fetch appointments
  // ========================================================================
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/appointments', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAppointments();
  }, [isAdmin, fetchAppointments]);

  // ========================================================================
  // Filter appointments by status
  // ========================================================================
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter((apt) => apt.status === statusFilter));
    }
  }, [appointments, statusFilter]);

  // ========================================================================
  // Handle appointment actions
  // ========================================================================
  const handleAction = async (appointmentId: string, action: 'approve' | 'cancel') => {
    try {
      setActionLoading(appointmentId);

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/appointments/${appointmentId}/${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} appointment`);
      }

      // Refresh appointments list
      await fetchAppointments();
    } catch (err) {
      console.error(`Failed to ${action} appointment:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${action} appointment`);
    } finally {
      setActionLoading(null);
    }
  };

  // ========================================================================
  // Get status badge color
  // ========================================================================
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'modified':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'canceled':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  // ========================================================================
  // Format date and time for display
  // ========================================================================
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Appointments
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and manage customer appointment requests
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
          <button
            onClick={() => setError('')}
            className="mt-2 text-sm text-red-700 dark:text-red-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'all'
              ? filterButtonColors.active.purple
              : filterButtonColors.inactive
          }`}
        >
          All ({appointments.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'pending'
              ? filterButtonColors.active.purple
              : filterButtonColors.inactive
          }`}
        >
          Pending ({appointments.filter((a) => a.status === 'pending').length})
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'approved'
              ? filterButtonColors.active.green
              : filterButtonColors.inactive
          }`}
        >
          Approved ({appointments.filter((a) => a.status === 'approved').length})
        </button>
        <button
          onClick={() => setStatusFilter('canceled')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'canceled'
              ? filterButtonColors.active.red
              : filterButtonColors.inactive
          }`}
        >
          Canceled ({appointments.filter((a) => a.status === 'canceled').length})
        </button>
      </div>

      {/* Appointments list */}
      {filteredAppointments.length === 0 ? (
        <Card hoverEffect="none">
          <div className="p-8 text-center">
            <div className="inline-block p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {appointments.length === 0
                ? 'No appointment requests yet. Requests will appear here when customers schedule consultations.'
                : 'No appointments match the selected filter.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} hoverEffect="lift">
              <div className="p-6">
                {/* Header row */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {appointment.customer_name || 'Customer'}
                    </h3>
                    <a
                      href={`mailto:${appointment.customer_email}`}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      {appointment.customer_email}
                    </a>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>

                {/* Date/time details */}
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  {/* Preferred slot */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                      Preferred Time
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatDate(appointment.preferred_date)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatTime(appointment.preferred_time_start)} - {formatTime(appointment.preferred_time_end)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {appointment.duration_minutes} minutes
                    </p>
                  </div>

                  {/* Alternate slot (if provided) */}
                  {appointment.alternate_date && appointment.alternate_time_start && appointment.alternate_time_end && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">
                        Alternate Time
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatDate(appointment.alternate_date)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatTime(appointment.alternate_time_start)} - {formatTime(appointment.alternate_time_end)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes (if any) */}
                {appointment.notes && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Customer Notes</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{appointment.notes}</p>
                  </div>
                )}

                {/* Footer with actions */}
                <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 gap-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p>Order: <span className="font-mono">{appointment.order_id.slice(0, 12)}...</span></p>
                    <p>Requested: {new Date(appointment.created_at).toLocaleDateString()}</p>
                  </div>

                  {/* Action buttons (only for pending appointments) */}
                  {appointment.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="purple"
                        size="sm"
                        onClick={() => handleAction(appointment.id, 'approve')}
                        disabled={actionLoading === appointment.id}
                      >
                        {actionLoading === appointment.id ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        variant="gray"
                        size="sm"
                        onClick={() => handleAction(appointment.id, 'cancel')}
                        disabled={actionLoading === appointment.id}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {/* Show Google Calendar link for approved appointments */}
                  {appointment.status === 'approved' && appointment.google_event_id && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                      </svg>
                      Added to Calendar
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
