// ============================================================================
// Notification Preferences API
// ============================================================================
// What: Get and update user notification preferences
// Why: Let users control which emails they receive
// How: Store preferences in user metadata or preferences table

export const dynamic = 'force-dynamic';

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// ============================================================================
// Types
// ============================================================================

interface NotificationPreferences {
  orderUpdates: boolean;
  orderConfirmation: boolean;
  appointmentReminders: boolean;
  productWishlistAlerts: boolean;
  promotionalEmails: boolean;
  weeklyDigest: boolean;
}

// Default preferences for new users
const DEFAULT_PREFERENCES: NotificationPreferences = {
  orderUpdates: true,
  orderConfirmation: true,
  appointmentReminders: true,
  productWishlistAlerts: false,
  promotionalEmails: false,
  weeklyDigest: false,
};

// ============================================================================
// GET - Fetch User's Notification Preferences
// ============================================================================

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Try to fetch preferences from database
    const { data, error } = await supabase
      .from('user_preferences')
      .select('notification_preferences')
      .eq('email', session.user.email)
      .single();

    // If preferences don't exist or there's an error, return defaults
    if (error || !data) {
      return NextResponse.json({
        preferences: DEFAULT_PREFERENCES,
        isDefault: true,
      });
    }

    // Parse stored preferences or return defaults if invalid
    const preferences = data.notification_preferences || DEFAULT_PREFERENCES;

    return NextResponse.json({
      preferences,
      isDefault: false,
    });
  } catch (error) {
    console.error('Notification preferences fetch error:', error);
    // Gracefully return defaults on error instead of failing
    return NextResponse.json({
      preferences: DEFAULT_PREFERENCES,
      isDefault: true,
      error: 'Using default preferences',
    });
  }
}

// ============================================================================
// PUT - Update User's Notification Preferences
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { preferences } = body;

    // Validate preferences object
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    // Merge with defaults to ensure all fields are present
    const mergedPreferences: NotificationPreferences = {
      ...DEFAULT_PREFERENCES,
      ...preferences,
    };

    const supabase = await createSupabaseServerClient();

    // Upsert preferences into database
    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          email: session.user.email,
          notification_preferences: mergedPreferences,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'email',
        }
      );

    if (error) {
      console.error('Preference update error:', error);
      throw new Error('Failed to save preferences');
    }

    return NextResponse.json({
      preferences: mergedPreferences,
      success: true,
    });
  } catch (error) {
    console.error('Notification preferences update error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update preferences',
      },
      { status: 500 }
    );
  }
}
