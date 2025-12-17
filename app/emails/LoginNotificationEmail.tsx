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
// Login Notification Email Template
// ============================================================================
// Sent to users after successful login for security awareness
// Includes login details and a way to report suspicious activity

export interface LoginNotificationEmailProps {
  email: string;
  loginTime: string;
  ipAddress?: string;
  userAgent?: string;
}

export default function LoginNotificationEmail({
  email,
  loginTime,
  ipAddress,
  userAgent,
}: LoginNotificationEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const displayName = email.split('@')[0];

  // Parse user agent for friendlier display
  const browserInfo = userAgent
    ? userAgent.includes('Chrome')
      ? 'Chrome'
      : userAgent.includes('Firefox')
        ? 'Firefox'
        : userAgent.includes('Safari')
          ? 'Safari'
          : userAgent.includes('Edge')
            ? 'Edge'
            : 'Unknown browser'
    : 'Unknown browser';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with blue gradient for security */}
          <Section style={header}>
            <Text style={headerTitle}>New Sign-In to Your Account</Text>
          </Section>

          <Section style={section}>
            {/* Greeting */}
            <Text style={greeting}>Hey {displayName},</Text>

            <Text style={paragraph}>
              We noticed a new sign-in to your NeedThisDone account. If this was you,
              no action is needed. You're all set!
            </Text>

            {/* Login Details Card */}
            <Section style={card}>
              <Text style={cardTitle}>Sign-In Details</Text>
              <table style={detailsTable}>
                <tbody>
                  <tr>
                    <td style={detailLabel}>When:</td>
                    <td style={detailValue}>{loginTime}</td>
                  </tr>
                  <tr>
                    <td style={detailLabel}>Account:</td>
                    <td style={detailValue}>{email}</td>
                  </tr>
                  {ipAddress && (
                    <tr>
                      <td style={detailLabel}>IP Address:</td>
                      <td style={detailValue}>{ipAddress}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={detailLabel}>Browser:</td>
                    <td style={detailValue}>{browserInfo}</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Security Warning */}
            <Section style={warningCallout}>
              <Text style={warningText}>
                <strong>Wasn't you?</strong> If you didn't sign in, your account may
                have been compromised. Please reset your password immediately:
              </Text>
              <Button style={warningButton} href={`${siteUrl}/auth/reset-password`}>
                Reset Password
              </Button>
            </Section>

            {/* Reassurance */}
            <Text style={paragraph}>
              We send these notifications to help keep your account secure. You'll
              receive an email like this every time someone signs into your account.
            </Text>

            <Text style={signature}>
              Stay safe,
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
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  padding: '40px',
  textAlign: 'center',
};

const headerTitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
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
  backgroundColor: '#f8fafc',
  padding: '25px',
  borderRadius: '8px',
  borderLeft: '4px solid #3b82f6',
  margin: '25px 0',
};

const cardTitle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333',
  marginTop: '0',
  marginBottom: '16px',
};

const detailsTable: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const detailLabel: React.CSSProperties = {
  padding: '8px 0',
  color: '#64748b',
  fontSize: '14px',
  width: '100px',
  verticalAlign: 'top',
};

const detailValue: React.CSSProperties = {
  padding: '8px 0',
  color: '#1e293b',
  fontSize: '14px',
  fontWeight: '500',
};

const warningCallout: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  padding: '20px',
  borderRadius: '8px',
  margin: '25px 0',
  borderLeft: '4px solid #ef4444',
};

const warningText: React.CSSProperties = {
  margin: '0 0 16px 0',
  fontSize: '15px',
  color: '#991b1b',
  lineHeight: '1.6',
};

const warningButton: React.CSSProperties = {
  backgroundColor: '#ef4444',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '14px',
  display: 'inline-block',
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
