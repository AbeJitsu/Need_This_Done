import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

// ============================================================================
// Button Stories - Showcase all button variants and states
// ============================================================================
// Stories cover all 6 color variants, 3 sizes, and disabled states.

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    nextjs: { appDirectory: true },
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['purple', 'blue', 'green', 'orange', 'teal', 'gray'],
      description: 'Color variant of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Default Variants - All color options at large size
// ============================================================================

export const Purple: Story = {
  args: {
    variant: 'purple',
    size: 'lg',
    children: 'Purple Button',
  },
};

export const Blue: Story = {
  args: {
    variant: 'blue',
    size: 'lg',
    children: 'Blue Button',
  },
};

export const Green: Story = {
  args: {
    variant: 'green',
    size: 'lg',
    children: 'Green Button',
  },
};

export const Orange: Story = {
  args: {
    variant: 'orange',
    size: 'lg',
    children: 'Orange Button',
  },
};

export const Teal: Story = {
  args: {
    variant: 'teal',
    size: 'lg',
    children: 'Teal Button',
  },
};

export const Gray: Story = {
  args: {
    variant: 'gray',
    size: 'lg',
    children: 'Gray Button',
  },
};

// ============================================================================
// Size Variations - Show all three sizes
// ============================================================================

export const SmallSize: Story = {
  args: {
    variant: 'purple',
    size: 'sm',
    children: 'Small Button',
  },
};

export const MediumSize: Story = {
  args: {
    variant: 'blue',
    size: 'md',
    children: 'Medium Button',
  },
};

export const LargeSize: Story = {
  args: {
    variant: 'green',
    size: 'lg',
    children: 'Large Button',
  },
};

// ============================================================================
// Disabled State - Shows how buttons look when disabled
// ============================================================================

export const Disabled: Story = {
  args: {
    variant: 'purple',
    size: 'lg',
    disabled: true,
    children: 'Disabled Button',
  },
};

// ============================================================================
// As Link - Button rendered as a Next.js Link
// ============================================================================

export const AsLink: Story = {
  args: {
    variant: 'blue',
    size: 'lg',
    href: '/example',
    children: 'Link Button',
  },
};

// ============================================================================
// All Colors Grid - Visual comparison of all color variants
// ============================================================================

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Button variant="purple" size="md">Purple</Button>
        <Button variant="blue" size="md">Blue</Button>
        <Button variant="green" size="md">Green</Button>
        <Button variant="orange" size="md">Orange</Button>
        <Button variant="teal" size="md">Teal</Button>
        <Button variant="gray" size="md">Gray</Button>
      </div>
    </div>
  ),
};

// ============================================================================
// All Sizes Grid - Visual comparison of all sizes
// ============================================================================

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <Button variant="purple" size="sm">Small Button</Button>
      <Button variant="purple" size="md">Medium Button</Button>
      <Button variant="purple" size="lg">Large Button</Button>
    </div>
  ),
};

// ============================================================================
// Interactive Example - Button with onClick handler
// ============================================================================

export const WithOnClick: Story = {
  args: {
    variant: 'green',
    size: 'lg',
    onClick: () => alert('Button clicked!'),
    children: 'Click Me',
  },
};
