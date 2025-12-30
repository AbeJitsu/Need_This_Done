import type { Meta, StoryObj } from '@storybook/react';
import ProductRecommendations from './ProductRecommendations';

// ============================================================================
// ProductRecommendations Stories
// ============================================================================
// Storybook stories for the product recommendations component

const meta: Meta<typeof ProductRecommendations> = {
  title: 'Ecommerce/ProductRecommendations',
  component: ProductRecommendations,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['popular', 'trending', 'personalized', 'related', 'bought_together'],
    },
    color: {
      control: 'select',
      options: ['blue', 'green', 'purple'],
    },
    layout: {
      control: 'select',
      options: ['grid', 'row'],
    },
    limit: {
      control: { type: 'range', min: 2, max: 12, step: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProductRecommendations>;

// ============================================================================
// Stories
// ============================================================================

export const Popular: Story = {
  args: {
    type: 'popular',
    limit: 4,
    color: 'blue',
    layout: 'grid',
  },
};

export const Trending: Story = {
  args: {
    type: 'trending',
    limit: 4,
    color: 'green',
    layout: 'grid',
  },
};

export const Personalized: Story = {
  args: {
    type: 'personalized',
    limit: 4,
    color: 'purple',
    layout: 'grid',
  },
};

export const RelatedProducts: Story = {
  args: {
    type: 'related',
    productId: 'prod_123',
    limit: 4,
    color: 'blue',
    title: 'Similar Products',
  },
};

export const BoughtTogether: Story = {
  args: {
    type: 'bought_together',
    productId: 'prod_123',
    limit: 3,
    color: 'green',
    title: 'Frequently Bought Together',
  },
};

export const RowLayout: Story = {
  args: {
    type: 'popular',
    limit: 6,
    color: 'blue',
    layout: 'row',
  },
};

export const CustomTitle: Story = {
  args: {
    type: 'popular',
    limit: 4,
    title: 'Best Sellers This Week',
    color: 'purple',
  },
};

export const ColorVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <ProductRecommendations type="popular" color="blue" limit={4} title="Blue Variant" />
      <ProductRecommendations type="trending" color="green" limit={4} title="Green Variant" />
      <ProductRecommendations type="personalized" color="purple" limit={4} title="Purple Variant" />
    </div>
  ),
};
