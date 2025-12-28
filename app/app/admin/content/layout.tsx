import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Management - Admin | NeedThisDone',
  description: 'Edit page content, colors, and text on your marketing pages.',
};

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
