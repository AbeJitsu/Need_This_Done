export const dynamic = 'force-dynamic';

// ============================================================================
// POST /api/loyalty/earn
// ============================================================================
// What: Award loyalty points on order completion
// Why: Incentivize repeat purchases and engagement
// How: Calculate points based on order amount and loyalty config

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const earnPointsSchema = z.object({
  userId: z.string().uuid(),
  orderId: z.string(),
  orderTotalCents: z.number().min(0),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, orderId, orderTotalCents, description } = earnPointsSchema.parse(body);

    // Get loyalty config
    const { data: config, error: configError } = await supabase
      .from('loyalty_points_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (configError || !config) {
      console.error('Error fetching loyalty config:', configError);
      return NextResponse.json(
        { error: 'Loyalty points not available' },
        { status: 500 }
      );
    }

    // Calculate points to earn
    const orderDollars = orderTotalCents / 100;
    const pointsToEarn = Math.floor(orderDollars * config.points_per_dollar);

    if (pointsToEarn <= 0) {
      return NextResponse.json({
        pointsEarned: 0,
        message: 'Order too small for points',
      });
    }

    // Insert loyalty points record
    const { error: insertError } = await supabase
      .from('loyalty_points')
      .insert({
        user_id: userId,
        points_earned: pointsToEarn,
        source: 'purchase',
        source_id: orderId,
        description: description || `Earned from order ${orderId}`,
      });

    if (insertError) {
      console.error('Error earning points:', insertError);
      return NextResponse.json(
        { error: 'Failed to award points' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      pointsEarned: pointsToEarn,
      totalBalance: 0, // Will be fetched separately
      orderId,
    });

  } catch (error) {
    console.error('Earn points error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
