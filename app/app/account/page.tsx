import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import AccountSettingsClient from '@/components/account/AccountSettingsClient';

export const dynamic = 'force-dynamic';

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
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <AccountSettingsClient />;
}
