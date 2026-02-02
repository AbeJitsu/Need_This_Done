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
// Appointment Reminder Email Template
// ============================================================================
// Sent to customers as a reminder before their upcoming appointment
// Supports 24 hour, 1 hour, or custom time-before reminders

export interface AppointmentReminderEmailProps {
  customerName?: string;
  customerEmail: string;
  appointmentDate: string;    // e.g., "Friday, December 20, 2025"
  appointmentTime: string;    // e.g., "2:00 PM"
  durationMinutes: number;
  serviceName: string;
  meetingLink?: string;       // Video call link if applicable
  orderId: string;
  hoursUntilAppointment: number; // 24 or 1 for display
}

export default function AppointmentReminderEmail({
  customerName,
  customerEmail,
  appointmentDate,
  appointmentTime,
  durationMinutes,
  serviceName,
  meetingLink,
  orderId,
  hoursUntilAppointment,
}: AppointmentReminderEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const displayName = customerName || customerEmail.split('@')[0];
  const reminderMessage = hoursUntilAppointment >= 24
    ? `Your appointment is coming up in ${hoursUntilAppointment} hours`
    : 'Your appointment is happening very soon!';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with blue gradient */}
          <Section style={header}>
            <Text style={headerIcon}>⏰</Text>
            <Text style={headerTitle}>Appointment Reminder</Text>
            <Text style={headerSubtitle}>{reminderMessage}</Text>
          </Section>

          <Section style={section}>
            {/* Greeting */}
            <Text style={greeting}>Hey {displayName},</Text>

            <Text style={paragraph}>
              This is a friendly reminder about your upcoming appointment:
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
            </Section>

            {/* Meeting Link (if video call) */}
            {meetingLink && (
              <>
                <Text style={sectionTitle}>Join Your Meeting</Text>
                <Text style={paragraph}>
                  This appointment will be held via video call. Use the link below to join:
                </Text>
                <Section style={buttonContainer}>
                  <Button style={button} href={meetingLink}>
                    Join Meeting
                  </Button>
                </Section>
              </>
            )}

            {/* Preparation Tips */}
            <Section style={tipsCard}>
              <Text style={tipsTitle}>📝 Before Your Appointment</Text>
              <ul style={tipsList}>
                <li style={tipsItem}>Have any questions or materials ready</li>
                <li style={tipsItem}>Test your audio/video if it's a video call</li>
                <li style={tipsItem}>Join 5 minutes early to avoid delays</li>
                <li style={tipsItem}>
                  Have your order ID handy: <code style={orderIdCode}>{orderId}</code>
                </li>
              </ul>
            </Section>

            {/* CTA and View Order */}
            <Text style={paragraph}>
              Need to reschedule or have questions? Visit your account to manage your appointment:
            </Text>
            <Section style={buttonContainer}>
              <Button style={button} href={`${siteUrl}/orders/${orderId}`}>
                View Your Order
              </Button>
            </Section>

            {/* Footer */}
            <Section style={divider} />
            <Text style={footer}>
              If you need to cancel or reschedule, please contact us as soon as possible.
            </Text>
            <Text style={footer}>
              Questions? We're here to help at{' '}
              <Link style={link} href={`${siteUrl}/contact`}>
                needthisdone.com/contact
              </Link>
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

const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  margin: 0,
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  margin: '40px auto',
  maxWidth: '600px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const header = {
  backgroundColor: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
  padding: '40px 20px',
  textAlign: 'center' as const,
  color: '#ffffff',
};

const headerIcon = {
  fontSize: '48px',
  lineHeight: 1,
  marginBottom: '16px',
};

const headerTitle = {
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  color: '#ffffff',
};

const headerSubtitle = {
  fontSize: '16px',
  fontWeight: '400',
  margin: '0',
  color: 'rgba(255,255,255,0.9)',
};

const section = {
  padding: '40px',
};

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#0f172a',
  marginBottom: '16px',
  margin: '0 0 16px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#475569',
  margin: '16px 0',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '24px 0 12px 0',
};

const appointmentCard = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #bfdbfe',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const appointmentService = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#1e40af',
  margin: '0 0 16px 0',
};

const detailsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '16px',
  marginTop: '12px',
} as React.CSSProperties;

const detailItem = {
  textAlign: 'center' as const,
};

const detailLabel = {
  fontSize: '12px',
  fontWeight: '500',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  margin: '0 0 4px 0',
};

const detailValue = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1e40af',
  margin: '0',
};

const tipsCard = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fcd34d',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const tipsTitle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#92400e',
  margin: '0 0 12px 0',
};

const tipsList = {
  margin: '0',
  paddingLeft: '20px',
  color: '#78350f',
};

const tipsItem = {
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
  color: '#78350f',
};

const orderIdCode = {
  backgroundColor: '#f3f4f6',
  padding: '2px 6px',
  borderRadius: '3px',
  fontFamily: '"Courier New", monospace',
  fontSize: '12px',
  color: '#1e40af',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  border: 'none',
  borderRadius: '6px',
  color: '#ffffff',
  cursor: 'pointer',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  transition: 'background-color 0.2s ease',
};

const divider = {
  backgroundColor: '#e2e8f0',
  height: '1px',
  margin: '32px 0',
};

const footer = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#64748b',
  margin: '12px 0',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};
