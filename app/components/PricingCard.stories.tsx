import type { Meta, StoryObj } from '@storybook/react';
import PricingCard from './PricingCard';

// ============================================================================
// PricingCard Stories
// ============================================================================
// Shows all variants of the PricingCard component:
// - Different pricing tiers (Basic, Professional, Enterprise)
// - Popular badge on/off
// - All color options (purple, blue, green)
// - Different feature list lengths

const meta = {
  title: 'Components/PricingCard',
  component: PricingCard,
  parameters: {
    layout: 'centered',
    appDirectory: true,
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['purple', 'blue', 'green'],
    },
    popular: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[380px] min-h-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PricingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic Tier - Entry level pricing
// ============================================================================

export const BasicPurple: Story = {
  args: {
    name: 'Basic',
    price: '$499',
    period: 'per project',
    description: 'Perfect for small businesses just getting started online',
    features: [
      '5-page custom website',
      'Mobile-responsive design',
      'Basic SEO optimization',
      'Contact form integration',
      '30 days of support',
    ],
    color: 'purple',
    cta: 'Get Started',
    href: '/contact',
    popular: false,
  },
};

export const BasicBlue: Story = {
  args: {
    name: 'Starter',
    price: '$799',
    period: 'per project',
    description: 'Great for growing businesses ready to expand their online presence',
    features: [
      '10-page custom website',
      'Mobile-responsive design',
      'Advanced SEO setup',
      'Google Analytics integration',
      '60 days of support',
      'Social media integration',
    ],
    color: 'blue',
    cta: 'Choose Starter',
    href: '/contact',
    popular: false,
  },
};

// ============================================================================
// Professional Tier - Most popular option
// ============================================================================

export const ProfessionalWithPopular: Story = {
  args: {
    name: 'Professional',
    price: '$1,499',
    period: 'per project',
    description: 'Our most popular choice for businesses that mean business',
    features: [
      'Unlimited pages',
      'Custom design & branding',
      'Advanced SEO & analytics',
      'Blog or news section',
      'E-commerce ready (up to 50 products)',
      'Email marketing integration',
      '90 days of priority support',
      'Performance optimization',
    ],
    color: 'blue',
    cta: 'Get Professional',
    href: '/contact',
    popular: true,
  },
};

export const ProfessionalGreen: Story = {
  args: {
    name: 'Professional',
    price: '$1,499',
    period: 'per project',
    description: 'Complete solution for serious businesses',
    features: [
      'Unlimited pages',
      'Custom design & branding',
      'Advanced SEO & analytics',
      'Blog or news section',
      'E-commerce ready (up to 50 products)',
      '90 days of priority support',
    ],
    color: 'green',
    cta: 'Choose Professional',
    href: '/contact',
    popular: false,
  },
};

// ============================================================================
// Enterprise Tier - Premium offering
// ============================================================================

export const EnterprisePurple: Story = {
  args: {
    name: 'Enterprise',
    price: 'Custom',
    period: 'quote',
    description: 'Tailored solutions for large organizations with complex needs',
    features: [
      'Fully custom web application',
      'Dedicated project manager',
      'Custom integrations & APIs',
      'Advanced security features',
      'Scalable cloud infrastructure',
      'Multi-language support',
      '1 year of dedicated support',
      'Training & documentation',
      'SLA guarantee',
    ],
    color: 'purple',
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
};

export const EnterpriseGreen: Story = {
  args: {
    name: 'Enterprise Plus',
    price: 'From $5,000',
    period: 'per project',
    description: 'Maximum flexibility and support for mission-critical applications',
    features: [
      'Unlimited everything',
      'White-glove service',
      'Custom workflow automation',
      'Advanced analytics dashboard',
      'Priority bug fixes',
      'Quarterly strategy sessions',
      'Lifetime support',
    ],
    color: 'green',
    cta: 'Schedule Consultation',
    href: '/contact',
    popular: false,
  },
};

// ============================================================================
// Popular Badge Variations
// ============================================================================

export const PopularPurple: Story = {
  args: {
    name: 'Most Popular',
    price: '$999',
    period: 'per month',
    description: 'The plan most teams choose for maximum value',
    features: [
      'Everything in Basic',
      'Priority support 24/7',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated account manager',
    ],
    color: 'purple',
    cta: 'Start Free Trial',
    href: '/contact',
    popular: true,
  },
};

export const PopularGreen: Story = {
  args: {
    name: 'Best Value',
    price: '$1,299',
    period: 'per month',
    description: 'Get the most features for your investment',
    features: [
      'All Professional features',
      'Unlimited users',
      'API access',
      'Custom reporting',
      'White-label options',
      '99.9% uptime SLA',
    ],
    color: 'green',
    cta: 'Get Best Value',
    href: '/contact',
    popular: true,
  },
};

// ============================================================================
// Minimal Features - Simpler cards
// ============================================================================

export const MinimalFeatures: Story = {
  args: {
    name: 'Quick Start',
    price: '$299',
    period: 'one-time',
    description: 'Get online fast with our streamlined package',
    features: [
      'Single-page website',
      'Mobile-friendly',
      'Fast delivery (5 days)',
    ],
    color: 'blue',
    cta: 'Quick Start',
    href: '/contact',
    popular: false,
  },
};

// ============================================================================
// All Colors Comparison
// ============================================================================

export const AllColors: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-6 w-[1200px]">
      <PricingCard
        name="Purple Plan"
        price="$99"
        period="per month"
        description="Purple color variant example"
        features={[
          'Feature one',
          'Feature two',
          'Feature three',
          'Feature four',
        ]}
        color="purple"
        cta="Get Purple"
        href="/contact"
        popular={false}
      />
      <PricingCard
        name="Blue Plan"
        price="$199"
        period="per month"
        description="Blue color variant example"
        features={[
          'Feature one',
          'Feature two',
          'Feature three',
          'Feature four',
        ]}
        color="blue"
        cta="Get Blue"
        href="/contact"
        popular={true}
      />
      <PricingCard
        name="Green Plan"
        price="$299"
        period="per month"
        description="Green color variant example"
        features={[
          'Feature one',
          'Feature two',
          'Feature three',
          'Feature four',
        ]}
        color="green"
        cta="Get Green"
        href="/contact"
        popular={false}
      />
    </div>
  ),
};
