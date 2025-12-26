import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAuth } from '@/lib/api-auth';
import { badRequest, serverError } from '@/lib/api-errors';
import {
  MediaItem,
  MediaListResponse,
  MEDIA_VALIDATION,
  isValidMediaType,
  isValidMediaSize,
  getMediaUrl
} from '@/lib/media-types';

// ============================================================================
// GET /api/media - List media items with filtering
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    // Parse filters
    const folder = searchParams.get('folder');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '24', 10), 100);
    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabase
      .from('media')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (folder && folder !== 'all') {
      query = query.eq('folder', folder);
    }

    if (search) {
      query = query.or(`filename.ilike.%${search}%,alt_text.ilike.%${search}%,caption.ilike.%${search}%`);
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    // Paginate
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[Media API] List error:', error);
      return serverError('Failed to fetch media');
    }

    // Add URLs to each item
    const mediaWithUrls: MediaItem[] = (data || []).map((item: MediaItem) => ({
      ...item,
      url: getMediaUrl(item.storage_path),
    }));

    const response: MediaListResponse = {
      media: mediaWithUrls,
      total: count || 0,
      page,
      pageSize,
      hasMore: offset + pageSize < (count || 0),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Media API] Unexpected error:', error);
    return serverError('Failed to fetch media');
  }
}

// ============================================================================
// POST /api/media - Upload new media
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth();
    if (auth.error) {
      return auth.error;
    }

    const supabase = getSupabaseAdmin();
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';
    const altText = formData.get('alt_text') as string | null;
    const caption = formData.get('caption') as string | null;
    const tagsString = formData.get('tags') as string | null;
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

    if (!file) {
      return badRequest('No file provided');
    }

    // Validate file
    if (!isValidMediaType(file.type)) {
      return badRequest(`Invalid file type. Allowed: ${MEDIA_VALIDATION.ALLOWED_TYPES.join(', ')}`);
    }

    if (!isValidMediaSize(file.size)) {
      return badRequest(`File too large. Maximum size: ${MEDIA_VALIDATION.MAX_SIZE / 1024 / 1024}MB`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9-_]/g, '-') // Sanitize
      .substring(0, 50); // Limit length

    const filename = `${sanitizedName}-${timestamp}-${randomId}.${extension}`;
    const storagePath = `${folder}/${filename}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from('media-library')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Media API] Upload error:', uploadError);
      return serverError('Failed to upload file');
    }

    // Get image dimensions (basic extraction from buffer for common formats)
    let width: number | undefined;
    let height: number | undefined;

    // For now, we'll leave dimensions undefined - they can be set via client-side processing
    // or a separate image processing service

    // Save metadata to database
    const mediaRecord = {
      storage_path: storagePath,
      filename,
      original_filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      width,
      height,
      alt_text: altText || null,
      caption: caption || null,
      tags,
      folder,
      uploaded_by: auth.user.id,
    };

    const { data: insertedMedia, error: insertError } = await supabase
      .from('media')
      .insert(mediaRecord)
      .select()
      .single();

    if (insertError) {
      console.error('[Media API] Insert error:', insertError);
      // Try to clean up the uploaded file
      await supabase.storage.from('media-library').remove([storagePath]);
      return serverError('Failed to save media metadata');
    }

    const mediaWithUrl: MediaItem = {
      ...insertedMedia,
      url: getMediaUrl(storagePath),
    };

    return NextResponse.json({ success: true, media: mediaWithUrl }, { status: 201 });
  } catch (error) {
    console.error('[Media API] Unexpected error:', error);
    return serverError('Failed to upload media');
  }
}
