import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dev Dashboard - Admin | NeedThisDone',
  description: 'System monitoring, development tools, and demos for administrators.',
};

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
