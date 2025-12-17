import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import * as React from "react";

// ============================================================================
// Abandoned Cart Recovery Email Template
// ============================================================================
// What: Gentle reminder sent to customers who left items in their cart
// Why: Recover potentially lost sales by reminding customers to complete checkout
// How: Shows cart items, subtotal, optional discount, and friendly CTA

export interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

export interface AbandonedCartEmailProps {
  customerEmail: string;
  customerName?: string;
  cartId: string;
  items: CartItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
  cartUrl: string;
}

export default function AbandonedCartEmail({
  customerEmail,
  customerName,
  cartId,
  items,
  subtotal,
  discountCode,
  discountAmount,
  cartUrl,
}: AbandonedCartEmailProps) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://needthisdone.com";
  const displayName = customerName || customerEmail.split("@")[0];

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);

  const hasDiscount = discountCode && discountAmount && discountAmount > 0;
  const finalTotal = hasDiscount ? subtotal - discountAmount : subtotal;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with gentle, inviting design */}
          <Section style={header}>
            <Text style={headerIcon}>🛒</Text>
            <Text style={headerTitle}>You Left Something Behind!</Text>
            <Text style={headerSubtitle}>Your cart is waiting for you</Text>
          </Section>

          <Section style={section}>
            {/* Friendly greeting */}
            <Text style={greeting}>Hey {displayName},</Text>

            <Text style={paragraph}>
              We noticed you left some items in your cart. No worries, we've
              saved everything for you! Ready to complete your order?
            </Text>

            {/* Cart items card */}
            <Section style={card}>
              <Text style={cardTitle}>Your Cart</Text>

              {/* Items table */}
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
                      <td style={tableCell}>{item.name}</td>
                      <td style={tableCellRight}>{item.quantity}</td>
                      <td style={tableCellRight}>
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Hr style={divider} />

              {/* Totals section */}
              <Section style={totalsSection}>
                <Section style={totalRow}>
                  <Text style={totalLabel}>Subtotal</Text>
                  <Text style={totalValue}>{formatPrice(subtotal)}</Text>
                </Section>

                {hasDiscount && (
                  <Section style={totalRow}>
                    <Text style={totalLabelDiscount}>
                      Discount ({discountCode})
                    </Text>
                    <Text style={totalValueDiscount}>
                      -{formatPrice(discountAmount)}
                    </Text>
                  </Section>
                )}

                <Section style={totalRowFinal}>
                  <Text style={totalLabelBold}>Total</Text>
                  <Text style={totalValueBold}>{formatPrice(finalTotal)}</Text>
                </Section>
              </Section>
            </Section>

            {/* Discount callout if applicable */}
            {hasDiscount && (
              <Section style={discountCallout}>
                <Text style={discountTitle}>🎁 Special Offer for You!</Text>
                <Text style={discountText}>
                  Use code{" "}
                  <strong style={discountCodeStyle}>{discountCode}</strong> at
                  checkout to save {formatPrice(discountAmount)}
                </Text>
              </Section>
            )}

            {/* Primary CTA */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={cartUrl}>
                Complete Your Order
              </Button>
            </Section>

            {/* Reassurance text */}
            <Text style={reassurance}>
              Questions? We're here to help! Just reply to this email and we'll
              get back to you right away.
            </Text>

            <Text style={signature}>
              Looking forward to serving you,
              <br />
              <strong style={{ color: "#10b981" }}>
                The Need This Done Team
              </strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <a href={siteUrl} style={footerLink}>
                NeedThisDone.com
              </a>
            </Text>
            <Text style={footerMuted}>
              Professional services that actually get done
            </Text>
            <Text style={footerMuted}>
              No longer interested?{" "}
              <a href={`${siteUrl}/cart/clear?id=${cartId}`} style={footerLink}>
                Clear your cart
              </a>
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
  backgroundColor: "#f8f9fa",
  padding: "20px",
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

const header: React.CSSProperties = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "40px",
  textAlign: "center",
};

const headerIcon: React.CSSProperties = {
  fontSize: "48px",
  margin: "0 0 10px 0",
  color: "#ffffff",
};

const headerTitle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const headerSubtitle: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.9)",
  fontSize: "16px",
  margin: "8px 0 0 0",
};

const section: React.CSSProperties = {
  padding: "30px",
};

const greeting: React.CSSProperties = {
  fontSize: "18px",
  marginTop: "0",
  marginBottom: "16px",
  color: "#1f2937",
};

const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.8",
  margin: "16px 0",
  color: "#4b5563",
};

const card: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  padding: "25px",
  borderRadius: "8px",
  margin: "25px 0",
  border: "1px solid #e5e7eb",
};

const cardTitle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#1f2937",
  marginTop: "0",
  marginBottom: "20px",
};

const itemsTable: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: "20px",
};

const tableHeader: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 0",
  borderBottom: "2px solid #e5e7eb",
  fontSize: "12px",
  fontWeight: "600",
  color: "#6b7280",
  textTransform: "uppercase",
};

const tableHeaderRight: React.CSSProperties = {
  ...tableHeader,
  textAlign: "right",
};

const tableCell: React.CSSProperties = {
  padding: "12px 0",
  borderBottom: "1px solid #f3f4f6",
  fontSize: "15px",
  color: "#1f2937",
};

const tableCellRight: React.CSSProperties = {
  ...tableCell,
  textAlign: "right",
};

const divider: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const totalsSection: React.CSSProperties = {
  marginTop: "10px",
};

const totalRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const totalRowFinal: React.CSSProperties = {
  ...totalRow,
  marginTop: "12px",
  paddingTop: "12px",
  borderTop: "2px solid #e5e7eb",
};

const totalLabel: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "0",
};

const totalValue: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "14px",
  margin: "0",
  textAlign: "right",
};

const totalLabelDiscount: React.CSSProperties = {
  ...totalLabel,
  color: "#10b981",
};

const totalValueDiscount: React.CSSProperties = {
  ...totalValue,
  color: "#10b981",
  fontWeight: "600",
};

const totalLabelBold: React.CSSProperties = {
  ...totalLabel,
  color: "#1f2937",
  fontWeight: "bold",
  fontSize: "16px",
};

const totalValueBold: React.CSSProperties = {
  ...totalValue,
  fontWeight: "bold",
  fontSize: "18px",
  color: "#667eea",
};

const discountCallout: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  padding: "20px",
  borderRadius: "8px",
  margin: "25px 0",
  borderLeft: "4px solid #10b981",
  textAlign: "center",
};

const discountTitle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#166534",
  marginTop: "0",
  marginBottom: "12px",
};

const discountText: React.CSSProperties = {
  margin: "0",
  fontSize: "15px",
  color: "#166534",
  lineHeight: "1.6",
};

const discountCodeStyle: React.CSSProperties = {
  backgroundColor: "#dcfce7",
  padding: "4px 10px",
  borderRadius: "4px",
  fontFamily: "monospace",
  fontSize: "16px",
  color: "#166534",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center",
  margin: "30px 0",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#667eea",
  color: "#ffffff",
  padding: "16px 40px",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "18px",
  display: "inline-block",
  boxShadow: "0 4px 6px rgba(102, 126, 234, 0.2)",
};

const reassurance: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
  textAlign: "center",
  margin: "20px 0",
  lineHeight: "1.6",
};

const signature: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.8",
  marginTop: "24px",
  marginBottom: "0",
  color: "#4b5563",
};

const footer: React.CSSProperties = {
  textAlign: "center",
  padding: "20px",
  borderTop: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
};

const footerText: React.CSSProperties = {
  margin: "5px 0",
  fontSize: "14px",
  color: "#6b7280",
};

const footerLink: React.CSSProperties = {
  color: "#667eea",
  textDecoration: "none",
};

const footerMuted: React.CSSProperties = {
  margin: "5px 0",
  fontSize: "12px",
  color: "#9ca3af",
};
