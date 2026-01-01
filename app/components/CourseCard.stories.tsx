import type { Meta, StoryObj } from '@storybook/react';
import CourseCard from './CourseCard';

// ============================================================================
// CourseCard Stories
// ============================================================================
// Storybook stories for LMS CourseCard component

const meta: Meta<typeof CourseCard> = {
  title: 'LMS/CourseCard',
  component: CourseCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    color: {
      control: 'select',
      options: ['blue', 'green', 'purple'],
    },
    variant: {
      control: 'select',
      options: ['preview', 'enrolled'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CourseCard>;

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites from scratch.',
    instructor: 'Sarah Johnson',
    duration: '12 hours',
    lessonCount: 24,
    price: 4999, // $49.99
    color: 'blue',
    href: '/courses/web-dev-intro',
    variant: 'preview',
  },
};

export const WithPrice: Story = {
  args: {
    title: 'Advanced React Patterns',
    description: 'Master advanced React concepts including hooks, context, and performance optimization.',
    instructor: 'Mike Chen',
    duration: '8 hours',
    lessonCount: 16,
    price: 7999, // $79.99
    originalPrice: 9999, // Was $99.99
    color: 'purple',
    href: '/courses/react-advanced',
    variant: 'preview',
  },
};

export const FreeCourse: Story = {
  args: {
    title: 'Git Basics for Beginners',
    description: 'Get started with version control using Git and GitHub in this free introductory course.',
    instructor: 'Alex Rivera',
    duration: '2 hours',
    lessonCount: 8,
    price: 0,
    color: 'green',
    href: '/courses/git-basics',
    variant: 'preview',
  },
};

export const Enrolled: Story = {
  args: {
    title: 'Python for Data Science',
    description: 'Learn Python programming and data analysis with pandas, numpy, and matplotlib.',
    instructor: 'Dr. Emily Watson',
    duration: '20 hours',
    lessonCount: 40,
    progress: 65,
    color: 'green',
    href: '/courses/python-data-science',
    variant: 'enrolled',
  },
};

export const JustStarted: Story = {
  args: {
    title: 'UI/UX Design Fundamentals',
    description: 'Discover the principles of user interface and user experience design.',
    instructor: 'Jordan Lee',
    duration: '15 hours',
    lessonCount: 30,
    progress: 5,
    color: 'purple',
    href: '/courses/uiux-fundamentals',
    variant: 'enrolled',
  },
};

export const NearlyComplete: Story = {
  args: {
    title: 'TypeScript Mastery',
    description: 'Take your JavaScript skills to the next level with TypeScript.',
    instructor: 'Chris Anderson',
    duration: '10 hours',
    lessonCount: 20,
    progress: 95,
    color: 'blue',
    href: '/courses/typescript-mastery',
    variant: 'enrolled',
  },
};

export const WithThumbnail: Story = {
  args: {
    title: 'Photography Essentials',
    description: 'Learn photography basics from composition to lighting techniques.',
    instructor: 'Maria Garcia',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=225&fit=crop',
    duration: '6 hours',
    lessonCount: 12,
    price: 3499,
    color: 'purple',
    href: '/courses/photography-essentials',
    variant: 'preview',
  },
};
