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
// Purchase Receipt Email Template
// ============================================================================
// What: Official receipt sent after successful payment
// Why: Customers need a record of their purchase for accounting/records
// How: Shows itemized order with prices, taxes, and payment confirmation

export interface PurchaseReceiptEmailProps {
  customerEmail: string;
  customerName?: string;
  orderId: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentLast4?: string;
  billingAddress?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export default function PurchaseReceiptEmail({
  customerEmail,
  customerName,
  orderId,
  orderDate,
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  paymentLast4,
  billingAddress,
}: PurchaseReceiptEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';

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
            <Text style={headerTitle}>Receipt</Text>
            <Text style={headerSubtitle}>Thank you for your purchase!</Text>
          </Section>

          <Section style={section}>
            {/* Order Info */}
            <Section style={infoRow}>
              <Text style={infoLabel}>Order Number</Text>
              <Text style={infoValue}>{orderId}</Text>
            </Section>
            <Section style={infoRow}>
              <Text style={infoLabel}>Date</Text>
              <Text style={infoValue}>{orderDate}</Text>
            </Section>
            {customerName && (
              <Section style={infoRow}>
                <Text style={infoLabel}>Customer</Text>
                <Text style={infoValue}>{customerName}</Text>
              </Section>
            )}
            <Section style={infoRow}>
              <Text style={infoLabel}>Email</Text>
              <Text style={infoValue}>{customerEmail}</Text>
            </Section>

            <Hr style={divider} />

            {/* Items */}
            <Text style={sectionTitle}>Order Details</Text>
            <table style={table}>
              <thead>
                <tr>
                  <th style={tableHeader}>Item</th>
                  <th style={tableHeaderRight}>Qty</th>
                  <th style={tableHeaderRight}>Price</th>
                  <th style={tableHeaderRight}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td style={tableCell}>{item.name}</td>
                    <td style={tableCellRight}>{item.quantity}</td>
                    <td style={tableCellRight}>{formatCurrency(item.unitPrice)}</td>
                    <td style={tableCellRight}>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Hr style={divider} />

            {/* Totals */}
            <Section style={totalsSection}>
              <Section style={totalRow}>
                <Text style={totalLabel}>Subtotal</Text>
                <Text style={totalValue}>{formatCurrency(subtotal)}</Text>
              </Section>
              <Section style={totalRow}>
                <Text style={totalLabel}>Tax</Text>
                <Text style={totalValue}>{formatCurrency(tax)}</Text>
              </Section>
              <Section style={totalRowFinal}>
                <Text style={totalLabelBold}>Total</Text>
                <Text style={totalValueBold}>{formatCurrency(total)}</Text>
              </Section>
            </Section>

            <Hr style={divider} />

            {/* Payment Info */}
            <Text style={sectionTitle}>Payment Information</Text>
            <Section style={card}>
              <Text style={field}>
                <strong>Method:</strong> {paymentMethod}
                {paymentLast4 && ` ending in ${paymentLast4}`}
              </Text>
              <Text style={fieldSuccess}>
                Payment Successful
              </Text>
            </Section>

            {/* Billing Address */}
            {billingAddress && (
              <>
                <Text style={sectionTitle}>Billing Address</Text>
                <Section style={card}>
                  <Text style={field}>{billingAddress.line1}</Text>
                  <Text style={field}>
                    {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
                  </Text>
                  <Text style={field}>{billingAddress.country}</Text>
                </Section>
              </>
            )}

            {/* CTA */}
            <Section style={buttonSection}>
              <Button style={button} href={`${siteUrl}/dashboard`}>
                View Order History
              </Button>
            </Section>

            {/* Footer */}
            <Text style={footerText}>
              Questions about your order? Contact us at{' '}
              <a href={`mailto:support@needthisdone.com`} style={link}>
                support@needthisdone.com
              </a>
            </Text>
            <Text style={footerMuted}>
              This receipt serves as proof of your purchase. Please keep it for your records.
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

const infoRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const infoLabel: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const infoValue: React.CSSProperties = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  textAlign: 'right',
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

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const tableHeader: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 0',
  borderBottom: '2px solid #e5e7eb',
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase',
};

const tableHeaderRight: React.CSSProperties = {
  ...tableHeader,
  textAlign: 'right',
};

const tableCell: React.CSSProperties = {
  padding: '12px 0',
  borderBottom: '1px solid #f3f4f6',
  color: '#1f2937',
  fontSize: '14px',
};

const tableCellRight: React.CSSProperties = {
  ...tableCell,
  textAlign: 'right',
};

const totalsSection: React.CSSProperties = {
  marginTop: '16px',
};

const totalRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const totalRowFinal: React.CSSProperties = {
  ...totalRow,
  marginTop: '12px',
  paddingTop: '12px',
  borderTop: '2px solid #e5e7eb',
};

const totalLabel: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const totalValue: React.CSSProperties = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '0',
  textAlign: 'right',
};

const totalLabelBold: React.CSSProperties = {
  ...totalLabel,
  color: '#1f2937',
  fontWeight: 'bold',
  fontSize: '16px',
};

const totalValueBold: React.CSSProperties = {
  ...totalValue,
  fontWeight: 'bold',
  fontSize: '18px',
  color: '#10b981',
};

const card: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '16px',
};

const field: React.CSSProperties = {
  margin: '4px 0',
  fontSize: '14px',
  color: '#4b5563',
};

const fieldSuccess: React.CSSProperties = {
  ...field,
  color: '#10b981',
  fontWeight: '600',
  marginTop: '8px',
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
