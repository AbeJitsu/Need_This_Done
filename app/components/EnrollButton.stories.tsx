import type { Meta, StoryObj } from '@storybook/react';
import EnrollButton from './EnrollButton';

// ============================================================================
// EnrollButton Stories
// ============================================================================
// Storybook stories for LMS EnrollButton component

const meta: Meta<typeof EnrollButton> = {
  title: 'LMS/EnrollButton',
  component: EnrollButton,
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
    price: {
      control: 'number',
      description: 'Price in cents (0 for free)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof EnrollButton>;

// ============================================================================
// Stories
// ============================================================================

export const Free: Story = {
  args: {
    courseId: 'course-123',
    courseName: 'Introduction to JavaScript',
    price: 0,
    color: 'blue',
    size: 'md',
    onEnrollSuccess: () => console.log('Enrolled!'),
    onEnrollError: (error) => console.log('Error:', error),
  },
};

export const Paid: Story = {
  args: {
    courseId: 'course-456',
    courseName: 'Advanced React Patterns',
    price: 4999,
    color: 'green',
    size: 'md',
    onEnrollSuccess: () => console.log('Enrolled!'),
    onEnrollError: (error) => console.log('Error:', error),
  },
};

export const AlreadyEnrolled: Story = {
  args: {
    courseId: 'course-789',
    courseName: 'Web Development Fundamentals',
    price: 0,
    isEnrolled: true,
    color: 'blue',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    courseId: 'course-123',
    courseName: 'Quick Start Guide',
    price: 0,
    color: 'purple',
    size: 'sm',
    onEnrollSuccess: () => console.log('Enrolled!'),
  },
};

export const Large: Story = {
  args: {
    courseId: 'course-123',
    courseName: 'Complete Course Bundle',
    price: 9999,
    color: 'blue',
    size: 'lg',
    onEnrollSuccess: () => console.log('Enrolled!'),
  },
};

export const FullWidth: Story = {
  args: {
    courseId: 'course-123',
    courseName: 'Full Stack Development',
    price: 0,
    color: 'green',
    size: 'md',
    fullWidth: true,
    onEnrollSuccess: () => console.log('Enrolled!'),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const ColorVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <EnrollButton
        courseId="course-1"
        courseName="Blue Course"
        price={0}
        color="blue"
        onEnrollSuccess={() => console.log('Blue enrolled')}
      />
      <EnrollButton
        courseId="course-2"
        courseName="Green Course"
        price={2999}
        color="green"
        onEnrollSuccess={() => console.log('Green enrolled')}
      />
      <EnrollButton
        courseId="course-3"
        courseName="Purple Course"
        price={0}
        color="purple"
        onEnrollSuccess={() => console.log('Purple enrolled')}
      />
    </div>
  ),
};

export const SizeVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <EnrollButton
        courseId="course-1"
        courseName="Small"
        price={0}
        size="sm"
        onEnrollSuccess={() => console.log('Small enrolled')}
      />
      <EnrollButton
        courseId="course-2"
        courseName="Medium"
        price={1999}
        size="md"
        onEnrollSuccess={() => console.log('Medium enrolled')}
      />
      <EnrollButton
        courseId="course-3"
        courseName="Large"
        price={4999}
        size="lg"
        onEnrollSuccess={() => console.log('Large enrolled')}
      />
    </div>
  ),
};

export const PriceVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="w-20 text-gray-600 dark:text-gray-400">Free:</span>
        <EnrollButton
          courseId="course-1"
          courseName="Free Course"
          price={0}
          onEnrollSuccess={() => console.log('Free enrolled')}
        />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-gray-600 dark:text-gray-400">$19.99:</span>
        <EnrollButton
          courseId="course-2"
          courseName="Budget Course"
          price={1999}
          onEnrollSuccess={() => console.log('Budget enrolled')}
        />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-gray-600 dark:text-gray-400">$99.99:</span>
        <EnrollButton
          courseId="course-3"
          courseName="Premium Course"
          price={9999}
          onEnrollSuccess={() => console.log('Premium enrolled')}
        />
      </div>
    </div>
  ),
};
