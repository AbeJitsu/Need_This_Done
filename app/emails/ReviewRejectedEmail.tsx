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
// Review Rejected Email Template
// ============================================================================
// Sent to customers when their product review is rejected
// Includes reason for rejection and option to revise and resubmit

export interface ReviewRejectedEmailProps {
  customerName?: string;
  customerEmail: string;
  productTitle: string;
  rating: number;
  rejectionReason?: string;
  productUrl?: string;
}

export default function ReviewRejectedEmail({
  customerName,
  customerEmail,
  productTitle,
  rating,
  rejectionReason,
  productUrl,
}: ReviewRejectedEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const displayName = customerName || customerEmail.split('@')[0];
  const reviewLink = productUrl || `${siteUrl}/shop`;
  const stars = '⭐'.repeat(rating);

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with blue gradient */}
          <Section style={header}>
            <Text style={headerIcon}>📝</Text>
            <Text style={headerTitle}>Review Not Approved</Text>
            <Text style={headerSubtitle}>We need some changes before publication</Text>
          </Section>

          <Section style={section}>
            {/* Greeting */}
            <Text style={greeting}>Hey {displayName},</Text>

            <Text style={paragraph}>
              Thank you for taking the time to review <strong>{productTitle}</strong>.
              We appreciate your feedback, but we're unable to publish your review
              at this time.
            </Text>

            {/* Review Summary */}
            <Section style={infoCard}>
              <Text style={infoCardTitle}>Your Review Details</Text>

              <div style={detailRow}>
                <Text style={detailLabel}>Product:</Text>
                <Text style={detailValue}>{productTitle}</Text>
              </div>

              <div style={detailRow}>
                <Text style={detailLabel}>Rating:</Text>
                <Text style={detailValue}>{stars} ({rating}/5)</Text>
              </div>
            </Section>

            {/* Rejection Reason */}
            {rejectionReason ? (
              <Section style={reasonCard}>
                <Text style={reasonTitle}>Reason for Rejection</Text>
                <Text style={reasonText}>{rejectionReason}</Text>
              </Section>
            ) : (
              <Section style={reasonCard}>
                <Text style={reasonTitle}>Why Your Review Wasn't Approved</Text>
                <Text style={reasonText}>
                  Your review didn't meet our community guidelines. Please review
                  our policies and feel free to resubmit with revisions.
                </Text>
              </Section>
            )}

            {/* Community Guidelines */}
            <Section style={guidelinesBox}>
              <Text style={guidelinesTitle}>Our Review Guidelines</Text>
              <Text style={guidelinesText}>
                • Be honest and constructive in your feedback<br />
                • Avoid offensive, discriminatory, or inappropriate language<br />
                • Don't include personal information<br />
                • Focus on the product, not the seller<br />
                • No spam, promotional content, or unrelated comments
              </Text>
            </Section>

            {/* Next Steps */}
            <Section style={ctaSection}>
              <Text style={ctaHelper}>Would you like to revise your review?</Text>
              <Button style={secondaryButton} href={reviewLink}>
                Submit a New Review
              </Button>
            </Section>

            {/* Support */}
            <Section style={supportBox}>
              <Text style={supportTitle}>Still Have Questions?</Text>
              <Text style={supportText}>
                If you believe this was a mistake or have questions about our review
                policy, please don't hesitate to reach out to our support team.
              </Text>
            </Section>

            <Text style={signature}>
              We appreciate your feedback,
              <br />
              <strong style={{ color: '#3b82f6' }}>
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
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
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

const infoCard: React.CSSProperties = {
  backgroundColor: '#f0f9ff',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  border: '1px solid #bfdbfe',
};

const infoCardTitle: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const detailRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  margin: '8px 0',
  paddingBottom: '8px',
  borderBottom: '1px solid #dbeafe',
};

const detailLabel: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const detailValue: React.CSSProperties = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '0',
};

const reasonCard: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #f59e0b',
};

const reasonTitle: React.CSSProperties = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const reasonText: React.CSSProperties = {
  color: '#78350f',
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.6',
};

const guidelinesBox: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
};

const guidelinesTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 12px 0',
};

const guidelinesText: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '1.8',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '30px 0',
};

const ctaHelper: React.CSSProperties = {
  fontSize: '14px',
  color: '#666',
  margin: '0 0 12px 0',
};

const secondaryButton: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
};

const supportBox: React.CSSProperties = {
  backgroundColor: '#f0f9ff',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
};

const supportTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 12px 0',
};

const supportText: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  color: '#1e3a8a',
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
  color: '#3b82f6',
  textDecoration: 'none',
};
