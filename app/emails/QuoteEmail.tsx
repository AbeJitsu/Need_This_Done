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
// Quote Email Template
// ============================================================================
// What: Email sent to customers with their quote and payment link
// Why: Customers need to review the quote and pay their deposit
// How: Shows project details, pricing, and CTA to pay deposit

export interface QuoteEmailProps {
  customerEmail: string;
  customerName: string;
  quoteReference: string;
  projectDescription?: string;
  totalAmount: number;
  depositAmount: number;
  expiresAt: string;
  paymentUrl: string;
}

export default function QuoteEmail({
  customerName,
  quoteReference,
  projectDescription,
  totalAmount,
  depositAmount,
  expiresAt,
  paymentUrl,
}: QuoteEmailProps) {
  const firstName = customerName.split(' ')[0];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerEmoji}>📝</Text>
            <Text style={headerTitle}>Your Quote is Ready!</Text>
            <Text style={headerSubtitle}>Review and pay your deposit to get started</Text>
          </Section>

          <Section style={section}>
            {/* Personal greeting */}
            <Text style={greeting}>
              Hi {firstName},
            </Text>
            <Text style={paragraph}>
              Great news! We&apos;ve put together a quote for your project. Take a look
              at the details below and pay your deposit when you&apos;re ready to kick things off.
            </Text>

            <Hr style={divider} />

            {/* Quote Details */}
            <Text style={sectionTitle}>Quote Details</Text>
            <Section style={card}>
              <Section style={infoRow}>
                <Text style={infoLabel}>Quote Reference</Text>
                <Text style={infoValueMono}>{quoteReference}</Text>
              </Section>
              {projectDescription && (
                <Section style={infoRowFull}>
                  <Text style={infoLabel}>Project</Text>
                  <Text style={infoValueFull}>{projectDescription}</Text>
                </Section>
              )}
              <Section style={infoRow}>
                <Text style={infoLabel}>Valid Until</Text>
                <Text style={infoValue}>{formatDate(expiresAt)}</Text>
              </Section>
            </Section>

            <Hr style={divider} />

            {/* Pricing */}
            <Text style={sectionTitle}>Pricing</Text>
            <Section style={pricingCard}>
              <Section style={infoRow}>
                <Text style={infoLabel}>Project Total</Text>
                <Text style={infoValue}>{formatCurrency(totalAmount)}</Text>
              </Section>
              <Section style={infoRowHighlight}>
                <Text style={infoLabelBold}>Deposit to Start (50%)</Text>
                <Text style={infoValueHighlight}>{formatCurrency(depositAmount)}</Text>
              </Section>
              <Section style={infoRow}>
                <Text style={infoLabelMuted}>Balance Due on Completion</Text>
                <Text style={infoValueMuted}>{formatCurrency(totalAmount - depositAmount)}</Text>
              </Section>
            </Section>

            <Hr style={divider} />

            {/* How it works */}
            <Text style={sectionTitle}>How It Works</Text>
            <Section style={timeline}>
              <Section style={timelineItem}>
                <Text style={timelineNumber}>1</Text>
                <Section style={timelineContent}>
                  <Text style={timelineTitle}>Pay Your Deposit</Text>
                  <Text style={timelineDesc}>
                    Click the button below to pay {formatCurrency(depositAmount)} and reserve your spot.
                  </Text>
                </Section>
              </Section>

              <Section style={timelineItem}>
                <Text style={timelineNumber}>2</Text>
                <Section style={timelineContent}>
                  <Text style={timelineTitle}>We Start Working</Text>
                  <Text style={timelineDesc}>
                    Your project moves to the front of our queue and work begins immediately.
                  </Text>
                </Section>
              </Section>

              <Section style={timelineItem}>
                <Text style={timelineNumber}>3</Text>
                <Section style={timelineContent}>
                  <Text style={timelineTitle}>Review & Approve</Text>
                  <Text style={timelineDesc}>
                    You&apos;ll review the finished work and request any adjustments.
                  </Text>
                </Section>
              </Section>

              <Section style={timelineItem}>
                <Text style={timelineNumber}>4</Text>
                <Section style={timelineContent}>
                  <Text style={timelineTitle}>Final Payment & Delivery</Text>
                  <Text style={timelineDesc}>
                    Pay the remaining balance and we&apos;ll hand over everything.
                  </Text>
                </Section>
              </Section>
            </Section>

            {/* CTA */}
            <Section style={buttonSection}>
              <Button style={button} href={paymentUrl}>
                Pay {formatCurrency(depositAmount)} Deposit
              </Button>
            </Section>

            <Text style={linkNote}>
              Or copy this link: <a href={paymentUrl} style={link}>{paymentUrl}</a>
            </Text>

            {/* Footer */}
            <Hr style={divider} />
            <Text style={footerText}>
              Questions about your quote? Just reply to this email or contact us at{' '}
              <a href="mailto:hello@needthisdone.com" style={link}>
                hello@needthisdone.com
              </a>
            </Text>
            <Text style={footerMuted}>
              This quote is valid until {formatDate(expiresAt)}. After that, pricing may change.
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
  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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

const pricingCard: React.CSSProperties = {
  backgroundColor: '#faf5ff',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #e9d5ff',
  marginBottom: '8px',
};

const infoRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const infoRowFull: React.CSSProperties = {
  marginBottom: '8px',
};

const infoRowHighlight: React.CSSProperties = {
  ...infoRow,
  backgroundColor: '#8b5cf6',
  margin: '12px -16px',
  padding: '12px 16px',
};

const infoLabel: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const infoLabelBold: React.CSSProperties = {
  ...infoLabel,
  color: '#ffffff',
  fontWeight: '600',
};

const infoLabelMuted: React.CSSProperties = {
  ...infoLabel,
  color: '#9ca3af',
};

const infoValue: React.CSSProperties = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  textAlign: 'right',
};

const infoValueFull: React.CSSProperties = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '4px 0 0 0',
};

const infoValueMono: React.CSSProperties = {
  ...infoValue,
  fontFamily: 'monospace',
  fontSize: '13px',
  backgroundColor: '#e5e7eb',
  padding: '2px 6px',
  borderRadius: '4px',
};

const infoValueHighlight: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'right',
};

const infoValueMuted: React.CSSProperties = {
  ...infoValue,
  color: '#9ca3af',
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
  backgroundColor: '#8b5cf6',
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
  marginBottom: '16px',
};

const button: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#8b5cf6',
  color: '#ffffff',
  padding: '14px 36px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '16px',
};

const linkNote: React.CSSProperties = {
  textAlign: 'center',
  color: '#9ca3af',
  fontSize: '12px',
  marginBottom: '24px',
  wordBreak: 'break-all',
};

const link: React.CSSProperties = {
  color: '#8b5cf6',
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
