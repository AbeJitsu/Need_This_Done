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
// Review Approved Email Template
// ============================================================================
// Sent to customers when their product review is approved and published
// Includes product details and link to view published review

export interface ReviewApprovedEmailProps {
  customerName?: string;
  customerEmail: string;
  productTitle: string;
  productImage?: string;
  rating: number;
  reviewTitle?: string;
  productUrl?: string;
}

export default function ReviewApprovedEmail({
  customerName,
  customerEmail,
  productTitle,
  productImage,
  rating,
  reviewTitle,
  productUrl,
}: ReviewApprovedEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const displayName = customerName || customerEmail.split('@')[0];
  const reviewLink = productUrl || `${siteUrl}/shop`;
  const stars = '⭐'.repeat(rating);

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with green gradient */}
          <Section style={header}>
            <Text style={headerIcon}>✅</Text>
            <Text style={headerTitle}>Your Review is Published!</Text>
            <Text style={headerSubtitle}>Thank you for sharing your feedback</Text>
          </Section>

          <Section style={section}>
            {/* Greeting */}
            <Text style={greeting}>Hey {displayName},</Text>

            <Text style={paragraph}>
              Great news! Your review for <strong>{productTitle}</strong> has been
              approved and is now visible to other customers.
            </Text>

            {/* Review Summary Card */}
            <Section style={reviewCard}>
              {productImage && (
                <img
                  src={productImage}
                  alt={productTitle}
                  style={productImage as React.CSSProperties}
                />
              )}

              <Text style={productTitle as React.CSSProperties}>
                {productTitle}
              </Text>

              <div style={ratingSection}>
                <Text style={ratingStars}>{stars}</Text>
                <Text style={ratingText}>{rating} out of 5 stars</Text>
              </div>

              {reviewTitle && (
                <Text style={reviewTitleText}>"{reviewTitle}"</Text>
              )}

              <Text style={reviewHelpText}>
                Your review has been helpful to our community!
              </Text>
            </Section>

            {/* View Review CTA */}
            <Section style={ctaSection}>
              <Button style={primaryButton} href={reviewLink}>
                View Product & Reviews
              </Button>
            </Section>

            {/* Additional Info */}
            <Section style={infoBox}>
              <Text style={infoTitle}>How Your Review Helps</Text>
              <Text style={infoText}>
                • Helps other customers make informed decisions<br />
                • Provides valuable feedback to sellers<br />
                • Builds trust in our community<br />
                • May earn you recognition as a trusted reviewer
              </Text>
            </Section>

            {/* Next Steps */}
            <Section style={callout}>
              <Text style={calloutTitle}>What's Next?</Text>
              <Text style={calloutText}>
                You can continue browsing our catalog and leave reviews on other
                products. We appreciate your contribution to our community!
              </Text>
            </Section>

            <Text style={signature}>
              Thanks for being part of our community,
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

const reviewCard: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  padding: '30px',
  borderRadius: '12px',
  margin: '25px 0',
  textAlign: 'center',
  border: '2px solid #dcfce7',
};


const ratingSection: React.CSSProperties = {
  margin: '16px 0',
};

const ratingStars: React.CSSProperties = {
  fontSize: '28px',
  margin: '0 0 8px 0',
};

const ratingText: React.CSSProperties = {
  color: '#059669',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const reviewTitleText: React.CSSProperties = {
  color: '#374151',
  fontSize: '16px',
  fontStyle: 'italic',
  margin: '16px 0 0 0',
};

const reviewHelpText: React.CSSProperties = {
  color: '#059669',
  fontSize: '14px',
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
  backgroundColor: '#f0fdf4',
  padding: '20px',
  borderRadius: '8px',
  margin: '25px 0',
  borderLeft: '4px solid #059669',
};

const calloutTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#047857',
  marginTop: '0',
  marginBottom: '12px',
};

const calloutText: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  color: '#065f46',
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
