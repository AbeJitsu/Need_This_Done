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
// Order Ready for Delivery Email
// ============================================================================
// Sent when admin marks order as ready for delivery and collects final payment

export interface OrderReadyEmailProps {
  orderId: string;
  customerName?: string;
  finalPaymentMethod: 'card' | 'cash' | 'check' | 'other';
  amountCharged?: number;
}

const methodLabels: Record<string, string> = {
  card: 'Credit/Debit Card',
  cash: 'Cash',
  check: 'Check',
  other: 'Alternative Payment',
};

export default function OrderReadyEmail({
  orderId,
  customerName,
  finalPaymentMethod,
  amountCharged,
}: OrderReadyEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={box}>
            <Heading style={heading}>
              🎉 Your Order is Ready!
            </Heading>
          </Section>

          {/* Main Content */}
          <Section style={box}>
            <Text style={paragraph}>
              Hi {customerName ? customerName.split(' ')[0] : 'there'},
            </Text>

            <Text style={paragraph}>
              Great news! Your order is complete and ready for delivery.
            </Text>

            {/* Order Details */}
            <Section style={details}>
              <div style={detailRow}>
                <span style={detailLabel}>Order ID</span>
                <span style={detailValue}>{orderId}</span>
              </div>

              <div style={detailRow}>
                <span style={detailLabel}>Payment Method</span>
                <span style={detailValue}>
                  {methodLabels[finalPaymentMethod] || finalPaymentMethod}
                </span>
              </div>

              {amountCharged && (
                <div style={detailRow}>
                  <span style={detailLabel}>Final Payment Charged</span>
                  <span style={detailValue}>
                    ${(amountCharged / 100).toFixed(2)}
                  </span>
                </div>
              )}
            </Section>

            {amountCharged && (
              <Text style={paragraph}>
                We've charged the remaining balance to your card on file. You'll see this
                charge on your statement as "Need This Done - Final Payment".
              </Text>
            )}

            <Text style={paragraph}>
              Your order will be available shortly. We'll send delivery/pickup details separately.
            </Text>

            {/* CTA Button */}
            <Section style={{ textAlign: 'center' as const, marginTop: '20px' }}>
              <Button
                style={button}
                href={`${siteUrl}/account/orders`}
              >
                View Your Order
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footer}>
              Thank you for your business!
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

const paragraph = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '12px 0',
  padding: '0',
};

const details = {
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
};

const detailRow = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  marginBottom: '8px',
  fontSize: '14px',
};

const detailLabel = {
  color: '#6b7280',
  fontWeight: '500' as const,
};

const detailValue = {
  color: '#111827',
  fontWeight: 'bold' as const,
};

const button = {
  backgroundColor: '#059669',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
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
