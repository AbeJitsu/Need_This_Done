'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import {
  formInputColors,
  headingColors,
  accentColors,
} from '@/lib/colors';
import { Calendar, Clock, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

// ============================================================================
// Active Appointments Section Component
// ============================================================================
// What: Displays customer's upcoming and pending appointment requests
// Why: Customers need visibility into scheduled consultations
// How: Fetches from /api/user/appointments, shows status and details

interface Appointment {
  id: string;
  customer_name: string | null;
  preferred_date: string;
  preferred_time_start: string;
  preferred_time_end?: string;
  duration_minutes: number;
  status: 'pending' | 'approved' | 'modified' | 'cancelled' | 'completed';
  admin_notes: string | null;
  scheduled_at: string | null;
  google_event_link: string | null;
  created_at: string;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'pending':
      return <HelpCircle className="w-5 h-5 text-blue-600" />;
    case 'modified':
      return <AlertCircle className="w-5 h-5 text-orange-600" />;
    case 'cancelled':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    default:
      return <CheckCircle className="w-5 h-5 text-gray-600" />;
  }
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-green-50 text-green-700 border border-green-200';
    case 'pending':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'modified':
      return 'bg-orange-50 text-orange-700 border border-orange-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border border-red-200';
    case 'completed':
      return 'bg-gray-50 text-gray-700 border border-gray-200';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200';
  }
}

function formatTime(timeString: string): string {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export default function ActiveAppointmentsSection() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/appointments');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load appointments');
        }

        // Filter out completed appointments, sort by date
        const activeAppointments = (data.appointments || [])
          .filter((apt: Appointment) => apt.status !== 'completed' && apt.status !== 'cancelled')
          .sort((a: Appointment, b: Appointment) => {
            return new Date(a.preferred_date).getTime() - new Date(b.preferred_date).getTime();
          });

        setAppointments(activeAppointments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className={formInputColors.helper}>Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card hoverEffect="none">
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className={`text-sm ${formInputColors.helper}`}>{error}</p>
        </div>
      </Card>
    );
  }

  // Empty state
  if (appointments.length === 0) {
    return (
      <Card hoverEffect="none">
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className={`text-lg font-semibold ${headingColors.primary} mb-2`}>
            No appointments scheduled
          </h3>
          <p className={`${formInputColors.helper} mb-6`}>
            When you book a consultation, your appointment will appear here.
          </p>
          <Button variant="green" href="/pricing" size="md">
            Browse Consultations
          </Button>
        </div>
      </Card>
    );
  }

  // Show appointments
  return (
    <div className="space-y-3">
      {appointments.map((appointment) => {
        const appointmentDate = new Date(appointment.preferred_date);
        const dateStr = appointmentDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const timeStr = formatTime(appointment.preferred_time_start);
        const endTimeStr = appointment.preferred_time_end
          ? formatTime(appointment.preferred_time_end)
          : formatTime(
              `${String(Math.floor(parseInt(appointment.preferred_time_start.split(':')[0], 10) + appointment.duration_minutes / 60)).padStart(2, '0')}:${String(
                (parseInt(appointment.preferred_time_start.split(':')[1], 10) + (appointment.duration_minutes % 60)) % 60
              ).padStart(2, '0')}`
            );

        return (
          <Card key={appointment.id} hoverEffect="lift">
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(appointment.status)}
                </div>

                {/* Main content */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className={`font-semibold ${headingColors.primary}`}>
                        Appointment Request
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{dateStr}</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>
                          {timeStr} – {endTimeStr}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusBadgeColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>

                  {/* Admin notes (for modified or special status) */}
                  {appointment.admin_notes && (
                    <div className={`mt-3 p-3 rounded-lg ${accentColors.blue.bg} border ${accentColors.blue.border}`}>
                      <p className={`text-sm ${formInputColors.helper}`}>
                        <strong>Update from us:</strong> {appointment.admin_notes}
                      </p>
                    </div>
                  )}

                  {/* Google Calendar link (for approved appointments) */}
                  {appointment.status === 'approved' && appointment.google_event_link && (
                    <div className="mt-3">
                      <Link
                        href={appointment.google_event_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm font-medium ${accentColors.green.titleText} hover:underline`}
                      >
                        View in Google Calendar →
                      </Link>
                    </div>
                  )}

                  {/* Status-specific messaging */}
                  <p className={`text-xs ${formInputColors.helper} mt-2`}>
                    {appointment.status === 'pending'
                      ? "We'll review your request and confirm within 24 hours."
                      : appointment.status === 'approved'
                      ? 'Your appointment is confirmed. See calendar event for details.'
                      : appointment.status === 'modified'
                      ? 'We suggested a different time. Please review the update above.'
                      : 'This appointment has been cancelled.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
