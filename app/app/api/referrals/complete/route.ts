import { createClient } from '@supabase/supabase-js';
import { validateSupabaseAdminConfig } from '@/lib/supabase-client-safe';

interface CompleteReferralRequest {
  referralTransactionId: string;
  orderId?: string;
}

export async function POST(request: Request) {
  try {
    const config = validateSupabaseAdminConfig();
    if (!config.isValid) return config.error;

    const supabase = createClient(config.url, config.key, {
      auth: { persistSession: false }
    });

    const { referralTransactionId, orderId: _orderId } = (await request.json()) as CompleteReferralRequest;

    if (!referralTransactionId) {
      return Response.json(
        { error: 'Missing referral transaction ID' },
        { status: 400 }
      );
    }

    // Get the referral transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('referral_transactions')
      .select('*')
      .eq('id', referralTransactionId)
      .single();

    if (transactionError || !transaction) {
      return Response.json(
        { error: 'Referral transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.status === 'completed') {
      return Response.json(
        { error: 'This referral was already completed' },
        { status: 400 }
      );
    }

    // Update transaction status
    const { error: updateError } = await supabase
      .from('referral_transactions')
      .update({
        status: 'completed',
        claimed_at: new Date().toISOString(),
      })
      .eq('id', referralTransactionId);

    if (updateError) {
      return Response.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    // Add credit to referrer's account
    await supabase
      .from('customer_referrals')
      .update({
        credit_balance: supabase.rpc('increment_credit_balance', {
          user_id: transaction.referrer_id,
          amount: transaction.credit_amount,
        }),
        total_earned: supabase.rpc('increment_total_earned', {
          user_id: transaction.referrer_id,
          amount: transaction.credit_amount,
        }),
        total_referrals: supabase.rpc('increment_total_referrals', {
          user_id: transaction.referrer_id,
        }),
      })
      .eq('user_id', transaction.referrer_id);

    // For now, do simpler update
    const { data: referral } = await supabase
      .from('customer_referrals')
      .select('credit_balance, total_earned, total_referrals')
      .eq('user_id', transaction.referrer_id)
      .single();

    if (referral) {
      const { error: simpleUpdateError } = await supabase
        .from('customer_referrals')
        .update({
          credit_balance: (referral.credit_balance || 0) + transaction.credit_amount,
          total_earned: (referral.total_earned || 0) + transaction.credit_amount,
          total_referrals: (referral.total_referrals || 0) + 1,
        })
        .eq('user_id', transaction.referrer_id);

      if (simpleUpdateError) {
        console.error('Error updating referral credit:', simpleUpdateError);
      }
    }

    return Response.json({
      success: true,
      transaction: {
        ...transaction,
        status: 'completed',
        claimed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error completing referral:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
