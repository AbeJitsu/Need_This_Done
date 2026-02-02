import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
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

    // Verify admin role
    const { data: userData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get referral statistics
    const { data: referrals, error: referralsError } = await supabase
      .from('customer_referrals')
      .select('*')
      .order('total_earned', { ascending: false });

    if (referralsError) {
      return Response.json(
        { error: referralsError.message },
        { status: 400 }
      );
    }

    // Get transaction statistics
    const { data: transactions, error: transactionsError } = await supabase
      .from('referral_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (transactionsError) {
      return Response.json(
        { error: transactionsError.message },
        { status: 400 }
      );
    }

    // Calculate aggregate stats
    const totalCreditIssued = referrals?.reduce((sum, r) => sum + (r.total_earned || 0), 0) || 0;
    const totalCreditUsed = referrals?.reduce((sum, r) => sum + ((r.total_earned || 0) - (r.credit_balance || 0)), 0) || 0;
    const totalReferrals = transactions?.filter(t => t.status === 'completed').length || 0;
    const conversionRate = transactions && transactions.length > 0
      ? (totalReferrals / transactions.length) * 100
      : 0;

    return Response.json({
      stats: {
        totalReferrers: referrals?.length || 0,
        totalCreditIssued,
        totalCreditUsed,
        totalReferrals,
        conversionRate: conversionRate.toFixed(2),
      },
      topReferrers: (referrals || [])
        .slice(0, 10)
        .map(r => ({
          code: r.referral_code,
          totalEarned: r.total_earned,
          totalReferrals: r.total_referrals,
          balance: r.credit_balance,
        })),
      transactionBreakdown: {
        pending: transactions?.filter(t => t.status === 'pending').length || 0,
        completed: totalReferrals,
        expired: transactions?.filter(t => t.status === 'expired').length || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching referral analytics:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
