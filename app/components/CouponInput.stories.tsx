import type { Meta, StoryObj } from '@storybook/react';
import CouponInput from './CouponInput';

// ============================================================================
// CouponInput Stories
// ============================================================================
// Storybook stories for the coupon input component

const meta: Meta<typeof CouponInput> = {
  title: 'Ecommerce/CouponInput',
  component: CouponInput,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['blue', 'green', 'purple'],
    },
    cartTotal: {
      control: { type: 'number' },
      description: 'Cart total in cents',
    },
    itemCount: {
      control: { type: 'number' },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CouponInput>;

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    cartTotal: 10000,
    itemCount: 3,
    color: 'blue',
    onApply: (result) => console.log('Applied:', result),
    onRemove: () => console.log('Removed'),
  },
};

export const GreenVariant: Story = {
  args: {
    cartTotal: 5000,
    itemCount: 2,
    color: 'green',
    onApply: (result) => console.log('Applied:', result),
  },
};

export const PurpleVariant: Story = {
  args: {
    cartTotal: 15000,
    itemCount: 5,
    color: 'purple',
    onApply: (result) => console.log('Applied:', result),
  },
};

export const Disabled: Story = {
  args: {
    cartTotal: 10000,
    itemCount: 3,
    color: 'blue',
    disabled: true,
  },
};

export const FirstOrderCustomer: Story = {
  args: {
    cartTotal: 10000,
    itemCount: 3,
    isFirstOrder: true,
    color: 'blue',
    onApply: (result) => console.log('Applied:', result),
  },
};

export const HighValueCart: Story = {
  args: {
    cartTotal: 50000,
    itemCount: 10,
    color: 'green',
    onApply: (result) => console.log('Applied:', result),
  },
};

export const ColorVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <CouponInput color="blue" cartTotal={10000} />
      <CouponInput color="green" cartTotal={10000} />
      <CouponInput color="purple" cartTotal={10000} />
    </div>
  ),
};
