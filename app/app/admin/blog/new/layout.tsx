import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Blog Post - Admin | NeedThisDone',
  description: 'Write a new blog post or import content from LinkedIn.',
};

export default function NewBlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
