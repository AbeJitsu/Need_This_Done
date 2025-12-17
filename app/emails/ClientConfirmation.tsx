import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
} from '@react-email/components';
import * as React from 'react';

// ============================================================================
// Client Confirmation Email Template
// ============================================================================
// Sent to client after successful project submission
// Sets expectations for response time and next steps

export interface ClientConfirmationProps {
  name: string;
  service?: string;
}

export default function ClientConfirmation({
  name,
  service,
}: ClientConfirmationProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with purple gradient */}
          <Section style={header}>
            <Text style={headerTitle}>✨ We Got Your Message!</Text>
          </Section>

          <Section style={section}>
            {/* Greeting */}
            <Text style={greeting}>Hey {name},</Text>

            <Text style={paragraph}>
              Thanks for reaching out
              {service && (
                <>
                  {' '}
                  about our <strong>{service}</strong> service
                </>
              )}
              ! We're excited to learn more about what you need help with.
            </Text>

            {/* What Happens Next Section */}
            <Section style={card}>
              <Text style={cardTitle}>What Happens Next?</Text>
              <ol style={list}>
                <li style={listItem}>
                  <strong>We'll review your request</strong> within{' '}
                  <strong>2 business days</strong>
                </li>
                <li style={listItem}>
                  <strong>You'll receive a personalized quote</strong> via email
                  with pricing and timeline
                </li>
                <li style={listItem}>
                  <strong>Love it?</strong> Pay 50% to start, 50% on delivery.
                  Simple as that
                </li>
              </ol>
            </Section>

            {/* Quick Tip Callout */}
            <Section style={callout}>
              <Text style={calloutText}>
                💡 <strong>Quick tip:</strong> Check your spam folder if you
                don't see our response. We'll be emailing from the same address
                this message came from.
              </Text>
            </Section>

            {/* Additional Resources */}
            <Text style={paragraph}>
              In the meantime, feel free to browse our{' '}
              <Link href={`${siteUrl}/services`} style={link}>
                services
              </Link>{' '}
              or check out our{' '}
              <Link href={`${siteUrl}/faq`} style={link}>
                FAQ
              </Link>{' '}
              for answers to common questions.
            </Text>

            <Text style={signature}>
              Talk soon,
              <br />
              <strong style={{ color: '#667eea' }}>
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
// Inline styles for email compatibility

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
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '40px',
  textAlign: 'center',
};

const headerTitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
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
  backgroundColor: '#ffffff',
  padding: '25px',
  borderRadius: '8px',
  borderLeft: '4px solid #10b981',
  margin: '25px 0',
};

const cardTitle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#333',
  marginTop: '0',
  marginBottom: '16px',
};

const list: React.CSSProperties = {
  paddingLeft: '20px',
  margin: '0',
};

const listItem: React.CSSProperties = {
  marginBottom: '12px',
  fontSize: '15px',
  lineHeight: '1.6',
};

const callout: React.CSSProperties = {
  backgroundColor: '#e0e7ff',
  padding: '20px',
  borderRadius: '8px',
  margin: '25px 0',
};

const calloutText: React.CSSProperties = {
  margin: '0',
  fontSize: '15px',
  color: '#4c51bf',
  lineHeight: '1.6',
};

const link: React.CSSProperties = {
  color: '#667eea',
  textDecoration: 'none',
  fontWeight: '600',
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
  color: '#667eea',
  textDecoration: 'none',
};
