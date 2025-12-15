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
// Order Confirmation Email Template
// ============================================================================
// Sent to customers after successful checkout
// Confirms order details and provides next steps

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  requiresAppointment?: boolean;
}

export interface OrderConfirmationEmailProps {
  customerName?: string;
  customerEmail: string;
  orderId: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  total: number;
  requiresAppointment?: boolean;
}

export default function OrderConfirmationEmail({
  customerName,
  customerEmail,
  orderId,
  orderDate,
  items,
  subtotal,
  tax = 0,
  total,
  requiresAppointment = false,
}: OrderConfirmationEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const displayName = customerName || customerEmail.split('@')[0];

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with green gradient for success */}
          <Section style={header}>
            <Text style={headerIcon}>✓</Text>
            <Text style={headerTitle}>Order Confirmed!</Text>
            <Text style={headerSubtitle}>Order #{orderId}</Text>
          </Section>

          <Section style={section}>
            {/* Greeting */}
            <Text style={greeting}>Hey {displayName},</Text>

            <Text style={paragraph}>
              Thank you for your order! We've received your payment and you're all set.
              {requiresAppointment && (
                <> Since your order includes a consultation, we'll be in touch soon to schedule your appointment.</>
              )}
            </Text>

            {/* Order Summary */}
            <Section style={card}>
              <Text style={cardTitle}>Order Summary</Text>
              <Text style={orderMeta}>
                <strong>Order ID:</strong> {orderId}
                <br />
                <strong>Date:</strong> {orderDate}
              </Text>

              {/* Items */}
              <table style={itemsTable}>
                <thead>
                  <tr>
                    <th style={tableHeader}>Item</th>
                    <th style={tableHeaderRight}>Qty</th>
                    <th style={tableHeaderRight}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={tableCell}>
                        {item.name}
                        {item.requiresAppointment && (
                          <span style={appointmentBadge}> 📅 Appointment</span>
                        )}
                      </td>
                      <td style={tableCellRight}>{item.quantity}</td>
                      <td style={tableCellRight}>{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={totalsSection}>
                <div style={totalsRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {tax > 0 && (
                  <div style={totalsRow}>
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                )}
                <div style={totalsRowFinal}>
                  <span><strong>Total</strong></span>
                  <span><strong>{formatPrice(total)}</strong></span>
                </div>
              </div>
            </Section>

            {/* Appointment CTA if needed */}
            {requiresAppointment && (
              <Section style={appointmentCard}>
                <Text style={appointmentTitle}>📅 Schedule Your Appointment</Text>
                <Text style={appointmentText}>
                  Your order includes a consultation that requires scheduling.
                  Click below to select your preferred time slot.
                </Text>
                <Button style={ctaButton} href={`${siteUrl}/appointment/request?order=${orderId}`}>
                  Schedule Now
                </Button>
              </Section>
            )}

            {/* What's Next */}
            <Section style={callout}>
              <Text style={calloutTitle}>What's Next?</Text>
              <Text style={calloutText}>
                {requiresAppointment ? (
                  <>
                    1. Schedule your appointment using the button above<br />
                    2. We'll confirm your time slot within 24 hours<br />
                    3. You'll receive a calendar invite with meeting details
                  </>
                ) : (
                  <>
                    1. We're processing your order now<br />
                    2. You'll receive updates as we work on it<br />
                    3. Questions? Just reply to this email
                  </>
                )}
              </Text>
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <Button style={secondaryButton} href={`${siteUrl}/dashboard`}>
                View Order in Dashboard
              </Button>
            </Section>

            <Text style={signature}>
              Thanks for choosing us,
              <br />
              <strong style={{ color: '#10b981' }}>
                The Need This Done Team
              </strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
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
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  padding: '40px',
  textAlign: 'center',
};

const headerIcon: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 10px 0',
  color: '#ffffff',
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

const card: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  padding: '25px',
  borderRadius: '8px',
  margin: '25px 0',
};

const cardTitle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#333',
  marginTop: '0',
  marginBottom: '16px',
};

const orderMeta: React.CSSProperties = {
  fontSize: '14px',
  color: '#666',
  marginBottom: '20px',
  lineHeight: '1.6',
};

const itemsTable: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '20px',
};

const tableHeader: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 0',
  borderBottom: '2px solid #e5e7eb',
  fontSize: '14px',
  fontWeight: '600',
  color: '#666',
};

const tableHeaderRight: React.CSSProperties = {
  ...tableHeader,
  textAlign: 'right',
};

const tableCell: React.CSSProperties = {
  padding: '12px 0',
  borderBottom: '1px solid #e5e7eb',
  fontSize: '15px',
};

const tableCellRight: React.CSSProperties = {
  ...tableCell,
  textAlign: 'right',
};

const appointmentBadge: React.CSSProperties = {
  fontSize: '12px',
  color: '#667eea',
};

const totalsSection: React.CSSProperties = {
  marginTop: '10px',
};

const totalsRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  fontSize: '14px',
  color: '#666',
};

const totalsRowFinal: React.CSSProperties = {
  ...totalsRow,
  borderTop: '2px solid #e5e7eb',
  marginTop: '8px',
  paddingTop: '16px',
  fontSize: '16px',
  color: '#333',
};

const appointmentCard: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  padding: '25px',
  borderRadius: '8px',
  borderLeft: '4px solid #667eea',
  margin: '25px 0',
  textAlign: 'center',
};

const appointmentTitle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333',
  marginTop: '0',
  marginBottom: '12px',
};

const appointmentText: React.CSSProperties = {
  fontSize: '15px',
  color: '#666',
  margin: '0 0 20px 0',
  lineHeight: '1.6',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '30px 0',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#667eea',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
  display: 'inline-block',
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

const callout: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  padding: '20px',
  borderRadius: '8px',
  margin: '25px 0',
};

const calloutTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#166534',
  marginTop: '0',
  marginBottom: '12px',
};

const calloutText: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  color: '#166534',
  lineHeight: '1.8',
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

const footerText: React.CSSProperties = {
  margin: '5px 0',
  fontSize: '14px',
  color: '#666',
};

const footerLink: React.CSSProperties = {
  color: '#10b981',
  textDecoration: 'none',
};
