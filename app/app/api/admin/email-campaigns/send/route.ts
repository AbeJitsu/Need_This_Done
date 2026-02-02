import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { Resend } from 'resend';
import { withDeduplication, isDuplicateRequestError } from '@/lib/request-dedup';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendCampaignRequest {
  campaignId: string;
}

export async function POST(request: Request) {
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

    const { campaignId } = (await request.json()) as SendCampaignRequest;

    if (!campaignId) {
      return Response.json(
        { error: 'Campaign ID required' },
        { status: 400 }
      );
    }

    // ========================================================================
    // CRITICAL: Use request deduplication to prevent double-send on retries
    // ========================================================================
    // If admin clicks send twice (network timeout, browser refresh, etc.),
    // we should NOT send the campaign twice. This uses atomic Redis SET NX
    // to ensure exactly-once semantics.
    //
    // The deduplication fingerprint includes the campaign ID + user ID
    // so different admins can send different campaigns, but the same admin
    // sending the same campaign twice within 60 seconds gets blocked.

    try {
      // Use deduplication wrapper for the entire send operation
      // If a duplicate is detected, throws DuplicateRequestError
      await withDeduplication(
        { campaignId, userId: user.id },
        async () => {
          return await sendCampaignEmails(campaignId, user.id);
        },
        { operation: 'email campaign send', userId: user.id }
      );

      return Response.json({
        success: true,
        message: 'Campaign sending started',
      });
    } catch (error) {
      if (isDuplicateRequestError(error)) {
        // Duplicate send detected - return 429 to indicate this is a retry
        return Response.json(
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
    console.error('Error sending campaign:', error);
    return Response.json(
      { error: 'Internal server error' },
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

async function sendCampaignEmails(
  campaignId: string,
  userId: string
): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  total: number;
}> {
  // Fetch campaign and template
  const { data: campaign, error: campaignError } = await supabase
    .from('email_campaigns')
    .select('*, email_templates(*)')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
    throw new Error('Campaign cannot be sent in current status');
  }

  // Get customer list based on segment
  const { data: customers, error: customerError } = await supabase
    .from('profiles')
    .select('id, email, first_name')
    .neq('email', null);

  if (customerError || !customers) {
    throw new Error('Unable to fetch recipients');
  }

  // Update campaign status to sending
  await supabase
    .from('email_campaigns')
    .update({
      status: 'sending',
      total_recipients: customers.length,
    })
    .eq('id', campaignId);

  // Create recipient records
  const recipientInserts = customers.map(c => ({
    campaign_id: campaignId,
    user_id: c.id,
    email: c.email,
  }));

  await supabase
    .from('campaign_recipients')
    .insert(recipientInserts);

  // Send emails (simplified - in production would use queue)
  let sentCount = 0;
  let failedCount = 0;

  for (const customer of customers) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@needthisdone.com',
        to: customer.email,
        subject: campaign.subject,
        html: campaign.email_templates.html_content,
        text: campaign.email_templates.plain_text_content,
      });

      sentCount++;

      // Update recipient status
      await supabase
        .from('campaign_recipients')
        .update({ status: 'sent' })
        .eq('campaign_id', campaignId)
        .eq('email', customer.email);
    } catch (error) {
      console.error(`Failed to send to ${customer.email}:`, error);
      failedCount++;

      await supabase
        .from('campaign_recipients')
        .update({ status: 'failed' })
        .eq('campaign_id', campaignId)
        .eq('email', customer.email);
    }
  }

  // Update campaign with results
  const { error: updateError } = await supabase
    .from('email_campaigns')
    .update({
      status: failedCount > 0 && sentCount === 0 ? 'failed' : 'sent',
      sent_at: new Date().toISOString(),
      successfully_sent: sentCount,
      bounced: failedCount,
    })
    .eq('id', campaignId);

  if (updateError) {
    console.error('Error updating campaign:', updateError);
  }

  return {
    success: true,
    sent: sentCount,
    failed: failedCount,
    total: customers.length,
  };
}
