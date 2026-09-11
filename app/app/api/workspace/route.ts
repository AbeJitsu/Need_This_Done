import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { loadWorkspace, WorkspaceUnavailableError } from '@/lib/workspace';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await verifyAuth();
  if (auth.error) return auth.error;

  try {
    const supabase = await createSupabaseServerClient();
    const workspace = await loadWorkspace(supabase, auth.user.id);
    return NextResponse.json(workspace, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof WorkspaceUnavailableError) {
      return NextResponse.json(
        { error: error.message, code: 'WORKSPACE_NOT_CONFIGURED' },
        { status: 503 },
      );
    }
    console.error('[workspace] Failed to load authenticated workspace:', error);
    return NextResponse.json(
      { error: 'Your workspace could not be loaded right now.', code: 'WORKSPACE_LOAD_FAILED' },
      { status: 500 },
    );
  }
}
