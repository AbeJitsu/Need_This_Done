import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// File Download API - /api/files/[...path]
// ============================================================================
// Serves files from Supabase Storage via time-limited signed URLs.
// Used by ProjectDetailModal to let admins view/download attachments.
//
// Security: Uses signed URLs that expire after 24 hours. Files in the
// project-attachments bucket are not publicly accessible.

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Reconstruct the file path from URL segments
  const { path } = await params;
  const filePath = path.join('/');

  if (!filePath) {
    return NextResponse.json({ error: 'File path required' }, { status: 400 });
  }

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables for file download');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Create Supabase client with service role for storage access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Generate a signed URL (valid for 24 hours)
  const { data, error } = await supabase.storage
    .from('project-attachments')
    .createSignedUrl(filePath, 86400);

  if (error || !data?.signedUrl) {
    console.error('Failed to generate signed URL:', error?.message);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // Redirect to the signed URL
  return NextResponse.redirect(data.signedUrl);
}
