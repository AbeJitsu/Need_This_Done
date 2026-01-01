import type { Meta, StoryObj } from '@storybook/react';
import Certificate from './Certificate';

// ============================================================================
// Certificate Stories
// ============================================================================
// Storybook stories for LMS Certificate component

const meta: Meta<typeof Certificate> = {
  title: 'LMS/Certificate',
  component: Certificate,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'light',
    },
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['blue', 'green', 'purple'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Certificate>;

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    courseName: 'Introduction to Web Development',
    courseDescription: 'A comprehensive introduction to HTML, CSS, and JavaScript',
    studentName: 'Jane Smith',
    completionDate: new Date('2025-01-15'),
    certificateId: 'CERT-2025-WD-001',
    instructorName: 'Sarah Johnson',
    color: 'blue',
  },
};

export const GreenTheme: Story = {
  args: {
    courseName: 'Python for Data Science',
    courseDescription: 'Master data analysis with Python, pandas, and visualization',
    studentName: 'John Doe',
    completionDate: new Date('2025-02-20'),
    certificateId: 'CERT-2025-PY-042',
    instructorName: 'Dr. Emily Watson',
    color: 'green',
  },
};

export const PurpleTheme: Story = {
  args: {
    courseName: 'Advanced React Patterns',
    courseDescription: 'Deep dive into hooks, context, and performance optimization',
    studentName: 'Alex Chen',
    completionDate: new Date('2025-03-10'),
    certificateId: 'CERT-2025-RX-103',
    instructorName: 'Mike Rodriguez',
    color: 'purple',
  },
};

export const WithoutDescription: Story = {
  args: {
    courseName: 'Git & GitHub Fundamentals',
    studentName: 'Maria Garcia',
    completionDate: new Date('2025-01-05'),
    certificateId: 'CERT-2025-GIT-007',
    instructorName: 'Chris Anderson',
    color: 'blue',
  },
};

export const LongCourseName: Story = {
  args: {
    courseName: 'Complete Full-Stack Web Development Bootcamp with React, Node.js, and PostgreSQL',
    courseDescription: 'From zero to full-stack developer in 20 weeks',
    studentName: 'Elizabeth Montgomery-Smithson',
    completionDate: new Date('2025-06-30'),
    certificateId: 'CERT-2025-FS-999',
    instructorName: 'Dr. Katherine Williams',
    color: 'purple',
  },
};
