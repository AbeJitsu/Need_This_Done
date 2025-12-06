import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import PageHeader from './PageHeader';

// ============================================================================
// PageHeader Stories - Showcase page header variations
// ============================================================================
// Stories show headers with and without descriptions, plus different content lengths.

const meta: Meta<typeof PageHeader> = {
  component: PageHeader,
  parameters: {
    nextjs: { appDirectory: true },
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The main heading text',
    },
    description: {
      control: 'text',
      description: 'Optional description text below the title',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic Variants - Common use cases
// ============================================================================

export const WithDescription: Story = {
  args: {
    title: 'Welcome to Our Platform',
    description: 'Discover amazing features and services designed to help you succeed. We\'re here to make your life easier.',
  },
};

export const WithoutDescription: Story = {
  args: {
    title: 'Simple Page Title',
  },
};

// ============================================================================
// Content Length Variations
// ============================================================================

export const ShortTitle: Story = {
  args: {
    title: 'About Us',
    description: 'Learn more about our story and mission.',
  },
};

export const LongTitle: Story = {
  args: {
    title: 'Comprehensive Task Management and Project Organization Platform',
    description: 'A complete solution for managing your tasks, tracking progress, and collaborating with your team effectively.',
  },
};

export const LongDescription: Story = {
  args: {
    title: 'Our Services',
    description: 'We offer a comprehensive suite of services designed to meet all your needs. From initial consultation to final delivery, our team of experts is dedicated to providing exceptional results. Whether you\'re a small business or a large enterprise, we have the tools and expertise to help you achieve your goals and grow your business sustainably.',
  },
};

// ============================================================================
// Real-World Examples - Based on actual site pages
// ============================================================================

export const ServicesPage: Story = {
  args: {
    title: 'Our Services',
    description: 'Professional task management solutions tailored to your needs',
  },
};

export const PricingPage: Story = {
  args: {
    title: 'Simple, Transparent Pricing',
    description: 'Choose the plan that works best for you. All plans include our core features.',
  },
};

export const HowItWorksPage: Story = {
  args: {
    title: 'How It Works',
    description: 'Get started in three simple steps',
  },
};

export const ContactPage: Story = {
  args: {
    title: 'Get in Touch',
    description: 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
  },
};

export const FAQPage: Story = {
  args: {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about our platform and services',
  },
};

// ============================================================================
// Edge Cases
// ============================================================================

export const MinimalTitle: Story = {
  args: {
    title: 'FAQ',
  },
};

export const EmptyDescription: Story = {
  args: {
    title: 'Page Title',
    description: '',
  },
};

// ============================================================================
// Visual Comparison - Multiple headers in sequence
// ============================================================================

export const MultipleHeaders: Story = {
  render: () => (
    <div className="space-y-12">
      <PageHeader
        title="First Section"
        description="This shows how multiple headers look when stacked vertically"
      />
      <PageHeader
        title="Second Section"
        description="Each header maintains proper spacing and hierarchy"
      />
      <PageHeader
        title="Third Section"
      />
    </div>
  ),
};
