// ============================================================================
// POST /api/loyalty/redeem
// ============================================================================
// What: Redeem loyalty points for discount on order
// Why: Give customers incentive to use accumulated points
// How: Deduct points, record redemption, return discount amount

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const redeemSchema = z.object({
  userId: z.string().uuid(),
  pointsToRedeem: z.number().int().min(1),
  orderId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, pointsToRedeem, orderId } = redeemSchema.parse(body);

    // Get loyalty config
    const { data: config, error: configError } = await supabase
      .from('loyalty_points_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (configError || !config || !config.is_active) {
      return NextResponse.json(
        { error: 'Loyalty points not available' },
        { status: 400 }
      );
    }

    // Check minimum points requirement
    if (pointsToRedeem < config.min_points_to_redeem) {
      return NextResponse.json(
        {
          error: `Minimum ${config.min_points_to_redeem} points required`,
          minRequired: config.min_points_to_redeem,
        },
        { status: 400 }
      );
    }

    // Get user's current balance
    const { data: balance } = await supabase
      .from('loyalty_points_balance')
      .select('current_balance')
      .eq('user_id', userId)
      .single();

    const currentBalance = balance?.current_balance || 0;

    if (currentBalance < pointsToRedeem) {
      return NextResponse.json(
        {
          error: 'Insufficient points',
          currentBalance,
          requested: pointsToRedeem,
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    const amountCreditedCents = Math.floor(pointsToRedeem * config.point_value_cents);

    // Record redemption
    const { data: redemption, error: redeemError } = await supabase
      .from('loyalty_redemptions')
      .insert({
        user_id: userId,
        points_redeemed: pointsToRedeem,
        amount_credited_cents: amountCreditedCents,
        order_id: orderId || null,
        status: 'completed',
      })
      .select()
      .single();

    if (redeemError) {
      console.error('Error redeeming points:', redeemError);
      return NextResponse.json(
        { error: 'Failed to redeem points' },
        { status: 500 }
      );
    }

    const newBalance = currentBalance - pointsToRedeem;

    return NextResponse.json({
      pointsRedeemed: pointsToRedeem,
      discountCents: amountCreditedCents,
      discountDollars: (amountCreditedCents / 100).toFixed(2),
      newBalance,
      redemptionId: redemption.id,
    });

  } catch (error) {
    console.error('Redeem points error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
