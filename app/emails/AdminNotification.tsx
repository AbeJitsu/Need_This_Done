import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';

// ============================================================================
// Admin Notification Email Template
// ============================================================================
// Sent to admin when a new project submission arrives
// Includes all client details, project info, and link to dashboard

export interface AdminNotificationProps {
  projectId: string;
  name: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
  attachmentCount: number;
  submittedAt: string;
}

export default function AdminNotification({
  projectId,
  name,
  email,
  company,
  service,
  message,
  attachmentCount,
  submittedAt,
}: AdminNotificationProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const dashboardUrl = `${siteUrl}/admin/projects/${projectId}`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with purple gradient */}
          <Section style={header}>
            <Text style={headerTitle}>🎯 New Project Submission</Text>
          </Section>

          {/* Client Information */}
          <Section style={section}>
            <Section style={card}>
              <Text style={cardTitle}>Client Information</Text>
              <Text style={field}>
                <strong>Name:</strong> {name}
              </Text>
              <Text style={field}>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${email}`} style={link}>
                  {email}
                </a>
              </Text>
              {company && (
                <Text style={field}>
                  <strong>Company:</strong> {company}
                </Text>
              )}
              {service && (
                <Text style={field}>
                  <strong>Service Interest:</strong> {service}
                </Text>
              )}
              <Text style={fieldMuted}>
                <strong>Submitted:</strong> {submittedAt}
              </Text>
            </Section>

            {/* Project Details */}
            <Section style={cardGreen}>
              <Text style={cardTitle}>Project Details</Text>
              <Text style={messageText}>{message}</Text>
            </Section>

            {/* Attachments (if any) */}
            {attachmentCount > 0 && (
              <Section style={cardOrange}>
                <Text style={cardTitle}>
                  📎 Attachments ({attachmentCount})
                </Text>
                <Text style={fieldMuted}>
                  View attachments in the admin dashboard
                </Text>
              </Section>
            )}

            {/* Call to Action Button */}
            <Section style={buttonSection}>
              <Button style={button} href={dashboardUrl}>
                View in Dashboard →
              </Button>
            </Section>

            {/* Project ID */}
            <Text style={projectIdText}>
              Project ID: <code style={code}>{projectId}</code>
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
// Inline styles for email compatibility (Tailwind not available in emails)

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
  padding: '30px',
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

const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '8px',
  borderLeft: '4px solid #667eea',
  marginBottom: '20px',
};

const cardGreen: React.CSSProperties = {
  ...card,
  borderLeft: '4px solid #10b981',
};

const cardOrange: React.CSSProperties = {
  ...card,
  borderLeft: '4px solid #f59e0b',
};

const cardTitle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333',
  marginTop: '0',
  marginBottom: '12px',
};

const field: React.CSSProperties = {
  margin: '8px 0',
  fontSize: '15px',
  lineHeight: '1.6',
};

const fieldMuted: React.CSSProperties = {
  ...field,
  color: '#666',
  fontSize: '14px',
};

const link: React.CSSProperties = {
  color: '#667eea',
  textDecoration: 'none',
};

const messageText: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  margin: '0',
  fontSize: '15px',
  lineHeight: '1.6',
};

const buttonSection: React.CSSProperties = {
  backgroundColor: '#667eea',
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center',
  marginBottom: '20px',
};

const button: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#ffffff',
  color: '#667eea',
  padding: '12px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '16px',
};

const projectIdText: React.CSSProperties = {
  textAlign: 'center',
  color: '#666',
  fontSize: '14px',
  marginTop: '20px',
};

const code: React.CSSProperties = {
  backgroundColor: '#f1f5f9',
  padding: '2px 6px',
  borderRadius: '3px',
  fontFamily: 'monospace',
  fontSize: '13px',
};
