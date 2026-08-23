import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { hasAdminRole } from '@/lib/api-auth';
import AccountSettingsClient from '@/components/account/AccountSettingsClient';

export const dynamic = 'force-dynamic';

// ============================================================================
// Account Settings Page - /account
// ============================================================================
// Private team profile settings. Historical customer identities do not grant
// access to this route.

export const metadata: Metadata = {
  title: 'Account Settings - NeedThisDone',
  description: 'Manage your account information and preferences',
};

export default async function AccountPage() {
  // Protect the page - require authentication
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !(await hasAdminRole(user.id))) {
    redirect('/login');
  }

  return <AccountSettingsClient />;
}
