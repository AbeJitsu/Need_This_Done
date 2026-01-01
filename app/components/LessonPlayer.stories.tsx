import type { Meta, StoryObj } from '@storybook/react';
import LessonPlayer from './LessonPlayer';

// ============================================================================
// LessonPlayer Stories
// ============================================================================
// Storybook stories for LMS LessonPlayer component

const meta: Meta<typeof LessonPlayer> = {
  title: 'LMS/LessonPlayer',
  component: LessonPlayer,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['blue', 'green', 'purple'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof LessonPlayer>;

// Sample lesson content
const sampleContent = `
<p>Welcome to this lesson! In this section, we'll cover the fundamental concepts you need to understand before moving forward.</p>

<h2>Key Concepts</h2>
<p>There are three main ideas we'll explore:</p>
<ul>
  <li><strong>Concept One</strong> - The foundation of everything we'll build</li>
  <li><strong>Concept Two</strong> - How things connect together</li>
  <li><strong>Concept Three</strong> - Putting it all into practice</li>
</ul>

<h2>What You'll Learn</h2>
<p>By the end of this lesson, you'll be able to:</p>
<ol>
  <li>Understand the core principles</li>
  <li>Apply these concepts in real scenarios</li>
  <li>Build confidence for the next lesson</li>
</ol>

<p>Let's get started!</p>
`;

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    title: 'Introduction to Variables',
    content: sampleContent,
    currentLesson: 3,
    totalLessons: 12,
    color: 'blue',
    onPrevious: () => console.log('Previous clicked'),
    onNext: () => console.log('Next clicked'),
    onMarkComplete: () => console.log('Marked complete'),
  },
};

export const FirstLesson: Story = {
  args: {
    title: 'Welcome to the Course',
    content: `
      <p>Welcome to your learning journey! This is the first lesson where we'll set the foundation for everything to come.</p>
      <p>Take your time with this content - understanding these basics will make everything else easier.</p>
    `,
    currentLesson: 1,
    totalLessons: 10,
    color: 'green',
    onPrevious: () => console.log('Previous clicked'),
    onNext: () => console.log('Next clicked'),
    onMarkComplete: () => console.log('Marked complete'),
  },
};

export const LastLesson: Story = {
  args: {
    title: 'Course Conclusion & Next Steps',
    content: `
      <h2>Congratulations!</h2>
      <p>You've made it to the final lesson. Let's review what you've learned and discuss where to go from here.</p>
      <h3>Key Takeaways</h3>
      <ul>
        <li>You've mastered the fundamentals</li>
        <li>You've applied concepts in practice exercises</li>
        <li>You're ready for advanced topics</li>
      </ul>
    `,
    currentLesson: 10,
    totalLessons: 10,
    color: 'purple',
    onPrevious: () => console.log('Previous clicked'),
    onNext: () => console.log('Next clicked'),
    onMarkComplete: () => console.log('Marked complete'),
  },
};

export const WithVideo: Story = {
  args: {
    title: 'Understanding Functions',
    content: `
      <p>In this video lesson, we explore how functions work and why they're essential for writing clean, reusable code.</p>
      <p>Watch the video above, then review the key points below.</p>
    `,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    currentLesson: 5,
    totalLessons: 12,
    color: 'blue',
    onPrevious: () => console.log('Previous clicked'),
    onNext: () => console.log('Next clicked'),
    onMarkComplete: () => console.log('Marked complete'),
  },
};

export const Completed: Story = {
  args: {
    title: 'Working with Arrays',
    content: `
      <p>Arrays are collections of items that let you store multiple values in a single variable.</p>
      <p>This lesson has already been completed. You can review the content or move to the next lesson.</p>
    `,
    currentLesson: 4,
    totalLessons: 12,
    isCompleted: true,
    color: 'green',
    onPrevious: () => console.log('Previous clicked'),
    onNext: () => console.log('Next clicked'),
  },
};

export const MiddleOfCourse: Story = {
  args: {
    title: 'Advanced Patterns',
    content: sampleContent,
    currentLesson: 6,
    totalLessons: 12,
    color: 'purple',
    onPrevious: () => console.log('Previous clicked'),
    onNext: () => console.log('Next clicked'),
    onMarkComplete: () => console.log('Marked complete'),
  },
};
