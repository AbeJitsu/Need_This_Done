// ============================================================================
// Private operator profile API
// ============================================================================
// The retained team profile is available only to database-backed operators.

export const dynamic = 'force-dynamic';

import { NextResponse, NextRequest } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (auth.error) return auth.error;
    const authUser = auth.user;

    const user = {
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.user_metadata?.full_name,
      image: authUser.user_metadata?.avatar_url,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (auth.error) return auth.error;
    const authUser = auth.user;

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Note: Google-provided names are not changed in Auth metadata by this
    // endpoint. A separate profile table can own editable display names later.
    // In the future, if we implement profile customization, we'd store it separately in a user profiles table

    return NextResponse.json({
      user: {
        email: authUser.email,
        name: name.trim(),
        image: authUser.user_metadata?.avatar_url,
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
