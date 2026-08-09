import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/** Human-only transition from a reviewed research draft into outreach_messages. */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  if (!z.string().uuid().safeParse(params.id).success) return NextResponse.json({ error: 'Invalid dossier.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('promote_prospect_dossier', { target_dossier_id: params.id });
  if (error) {
    if (error.code === 'P0002') return NextResponse.json({ error: 'Dossier not found.' }, { status: 404 });
    return NextResponse.json({ error: 'A valid recipient and approved sender are required before this draft can enter outreach.' }, { status: 409 });
  }
  return NextResponse.json({ message: data }, { status: 201 });
}
