import type { Meta, StoryObj } from '@storybook/react';
import SectionPicker from './SectionPicker';
import type { SectionDefinition } from '@/lib/sections';

// ============================================================================
// SectionPicker Stories
// ============================================================================
// Storybook stories for the section picker component

const meta: Meta<typeof SectionPicker> = {
  title: 'Page Builder/SectionPicker',
  component: SectionPicker,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '700px', maxHeight: '600px' }}>
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
type Story = StoryObj<typeof SectionPicker>;

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    color: 'blue',
    onSelect: (section: SectionDefinition) => console.log('Selected:', section),
    onClose: () => console.log('Closed'),
  },
};

export const GreenVariant: Story = {
  args: {
    color: 'green',
    onSelect: (section: SectionDefinition) => console.log('Selected:', section),
    onClose: () => console.log('Closed'),
  },
};

export const PurpleVariant: Story = {
  args: {
    color: 'purple',
    onSelect: (section: SectionDefinition) => console.log('Selected:', section),
    onClose: () => console.log('Closed'),
  },
};

export const WithoutCloseButton: Story = {
  args: {
    color: 'blue',
    onSelect: (section: SectionDefinition) => console.log('Selected:', section),
    // No onClose prop
  },
};

export const ColorVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-gray-500 mb-2">Blue</p>
        <SectionPicker
          color="blue"
          onSelect={(s) => console.log('Blue selected:', s)}
        />
      </div>
    </div>
  ),
};
