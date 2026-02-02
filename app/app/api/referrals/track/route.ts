import { createClient } from '@supabase/supabase-js';
import { validateSupabaseAdminConfig } from '@/lib/supabase-client-safe';

interface TrackReferralRequest {
  referralCode: string;
  userId: string;
}

export async function POST(request: Request) {
  try {
    const config = validateSupabaseAdminConfig();
    if (!config.isValid) return config.error;

    const supabase = createClient(config.url, config.key, {
      auth: { persistSession: false }
    });

    const { referralCode, userId } = (await request.json()) as TrackReferralRequest;

    if (!referralCode || !userId) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify referral code exists
    const { data: referral, error: referralError } = await supabase
      .from('customer_referrals')
      .select('user_id')
      .eq('referral_code', referralCode)
      .single();

    if (referralError || !referral) {
      return Response.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    // Don't allow self-referrals
    if (referral.user_id === userId) {
      return Response.json(
        { error: 'Cannot use your own referral code' },
        { status: 400 }
      );
    }

    // Check if this user was already referred by this code
    const { data: existingTransaction } = await supabase
      .from('referral_transactions')
      .select('id')
      .eq('referred_user_id', userId)
      .eq('referral_code', referralCode)
      .single();

    if (existingTransaction) {
      return Response.json(
        { error: 'This user was already referred with this code' },
        { status: 400 }
      );
    }

    // Create referral transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('referral_transactions')
      .insert({
        referrer_id: referral.user_id,
        referred_user_id: userId,
        referral_code: referralCode,
        status: 'pending',
      })
      .select()
      .single();

    if (transactionError) {
      return Response.json(
        { error: transactionError.message },
        { status: 400 }
      );
    }

    return Response.json({ success: true, transaction });
  } catch (error) {
    console.error('Error tracking referral:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
