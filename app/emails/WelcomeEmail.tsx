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
// Welcome Email Template
// ============================================================================
// Sent to new users after successful account creation
// Welcomes them and provides helpful getting-started links

export interface WelcomeEmailProps {
  name?: string;
  email: string;
}

export default function WelcomeEmail({ name, email }: WelcomeEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const displayName = name || email.split('@')[0];

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with purple gradient */}
          <Section style={header}>
            <Text style={headerTitle}>Welcome to NeedThisDone!</Text>
          </Section>

          <Section style={section}>
            {/* Greeting */}
            <Text style={greeting}>Hey {displayName},</Text>

            <Text style={paragraph}>
              Your account is all set up and ready to go! We're excited to have you on board.
            </Text>

            {/* What You Can Do Section */}
            <Section style={card}>
              <Text style={cardTitle}>Here's What You Can Do</Text>
              <ul style={list}>
                <li style={listItem}>
                  <strong>Submit projects</strong> — Tell us what you need done and
                  we'll get you a quote within 2 business days
                </li>
                <li style={listItem}>
                  <strong>Track your orders</strong> — See the status of your
                  projects from start to finish
                </li>
                <li style={listItem}>
                  <strong>Browse our services</strong> — From websites to marketing,
                  we've got you covered
                </li>
              </ul>
            </Section>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={`${siteUrl}/contact`}>
                Start Your First Project
              </Button>
            </Section>

            {/* Quick Tip Callout */}
            <Section style={callout}>
              <Text style={calloutText}>
                💡 <strong>Need help?</strong> Check out our{' '}
                <Link href={`${siteUrl}/faq`} style={calloutLink}>
                  FAQ
                </Link>{' '}
                or reply to this email — we're always happy to help!
              </Text>
            </Section>

            <Text style={signature}>
              Welcome aboard,
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

const calloutLink: React.CSSProperties = {
  color: '#4c51bf',
  textDecoration: 'underline',
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
