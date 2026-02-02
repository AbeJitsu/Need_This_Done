// ============================================================================
// Customer Account Profile API
// ============================================================================
// What: Get and update customer profile information
// Why: Allow customers to manage their account details
// How: Fetch/update user data from Supabase or NextAuth session

export const dynamic = 'force-dynamic';

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For NextAuth/Google OAuth users, we return the session info
    // For Supabase users, we can fetch more details if needed
    const user = {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Note: Name is read-only from NextAuth/Google OAuth
    // User cannot change their name through this API as it comes from their Google account
    // In the future, if we implement profile customization, we'd store it separately in a user profiles table

    return NextResponse.json({
      user: {
        email: session.user.email,
        name: name.trim(),
        image: session.user.image,
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
