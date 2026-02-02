import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { Resend } from 'resend';

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

    // Fetch campaign and template
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*, email_templates(*)')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return Response.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return Response.json(
        { error: 'Campaign cannot be sent in current status' },
        { status: 400 }
      );
    }

    // Get customer list based on segment
    const { data: customers, error: customerError } = await supabase
      .from('profiles')
      .select('id, email, first_name')
      .neq('email', null);

    if (customerError || !customers) {
      return Response.json(
        { error: 'Unable to fetch recipients' },
        { status: 500 }
      );
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

    return Response.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: customers.length,
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
