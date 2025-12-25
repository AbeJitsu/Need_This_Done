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
// Order Status Update Email Template
// ============================================================================
// Sent to customers when their order status changes
// Keeps customers informed throughout the fulfillment process

export interface OrderStatusUpdateEmailProps {
  customerEmail: string;
  customerName?: string;
  orderId: string;
  previousStatus: string;
  newStatus: string;
  updatedAt: string;
}

// Status display configuration
const statusConfig: Record<string, { icon: string; title: string; message: string; color: string }> = {
  pending: {
    icon: '⏳',
    title: 'Order Received',
    message: 'We\'ve received your order and will begin processing it shortly.',
    color: '#f59e0b',
  },
  processing: {
    icon: '⚙️',
    title: 'Order Processing',
    message: 'Great news! We\'re actively working on your order now.',
    color: '#3b82f6',
  },
  shipped: {
    icon: '📦',
    title: 'Order Shipped',
    message: 'Your order is on its way! You should receive it soon.',
    color: '#8b5cf6',
  },
  delivered: {
    icon: '✓',
    title: 'Order Delivered',
    message: 'Your order has been delivered. We hope you love it!',
    color: '#10b981',
  },
  canceled: {
    icon: '✕',
    title: 'Order Canceled',
    message: 'Your order has been canceled. If you have questions, please reach out.',
    color: '#ef4444',
  },
};

export default function OrderStatusUpdateEmail({
  customerEmail,
  customerName,
  orderId,
  previousStatus,
  newStatus,
  updatedAt,
}: OrderStatusUpdateEmailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
  const displayName = customerName || customerEmail.split('@')[0];
  const status = statusConfig[newStatus] || statusConfig.pending;

  // Format date nicely
  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with dynamic color based on status */}
          <Section style={{ ...header, background: `linear-gradient(135deg, ${status.color} 0%, ${adjustColor(status.color, -20)} 100%)` }}>
            <Text style={headerIcon}>{status.icon}</Text>
            <Text style={headerTitle}>{status.title}</Text>
            <Text style={headerSubtitle}>Order #{orderId}</Text>
          </Section>

          <Section style={section}>
            {/* Greeting */}
            <Text style={greeting}>Hey {displayName},</Text>

            <Text style={paragraph}>
              {status.message}
            </Text>

            {/* Status Update Card */}
            <Section style={card}>
              <Text style={cardTitle}>Status Update</Text>

              {/* Progress indicator */}
              <div style={progressContainer}>
                <div style={progressTrack}>
                  <StatusStep
                    label="Pending"
                    isActive={newStatus === 'pending'}
                    isPast={['processing', 'shipped', 'delivered'].includes(newStatus)}
                    isCanceled={newStatus === 'canceled'}
                  />
                  <div style={progressLine(newStatus !== 'pending' && newStatus !== 'canceled')} />
                  <StatusStep
                    label="Processing"
                    isActive={newStatus === 'processing'}
                    isPast={['shipped', 'delivered'].includes(newStatus)}
                    isCanceled={newStatus === 'canceled'}
                  />
                  <div style={progressLine(['shipped', 'delivered'].includes(newStatus))} />
                  <StatusStep
                    label="Shipped"
                    isActive={newStatus === 'shipped'}
                    isPast={newStatus === 'delivered'}
                    isCanceled={newStatus === 'canceled'}
                  />
                  <div style={progressLine(newStatus === 'delivered')} />
                  <StatusStep
                    label="Delivered"
                    isActive={newStatus === 'delivered'}
                    isPast={false}
                    isCanceled={newStatus === 'canceled'}
                  />
                </div>
              </div>

              <Text style={updateMeta}>
                <strong>Previous Status:</strong> {capitalizeFirst(previousStatus)}
                <br />
                <strong>New Status:</strong> {capitalizeFirst(newStatus)}
                <br />
                <strong>Updated:</strong> {formattedDate}
              </Text>
            </Section>

            {/* Helpful message based on status */}
            {newStatus === 'shipped' && (
              <Section style={callout}>
                <Text style={calloutTitle}>📬 Delivery Tips</Text>
                <Text style={calloutText}>
                  Keep an eye out for your package! If you have any delivery preferences or concerns, feel free to reach out.
                </Text>
              </Section>
            )}

            {newStatus === 'delivered' && (
              <Section style={callout}>
                <Text style={calloutTitle}>💬 We'd Love Your Feedback</Text>
                <Text style={calloutText}>
                  We hope everything arrived in great condition! If you have any questions or feedback about your order, just reply to this email.
                </Text>
              </Section>
            )}

            {newStatus === 'canceled' && (
              <Section style={cancelCallout}>
                <Text style={cancelTitle}>Need Help?</Text>
                <Text style={cancelText}>
                  If you didn't request this cancellation or have any questions, please contact us right away and we'll help sort things out.
                </Text>
              </Section>
            )}

            {/* CTA */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={`${siteUrl}/dashboard`}>
                View Order Details
              </Button>
            </Section>

            <Text style={signature}>
              Thanks for being a customer,
              <br />
              <strong style={{ color: status.color }}>
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
// Helper Components
// ============================================================================

interface StatusStepProps {
  label: string;
  isActive: boolean;
  isPast: boolean;
  isCanceled: boolean;
}

function StatusStep({ label, isActive, isPast, isCanceled }: StatusStepProps) {
  const dotStyle: React.CSSProperties = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: isCanceled
      ? '#d1d5db'
      : isActive
      ? '#10b981'
      : isPast
      ? '#10b981'
      : '#e5e7eb',
    margin: '0 auto 4px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    color: isCanceled ? '#9ca3af' : isActive ? '#10b981' : isPast ? '#6b7280' : '#9ca3af',
    fontWeight: isActive ? 'bold' : 'normal',
    textAlign: 'center',
  };

  return (
    <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '60px' }}>
      <div style={dotStyle} />
      <Text style={labelStyle}>{label}</Text>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function adjustColor(hex: string, percent: number): string {
  // Simple color adjustment for gradient
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 0 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}

function progressLine(active: boolean): React.CSSProperties {
  return {
    display: 'inline-block',
    width: '30px',
    height: '2px',
    backgroundColor: active ? '#10b981' : '#e5e7eb',
    verticalAlign: 'middle',
    margin: '0 4px',
  };
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
  padding: '40px',
  textAlign: 'center',
};

const headerIcon: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 10px 0',
  color: '#ffffff',
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
  color: '#374151',
};

const card: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  padding: '25px',
  borderRadius: '8px',
  margin: '25px 0',
};

const cardTitle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#333',
  marginTop: '0',
  marginBottom: '20px',
  textAlign: 'center',
};

const progressContainer: React.CSSProperties = {
  marginBottom: '20px',
};

const progressTrack: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const updateMeta: React.CSSProperties = {
  fontSize: '14px',
  color: '#666',
  lineHeight: '1.6',
  textAlign: 'center',
  marginBottom: '0',
};

const callout: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  padding: '20px',
  borderRadius: '8px',
  margin: '25px 0',
};

const calloutTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#166534',
  marginTop: '0',
  marginBottom: '12px',
};

const calloutText: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  color: '#166534',
  lineHeight: '1.8',
};

const cancelCallout: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  padding: '20px',
  borderRadius: '8px',
  margin: '25px 0',
  borderLeft: '4px solid #ef4444',
};

const cancelTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#991b1b',
  marginTop: '0',
  marginBottom: '12px',
};

const cancelText: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  color: '#991b1b',
  lineHeight: '1.8',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '30px 0',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
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
  color: '#4f46e5',
  textDecoration: 'none',
};
