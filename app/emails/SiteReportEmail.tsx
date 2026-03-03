import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Link,
} from '@react-email/components';
import * as React from 'react';

// ============================================================================
// Site Report Email Template
// ============================================================================
// Sent after a user submits their URL for analysis.
// Shows enough to hook (score, top wins/losses, summary) — drives click-through
// to the full report page for detailed results.

export interface SiteReportEmailProps {
  email: string;
  url: string;
  score: number;
  grade: string;
  categories: { name: string; earned: number; possible: number; note: string }[];
  executiveSummary: string;
  reportUrl: string;
}

// Grade → color mapping (BJJ belt progression)
const gradeColors: Record<string, string> = {
  A: '#10b981', // emerald
  B: '#3b82f6', // blue
  C: '#8b5cf6', // purple
  D: '#eab308', // gold
  F: '#ef4444', // red
};

export default function SiteReportEmail({
  url,
  score,
  grade,
  categories,
  executiveSummary,
  reportUrl,
}: SiteReportEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const domain = new URL(url).hostname;
  const gradeColor = gradeColors[grade] || '#6b7280';

  // Top wins (full marks) and losses (lost most points)
  const wins = categories.filter((c) => c.earned === c.possible).slice(0, 3);
  const losses = categories
    .map((c) => ({ ...c, lost: c.possible - c.earned }))
    .filter((c) => c.lost > 0)
    .sort((a, b) => b.lost - a.lost)
    .slice(0, 3);

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>Your Site Report Is Ready</Text>
            <Text style={headerSubtitle}>{domain}</Text>
          </Section>

          <Section style={section}>
            {/* Score card */}
            <Section style={scoreCard}>
              <Text style={scoreNumber}>{score}<span style={scoreMax}>/100</span></Text>
              <Text style={{ ...gradeBadge, backgroundColor: gradeColor }}>{grade}</Text>
            </Section>

            {/* Wins and losses */}
            {wins.length > 0 && (
              <Section style={resultsList}>
                {wins.map((w) => (
                  <Text key={w.name} style={resultItem}>
                    <span style={checkMark}>&#10003;</span> {w.name}: {w.note}
                  </Text>
                ))}
              </Section>
            )}

            {losses.length > 0 && (
              <Section style={resultsList}>
                {losses.map((l) => (
                  <Text key={l.name} style={resultItem}>
                    <span style={xMark}>&#10007;</span> {l.name}: {l.note}
                  </Text>
                ))}
              </Section>
            )}

            {/* Executive summary */}
            <Text style={summaryText}>{executiveSummary}</Text>

            {/* Primary CTA */}
            <Section style={ctaSection}>
              <Button style={primaryButton} href={reportUrl}>
                View Your Full Report
              </Button>
            </Section>

            <Hr style={divider} />

            {/* Soft CTA */}
            <Text style={softCtaText}>
              Want help fixing these issues?
            </Text>
            <Section style={ctaSection}>
              <Button style={secondaryButton} href={`${siteUrl}/contact`}>
                Book a Free 15-Min Call
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={siteUrl} style={footerLink}>
                NeedThisDone.com
              </Link>
            </Text>
            <Text style={footerText}>
              Websites, automation & AI for small businesses
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
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  padding: '40px',
  textAlign: 'center',
};

const headerTitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '26px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const headerSubtitle: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '16px',
  margin: '0',
};

const section: React.CSSProperties = {
  padding: '30px',
};

const scoreCard: React.CSSProperties = {
  textAlign: 'center',
  padding: '20px 0',
  marginBottom: '20px',
};

const scoreNumber: React.CSSProperties = {
  fontSize: '52px',
  fontWeight: 'bold',
  color: '#0f172a',
  margin: '0 0 12px 0',
  lineHeight: '1',
};

const scoreMax: React.CSSProperties = {
  fontSize: '24px',
  color: '#94a3b8',
  fontWeight: 'normal',
};

const gradeBadge: React.CSSProperties = {
  display: 'inline-block',
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: 'bold',
  padding: '6px 20px',
  borderRadius: '20px',
  margin: '0',
};

const resultsList: React.CSSProperties = {
  marginBottom: '16px',
};

const resultItem: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '6px 0',
  color: '#374151',
};

const checkMark: React.CSSProperties = {
  color: '#10b981',
  fontWeight: 'bold',
  marginRight: '8px',
};

const xMark: React.CSSProperties = {
  color: '#ef4444',
  fontWeight: 'bold',
  marginRight: '8px',
};

const summaryText: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#4b5563',
  margin: '20px 0',
  padding: '16px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  borderLeft: '4px solid #3b82f6',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '24px 0',
};

const primaryButton: React.CSSProperties = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
  display: 'inline-block',
};

const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const softCtaText: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '16px',
  color: '#374151',
  margin: '0 0 8px 0',
};

const secondaryButton: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: '#3b82f6',
  padding: '12px 28px',
  borderRadius: '8px',
  border: '2px solid #3b82f6',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '15px',
  display: 'inline-block',
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
