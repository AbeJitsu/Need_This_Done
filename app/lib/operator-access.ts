import { redirect } from 'next/navigation';
import { hasAdminRole } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// Server-rendered operator boundary for private browser workspaces. The
// Supabase cookie session establishes identity; the durable user_roles record
// establishes operator access. Keep this separate from API responses, which
// use verifyAdmin to return 401/403 JSON contracts.
export async function requireOperator() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !(await hasAdminRole(user.id))) {
    redirect('/login');
  }

  return user;
}
