import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  if (!z.string().uuid().safeParse((await params).id).success) return NextResponse.json({ error: 'Invalid agent artifact.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: artifact, error: artifactError } = await supabase
    .from('agent_artifacts')
    .select('id, current_version_id, owner_id')
    .eq('id', (await params).id)
    .eq('owner_id', auth.user.id)
    .maybeSingle();
  if (artifactError) return NextResponse.json({ error: 'Artifact preview is unavailable.' }, { status: 500 });
  if (!artifact) return NextResponse.json({ error: 'Agent artifact not found.' }, { status: 404 });
  if (!artifact.current_version_id) return NextResponse.json({ error: 'This artifact has no preview version.' }, { status: 404 });

  const { data: version, error: versionError } = await supabase
    .from('agent_artifact_versions')
    .select('storage_path, mime_type')
    .eq('id', artifact.current_version_id)
    .eq('owner_id', auth.user.id)
    .maybeSingle();
  if (versionError) return NextResponse.json({ error: 'Artifact preview is unavailable.' }, { status: 500 });
  if (!version?.storage_path) return NextResponse.json({ error: 'This artifact is text-only.' }, { status: 404 });

  const { data, error } = await getSupabaseAdmin()
    .storage
    .from('agent-media-private')
    .createSignedUrl(version.storage_path, 300);
  if (error || !data?.signedUrl) return NextResponse.json({ error: 'A preview URL could not be created.' }, { status: 503 });
  return NextResponse.json({
    url: data.signedUrl,
    mimeType: version.mime_type || 'application/octet-stream',
    expiresInSeconds: 300,
  });
}
