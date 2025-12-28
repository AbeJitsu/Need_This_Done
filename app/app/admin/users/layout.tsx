import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management - Admin | NeedThisDone',
  description: 'View and manage all user accounts, roles, and permissions.',
};

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
