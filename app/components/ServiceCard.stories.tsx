import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ServiceCard from './ServiceCard';

// ============================================================================
// ServiceCard Stories
// ============================================================================
// Shows all variants of the ServiceCard component:
// - Compact variant with left border (used on home page)
// - Full variant with top border (used on services page)
// - All color options (purple, blue, green)
// - With and without href links

const meta = {
  title: 'Components/ServiceCard',
  component: ServiceCard,
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
    variant: {
      control: 'radio',
      options: ['compact', 'full'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ServiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Compact Variants - Left border, title + tagline only
// ============================================================================

export const CompactPurple: Story = {
  args: {
    title: 'Website Development',
    tagline: 'Custom websites built with modern technology',
    description: 'We create custom websites tailored to your business needs using the latest web technologies.',
    color: 'purple',
    variant: 'compact',
  },
};

export const CompactBlue: Story = {
  args: {
    title: 'Web Applications',
    tagline: 'Full-stack solutions for complex workflows',
    description: 'Build powerful web applications that streamline your business processes.',
    color: 'blue',
    variant: 'compact',
  },
};

export const CompactGreen: Story = {
  args: {
    title: 'Mobile-First Design',
    tagline: 'Responsive sites that work everywhere',
    description: 'Every site we build looks great on phones, tablets, and desktops.',
    color: 'green',
    variant: 'compact',
  },
};

export const CompactWithLink: Story = {
  args: {
    title: 'E-Commerce Solutions',
    tagline: 'Sell online with confidence',
    description: 'Complete online store solutions with payment processing.',
    color: 'purple',
    variant: 'compact',
    href: '/services',
  },
};

// ============================================================================
// Full Variants - Top border, complete content with details
// ============================================================================

export const FullPurple: Story = {
  args: {
    title: 'Website Development',
    tagline: 'Custom websites built with modern technology',
    description: 'We create custom websites tailored to your business needs using the latest web technologies.',
    details: 'Whether you need a simple landing page or a complex multi-page site, we deliver professional results.',
    color: 'purple',
    variant: 'full',
  },
};

export const FullBlue: Story = {
  args: {
    title: 'Web Applications',
    tagline: 'Full-stack solutions for complex workflows',
    description: 'Build powerful web applications that streamline your business processes and improve productivity.',
    details: 'From dashboards to custom tools, we create applications that solve real problems.',
    color: 'blue',
    variant: 'full',
  },
};

export const FullGreen: Story = {
  args: {
    title: 'Mobile-First Design',
    tagline: 'Responsive sites that work everywhere',
    description: 'Every site we build looks great on phones, tablets, and desktops with responsive design.',
    details: 'Your customers access the web from many devices. We make sure your site works perfectly on all of them.',
    color: 'green',
    variant: 'full',
  },
};

export const FullWithoutDetails: Story = {
  args: {
    title: 'API Integration',
    tagline: 'Connect your tools seamlessly',
    description: 'We integrate third-party services and APIs to extend your application capabilities.',
    color: 'blue',
    variant: 'full',
  },
};

export const FullWithLink: Story = {
  args: {
    title: 'E-Commerce Solutions',
    tagline: 'Sell online with confidence',
    description: 'Complete online store solutions with secure payment processing and inventory management.',
    details: 'Start selling today with Shopify, WooCommerce, or custom e-commerce platforms.',
    color: 'green',
    variant: 'full',
    href: '/services',
  },
};

// ============================================================================
// All Colors Side by Side - Comparison view
// ============================================================================

export const AllCompactColors: Story = {
  args: {
    title: 'Example Service',
    tagline: 'Example tagline',
    description: 'Example description',
    color: 'purple',
    variant: 'compact',
  },
  render: () => (
    <div className="space-y-4 w-[400px]">
      <ServiceCard
        title="Purple Service"
        tagline="This is the purple color variant"
        description="Description text"
        color="purple"
        variant="compact"
      />
      <ServiceCard
        title="Blue Service"
        tagline="This is the blue color variant"
        description="Description text"
        color="blue"
        variant="compact"
      />
      <ServiceCard
        title="Green Service"
        tagline="This is the green color variant"
        description="Description text"
        color="green"
        variant="compact"
      />
    </div>
  ),
};

export const AllFullColors: Story = {
  args: {
    title: 'Example Service',
    tagline: 'Example tagline',
    description: 'Example description',
    color: 'purple',
    variant: 'full',
  },
  render: () => (
    <div className="space-y-4 w-[400px]">
      <ServiceCard
        title="Purple Service"
        tagline="Tagline for purple"
        description="We create custom solutions using modern technology and best practices."
        details="Additional details about this service and what makes it special."
        color="purple"
        variant="full"
      />
      <ServiceCard
        title="Blue Service"
        tagline="Tagline for blue"
        description="We create custom solutions using modern technology and best practices."
        details="Additional details about this service and what makes it special."
        color="blue"
        variant="full"
      />
      <ServiceCard
        title="Green Service"
        tagline="Tagline for green"
        description="We create custom solutions using modern technology and best practices."
        details="Additional details about this service and what makes it special."
        color="green"
        variant="full"
      />
    </div>
  ),
};
