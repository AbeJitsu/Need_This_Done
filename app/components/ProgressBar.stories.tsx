import type { Meta, StoryObj } from '@storybook/react';
import ProgressBar from './ProgressBar';

// ============================================================================
// ProgressBar Stories
// ============================================================================
// Storybook stories for LMS ProgressBar component

const meta: Meta<typeof ProgressBar> = {
  title: 'LMS/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    color: {
      control: 'select',
      options: ['blue', 'green', 'purple'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    value: {
      control: { type: 'range', min: 0, max: 100 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    value: 65,
    color: 'blue',
    size: 'md',
    showPercentage: true,
  },
};

export const WithLabel: Story = {
  args: {
    value: 45,
    label: 'Course Progress',
    color: 'blue',
    size: 'md',
    showPercentage: true,
  },
};

export const Small: Story = {
  args: {
    value: 30,
    size: 'sm',
    color: 'green',
    showPercentage: true,
  },
};

export const Large: Story = {
  args: {
    value: 75,
    label: 'Module Completion',
    size: 'lg',
    color: 'purple',
    showPercentage: true,
  },
};

export const Completed: Story = {
  args: {
    value: 100,
    label: 'Course Complete!',
    color: 'green',
    size: 'md',
    showPercentage: true,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    label: 'Not Started',
    color: 'blue',
    size: 'md',
    showPercentage: true,
  },
};

export const NoPercentage: Story = {
  args: {
    value: 50,
    label: 'Progress',
    showPercentage: false,
    color: 'blue',
    size: 'md',
  },
};

export const MinimalNoLabel: Story = {
  args: {
    value: 25,
    showPercentage: false,
    color: 'purple',
    size: 'sm',
  },
};

// Showcase all colors
export const AllColors: Story = {
  render: () => (
    <div className="space-y-4">
      <ProgressBar value={60} label="Blue Theme" color="blue" />
      <ProgressBar value={75} label="Green Theme" color="green" />
      <ProgressBar value={45} label="Purple Theme" color="purple" />
    </div>
  ),
};

// Showcase all sizes
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <ProgressBar value={50} label="Small" size="sm" />
      <ProgressBar value={50} label="Medium" size="md" />
      <ProgressBar value={50} label="Large" size="lg" />
    </div>
  ),
};
