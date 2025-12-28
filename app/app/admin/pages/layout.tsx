import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Builder - Admin | NeedThisDone',
  description: 'Create and manage custom pages with drag-and-drop.',
};

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
