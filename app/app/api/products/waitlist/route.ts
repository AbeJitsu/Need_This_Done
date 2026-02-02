// ============================================================================
// Product Waitlist API
// ============================================================================
// What: Manage product waitlist signups for out-of-stock items
// Why: Capture customer demand and enable inventory alerts
// How: Store email + product ID, allow users to be notified when stock returns

import { NextResponse, NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Use singleton admin client to leverage connection pooling
// This ensures all requests share the same connection pool,
// supporting 100+ concurrent requests without exhaustion

// Validate required environment variables are present
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
    'Waitlist API cannot initialize without Supabase configuration.'
  );
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
    'Waitlist API requires service role credentials for database access.'
  );
}

interface WaitlistRequest {
  productId: string;
  variantId?: string;
  email: string;
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
}

export async function POST(request: NextRequest) {
  try {
    const body: WaitlistRequest = await request.json();
    const { productId, variantId, email } = body;

    // Validate required fields
    if (!productId || !email) {
      return NextResponse.json(
        { error: 'Product ID and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if already on waitlist
    const supabase = getSupabaseAdmin();
    const { data: existing, error: checkError } = await supabase
      .from('product_waitlist')
      .select('id')
      .eq('product_id', productId)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows found" which is expected
      console.error('Waitlist check error:', checkError);
      return NextResponse.json(
        { error: 'Failed to check waitlist status' },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: 'You are already on the waitlist for this product' },
        { status: 409 }
      );
    }

    // Add to waitlist
    const { error: insertError } = await supabase
      .from('product_waitlist')
      .insert({
        product_id: productId,
        variant_id: variantId || null,
        email: email.toLowerCase(),
        status: 'pending',
      });

    if (insertError) {
      console.error('Waitlist insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist',
    });
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Failed to process waitlist signup' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch user's waitlist entries
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: waitlistItems, error } = await supabase
      .from('product_waitlist')
      .select('product_id, variant_id, status, created_at')
      .eq('email', email.toLowerCase())
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Waitlist fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch waitlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: waitlistItems || [],
      count: waitlistItems?.length || 0,
    });
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    );
  }
}
