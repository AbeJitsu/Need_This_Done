import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';

// ============================================================================
// Deposit Confirmation Email Template
// ============================================================================
// What: Confirmation sent after customer pays deposit on a quote
// Why: Customer needs receipt + clear timeline of what happens next
// How: Shows quote details, deposit paid, balance due, and next steps

export interface DepositConfirmationEmailProps {
  customerEmail: string;
  customerName: string;
  quoteReference: string;
  projectDescription?: string;
  depositAmount: number;
  totalAmount: number;
  balanceRemaining: number;
  paidAt: string;
}

export default function DepositConfirmationEmail({
  customerEmail,
  customerName,
  quoteReference,
  projectDescription,
  depositAmount,
  totalAmount,
  balanceRemaining,
  paidAt,
}: DepositConfirmationEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const firstName = customerName.split(' ')[0];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerEmoji}>🎉</Text>
            <Text style={headerTitle}>You&apos;re All Set!</Text>
            <Text style={headerSubtitle}>Your deposit has been received</Text>
          </Section>

          <Section style={section}>
            {/* Personal greeting */}
            <Text style={greeting}>
              Hi {firstName},
            </Text>
            <Text style={paragraph}>
              Great news! We&apos;ve received your deposit and your project is now officially
              in our queue. We&apos;re excited to get started and can&apos;t wait to bring your
              vision to life.
            </Text>

            <Hr style={divider} />

            {/* Quote Details */}
            <Text style={sectionTitle}>Project Details</Text>
            <Section style={card}>
              <Section style={infoRow}>
                <Text style={infoLabel}>Quote Reference</Text>
                <Text style={infoValueMono}>{quoteReference}</Text>
              </Section>
              {projectDescription && (
                <Section style={infoRow}>
                  <Text style={infoLabel}>Project</Text>
                  <Text style={infoValue}>{projectDescription}</Text>
                </Section>
              )}
              <Section style={infoRow}>
                <Text style={infoLabel}>Email</Text>
                <Text style={infoValue}>{customerEmail}</Text>
              </Section>
              <Section style={infoRow}>
                <Text style={infoLabel}>Payment Date</Text>
                <Text style={infoValue}>{paidAt}</Text>
              </Section>
            </Section>

            <Hr style={divider} />

            {/* Payment Summary */}
            <Text style={sectionTitle}>Payment Summary</Text>
            <Section style={card}>
              <Section style={infoRow}>
                <Text style={infoLabel}>Project Total</Text>
                <Text style={infoValue}>{formatCurrency(totalAmount)}</Text>
              </Section>
              <Section style={infoRow}>
                <Text style={infoLabelSuccess}>Deposit Paid ✓</Text>
                <Text style={infoValueSuccess}>{formatCurrency(depositAmount)}</Text>
              </Section>
              <Section style={infoRowFinal}>
                <Text style={infoLabelBold}>Balance Due Upon Completion</Text>
                <Text style={infoValueBold}>{formatCurrency(balanceRemaining)}</Text>
              </Section>
            </Section>

            <Hr style={divider} />

            {/* What Happens Next */}
            <Text style={sectionTitle}>What Happens Next</Text>
            <Section style={timeline}>
              <Section style={timelineItem}>
                <Text style={timelineNumber}>1</Text>
                <Section style={timelineContent}>
                  <Text style={timelineTitle}>We Get to Work</Text>
                  <Text style={timelineDesc}>
                    Your project moves to the front of our queue and work begins.
                  </Text>
                </Section>
              </Section>

              <Section style={timelineItem}>
                <Text style={timelineNumber}>2</Text>
                <Section style={timelineContent}>
                  <Text style={timelineTitle}>Regular Updates</Text>
                  <Text style={timelineDesc}>
                    We&apos;ll keep you in the loop with progress updates and any questions.
                  </Text>
                </Section>
              </Section>

              <Section style={timelineItem}>
                <Text style={timelineNumber}>3</Text>
                <Section style={timelineContent}>
                  <Text style={timelineTitle}>Review & Feedback</Text>
                  <Text style={timelineDesc}>
                    Once complete, you&apos;ll review the work and we&apos;ll make any needed adjustments.
                  </Text>
                </Section>
              </Section>

              <Section style={timelineItem}>
                <Text style={timelineNumber}>4</Text>
                <Section style={timelineContent}>
                  <Text style={timelineTitle}>Final Payment & Delivery</Text>
                  <Text style={timelineDesc}>
                    After your approval, pay the remaining {formatCurrency(balanceRemaining)} and we&apos;ll hand over everything.
                  </Text>
                </Section>
              </Section>
            </Section>

            {/* CTA */}
            <Section style={buttonSection}>
              <Button style={button} href={siteUrl}>
                Visit NeedThisDone.com
              </Button>
            </Section>

            {/* Footer */}
            <Text style={footerText}>
              Questions about your project? Just reply to this email or contact us at{' '}
              <a href="mailto:hello@needthisdone.com" style={link}>
                hello@needthisdone.com
              </a>
            </Text>
            <Text style={footerMuted}>
              This email serves as your deposit receipt. Please keep it for your records.
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
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  padding: '30px',
  textAlign: 'center',
};

const headerEmoji: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 12px 0',
};

const headerTitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
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

const greeting: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 12px 0',
};

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  color: '#4b5563',
  lineHeight: '1.6',
  margin: '0',
};

const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '16px',
};

const card: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '8px',
};

const infoRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const infoRowFinal: React.CSSProperties = {
  ...infoRow,
  marginTop: '12px',
  paddingTop: '12px',
  borderTop: '1px solid #e5e7eb',
  marginBottom: '0',
};

const infoLabel: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const infoLabelSuccess: React.CSSProperties = {
  ...infoLabel,
  color: '#10b981',
  fontWeight: '600',
};

const infoLabelBold: React.CSSProperties = {
  ...infoLabel,
  color: '#1f2937',
  fontWeight: '600',
};

const infoValue: React.CSSProperties = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  textAlign: 'right',
};

const infoValueMono: React.CSSProperties = {
  ...infoValue,
  fontFamily: 'monospace',
  fontSize: '13px',
  backgroundColor: '#e5e7eb',
  padding: '2px 6px',
  borderRadius: '4px',
};

const infoValueSuccess: React.CSSProperties = {
  ...infoValue,
  color: '#10b981',
  fontWeight: '600',
};

const infoValueBold: React.CSSProperties = {
  ...infoValue,
  fontWeight: 'bold',
  fontSize: '16px',
};

const timeline: React.CSSProperties = {
  marginBottom: '16px',
};

const timelineItem: React.CSSProperties = {
  display: 'flex',
  marginBottom: '16px',
};

const timelineNumber: React.CSSProperties = {
  width: '28px',
  height: '28px',
  backgroundColor: '#10b981',
  color: '#ffffff',
  borderRadius: '50%',
  textAlign: 'center',
  lineHeight: '28px',
  fontWeight: '600',
  fontSize: '14px',
  flexShrink: 0,
  margin: '0',
};

const timelineContent: React.CSSProperties = {
  marginLeft: '12px',
  flex: 1,
};

const timelineTitle: React.CSSProperties = {
  fontWeight: '600',
  color: '#1f2937',
  fontSize: '14px',
  margin: '0 0 4px 0',
};

const timelineDesc: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0',
  lineHeight: '1.4',
};

const buttonSection: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '24px',
  marginBottom: '24px',
};

const button: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '12px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '16px',
};

const link: React.CSSProperties = {
  color: '#10b981',
  textDecoration: 'none',
};

const footerText: React.CSSProperties = {
  textAlign: 'center',
  color: '#6b7280',
  fontSize: '14px',
  marginBottom: '8px',
};

const footerMuted: React.CSSProperties = {
  textAlign: 'center',
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
};
