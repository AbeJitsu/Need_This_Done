import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Card from './Card';

// ============================================================================
// Card Stories - Showcase all card hover effects and colors
// ============================================================================
// Stories cover all 6 hover colors and 4 hover effects (lift, glow, tint, none).

const meta: Meta<typeof Card> = {
  component: Card,
  parameters: {
    nextjs: { appDirectory: true },
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    hoverColor: {
      control: 'select',
      options: ['purple', 'blue', 'green', 'gold', 'teal', 'gray'],
      description: 'Color variant for hover border',
    },
    hoverEffect: {
      control: 'select',
      options: ['lift', 'glow', 'tint', 'none'],
      description: 'Hover effect type',
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
type Story = StoryObj<typeof meta>;

// Sample content for cards
const SampleContent = () => (
  <div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
      Card Title
    </h3>
    <p className="text-gray-600 dark:text-gray-300">
      This is sample content inside a card. Hover over the card to see the effect in action.
    </p>
  </div>
);

// ============================================================================
// Default - Lift effect with gray hover (default behavior)
// ============================================================================

export const Default: Story = {
  args: {
    children: <SampleContent />,
  },
};

// ============================================================================
// Hover Colors - All color variants with lift effect
// ============================================================================

export const PurpleHover: Story = {
  args: {
    hoverColor: 'purple',
    hoverEffect: 'lift',
    children: <SampleContent />,
  },
};

export const BlueHover: Story = {
  args: {
    hoverColor: 'blue',
    hoverEffect: 'lift',
    children: <SampleContent />,
  },
};

export const GreenHover: Story = {
  args: {
    hoverColor: 'green',
    hoverEffect: 'lift',
    children: <SampleContent />,
  },
};

export const GoldHover: Story = {
  args: {
    hoverColor: 'gold',
    hoverEffect: 'lift',
    children: <SampleContent />,
  },
};

export const TealHover: Story = {
  args: {
    hoverColor: 'teal',
    hoverEffect: 'lift',
    children: <SampleContent />,
  },
};

export const GrayHover: Story = {
  args: {
    hoverColor: 'gray',
    hoverEffect: 'lift',
    children: <SampleContent />,
  },
};

// ============================================================================
// Hover Effects - All four effect types
// ============================================================================

export const LiftEffect: Story = {
  args: {
    hoverColor: 'purple',
    hoverEffect: 'lift',
    children: <SampleContent />,
  },
};

export const GlowEffect: Story = {
  args: {
    hoverColor: 'blue',
    hoverEffect: 'glow',
    children: <SampleContent />,
  },
};

export const TintEffect: Story = {
  args: {
    hoverColor: 'green',
    hoverEffect: 'tint',
    children: <SampleContent />,
  },
};

export const NoEffect: Story = {
  args: {
    hoverColor: 'gold',
    hoverEffect: 'none',
    children: <SampleContent />,
  },
};

// ============================================================================
// All Hover Colors Grid - Visual comparison of all colors
// ============================================================================

export const AllHoverColors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4" style={{ width: '800px' }}>
      <Card hoverColor="purple" hoverEffect="lift">
        <h4 className="font-bold text-gray-900 dark:text-gray-100">Purple</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Hover to see purple border</p>
      </Card>
      <Card hoverColor="blue" hoverEffect="lift">
        <h4 className="font-bold text-gray-900 dark:text-gray-100">Blue</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Hover to see blue border</p>
      </Card>
      <Card hoverColor="green" hoverEffect="lift">
        <h4 className="font-bold text-gray-900 dark:text-gray-100">Green</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Hover to see green border</p>
      </Card>
      <Card hoverColor="gold" hoverEffect="lift">
        <h4 className="font-bold text-gray-900 dark:text-gray-100">Gold</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Hover to see gold border</p>
      </Card>
      <Card hoverColor="teal" hoverEffect="lift">
        <h4 className="font-bold text-gray-900 dark:text-gray-100">Teal</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Hover to see teal border</p>
      </Card>
      <Card hoverColor="gray" hoverEffect="lift">
        <h4 className="font-bold text-gray-900 dark:text-gray-100">Gray</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Hover to see gray border</p>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// ============================================================================
// All Effects Grid - Visual comparison of all effects
// ============================================================================

export const AllEffects: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4" style={{ width: '800px' }}>
      <Card hoverColor="purple" hoverEffect="lift">
        <h4 className="font-bold text-gray-900 dark:text-gray-100">Lift Effect</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Card lifts up on hover</p>
      </Card>
      <Card hoverColor="blue" hoverEffect="glow">
        <h4 className="font-bold text-gray-900 dark:text-gray-100">Glow Effect</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Card glows on hover</p>
      </Card>
      <Card hoverColor="green" hoverEffect="tint">
        <h4 className="font-bold text-gray-900 dark:text-gray-100">Tint Effect</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Background tints on hover</p>
      </Card>
      <Card hoverColor="gold" hoverEffect="none">
        <h4 className="font-bold text-gray-900 dark:text-gray-100">No Effect</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Only border changes</p>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// ============================================================================
// With Custom Content - Example with richer content
// ============================================================================

export const WithRichContent: Story = {
  args: {
    hoverColor: 'purple',
    hoverEffect: 'lift',
    children: (
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Feature Title
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This card contains richer content including icons, headings, and multiple paragraphs to show how the component handles different content types.
        </p>
        <div className="flex gap-2">
          <span className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
            Tag 1
          </span>
          <span className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
            Tag 2
          </span>
        </div>
      </div>
    ),
  },
};
