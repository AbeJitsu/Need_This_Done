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
// Waitlist Back In Stock Email Template
// ============================================================================
// Sent to customers when a product they're waiting for is back in stock
// Includes product details and direct link to purchase

export interface WaitlistBackInStockEmailProps {
  customerName?: string;
  customerEmail: string;
  productTitle: string;
  productImage?: string;
  productUrl?: string;
  stockQuantity?: number;
}

export default function WaitlistBackInStockEmail({
  customerName,
  customerEmail,
  productTitle,
  productImage,
  productUrl,
  stockQuantity,
}: WaitlistBackInStockEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const displayName = customerName || customerEmail.split('@')[0];
  const shopLink = productUrl || `${siteUrl}/shop`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with green gradient */}
          <Section style={header}>
            <Text style={headerIcon}>📦</Text>
            <Text style={headerTitle}>Great News!</Text>
            <Text style={headerSubtitle}>A product you want is back in stock</Text>
          </Section>

          <Section style={section}>
            {/* Greeting */}
            <Text style={greeting}>Hi {displayName},</Text>

            <Text style={paragraph}>
              The product you've been waiting for is now available again!
            </Text>

            {/* Product Card */}
            <Section style={productCard}>
              {productImage && (
                <img
                  src={productImage}
                  alt={productTitle}
                  style={productImageStyle}
                />
              )}

              <Text style={productTitleStyle}>
                {productTitle}
              </Text>

              {stockQuantity && stockQuantity > 0 && (
                <Text style={stockText}>
                  {stockQuantity} unit{stockQuantity === 1 ? '' : 's'} available
                </Text>
              )}

              <Text style={productDescription}>
                Get it before it sells out again!
              </Text>
            </Section>

            {/* Shop Now CTA */}
            <Section style={ctaSection}>
              <Button style={primaryButton} href={shopLink}>
                Shop Now
              </Button>
            </Section>

            {/* Why You Got This */}
            <Section style={infoBox}>
              <Text style={infoTitle}>Why You Got This Email</Text>
              <Text style={infoText}>
                You signed up on our waitlist to be notified when this product returned
                to stock. If you're no longer interested, you can manage your waitlist
                preferences in your account settings.
              </Text>
            </Section>

            {/* Reminder */}
            <Section style={callout}>
              <Text style={calloutTitle}>⏰ Limited Stock</Text>
              <Text style={calloutText}>
                Popular items tend to sell out quickly. If you're interested, we recommend
                placing your order soon!
              </Text>
            </Section>

            <Text style={signature}>
              Happy shopping,
              <br />
              <strong style={{ color: '#059669' }}>
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
  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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

const productCard: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  padding: '30px',
  borderRadius: '12px',
  margin: '25px 0',
  textAlign: 'center',
  border: '2px solid #dcfce7',
};

const productImageStyle: React.CSSProperties = {
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  marginBottom: '16px',
};

const productTitleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0',
};

const stockText: React.CSSProperties = {
  color: '#059669',
  fontSize: '14px',
  fontWeight: '600',
  margin: '8px 0 0 0',
};

const productDescription: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '15px',
  margin: '12px 0 0 0',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '30px 0',
};

const primaryButton: React.CSSProperties = {
  backgroundColor: '#059669',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
};

const infoBox: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  margin: '25px 0',
};

const infoTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginTop: '0',
  marginBottom: '12px',
};

const infoText: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '1.8',
};

const callout: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  margin: '25px 0',
  borderLeft: '4px solid #f59e0b',
};

const calloutTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#b45309',
  marginTop: '0',
  marginBottom: '12px',
};

const calloutText: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  color: '#92400e',
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
  color: '#059669',
  textDecoration: 'none',
};
