import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Management - Admin | NeedThisDone',
  description: 'Create and manage your blog posts and content.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
