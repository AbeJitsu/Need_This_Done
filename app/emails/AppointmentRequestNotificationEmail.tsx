import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';

// ============================================================================
// Appointment Request Notification Email Template
// ============================================================================
// What: Sent to admin when a customer requests an appointment
// Why: Admin needs to review and approve/modify/decline appointment requests
// How: Shows customer info, preferred times, and link to admin dashboard

export interface AppointmentRequestNotificationProps {
  requestId: string;
  orderId: string;
  customerName: string | null;
  customerEmail: string;
  serviceName: string;
  durationMinutes: number;
  preferredDate: string;
  preferredTimeStart: string;
  preferredTimeEnd: string;
  alternateDate: string | null;
  alternateTimeStart: string | null;
  alternateTimeEnd: string | null;
  notes: string | null;
  submittedAt: string;
}

export default function AppointmentRequestNotificationEmail({
  requestId,
  orderId,
  customerName,
  customerEmail,
  serviceName,
  durationMinutes,
  preferredDate,
  preferredTimeStart,
  preferredTimeEnd,
  alternateDate,
  alternateTimeStart,
  alternateTimeEnd,
  notes,
  submittedAt,
}: AppointmentRequestNotificationProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const dashboardUrl = `${siteUrl}/admin/appointments`;

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time for display (24h to 12h)
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with purple gradient */}
          <Section style={header}>
            <Text style={headerTitle}>📅 New Appointment Request</Text>
            <Text style={headerSubtitle}>Action Required</Text>
          </Section>

          <Section style={section}>
            {/* Customer Information */}
            <Section style={card}>
              <Text style={cardTitle}>Customer Information</Text>
              <Text style={field}>
                <strong>Name:</strong> {customerName || 'Not provided'}
              </Text>
              <Text style={field}>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${customerEmail}`} style={link}>
                  {customerEmail}
                </a>
              </Text>
              <Text style={field}>
                <strong>Service:</strong> {serviceName} ({durationMinutes} min)
              </Text>
              <Text style={fieldMuted}>
                <strong>Order ID:</strong> {orderId}
              </Text>
            </Section>

            {/* Preferred Time Slot */}
            <Section style={cardGreen}>
              <Text style={cardTitle}>✨ Preferred Time</Text>
              <Text style={timeSlot}>
                {formatDate(preferredDate)}
              </Text>
              <Text style={timeRange}>
                {formatTime(preferredTimeStart)} - {formatTime(preferredTimeEnd)}
              </Text>
            </Section>

            {/* Alternate Time Slot (if provided) */}
            {alternateDate && alternateTimeStart && alternateTimeEnd && (
              <Section style={cardOrange}>
                <Text style={cardTitle}>🔄 Alternate Time</Text>
                <Text style={timeSlot}>
                  {formatDate(alternateDate)}
                </Text>
                <Text style={timeRange}>
                  {formatTime(alternateTimeStart)} - {formatTime(alternateTimeEnd)}
                </Text>
              </Section>
            )}

            {/* Notes (if provided) */}
            {notes && (
              <Section style={cardMuted}>
                <Text style={cardTitle}>💬 Customer Notes</Text>
                <Text style={messageText}>{notes}</Text>
              </Section>
            )}

            {/* Call to Action Button */}
            <Section style={buttonSection}>
              <Button style={button} href={dashboardUrl}>
                Review in Dashboard →
              </Button>
            </Section>

            {/* Request ID and timestamp */}
            <Text style={footerText}>
              Request ID: <code style={code}>{requestId}</code>
            </Text>
            <Text style={footerMuted}>
              Submitted: {submittedAt}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ============================================================================
// Styles
// ============================================================================
// Inline styles for email compatibility (Tailwind not available in emails)

const main: React.CSSProperties = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  backgroundColor: '#f8f9fa',
  padding: '20px',
};

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  overflow: 'hidden',
};

const header: React.CSSProperties = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '30px',
  textAlign: 'center',
};

const headerTitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const headerSubtitle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '16px',
  margin: '0',
};

const section: React.CSSProperties = {
  padding: '30px',
};

const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '8px',
  borderLeft: '4px solid #667eea',
  marginBottom: '20px',
};

const cardGreen: React.CSSProperties = {
  ...card,
  borderLeft: '4px solid #10b981',
  backgroundColor: '#f0fdf4',
};

const cardOrange: React.CSSProperties = {
  ...card,
  borderLeft: '4px solid #f59e0b',
  backgroundColor: '#fffbeb',
};

const cardMuted: React.CSSProperties = {
  ...card,
  borderLeft: '4px solid #94a3b8',
  backgroundColor: '#f8fafc',
};

const cardTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
  marginTop: '0',
  marginBottom: '12px',
};

const field: React.CSSProperties = {
  margin: '8px 0',
  fontSize: '15px',
  lineHeight: '1.6',
};

const fieldMuted: React.CSSProperties = {
  ...field,
  color: '#666',
  fontSize: '14px',
};

const link: React.CSSProperties = {
  color: '#667eea',
  textDecoration: 'none',
};

const timeSlot: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 4px 0',
};

const timeRange: React.CSSProperties = {
  fontSize: '16px',
  color: '#4b5563',
  margin: '0',
};

const messageText: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  margin: '0',
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#4b5563',
};

const buttonSection: React.CSSProperties = {
  backgroundColor: '#667eea',
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center',
  marginBottom: '20px',
};

const button: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#ffffff',
  color: '#667eea',
  padding: '12px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '16px',
};

const footerText: React.CSSProperties = {
  textAlign: 'center',
  color: '#666',
  fontSize: '14px',
  marginBottom: '4px',
};

const footerMuted: React.CSSProperties = {
  textAlign: 'center',
  color: '#9ca3af',
  fontSize: '13px',
  margin: '0',
};

const code: React.CSSProperties = {
  backgroundColor: '#f1f5f9',
  padding: '2px 6px',
  borderRadius: '3px',
  fontFamily: 'monospace',
  fontSize: '13px',
};
