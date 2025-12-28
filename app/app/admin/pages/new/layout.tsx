import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Page - Admin | NeedThisDone',
  description: 'Choose a template or start from scratch to build a new page.',
};

export default function NewPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
