// ============================================================================
// CTASection Storybook Stories
// ============================================================================
// Demonstrates different configurations of the CTASection component including
// various button counts, hover colors, and with/without descriptions.

import type { Meta, StoryObj } from '@storybook/react';
import CTASection from './CTASection';

const meta = {
  title: 'Components/CTASection',
  component: CTASection,
  parameters: {
    layout: 'padded',
    appDirectory: true,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CTASection>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Single Button Configuration
// ============================================================================
// Simple CTA with one primary action button

export const SingleButton: Story = {
  args: {
    title: 'Ready to Get Started?',
    description: 'Join thousands of satisfied customers who trust us with their tasks.',
    buttons: [
      {
        text: 'Get Started Today',
        variant: 'orange',
        href: '/signup',
        size: 'lg',
      },
    ],
    hoverColor: 'orange',
  },
};

// ============================================================================
// Two Button Configuration (Common Pattern)
// ============================================================================
// Primary and secondary action buttons side by side

export const TwoButtons: Story = {
  args: {
    title: 'Ready to Transform Your Workflow?',
    description: 'Start delegating tasks today and reclaim your valuable time.',
    buttons: [
      {
        text: 'Get Started',
        variant: 'orange',
        href: '/signup',
        size: 'lg',
      },
      {
        text: 'View Pricing',
        variant: 'purple',
        href: '/pricing',
        size: 'lg',
      },
    ],
    hoverColor: 'purple',
  },
};

// ============================================================================
// Three Button Configuration
// ============================================================================
// Multiple action options for users to choose from

export const ThreeButtons: Story = {
  args: {
    title: 'Choose Your Path Forward',
    description: 'Multiple ways to get started with our platform.',
    buttons: [
      {
        text: 'Sign Up Free',
        variant: 'orange',
        href: '/signup',
        size: 'md',
      },
      {
        text: 'See Pricing',
        variant: 'purple',
        href: '/pricing',
        size: 'md',
      },
      {
        text: 'Learn More',
        variant: 'blue',
        href: '/how-it-works',
        size: 'md',
      },
    ],
    hoverColor: 'blue',
  },
};

// ============================================================================
// Different Hover Colors
// ============================================================================

export const OrangeHover: Story = {
  args: {
    title: 'Orange Accent Theme',
    description: 'This card uses orange as the hover accent color.',
    buttons: [
      {
        text: 'Primary Action',
        variant: 'orange',
        href: '/action',
      },
      {
        text: 'Secondary Action',
        variant: 'purple',
        href: '/action',
      },
    ],
    hoverColor: 'orange',
  },
};

export const PurpleHover: Story = {
  args: {
    title: 'Purple Accent Theme',
    description: 'This card uses purple as the hover accent color.',
    buttons: [
      {
        text: 'Primary Action',
        variant: 'purple',
        href: '/action',
      },
      {
        text: 'Secondary Action',
        variant: 'blue',
        href: '/action',
      },
    ],
    hoverColor: 'purple',
  },
};

export const BlueHover: Story = {
  args: {
    title: 'Blue Accent Theme',
    description: 'This card uses blue as the hover accent color.',
    buttons: [
      {
        text: 'Primary Action',
        variant: 'blue',
        href: '/action',
      },
      {
        text: 'Secondary Action',
        variant: 'orange',
        href: '/action',
      },
    ],
    hoverColor: 'blue',
  },
};

// ============================================================================
// With and Without Description
// ============================================================================

export const WithDescription: Story = {
  args: {
    title: 'Complete CTA Section',
    description: 'This version includes both a title and a descriptive paragraph to provide context and encourage action.',
    buttons: [
      {
        text: 'Get Started',
        variant: 'orange',
        href: '/signup',
      },
    ],
    hoverColor: 'orange',
  },
};

export const WithoutDescription: Story = {
  args: {
    title: 'Simple CTA - Title Only',
    buttons: [
      {
        text: 'Take Action Now',
        variant: 'purple',
        href: '/action',
      },
    ],
    hoverColor: 'purple',
  },
};

// ============================================================================
// Different Button Sizes
// ============================================================================

export const MixedButtonSizes: Story = {
  args: {
    title: 'Different Button Sizes',
    description: 'Showcasing small, medium, and large button sizes.',
    buttons: [
      {
        text: 'Small Button',
        variant: 'orange',
        href: '/action',
        size: 'sm',
      },
      {
        text: 'Medium Button',
        variant: 'purple',
        href: '/action',
        size: 'md',
      },
      {
        text: 'Large Button',
        variant: 'blue',
        href: '/action',
        size: 'lg',
      },
    ],
    hoverColor: 'orange',
  },
};

// ============================================================================
// Real-World Examples
// ============================================================================

export const SignupCTA: Story = {
  args: {
    title: 'Start Delegating Today',
    description: 'Get your first task completed within 24 hours. No credit card required.',
    buttons: [
      {
        text: 'Create Free Account',
        variant: 'orange',
        href: '/signup',
        size: 'lg',
      },
    ],
    hoverColor: 'orange',
  },
};

export const PricingCTA: Story = {
  args: {
    title: 'Ready to Choose Your Plan?',
    description: 'All plans include unlimited tasks and 24/7 support.',
    buttons: [
      {
        text: 'View All Plans',
        variant: 'purple',
        href: '/pricing',
        size: 'lg',
      },
      {
        text: 'Contact Sales',
        variant: 'blue',
        href: '/contact',
        size: 'lg',
      },
    ],
    hoverColor: 'purple',
  },
};

export const SupportCTA: Story = {
  args: {
    title: 'Need Help?',
    description: 'Our team is here to answer your questions and help you succeed.',
    buttons: [
      {
        text: 'Contact Support',
        variant: 'blue',
        href: '/contact',
      },
      {
        text: 'View FAQ',
        variant: 'purple',
        href: '/faq',
      },
    ],
    hoverColor: 'blue',
  },
};
