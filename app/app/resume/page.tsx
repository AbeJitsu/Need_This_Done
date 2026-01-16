import { Metadata } from 'next';
import ResumePageClient from './ResumePageClient';

// ============================================================================
// Resume Page - /resume
// ============================================================================
// Public resume page for Abe Reyes. Shows professional background,
// skills, and experience. Useful for both potential clients and employers.
//
// This server component handles metadata. ResumePageClient handles rendering
// with Framer Motion animations.

export const metadata: Metadata = {
  title: 'Resume - Abe Reyes | Full-Stack Developer',
  description:
    'Full-stack developer with 3 years building production applications. React, Next.js, TypeScript, Node.js, PostgreSQL.',
};

export default function ResumePage() {
  return <ResumePageClient />;
}
