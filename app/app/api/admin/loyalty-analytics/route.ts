export const dynamic = 'force-dynamic';

// ============================================================================
// GET /api/admin/loyalty-analytics
// ============================================================================
// What: Fetch aggregated loyalty program analytics for admin dashboard
// Why: Show program performance metrics and top earners
// How: Query loyalty tables and aggregate statistics

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(req: NextRequest) {
  try {
    // Verify admin
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if admin
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch total points issued
    // Note: get_user_loyalty_balance is a per-user function, so we aggregate from points table instead

    // Get total issued points
    const { data: totalIssued } = await supabase
      .from('loyalty_points')
      .select('points_earned', { count: 'exact' });

    const totalPointsIssued = totalIssued?.reduce((sum, row) => sum + row.points_earned, 0) || 0;

    // Get total redeemed points
    const { data: totalRedeemed } = await supabase
      .from('loyalty_redemptions')
      .select('points_redeemed')
      .eq('status', 'completed');

    const totalPointsRedeemed = totalRedeemed?.reduce((sum, row) => sum + row.points_redeemed, 0) || 0;

    // Get outstanding points
    const { data: outstanding } = await supabase
      .from('loyalty_points_balance')
      .select('current_balance');

    const totalPointsOutstanding = outstanding?.reduce((sum, row) => sum + row.current_balance, 0) || 0;

    // Get unique participants
    const { data: participants } = await supabase
      .from('loyalty_points')
      .select('user_id');

    const uniqueParticipants = new Set(participants?.map(p => p.user_id)).size;

    // Calculate redemption rate
    const redemptionRate = totalPointsIssued > 0
      ? (totalPointsRedeemed / totalPointsIssued) * 100
      : 0;

    // Calculate average points per customer
    const averagePointsPerCustomer = uniqueParticipants > 0
      ? totalPointsIssued / uniqueParticipants
      : 0;

    // Get config
    const { data: config } = await supabase
      .from('loyalty_points_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get top earners
    const { data: topEarners } = await supabase
      .from('loyalty_points')
      .select('user_id')
      .order('points_earned', { ascending: false })
      .limit(10);

    const topEarnersMap = new Map();
    if (topEarners) {
      for (const earner of topEarners) {
        if (!topEarnersMap.has(earner.user_id)) {
          topEarnersMap.set(earner.user_id, 0);
        }
        topEarnersMap.set(earner.user_id, topEarnersMap.get(earner.user_id) + 1);
      }
    }

    const topEarnersWithEmail = await Promise.all(
      Array.from(topEarnersMap.entries()).slice(0, 5).map(async ([userId, earned]) => {
        const { data: userAuth } = await supabase.auth.admin.getUserById(userId);

        const { data: balance } = await supabase
          .from('loyalty_points_balance')
          .select('current_balance')
          .eq('user_id', userId)
          .single();

        return {
          email: userAuth?.user?.email || 'Unknown',
          pointsEarned: earned,
          balance: balance?.current_balance || 0,
        };
      })
    );

    return NextResponse.json({
      totalPointsIssued,
      totalPointsRedeemed,
      totalPointsOutstanding,
      uniqueParticipants,
      redemptionRate,
      averagePointsPerCustomer,
      config: config ? {
        pointsPerDollar: config.points_per_dollar,
        minPointsToRedeem: config.min_points_to_redeem,
        pointValueCents: config.point_value_cents,
      } : null,
      topEarners: topEarnersWithEmail,
    });

  } catch (error) {
    console.error('Loyalty analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
