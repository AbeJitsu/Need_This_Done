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

export interface ProjectGithubHandoffEmailProps {
  name: string;
  githubUrl: string;
  note?: string | null;
}

export default function ProjectGithubHandoffEmail({
  name,
  githubUrl,
  note,
}: ProjectGithubHandoffEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Your GitHub handoff is ready</Text>
          </Section>
          <Section style={section}>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>
              We have posted a GitHub handoff for your project. Your GitHub account must already have access to the linked repository.
            </Text>
            {note && <Text style={noteStyle}>{note}</Text>}
            <Link href={githubUrl} style={button}>Open GitHub handoff</Link>
            <Text style={paragraph}>Reply to this email if you need help with the handoff.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  backgroundColor: '#f8f9fa',
  padding: '20px',
};
const container: React.CSSProperties = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '10px', overflow: 'hidden' };
const header: React.CSSProperties = { background: '#2563eb', padding: '32px', textAlign: 'center' };
const headerTitle: React.CSSProperties = { color: '#ffffff', fontSize: '24px', fontWeight: 'bold', margin: '0' };
const section: React.CSSProperties = { padding: '30px' };
const paragraph: React.CSSProperties = { fontSize: '16px', lineHeight: '1.6', margin: '16px 0' };
const noteStyle: React.CSSProperties = { backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '16px', fontSize: '15px', lineHeight: '1.5' };
const button: React.CSSProperties = { backgroundColor: '#2563eb', borderRadius: '6px', color: '#ffffff', display: 'inline-block', fontWeight: 'bold', padding: '12px 18px', textDecoration: 'none' };
