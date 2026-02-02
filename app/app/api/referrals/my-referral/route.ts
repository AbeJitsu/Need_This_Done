export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

import { validateSupabaseAdminConfig } from '@/lib/supabase-client-safe';

export async function GET() {
  try {
    const config = validateSupabaseAdminConfig();
    if (!config.isValid) return config.error;

    const supabase = createClient(config.url, config.key, {
      auth: { persistSession: false }
    });

    const headersList = headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 401 });
    }

    // Get or create customer referral record
    let referral = await supabase
      .from('customer_referrals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (referral.error && referral.error.code === 'PGRST116') {
      // Record doesn't exist, create it
      const referralCode = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const { data: newReferral, error } = await supabase
        .from('customer_referrals')
        .insert({
          user_id: user.id,
          referral_code: referralCode,
        })
        .select()
        .single();

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      referral.data = newReferral;
    } else if (referral.error) {
      return Response.json(
        { error: referral.error.message },
        { status: 400 }
      );
    }

    // Get referral statistics
    const { data: transactions } = await supabase
      .from('referral_transactions')
      .select('status, credit_amount')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    const stats = {
      totalReferrals: transactions?.length || 0,
      completedReferrals: transactions?.filter(t => t.status === 'completed').length || 0,
      totalEarned: transactions?.reduce((sum, t) => sum + (t.status === 'completed' ? t.credit_amount : 0), 0) || 0,
    };

    return Response.json({
      referral: referral.data,
      stats,
      referralUrl: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referral.data.referral_code}`,
    });
  } catch (error) {
    console.error('Error fetching referral:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
