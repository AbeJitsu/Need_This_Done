import type { Meta, StoryObj } from '@storybook/react';
import ReviewCard, { Review } from './ReviewCard';

// ============================================================================
// ReviewCard Stories
// ============================================================================
// Storybook stories for the review card component

const meta: Meta<typeof ReviewCard> = {
  title: 'Ecommerce/ReviewCard',
  component: ReviewCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    color: {
      control: 'select',
      options: ['blue', 'green', 'purple'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReviewCard>;

// ============================================================================
// Sample Reviews
// ============================================================================

const sampleReview: Review = {
  id: 'review-1',
  product_id: 'prod-123',
  rating: 5,
  title: 'Excellent product, highly recommend!',
  content: 'I\'ve been using this for a month now and it\'s been amazing. The quality is outstanding and it works exactly as described. Customer service was also very helpful when I had questions.',
  reviewer_name: 'John D.',
  is_verified_purchase: true,
  helpful_count: 12,
  created_at: '2025-12-15T10:30:00Z',
};

const shortReview: Review = {
  id: 'review-2',
  product_id: 'prod-123',
  rating: 4,
  title: 'Good product',
  content: 'Works well. Shipping was fast.',
  reviewer_name: 'Sarah M.',
  is_verified_purchase: false,
  helpful_count: 3,
  created_at: '2025-12-20T14:00:00Z',
};

const negativeReview: Review = {
  id: 'review-3',
  product_id: 'prod-123',
  rating: 2,
  title: 'Not what I expected',
  content: 'The product quality is okay but it doesn\'t quite match the description. I expected something more durable. Might return it.',
  reviewer_name: 'Mike R.',
  is_verified_purchase: true,
  helpful_count: 5,
  created_at: '2025-12-18T09:15:00Z',
};

const anonymousReview: Review = {
  id: 'review-4',
  product_id: 'prod-123',
  rating: 3,
  title: null,
  content: 'It\'s okay. Nothing special but does the job.',
  reviewer_name: null,
  is_verified_purchase: false,
  helpful_count: 1,
  created_at: '2025-12-22T16:45:00Z',
};

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    review: sampleReview,
    color: 'blue',
    showActions: true,
    onVote: async (id, type) => console.log('Voted:', id, type),
    onReport: (id) => console.log('Report:', id),
  },
};

export const ShortReview: Story = {
  args: {
    review: shortReview,
    color: 'blue',
    showActions: true,
  },
};

export const NegativeReview: Story = {
  args: {
    review: negativeReview,
    color: 'blue',
    showActions: true,
  },
};

export const Anonymous: Story = {
  args: {
    review: anonymousReview,
    color: 'blue',
    showActions: true,
  },
};

export const WithoutActions: Story = {
  args: {
    review: sampleReview,
    showActions: false,
  },
};

export const GreenVariant: Story = {
  args: {
    review: sampleReview,
    color: 'green',
    showActions: true,
  },
};

export const PurpleVariant: Story = {
  args: {
    review: sampleReview,
    color: 'purple',
    showActions: true,
  },
};

export const MultipleReviews: Story = {
  render: () => (
    <div className="space-y-4">
      <ReviewCard review={sampleReview} color="blue" />
      <ReviewCard review={shortReview} color="blue" />
      <ReviewCard review={negativeReview} color="blue" />
    </div>
  ),
};
