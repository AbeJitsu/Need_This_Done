import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUrl } from '@/lib/google-calendar';

// ============================================================================
// Google Calendar Connect API Route - GET /api/google/connect
// ============================================================================
// What: Initiates Google OAuth flow for calendar integration
// Why: Admin needs to authorize access to their Google Calendar
// How: Generates OAuth URL with state parameter for security

export async function GET(request: NextRequest) {
  try {
    // Get the current user from the session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.is_admin === true;
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Generate state parameter (includes user ID for security)
    const state = Buffer.from(JSON.stringify({
      user_id: user.id,
      timestamp: Date.now(),
    })).toString('base64');

    // Get the OAuth authorization URL
    const authUrl = getAuthUrl(state);

    return NextResponse.json({
      auth_url: authUrl,
    });

  } catch (error) {
    console.error('[Google Connect] Error:', error);

    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'Google Calendar integration is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
