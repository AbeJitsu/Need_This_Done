import {
  Container,
  Head,
  Html,
  Body,
  Hr,
  Section,
  Text,
  Link,
  Preview,
} from '@react-email/components';
import * as React from 'react';

interface OrderCanceledEmailProps {
  customerName: string;
  customerEmail: string;
  orderId: string;
  reason: string;
  refunded?: boolean;
  refundAmount?: number;
}

export default function OrderCanceledEmail({
  customerName = 'Valued Customer',
  orderId,
  reason,
  refunded = false,
  refundAmount = 0,
}: OrderCanceledEmailProps) {
  const formattedRefund = refundAmount
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(refundAmount / 100)
    : null;

  return (
    <Html>
      <Head>
        <title>Your Order Has Been Canceled</title>
      </Head>
      <Preview>Order #{orderId} has been canceled. {refunded ? `${formattedRefund} has been refunded.` : ''}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerText}>Order Canceled</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {customerName},</Text>

            <Text style={body}>
              Your order <strong>#{orderId}</strong> has been canceled.
            </Text>

            <Text style={body}>
              <strong>Reason:</strong> {reason}
            </Text>

            {refunded && formattedRefund && (
              <>
                <Hr style={hr} />
                <Section style={refundSection}>
                  <Text style={refundTitle}>Refund Issued</Text>
                  <Text style={refundText}>
                    A refund of <strong>{formattedRefund}</strong> has been issued to your original payment method.
                  </Text>
                  <Text style={refundSmall}>
                    Please allow 3-5 business days for the refund to appear in your account.
                  </Text>
                </Section>
              </>
            )}

            <Hr style={hr} />

            {/* Next Steps */}
            <Section style={nextStepsSection}>
              <Text style={sectionTitle}>What Happens Next?</Text>
              <Text style={body}>
                If you have any questions about this cancellation, please don't hesitate to reach out to us. We're here to help!
              </Text>
              <Text style={body}>
                <Link href="https://needthisdone.com/contact" style={link}>
                  Contact Support
                </Link>
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={hr} />
            <Text style={footerText}>
              © 2026 NeedThisDone. All rights reserved.
            </Text>
            <Text style={footerText}>
              Questions? Contact us at support@needthisdone.com
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
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  marginBottom: '64px',
};

const header: React.CSSProperties = {
  backgroundColor: '#ef4444',
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const headerText: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '600',
  margin: '0',
};

const content: React.CSSProperties = {
  padding: '32px 20px',
};

const greeting: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 16px 0',
};

const body: React.CSSProperties = {
  fontSize: '14px',
  color: '#4b5563',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const hr: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const refundSection: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '16px',
};

const refundTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#16a34a',
  margin: '0 0 8px 0',
};

const refundText: React.CSSProperties = {
  fontSize: '14px',
  color: '#15803d',
  margin: '0 0 8px 0',
  lineHeight: '1.5',
};

const refundSmall: React.CSSProperties = {
  fontSize: '12px',
  color: '#22c55e',
  margin: '0',
};

const nextStepsSection: React.CSSProperties = {
  marginTop: '24px',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 12px 0',
};

const link: React.CSSProperties = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

const footer: React.CSSProperties = {
  padding: '32px 20px',
  backgroundColor: '#f9fafb',
  borderTop: '1px solid #e5e7eb',
};

const footerText: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '8px 0',
};

