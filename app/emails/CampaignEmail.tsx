import {
  Html,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Button,
  Font,
  Head,
  Preview,
} from '@react-email/components';

interface CampaignEmailProps {
  campaignTitle: string;
  message: string;
  discountCode?: string;
  discountPercent?: number;
  callToActionText?: string;
}

export default function CampaignEmail({
  campaignTitle,
  message,
  discountCode,
  discountPercent,
  callToActionText = 'Shop Now',
}: CampaignEmailProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
            format: 'woff2',
          }}
        />
      </Head>
      <Preview>{campaignTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={headerText}>NeedThisDone</Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Text style={titleText}>{campaignTitle}</Text>

            {message && (
              <Text style={bodyText}>{message}</Text>
            )}

            {/* Discount Code Section */}
            {(discountCode || discountPercent) && (
              <Section style={discountSection}>
                <Row>
                  <Column align="center">
                    <Text style={discountLabel}>
                      {discountPercent ? `${discountPercent}% OFF` : 'SPECIAL OFFER'}
                    </Text>
                    {discountCode && (
                      <Text style={codeText}>Code: {discountCode}</Text>
                    )}
                  </Column>
                </Row>
              </Section>
            )}

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Button
                style={ctaButton}
                href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://needthisdone.com'}/shop`}
              >
                {callToActionText}
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              You received this email because you're on our waitlist for a product you're interested in.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} NeedThisDone. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, sans-serif',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  paddingTop: '20px',
  paddingBottom: '20px',
};

const headerSection = {
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '20px',
  marginBottom: '30px',
  textAlign: 'center' as const,
};

const headerText = {
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  color: '#059669',
};

const contentSection = {
  paddingTop: '20px',
  paddingBottom: '20px',
};

const titleText = {
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 16px 0',
  color: '#1f2937',
};

const bodyText = {
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
  color: '#4b5563',
};

const discountSection = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #059669',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const discountLabel = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#059669',
  margin: '0',
};

const codeText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0 0 0',
  fontFamily: 'monospace',
};

const ctaSection = {
  paddingTop: '20px',
  paddingBottom: '20px',
  textAlign: 'center' as const,
};

const ctaButton = {
  backgroundColor: '#059669',
  color: '#ffffff',
  padding: '12px 32px',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  cursor: 'pointer',
};

const footerSection = {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '20px',
  paddingBottom: '20px',
  marginTop: '30px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '8px 0',
};
