import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import CircleBadge from './CircleBadge';

// ============================================================================
// CircleBadge Stories
// ============================================================================
// Shows all variants of the CircleBadge component:
// - All 6 color options (purple, blue, green, gold, teal, gray)
// - All 3 sizes (sm, md, lg)
// - Different number values
// - Complete size/color matrix

const meta = {
  title: 'Components/CircleBadge',
  component: CircleBadge,
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
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    number: {
      control: { type: 'number', min: 1, max: 99 },
    },
  },
} satisfies Meta<typeof CircleBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Small Size - All Colors
// ============================================================================

export const SmallPurple: Story = {
  args: {
    number: 1,
    color: 'purple',
    size: 'sm',
  },
};

export const SmallBlue: Story = {
  args: {
    number: 2,
    color: 'blue',
    size: 'sm',
  },
};

export const SmallGreen: Story = {
  args: {
    number: 3,
    color: 'green',
    size: 'sm',
  },
};

export const SmallGold: Story = {
  args: {
    number: 4,
    color: 'gold',
    size: 'sm',
  },
};

export const SmallTeal: Story = {
  args: {
    number: 5,
    color: 'teal',
    size: 'sm',
  },
};

export const SmallGray: Story = {
  args: {
    number: 6,
    color: 'gray',
    size: 'sm',
  },
};

// ============================================================================
// Medium Size (Default) - All Colors
// ============================================================================

export const MediumPurple: Story = {
  args: {
    number: 1,
    color: 'purple',
    size: 'md',
  },
};

export const MediumBlue: Story = {
  args: {
    number: 2,
    color: 'blue',
    size: 'md',
  },
};

export const MediumGreen: Story = {
  args: {
    number: 3,
    color: 'green',
    size: 'md',
  },
};

export const MediumGold: Story = {
  args: {
    number: 4,
    color: 'gold',
    size: 'md',
  },
};

export const MediumTeal: Story = {
  args: {
    number: 5,
    color: 'teal',
    size: 'md',
  },
};

export const MediumGray: Story = {
  args: {
    number: 6,
    color: 'gray',
    size: 'md',
  },
};

// ============================================================================
// Large Size - All Colors
// ============================================================================

export const LargePurple: Story = {
  args: {
    number: 1,
    color: 'purple',
    size: 'lg',
  },
};

export const LargeBlue: Story = {
  args: {
    number: 2,
    color: 'blue',
    size: 'lg',
  },
};

export const LargeGreen: Story = {
  args: {
    number: 3,
    color: 'green',
    size: 'lg',
  },
};

export const LargeGold: Story = {
  args: {
    number: 4,
    color: 'gold',
    size: 'lg',
  },
};

export const LargeTeal: Story = {
  args: {
    number: 5,
    color: 'teal',
    size: 'lg',
  },
};

export const LargeGray: Story = {
  args: {
    number: 6,
    color: 'gray',
    size: 'lg',
  },
};

// ============================================================================
// Different Numbers
// ============================================================================

export const HighNumber: Story = {
  args: {
    number: 99,
    color: 'blue',
    size: 'md',
  },
};

export const SingleDigit: Story = {
  args: {
    number: 7,
    color: 'green',
    size: 'md',
  },
};

// ============================================================================
// Size Comparison - Same Color
// ============================================================================

export const SizeComparisonPurple: Story = {
  args: { number: 1, color: 'purple' },
  render: () => (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <CircleBadge number={1} color="purple" size="sm" />
        <p className="text-xs mt-2 text-gray-600">Small</p>
      </div>
      <div className="text-center">
        <CircleBadge number={1} color="purple" size="md" />
        <p className="text-xs mt-2 text-gray-600">Medium</p>
      </div>
      <div className="text-center">
        <CircleBadge number={1} color="purple" size="lg" />
        <p className="text-xs mt-2 text-gray-600">Large</p>
      </div>
    </div>
  ),
};

export const SizeComparisonBlue: Story = {
  args: { number: 2, color: 'blue' },
  render: () => (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <CircleBadge number={2} color="blue" size="sm" />
        <p className="text-xs mt-2 text-gray-600">Small</p>
      </div>
      <div className="text-center">
        <CircleBadge number={2} color="blue" size="md" />
        <p className="text-xs mt-2 text-gray-600">Medium</p>
      </div>
      <div className="text-center">
        <CircleBadge number={2} color="blue" size="lg" />
        <p className="text-xs mt-2 text-gray-600">Large</p>
      </div>
    </div>
  ),
};

// ============================================================================
// Color Comparison - Same Size
// ============================================================================

export const AllColorsSmall: Story = {
  args: { number: 1, color: 'purple' },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div className="text-center">
        <CircleBadge number={1} color="purple" size="sm" />
        <p className="text-xs mt-2 text-gray-600">Purple</p>
      </div>
      <div className="text-center">
        <CircleBadge number={2} color="blue" size="sm" />
        <p className="text-xs mt-2 text-gray-600">Blue</p>
      </div>
      <div className="text-center">
        <CircleBadge number={3} color="green" size="sm" />
        <p className="text-xs mt-2 text-gray-600">Green</p>
      </div>
      <div className="text-center">
        <CircleBadge number={4} color="gold" size="sm" />
        <p className="text-xs mt-2 text-gray-600">Gold</p>
      </div>
      <div className="text-center">
        <CircleBadge number={5} color="teal" size="sm" />
        <p className="text-xs mt-2 text-gray-600">Teal</p>
      </div>
      <div className="text-center">
        <CircleBadge number={6} color="gray" size="sm" />
        <p className="text-xs mt-2 text-gray-600">Gray</p>
      </div>
    </div>
  ),
};

export const AllColorsMedium: Story = {
  args: { number: 1, color: 'purple' },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div className="text-center">
        <CircleBadge number={1} color="purple" size="md" />
        <p className="text-xs mt-2 text-gray-600">Purple</p>
      </div>
      <div className="text-center">
        <CircleBadge number={2} color="blue" size="md" />
        <p className="text-xs mt-2 text-gray-600">Blue</p>
      </div>
      <div className="text-center">
        <CircleBadge number={3} color="green" size="md" />
        <p className="text-xs mt-2 text-gray-600">Green</p>
      </div>
      <div className="text-center">
        <CircleBadge number={4} color="gold" size="md" />
        <p className="text-xs mt-2 text-gray-600">Gold</p>
      </div>
      <div className="text-center">
        <CircleBadge number={5} color="teal" size="md" />
        <p className="text-xs mt-2 text-gray-600">Teal</p>
      </div>
      <div className="text-center">
        <CircleBadge number={6} color="gray" size="md" />
        <p className="text-xs mt-2 text-gray-600">Gray</p>
      </div>
    </div>
  ),
};

export const AllColorsLarge: Story = {
  args: { number: 1, color: 'purple' },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div className="text-center">
        <CircleBadge number={1} color="purple" size="lg" />
        <p className="text-xs mt-2 text-gray-600">Purple</p>
      </div>
      <div className="text-center">
        <CircleBadge number={2} color="blue" size="lg" />
        <p className="text-xs mt-2 text-gray-600">Blue</p>
      </div>
      <div className="text-center">
        <CircleBadge number={3} color="green" size="lg" />
        <p className="text-xs mt-2 text-gray-600">Green</p>
      </div>
      <div className="text-center">
        <CircleBadge number={4} color="gold" size="lg" />
        <p className="text-xs mt-2 text-gray-600">Gold</p>
      </div>
      <div className="text-center">
        <CircleBadge number={5} color="teal" size="lg" />
        <p className="text-xs mt-2 text-gray-600">Teal</p>
      </div>
      <div className="text-center">
        <CircleBadge number={6} color="gray" size="lg" />
        <p className="text-xs mt-2 text-gray-600">Gray</p>
      </div>
    </div>
  ),
};

// ============================================================================
// Complete Matrix - All Sizes x All Colors
// ============================================================================

export const CompleteMatrix: Story = {
  args: { number: 1, color: 'purple' },
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-gray-700">Small</h3>
        <div className="flex gap-3">
          <CircleBadge number={1} color="purple" size="sm" />
          <CircleBadge number={2} color="blue" size="sm" />
          <CircleBadge number={3} color="green" size="sm" />
          <CircleBadge number={4} color="gold" size="sm" />
          <CircleBadge number={5} color="teal" size="sm" />
          <CircleBadge number={6} color="gray" size="sm" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-3 text-gray-700">Medium</h3>
        <div className="flex gap-3">
          <CircleBadge number={1} color="purple" size="md" />
          <CircleBadge number={2} color="blue" size="md" />
          <CircleBadge number={3} color="green" size="md" />
          <CircleBadge number={4} color="gold" size="md" />
          <CircleBadge number={5} color="teal" size="md" />
          <CircleBadge number={6} color="gray" size="md" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-3 text-gray-700">Large</h3>
        <div className="flex gap-3">
          <CircleBadge number={1} color="purple" size="lg" />
          <CircleBadge number={2} color="blue" size="lg" />
          <CircleBadge number={3} color="green" size="lg" />
          <CircleBadge number={4} color="gold" size="lg" />
          <CircleBadge number={5} color="teal" size="lg" />
          <CircleBadge number={6} color="gray" size="lg" />
        </div>
      </div>
    </div>
  ),
};
