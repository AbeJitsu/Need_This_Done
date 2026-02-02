import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { withDeduplication, isDuplicateRequestError } from '@/lib/request-dedup';
import { Resend } from 'resend';
import CampaignEmail from '@/emails/CampaignEmail';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ========================================================================
    // AUTHORIZATION: Use centralized verifyAdmin() helper
    // ========================================================================
    // This ensures consistent auth logic across all admin endpoints.
    // If auth fails, returns appropriate 401/403 error response.
    const auth = await verifyAdmin();
    if (auth.error) {
      return auth.error;
    }

    // ========================================================================
    // REQUEST DEDUPLICATION: Prevent double-sends on network retries
    // ========================================================================
    // If the admin clicks send twice (network timeout, browser retry, etc.),
    // we should NOT send the campaign twice. This uses atomic Redis SET NX
    // to ensure exactly-once semantics. Campaign is sent exactly once.

    try {
      const result = await withDeduplication(
        { campaignId: params.id },
        async () => {
          return await sendCampaignEmails(params.id);
        },
        { operation: 'waitlist campaign send', userId: auth.user.id }
      );

      return NextResponse.json(result);
    } catch (error) {
      if (isDuplicateRequestError(error)) {
        // Duplicate send detected - return 429 to indicate this is a retry
        return NextResponse.json(
          {
            error: 'Campaign send already in progress. Please wait a moment before trying again.',
            isDuplicate: true,
          },
          { status: 429 }
        );
      }
      throw error; // Re-throw non-duplicate errors
    }
  } catch (error) {
    console.error('Failed to send campaign:', error);
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Campaign Send Logic (Extracted)
// ============================================================================
// Separated into its own function so deduplication can wrap it cleanly.
// This ensures that if the same campaign is sent twice, the function
// body is only executed once (protected by atomic Redis SET NX).

async function sendCampaignEmails(campaignId: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = await createSupabaseServerClient();

  // Fetch campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('waitlist_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
    throw new Error(`Cannot send campaign with status: ${campaign.status}`);
  }

  // Determine recipients based on campaign targeting
  let query = supabase
    .from('product_waitlist')
    .select('email, product_id, id')
    .eq('status', 'pending');

  if (campaign.product_ids && campaign.product_ids.length > 0) {
    query = query.in('product_id', campaign.product_ids);
  }

  const { data: recipients, error: recipientError } = await query;

  if (recipientError) throw recipientError;
  if (!recipients || recipients.length === 0) {
    throw new Error('No recipients found for campaign');
  }

  // Prepare email list (deduplicate by email)
  const emailMap = new Map<string, string[]>();
  recipients.forEach((r) => {
    if (!emailMap.has(r.email)) {
      emailMap.set(r.email, []);
    }
    if (r.product_id) {
      emailMap.get(r.email)!.push(r.product_id);
    }
  });

  // Insert recipients into tracking table
  const recipientRecords = Array.from(emailMap.entries()).map(([email, productIds]) => ({
    campaign_id: campaignId,
    email,
    product_id: productIds[0] || null, // Use first product for tracking
    status: 'pending' as const,
  }));

  const { error: insertError } = await supabase
    .from('waitlist_campaign_recipients')
    .insert(recipientRecords);

  if (insertError) {
    console.error('Failed to insert recipients:', insertError);
    // Don't fail the send if tracking fails, but log it
  }

  // Send emails
  let sentCount = 0;
  let failedCount = 0;

  for (const [email, _] of emailMap.entries()) {
    try {
      await resend.emails.send({
        from: 'NeedThisDone <notifications@needthisdone.com>',
        to: email,
        subject: campaign.title,
        react: CampaignEmail({
          campaignTitle: campaign.title,
          message: campaign.message || '',
          discountCode: campaign.discount_code,
          discountPercent: campaign.discount_percent,
          callToActionText: campaign.call_to_action_text || 'Shop Now',
        }),
      });

      sentCount++;

      // Mark as sent in tracking table
      await supabase
        .from('waitlist_campaign_recipients')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('campaign_id', campaignId)
        .eq('email', email);
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
      failedCount++;

      // Mark as failed in tracking table
      await supabase
        .from('waitlist_campaign_recipients')
        .update({ status: 'failed' })
        .eq('campaign_id', campaignId)
        .eq('email', email);
    }
  }

  // Update campaign status
  await supabase
    .from('waitlist_campaigns')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', campaignId);

  return {
    success: true,
    sent: sentCount,
    failed: failedCount,
    total: emailMap.size,
  };
}
