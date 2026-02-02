'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { accentColors, alertColors, cardBgColors, cardBorderColors, headingColors, mutedTextColors } from '@/lib/colors';

// ============================================================================
// Admin Settings Page - /admin/settings
// ============================================================================
// What: Admin settings for Google Calendar integration and other configurations
// Why: Admins need to connect their Google Calendar for appointment syncing
// How: OAuth flow to connect/disconnect Google Calendar, display connection status

// ============================================================================
// Types
// ============================================================================

interface GoogleCalendarStatus {
  connected: boolean;
  googleEmail?: string;
  connectedAt?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function AdminSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [calendarStatus, setCalendarStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
  // Fetch Google Calendar connection status
  // ========================================================================
  useEffect(() => {
    const fetchCalendarStatus = async () => {
      try {
        setLoading(true);
        setError('');

        const session = await getSession();
        if (!session?.access_token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch('/api/google/status', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch calendar status');
        }

        const data = await response.json();
        setCalendarStatus(data);
      } catch (err) {
        console.error('Error fetching calendar status:', err);
        setError(err instanceof Error ? err.message : 'Failed to load calendar status');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isAdmin && !authLoading) {
      fetchCalendarStatus();
    }
  }, [isAuthenticated, isAdmin, authLoading]);

  // ========================================================================
  // Connect Google Calendar
  // ========================================================================
  const handleConnectCalendar = async () => {
    try {
      setActionLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Get OAuth URL from API
      const response = await fetch('/api/google/connect', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate Google Calendar connection');
      }

      const { auth_url } = await response.json();

      // Redirect to Google OAuth
      window.location.href = auth_url;
    } catch (err) {
      console.error('Error connecting calendar:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect Google Calendar');
      setActionLoading(false);
    }
  };

  // ========================================================================
  // Disconnect Google Calendar
  // ========================================================================
  const handleDisconnectCalendar = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar? New appointments will not sync to your calendar.')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/google/disconnect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect Google Calendar');
      }

      // Update local state
      setCalendarStatus({ connected: false });
    } catch (err) {
      console.error('Error disconnecting calendar:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect Google Calendar');
    } finally {
      setActionLoading(false);
    }
  };

  // ========================================================================
  // Loading state
  // ========================================================================
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
          <div className="animate-pulse">
            <div className={`h-8 ${cardBgColors.elevated} rounded w-1/3 mb-8`}></div>
            <div className={`${cardBgColors.base} rounded-xl p-6 ${cardBorderColors.light} border`}>
              <div className={`h-6 ${cardBgColors.elevated} rounded w-1/4 mb-4`}></div>
              <div className={`h-4 ${cardBgColors.elevated} rounded w-3/4`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${headingColors.primary}`}>Settings</h1>
          <p className={`mt-2 ${mutedTextColors.normal}`}>
            Manage your admin settings and integrations
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`${alertColors.error.bg} ${alertColors.error.border} border rounded-lg p-4 mb-6`}>
            <p className={alertColors.error.text}>{error}</p>
          </div>
        )}

        {/* Google Calendar Integration */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className={`text-xl font-semibold ${headingColors.primary} mb-2`}>
                  Google Calendar Integration
                </h2>
                <p className={mutedTextColors.normal}>
                  Connect your Google Calendar to automatically create events when you approve appointments
                </p>
              </div>

              {calendarStatus?.connected && (
                <div className={`px-3 py-1 rounded-full ${alertColors.success.bg} ${alertColors.success.text} text-sm font-medium`}>
                  Connected
                </div>
              )}
            </div>

            {calendarStatus?.connected ? (
              <div className="space-y-4">
                {/* Connected Account Info */}
                <div className={`${cardBgColors.base} rounded-lg p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${mutedTextColors.normal}`}>
                        Connected Account
                      </p>
                      <p className={`text-base font-semibold ${headingColors.primary} mt-1`}>
                        {calendarStatus.googleEmail}
                      </p>
                      {calendarStatus.connectedAt && (
                        <p className={`text-xs ${mutedTextColors.normal} mt-1`}>
                          Connected {new Date(calendarStatus.connectedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <svg className={`w-10 h-10 ${accentColors.blue.text}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                    </svg>
                  </div>
                </div>

                {/* Features List */}
                <div className={`${cardBgColors.base} rounded-lg p-4`}>
                  <p className={`text-sm font-medium ${headingColors.primary} mb-3`}>Active Features:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className={`w-5 h-5 ${alertColors.success.text} mr-2 flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={mutedTextColors.normal}>Automatic event creation when appointments are approved</span>
                    </li>
                    <li className="flex items-start">
                      <svg className={`w-5 h-5 ${alertColors.success.text} mr-2 flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={mutedTextColors.normal}>Calendar invites sent to customers automatically</span>
                    </li>
                    <li className="flex items-start">
                      <svg className={`w-5 h-5 ${alertColors.success.text} mr-2 flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={mutedTextColors.normal}>Automatic reminders (1 day and 30 minutes before)</span>
                    </li>
                  </ul>
                </div>

                {/* Disconnect Button */}
                <div className="flex justify-end">
                  <Button
                    variant="gray"
                    onClick={handleDisconnectCalendar}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Disconnecting...' : 'Disconnect Calendar'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Not Connected State */}
                <div className={`${cardBgColors.base} rounded-lg p-4`}>
                  <p className={mutedTextColors.normal}>
                    When you connect Google Calendar, approved appointments will automatically:
                  </p>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-start">
                      <svg className={`w-5 h-5 ${accentColors.blue.text} mr-2 flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className={mutedTextColors.normal}>Create events on your Google Calendar</span>
                    </li>
                    <li className="flex items-start">
                      <svg className={`w-5 h-5 ${accentColors.blue.text} mr-2 flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className={mutedTextColors.normal}>Send calendar invites to customers</span>
                    </li>
                    <li className="flex items-start">
                      <svg className={`w-5 h-5 ${accentColors.blue.text} mr-2 flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className={mutedTextColors.normal}>Include automatic email and popup reminders</span>
                    </li>
                  </ul>
                </div>

                {/* Connect Button */}
                <div className="flex justify-end">
                  <Button
                    variant="blue"
                    onClick={handleConnectCalendar}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Connecting...' : 'Connect Google Calendar'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Future Settings Sections */}
        <Card>
          <div className="p-6">
            <h2 className={`text-xl font-semibold ${headingColors.primary} mb-2`}>
              Additional Settings
            </h2>
            <p className={mutedTextColors.normal}>
              More settings and integrations coming soon
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
