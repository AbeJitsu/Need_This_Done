import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import StarRating from './StarRating';

// ============================================================================
// StarRating Stories
// ============================================================================
// Storybook stories for the star rating component

const meta: Meta<typeof StarRating> = {
  title: 'Ecommerce/StarRating',
  component: StarRating,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 5, step: 0.5 },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    color: {
      control: 'select',
      options: ['blue', 'green', 'purple'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StarRating>;

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    value: 4,
    readonly: true,
    size: 'md',
    color: 'blue',
  },
};

export const WithValue: Story = {
  args: {
    value: 4.5,
    readonly: true,
    showValue: true,
    size: 'md',
  },
};

export const Interactive: Story = {
  render: function InteractiveRating() {
    const [rating, setRating] = useState(0);
    return (
      <div className="space-y-4">
        <StarRating value={rating} onChange={setRating} />
        <p className="text-sm text-gray-500">Selected: {rating} stars</p>
      </div>
    );
  },
};

export const AllRatings: Story = {
  render: () => (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => (
        <div key={rating} className="flex items-center gap-2">
          <StarRating value={rating} readonly size="sm" />
          <span className="text-sm text-gray-500">{rating} stars</span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-500 mb-1">Small</p>
        <StarRating value={4} readonly size="sm" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Medium</p>
        <StarRating value={4} readonly size="md" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Large</p>
        <StarRating value={4} readonly size="lg" />
      </div>
    </div>
  ),
};

export const ColorVariants: Story = {
  render: () => (
    <div className="space-y-2">
      <StarRating value={4} readonly color="blue" />
      <StarRating value={4} readonly color="green" />
      <StarRating value={4} readonly color="purple" />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    value: 0,
    readonly: true,
  },
};

export const Partial: Story = {
  args: {
    value: 3.5,
    readonly: true,
    showValue: true,
  },
};
