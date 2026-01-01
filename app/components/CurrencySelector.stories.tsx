import type { Meta, StoryObj } from '@storybook/react';
import CurrencySelector from './CurrencySelector';

// ============================================================================
// CurrencySelector Stories
// ============================================================================
// Storybook stories for the currency selector component

const meta: Meta<typeof CurrencySelector> = {
  title: 'Ecommerce/CurrencySelector',
  component: CurrencySelector,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['blue', 'green', 'purple'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showName: {
      control: 'boolean',
    },
    showFlag: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CurrencySelector>;

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    color: 'blue',
    size: 'md',
    showFlag: true,
    showName: false,
  },
};

export const WithCurrencyName: Story = {
  args: {
    color: 'blue',
    size: 'md',
    showFlag: true,
    showName: true,
  },
};

export const Small: Story = {
  args: {
    color: 'blue',
    size: 'sm',
    showFlag: true,
  },
};

export const Large: Story = {
  args: {
    color: 'blue',
    size: 'lg',
    showFlag: true,
    showName: true,
  },
};

export const NoFlag: Story = {
  args: {
    color: 'blue',
    size: 'md',
    showFlag: false,
    showName: true,
  },
};

export const GreenVariant: Story = {
  args: {
    color: 'green',
    size: 'md',
    showFlag: true,
  },
};

export const PurpleVariant: Story = {
  args: {
    color: 'purple',
    size: 'md',
    showFlag: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div>
        <p className="text-sm text-gray-500 mb-2">Small</p>
        <CurrencySelector size="sm" showFlag />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Medium</p>
        <CurrencySelector size="md" showFlag />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Large</p>
        <CurrencySelector size="lg" showFlag />
      </div>
    </div>
  ),
};

export const ColorVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <CurrencySelector color="blue" showFlag />
      <CurrencySelector color="green" showFlag />
      <CurrencySelector color="purple" showFlag />
    </div>
  ),
};
