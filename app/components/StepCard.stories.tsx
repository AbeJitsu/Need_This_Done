import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import StepCard from './StepCard';

// ============================================================================
// StepCard Stories
// ============================================================================
// Shows all variants of the StepCard component:
// - All 6 color options (purple, blue, green, gold, teal, gray)
// - Different step numbers (1-4 matching typical How It Works flow)
// - Different detail list lengths
// - Complete process flow examples

const meta = {
  title: 'Components/StepCard',
  component: StepCard,
  parameters: {
    layout: 'centered',
    appDirectory: true,
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['purple', 'blue', 'green', 'gold', 'teal', 'gray'],
    },
    number: {
      control: { type: 'number', min: 1, max: 10 },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StepCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Step 1 - Purple (Discovery/Consultation)
// ============================================================================

export const Step1Purple: Story = {
  args: {
    number: 1,
    title: 'Tell Us What You Need',
    description: 'Start with a free consultation where we learn about your business, goals, and vision for your project.',
    details: [
      'Quick 15-30 minute discovery call',
      'Discuss your business goals and challenges',
      'Explore ideas and possibilities',
      'Get honest advice about what you actually need',
      'No pressure, no commitment required',
    ],
    color: 'purple',
  },
};

export const Step1Blue: Story = {
  args: {
    number: 1,
    title: 'Discovery & Planning',
    description: 'We begin by understanding your unique requirements, target audience, and project objectives.',
    details: [
      'Initial consultation meeting',
      'Requirements gathering',
      'Competitive analysis',
      'Project scope definition',
    ],
    color: 'blue',
  },
};

// ============================================================================
// Step 2 - Blue (Design/Planning)
// ============================================================================

export const Step2Blue: Story = {
  args: {
    number: 2,
    title: 'We Create a Custom Plan',
    description: 'Based on our conversation, we put together a detailed proposal with timeline, features, and transparent pricing.',
    details: [
      'Detailed project proposal within 2-3 days',
      'Clear timeline and milestones',
      'Itemized pricing with no hidden fees',
      'Mockups or wireframes for larger projects',
      'Revisions until you are 100% happy',
    ],
    color: 'blue',
  },
};

export const Step2Green: Story = {
  args: {
    number: 2,
    title: 'Design & Prototype',
    description: 'Our design team creates mockups and prototypes that bring your vision to life.',
    details: [
      'Custom design concepts',
      'Interactive prototypes',
      'Brand integration',
      'Feedback and revisions',
    ],
    color: 'green',
  },
};

// ============================================================================
// Step 3 - Green (Development/Build)
// ============================================================================

export const Step3Green: Story = {
  args: {
    number: 3,
    title: 'We Build Your Solution',
    description: 'Once you approve the plan, our development team gets to work building your project using modern, reliable technology.',
    details: [
      'Regular progress updates every week',
      'Staged development with preview links',
      'Your input welcomed throughout',
      'Rigorous testing at every stage',
      'Built for speed, security, and scalability',
    ],
    color: 'green',
  },
};

export const Step3Gold: Story = {
  args: {
    number: 3,
    title: 'Development & Testing',
    description: 'Clean code, thorough testing, and attention to detail ensure a quality product.',
    details: [
      'Agile development process',
      'Quality assurance testing',
      'Performance optimization',
      'Security best practices',
    ],
    color: 'gold',
  },
};

// ============================================================================
// Step 4 - Gold/Teal (Launch/Support)
// ============================================================================

export const Step4Gold: Story = {
  args: {
    number: 4,
    title: 'Launch & Ongoing Support',
    description: 'We handle the launch details and provide support to ensure your success long after the project goes live.',
    details: [
      'Smooth launch with zero downtime',
      'Training on how to manage your site',
      'Post-launch support included',
      'Available for updates and improvements',
      'Long-term partnership, not just a transaction',
    ],
    color: 'gold',
  },
};

export const Step4Teal: Story = {
  args: {
    number: 4,
    title: 'Deploy & Monitor',
    description: 'Your solution goes live with continuous monitoring and support to ensure everything runs smoothly.',
    details: [
      'Production deployment',
      'Performance monitoring',
      'User training sessions',
      '30-day support period',
      'Maintenance packages available',
    ],
    color: 'teal',
  },
};

// ============================================================================
// Additional Step Examples
// ============================================================================

export const Step5Gray: Story = {
  args: {
    number: 5,
    title: 'Optimization & Growth',
    description: 'After launch, we analyze performance and help you grow with data-driven improvements.',
    details: [
      'Analytics review',
      'Conversion optimization',
      'Feature enhancements',
      'Scalability planning',
    ],
    color: 'gray',
  },
};

export const StepWithMinimalDetails: Story = {
  args: {
    number: 1,
    title: 'Quick Setup',
    description: 'Get started in minutes with our streamlined onboarding process.',
    details: [
      'Fast account creation',
      'Simple configuration',
    ],
    color: 'blue',
  },
};

// ============================================================================
// All Colors for Each Step Number
// ============================================================================

export const AllColorsStep1: Story = {
  args: {
    number: 1,
    title: 'Example Step',
    description: 'Example description',
    details: ['Detail one', 'Detail two'],
    color: 'purple',
  },
  render: () => (
    <div className="space-y-4 w-[700px]">
      <StepCard
        number={1}
        title="Purple Step"
        description="Example using purple color variant for step one."
        details={['Detail one', 'Detail two', 'Detail three']}
        color="purple"
      />
      <StepCard
        number={1}
        title="Blue Step"
        description="Example using blue color variant for step one."
        details={['Detail one', 'Detail two', 'Detail three']}
        color="blue"
      />
      <StepCard
        number={1}
        title="Green Step"
        description="Example using green color variant for step one."
        details={['Detail one', 'Detail two', 'Detail three']}
        color="green"
      />
      <StepCard
        number={1}
        title="Gold Step"
        description="Example using gold color variant for step one."
        details={['Detail one', 'Detail two', 'Detail three']}
        color="gold"
      />
      <StepCard
        number={1}
        title="Teal Step"
        description="Example using teal color variant for step one."
        details={['Detail one', 'Detail two', 'Detail three']}
        color="teal"
      />
      <StepCard
        number={1}
        title="Gray Step"
        description="Example using gray color variant for step one."
        details={['Detail one', 'Detail two', 'Detail three']}
        color="gray"
      />
    </div>
  ),
};

// ============================================================================
// Complete 4-Step Flow
// ============================================================================

export const CompleteProcess: Story = {
  args: {
    number: 1,
    title: 'Example Step',
    description: 'Example description',
    details: ['Detail one', 'Detail two'],
    color: 'purple',
  },
  render: () => (
    <div className="space-y-6 w-[700px]">
      <StepCard
        number={1}
        title="Tell Us What You Need"
        description="Start with a free consultation where we learn about your business, goals, and vision."
        details={[
          'Quick 15-30 minute discovery call',
          'Discuss your business goals',
          'Get honest advice',
        ]}
        color="purple"
      />
      <StepCard
        number={2}
        title="We Create a Custom Plan"
        description="Based on our conversation, we put together a detailed proposal with timeline and pricing."
        details={[
          'Detailed project proposal',
          'Clear timeline and milestones',
          'Transparent pricing',
        ]}
        color="blue"
      />
      <StepCard
        number={3}
        title="We Build Your Solution"
        description="Our development team gets to work building your project using modern technology."
        details={[
          'Regular progress updates',
          'Staged development',
          'Rigorous testing',
        ]}
        color="green"
      />
      <StepCard
        number={4}
        title="Launch & Support"
        description="We handle the launch details and provide support to ensure your success."
        details={[
          'Smooth launch',
          'Training included',
          'Post-launch support',
        ]}
        color="gold"
      />
    </div>
  ),
};
