// ============================================================================
// GET /api/loyalty/balance
// ============================================================================
// What: Fetch user's current loyalty points balance
// Why: Display points in customer dashboard and checkout
// How: Query loyalty_points_balance view for aggregated balance

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(req: NextRequest) {
  try {
    // Get auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Fetch user's loyalty points balance
    const { data: balance, error: balanceError } = await supabase
      .from('loyalty_points_balance')
      .select('current_balance')
      .eq('user_id', user.id)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') {
      console.error('Error fetching loyalty balance:', balanceError);
      return NextResponse.json(
        { error: 'Failed to fetch balance' },
        { status: 500 }
      );
    }

    // Fetch config to show point value
    const { data: config, error: configError } = await supabase
      .from('loyalty_points_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (configError) {
      console.error('Error fetching loyalty config:', configError);
      return NextResponse.json(
        { error: 'Failed to fetch config' },
        { status: 500 }
      );
    }

    // Fetch recent transactions for history
    const { data: recentPoints, error: pointsError } = await supabase
      .from('loyalty_points')
      .select('id, points_earned, source, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (pointsError) {
      console.error('Error fetching recent points:', pointsError);
    }

    return NextResponse.json({
      userId: user.id,
      currentBalance: balance?.current_balance || 0,
      config: config ? {
        pointsPerDollar: config.points_per_dollar,
        minPointsToRedeem: config.min_points_to_redeem,
        pointValueCents: config.point_value_cents,
      } : null,
      recentTransactions: recentPoints || [],
    });

  } catch (error) {
    console.error('Loyalty balance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
