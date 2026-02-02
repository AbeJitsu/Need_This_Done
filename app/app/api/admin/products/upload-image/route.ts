import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/api-auth';

// ============================================================================
// Upload Image to Supabase Storage (Admin Only)
// ============================================================================
// What: Uploads product images to Supabase Storage
// Why: Provides centralized image hosting with public URLs
// How: Uses service role key to bypass RLS, uploads to product-images bucket

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Create Supabase client lazily to avoid build-time errors
// Environment variables aren't available during Next.js page data collection
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    // Admin-only endpoint
    const auth = await verifyAdmin();
    if (auth.error) {
      return auth.error;
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ error: 'No product ID provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate productId format (alphanumeric, hyphens, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(productId)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

    // Generate filename based on product ID
    const fileExt = file.name.split('.').pop();
    const fileName = `product-${productId}.${fileExt}`;
    const filePath = fileName;

    // Convert File to ArrayBuffer then Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get Supabase client (lazy initialization)
    const supabase = getSupabaseClient();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Replace existing file
      });

    if (error) {
      console.error('[Upload Image] Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to upload: ${error.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch (error) {
    console.error('[Upload Image] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
