import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import AccountSettingsClient from '@/components/account/AccountSettingsClient';

// ============================================================================
// Account Settings Page - /account
// ============================================================================
// What: Customer-facing account settings and profile management
// Why: Let users view and manage their account information
// How: Server component handles auth, client component handles interactivity

export const metadata: Metadata = {
  title: 'Account Settings - NeedThisDone',
  description: 'Manage your account information and preferences',
};

export default async function AccountPage() {
  // Protect the page - require authentication
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/api/auth/signin');
  }

  return <AccountSettingsClient />;
}
