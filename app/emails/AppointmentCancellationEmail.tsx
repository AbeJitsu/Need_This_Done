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
// Appointment Cancellation Email Template
// ============================================================================
// Sent to customers when admin cancels their appointment
// Provides helpful next steps and contact information

export interface AppointmentCancellationEmailProps {
  customerName?: string;
  customerEmail: string;
  appointmentDate: string;    // e.g., "Friday, December 20, 2025"
  appointmentTime: string;    // e.g., "2:00 PM - 2:30 PM EST"
  serviceName: string;
  orderId: string;
  reason?: string;            // Optional cancellation reason
}

export default function AppointmentCancellationEmail({
  customerName,
  customerEmail,
  appointmentDate,
  appointmentTime,
  serviceName,
  orderId,
  reason,
}: AppointmentCancellationEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const displayName = customerName || customerEmail.split('@')[0];

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerIcon}>📅</Text>
            <Text style={headerTitle}>Appointment Canceled</Text>
            <Text style={headerSubtitle}>We're sorry for any inconvenience</Text>
          </Section>

          <Section style={section}>
            {/* Greeting */}
            <Text style={greeting}>Hi {displayName},</Text>

            <Text style={paragraph}>
              We're reaching out to let you know that your upcoming appointment has been canceled.
            </Text>

            {/* Appointment Details Card */}
            <Section style={appointmentCard}>
              <Text style={appointmentService}>{serviceName}</Text>

              <div style={detailsGrid}>
                <div style={detailItem}>
                  <Text style={detailLabel}>Date</Text>
                  <Text style={detailValue}>{appointmentDate}</Text>
                </div>
                <div style={detailItem}>
                  <Text style={detailLabel}>Time</Text>
                  <Text style={detailValue}>{appointmentTime}</Text>
                </div>
              </div>

              <Text style={statusBadge}>CANCELED</Text>
            </Section>

            {/* Reason if provided */}
            {reason && (
              <Section style={reasonCard}>
                <Text style={reasonTitle}>Reason for cancellation:</Text>
                <Text style={reasonText}>{reason}</Text>
              </Section>
            )}

            {/* Next Steps */}
            <Section style={callout}>
              <Text style={calloutTitle}>What happens next?</Text>
              <Text style={calloutText}>
                If you paid for this consultation, a full refund will be processed within 3-5 business days.
                You can also reschedule at any time that works for you.
              </Text>
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <Button style={primaryButton} href={`${siteUrl}/pricing`}>
                Book a New Appointment
              </Button>
              <Text style={ctaHelper}>
                or <Link href={`${siteUrl}/contact`} style={ctaLink}>contact us</Link> if you have questions
              </Text>
            </Section>

            <Text style={signature}>
              We apologize for the inconvenience,
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
  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
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
  backgroundColor: '#f3f4f6',
  padding: '30px',
  borderRadius: '12px',
  margin: '25px 0',
  textAlign: 'center',
  border: '2px solid #e5e7eb',
};

const appointmentService: React.CSSProperties = {
  color: '#374151',
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
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 4px 0',
};

const detailValue: React.CSSProperties = {
  color: '#374151',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
  textDecoration: 'line-through',
};

const statusBadge: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  color: '#dc2626',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '8px 16px',
  borderRadius: '20px',
  display: 'inline-block',
  marginTop: '20px',
  border: '1px solid #fecaca',
};

const reasonCard: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
  margin: '25px 0',
};

const reasonTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#92400e',
  marginTop: '0',
  marginBottom: '8px',
};

const reasonText: React.CSSProperties = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0',
  lineHeight: '1.6',
};

const callout: React.CSSProperties = {
  backgroundColor: '#f0f9ff',
  padding: '20px',
  borderRadius: '8px',
  margin: '25px 0',
  borderLeft: '4px solid #0ea5e9',
};

const calloutTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#0369a1',
  marginTop: '0',
  marginBottom: '12px',
};

const calloutText: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  color: '#0369a1',
  lineHeight: '1.8',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '30px 0',
};

const primaryButton: React.CSSProperties = {
  backgroundColor: '#667eea',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
};

const ctaHelper: React.CSSProperties = {
  fontSize: '14px',
  color: '#666',
  margin: '16px 0 0 0',
};

const ctaLink: React.CSSProperties = {
  color: '#667eea',
  textDecoration: 'underline',
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
