import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
} from '@react-email/components';
import * as React from 'react';

// ============================================================================
// Appointment Confirmation Email Template
// ============================================================================
// Sent to customers when admin approves their appointment request
// Includes meeting details and .ics calendar attachment info

export interface AppointmentConfirmationEmailProps {
  customerName?: string;
  customerEmail: string;
  appointmentDate: string;    // e.g., "Friday, December 20, 2025"
  appointmentTime: string;    // e.g., "2:00 PM - 2:30 PM EST"
  durationMinutes: number;
  serviceName: string;
  meetingLink?: string;       // Video call link if applicable
  notes?: string;             // Any notes from admin
  orderId: string;
}

export default function AppointmentConfirmationEmail({
  customerName,
  customerEmail,
  appointmentDate,
  appointmentTime,
  durationMinutes,
  serviceName,
  meetingLink,
  notes,
  orderId,
}: AppointmentConfirmationEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const displayName = customerName || customerEmail.split('@')[0];

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with purple gradient */}
          <Section style={header}>
            <Text style={headerIcon}>📅</Text>
            <Text style={headerTitle}>Appointment Confirmed!</Text>
            <Text style={headerSubtitle}>Your consultation is scheduled</Text>
          </Section>

          <Section style={section}>
            {/* Greeting */}
            <Text style={greeting}>Hey {displayName},</Text>

            <Text style={paragraph}>
              Great news! Your appointment has been confirmed. Here are the details:
            </Text>

            {/* Appointment Details Card */}
            <Section style={appointmentCard}>
              <Text style={appointmentService}>{serviceName}</Text>

              <div style={detailsGrid}>
                <div style={detailItem}>
                  <Text style={detailLabel}>📆 Date</Text>
                  <Text style={detailValue}>{appointmentDate}</Text>
                </div>
                <div style={detailItem}>
                  <Text style={detailLabel}>🕐 Time</Text>
                  <Text style={detailValue}>{appointmentTime}</Text>
                </div>
                <div style={detailItem}>
                  <Text style={detailLabel}>⏱️ Duration</Text>
                  <Text style={detailValue}>{durationMinutes} minutes</Text>
                </div>
              </div>

              {meetingLink && (
                <Section style={meetingSection}>
                  <Text style={meetingLabel}>Meeting Link:</Text>
                  <Button style={meetingButton} href={meetingLink}>
                    Join Video Call
                  </Button>
                </Section>
              )}
            </Section>

            {/* Admin Notes if any */}
            {notes && (
              <Section style={notesCard}>
                <Text style={notesTitle}>Notes from our team:</Text>
                <Text style={notesText}>{notes}</Text>
              </Section>
            )}

            {/* Calendar Reminder */}
            <Section style={calendarReminder}>
              <Text style={calendarReminderText}>
                📎 <strong>Check your email</strong> — We've attached a calendar
                invite (.ics file) that you can add to your calendar app.
              </Text>
            </Section>

            {/* What to Expect */}
            <Section style={callout}>
              <Text style={calloutTitle}>What to Expect</Text>
              <Text style={calloutText}>
                • We'll send a reminder 24 hours before your appointment<br />
                • Have any questions or materials ready to discuss<br />
                • If you need to reschedule, reply to this email ASAP
              </Text>
            </Section>

            {/* Reschedule/Cancel Options */}
            <Section style={ctaSection}>
              <Text style={ctaHelper}>Need to make changes?</Text>
              <Button style={secondaryButton} href={`${siteUrl}/dashboard`}>
                View in Dashboard
              </Button>
            </Section>

            <Text style={signature}>
              See you soon,
              <br />
              <strong style={{ color: '#667eea' }}>
                The Need This Done Team
              </strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerOrderId}>Order #{orderId}</Text>
            <Text style={footerText}>
              <Link href={siteUrl} style={footerLink}>
                NeedThisDone.com
              </Link>
            </Text>
            <Text style={footerText}>
              Professional services that actually get done
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
  padding: '40px',
  textAlign: 'center',
};

const headerIcon: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 10px 0',
};

const headerTitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
};

const headerSubtitle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '16px',
  margin: '8px 0 0 0',
};

const section: React.CSSProperties = {
  padding: '30px',
};

const greeting: React.CSSProperties = {
  fontSize: '18px',
  marginTop: '0',
  marginBottom: '16px',
};

const paragraph: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.8',
  margin: '16px 0',
};

const appointmentCard: React.CSSProperties = {
  backgroundColor: '#667eea',
  padding: '30px',
  borderRadius: '12px',
  margin: '25px 0',
  textAlign: 'center',
};

const appointmentService: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
};

const detailsGrid: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-around',
  flexWrap: 'wrap',
  gap: '20px',
};

const detailItem: React.CSSProperties = {
  textAlign: 'center',
};

const detailLabel: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '14px',
  margin: '0 0 4px 0',
};

const detailValue: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const meetingSection: React.CSSProperties = {
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
};

const meetingLabel: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '14px',
  margin: '0 0 12px 0',
};

const meetingButton: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#667eea',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '14px',
  display: 'inline-block',
};

const notesCard: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
  margin: '25px 0',
};

const notesTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#92400e',
  marginTop: '0',
  marginBottom: '8px',
};

const notesText: React.CSSProperties = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0',
  lineHeight: '1.6',
};

const calendarReminder: React.CSSProperties = {
  backgroundColor: '#f0f9ff',
  padding: '16px 20px',
  borderRadius: '8px',
  margin: '20px 0',
};

const calendarReminderText: React.CSSProperties = {
  fontSize: '14px',
  color: '#0369a1',
  margin: '0',
  lineHeight: '1.6',
};

const callout: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  margin: '25px 0',
};

const calloutTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
  marginTop: '0',
  marginBottom: '12px',
};

const calloutText: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  color: '#666',
  lineHeight: '1.8',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '30px 0',
};

const ctaHelper: React.CSSProperties = {
  fontSize: '14px',
  color: '#666',
  margin: '0 0 12px 0',
};

const secondaryButton: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  color: '#333',
  padding: '14px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
  border: '1px solid #e5e7eb',
};

const signature: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.8',
  marginTop: '24px',
  marginBottom: '0',
};

const footer: React.CSSProperties = {
  textAlign: 'center',
  padding: '20px',
  borderTop: '1px solid #e5e7eb',
  marginTop: '10px',
};

const footerOrderId: React.CSSProperties = {
  fontSize: '12px',
  color: '#999',
  margin: '0 0 10px 0',
};

const footerText: React.CSSProperties = {
  margin: '5px 0',
  fontSize: '14px',
  color: '#666',
};

const footerLink: React.CSSProperties = {
  color: '#667eea',
  textDecoration: 'none',
};
