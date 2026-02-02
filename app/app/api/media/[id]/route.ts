import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAuth } from '@/lib/api-auth';
import { badRequest, notFound, serverError } from '@/lib/api-errors';
import { MediaItem, getMediaUrl } from '@/lib/media-types';

// ============================================================================
// GET /api/media/[id] - Get single media item
// ============================================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication to access media items
    const auth = await verifyAuth();
    if (auth.error) {
      return auth.error;
    }

    const supabase = getSupabaseAdmin();
    const { id } = params;

    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return notFound('Media not found');
    }

    const mediaWithUrl: MediaItem = {
      ...data,
      url: getMediaUrl(data.storage_path),
    };

    return NextResponse.json({ media: mediaWithUrl });
  } catch (error) {
    console.error('[Media API] Get error:', error);
    return serverError('Failed to fetch media');
  }
}

// ============================================================================
// PATCH /api/media/[id] - Update media metadata
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const auth = await verifyAuth();
    if (auth.error) {
      return auth.error;
    }

    const supabase = getSupabaseAdmin();
    const { id } = params;
    const body = await request.json();

    // Only allow updating certain fields
    const allowedFields = ['alt_text', 'caption', 'tags', 'folder'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return badRequest('No valid fields to update');
    }

    // If folder is being changed, move the file in storage
    if (updates.folder) {
      const { data: existingMedia } = await supabase
        .from('media')
        .select('storage_path, filename')
        .eq('id', id)
        .single();

      if (existingMedia) {
        const oldPath = existingMedia.storage_path;
        const newPath = `${updates.folder}/${existingMedia.filename}`;

        if (oldPath !== newPath) {
          // Move file in storage
          const { error: moveError } = await supabase.storage
            .from('media-library')
            .move(oldPath, newPath);

          if (moveError) {
            console.error('[Media API] Move error:', moveError);
            return serverError('Failed to move file');
          }

          updates.storage_path = newPath;
        }
      }
    }

    const { data, error } = await supabase
      .from('media')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Media API] Update error:', error);
      return serverError('Failed to update media');
    }

    if (!data) {
      return notFound('Media not found');
    }

    const mediaWithUrl: MediaItem = {
      ...data,
      url: getMediaUrl(data.storage_path),
    };

    return NextResponse.json({ success: true, media: mediaWithUrl });
  } catch (error) {
    console.error('[Media API] Unexpected error:', error);
    return serverError('Failed to update media');
  }
}

// ============================================================================
// DELETE /api/media/[id] - Delete media item
// ============================================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const auth = await verifyAuth();
    if (auth.error) {
      return auth.error;
    }

    const supabase = getSupabaseAdmin();
    const { id } = params;

    // Get the storage path first
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchError || !media) {
      return notFound('Media not found');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('media-library')
      .remove([media.storage_path]);

    if (storageError) {
      console.error('[Media API] Storage delete error:', storageError);
      // Continue anyway - the file might already be gone
    }

    // Delete metadata from database
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Media API] Delete error:', deleteError);
      return serverError('Failed to delete media');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Media API] Unexpected error:', error);
    return serverError('Failed to delete media');
  }
}
