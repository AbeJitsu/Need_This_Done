import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
} from '@react-email/components';

// ============================================================================
// Final Payment Failed Email
// ============================================================================
// Sent when card charge fails and payment method must be updated

export interface FinalPaymentFailedEmailProps {
  orderId: string;
  customerName?: string;
  balanceRemaining: number;
  contactEmail?: string;
}

export default function FinalPaymentFailedEmail({
  orderId,
  customerName,
  balanceRemaining,
  contactEmail = 'support@needthisdone.com',
}: FinalPaymentFailedEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={box}>
            <Heading style={heading}>
              ⚠️ Action Needed: Final Payment
            </Heading>
          </Section>

          {/* Main Content */}
          <Section style={box}>
            <Text style={paragraph}>
              Hi {customerName ? customerName.split(' ')[0] : 'there'},
            </Text>

            <Text style={paragraph}>
              Your order is ready for delivery, but we weren't able to charge your card for the
              remaining balance.
            </Text>

            {/* Balance Due Box */}
            <Section style={alertBox}>
              <div style={alertHeader}>Balance Due</div>
              <div style={alertAmount}>
                ${(balanceRemaining / 100).toFixed(2)}
              </div>
            </Section>

            {/* Why This Happened */}
            <Heading style={subheading}>
              Why did this happen?
            </Heading>

            <Text style={paragraph}>
              This could occur for several reasons:
            </Text>

            <ul style={list}>
              <li style={listItem}>Your card expired</li>
              <li style={listItem}>Insufficient funds available</li>
              <li style={listItem}>Your bank declined the charge</li>
              <li style={listItem}>Card details have changed</li>
            </ul>

            {/* What to Do */}
            <Heading style={subheading}>
              What should you do?
            </Heading>

            <Text style={paragraph}>
              You have several options to complete your payment:
            </Text>

            <ol style={list}>
              <li style={listItem}>
                <strong>Update your payment method</strong> in your account and we'll retry
              </li>
              <li style={listItem}>
                <strong>Contact us directly</strong> to arrange payment
              </li>
              <li style={listItem}>
                <strong>Pay with an alternative method</strong> - we accept cash, check, wire transfer, and more
              </li>
            </ol>

            {/* CTA Buttons */}
            <Section style={{ marginTop: '24px' }}>
              <Section style={{ marginBottom: '12px' }}>
                <Button
                  style={buttonPrimary}
                  href={`${siteUrl}/account/orders`}
                >
                  Update Payment Method
                </Button>
              </Section>

              <Section>
                <Button
                  style={buttonSecondary}
                  href={`mailto:${contactEmail}?subject=Order ${orderId} - Payment Help`}
                >
                  Contact Support
                </Button>
              </Section>
            </Section>

            <Text style={{ ...paragraph, marginTop: '24px', fontSize: '12px', color: '#9ca3af' }}>
              Reply to this email or contact {contactEmail} if you have any questions.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footer}>
              We're here to help!
            </Text>
            <Text style={footer}>
              Need This Done
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f9fafb',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  margin: '0 auto',
  maxWidth: '600px',
  overflow: 'hidden',
};

const box = {
  padding: '24px',
  borderBottom: '1px solid #e5e7eb',
};

const heading = {
  color: '#111827',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
  padding: '0',
};

const subheading = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '16px 0 8px 0',
  padding: '0',
};

const paragraph = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '12px 0',
  padding: '0',
};

const alertBox = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  borderRadius: '4px',
  padding: '16px',
  margin: '16px 0',
};

const alertHeader = {
  color: '#991b1b',
  fontSize: '12px',
  fontWeight: '600' as const,
  marginBottom: '4px',
};

const alertAmount = {
  color: '#dc2626',
  fontSize: '28px',
  fontWeight: 'bold',
};

const list = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '12px 0',
  paddingLeft: '24px',
};

const listItem = {
  marginBottom: '6px',
};

const buttonPrimary = {
  backgroundColor: '#059669',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  display: 'block',
  textAlign: 'center' as const,
};

const buttonSecondary = {
  backgroundColor: '#e5e7eb',
  borderRadius: '6px',
  color: '#111827',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  display: 'inline-block' as const,
  padding: '12px 20px',
};

const footerSection = {
  padding: '24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
};

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '4px 0',
  padding: '0',
};
