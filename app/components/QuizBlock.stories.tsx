import type { Meta, StoryObj } from '@storybook/react';
import QuizBlock from './QuizBlock';

// ============================================================================
// QuizBlock Stories
// ============================================================================
// Storybook stories for LMS QuizBlock component

const meta: Meta<typeof QuizBlock> = {
  title: 'LMS/QuizBlock',
  component: QuizBlock,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto">
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
type Story = StoryObj<typeof QuizBlock>;

// Sample quiz questions
const sampleQuestions = [
  {
    id: '1',
    question: 'What is the primary purpose of a variable in programming?',
    options: [
      'To store and reference data',
      'To create visual effects',
      'To connect to the internet',
      'To compile code',
    ],
    correctAnswer: 0,
    explanation: 'Variables are containers that store data values which can be referenced and manipulated throughout your program.',
  },
  {
    id: '2',
    question: 'Which of the following is NOT a primitive data type in JavaScript?',
    options: [
      'String',
      'Number',
      'Array',
      'Boolean',
    ],
    correctAnswer: 2,
    explanation: 'Array is not a primitive type - it\'s an object. The primitive types are: String, Number, Boolean, undefined, null, Symbol, and BigInt.',
  },
  {
    id: '3',
    question: 'What does the "const" keyword indicate?',
    options: [
      'A variable that can be reassigned',
      'A variable that cannot be reassigned',
      'A function declaration',
      'A loop statement',
    ],
    correctAnswer: 1,
    explanation: 'The "const" keyword declares a constant - a variable whose value cannot be reassigned after initialization.',
  },
];

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    title: 'JavaScript Fundamentals Quiz',
    questions: sampleQuestions,
    color: 'blue',
    onComplete: (score, total) => console.log(`Quiz completed: ${score}/${total}`),
  },
};

export const SingleQuestion: Story = {
  args: {
    title: 'Quick Check',
    questions: [sampleQuestions[0]],
    color: 'green',
    onComplete: (score, total) => console.log(`Quiz completed: ${score}/${total}`),
  },
};

export const PurpleTheme: Story = {
  args: {
    title: 'Data Types Assessment',
    questions: sampleQuestions.slice(0, 2),
    color: 'purple',
    onComplete: (score, total) => console.log(`Quiz completed: ${score}/${total}`),
  },
};

export const LongQuiz: Story = {
  args: {
    title: 'Comprehensive Review',
    questions: [
      ...sampleQuestions,
      {
        id: '4',
        question: 'What is the output of: console.log(typeof null)?',
        options: ['null', 'undefined', 'object', 'error'],
        correctAnswer: 2,
        explanation: 'This is a well-known JavaScript quirk. typeof null returns "object" due to a legacy bug in the language.',
      },
      {
        id: '5',
        question: 'Which method adds an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 0,
        explanation: 'push() adds elements to the end, pop() removes from end, unshift() adds to beginning, shift() removes from beginning.',
      },
    ],
    color: 'blue',
    onComplete: (score, total) => console.log(`Quiz completed: ${score}/${total}`),
  },
};
