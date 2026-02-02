import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import CampaignEmail from '@/emails/CampaignEmail';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('waitlist_campaigns')
      .select('*')
      .eq('id', params.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return NextResponse.json(
        { error: `Cannot send campaign with status: ${campaign.status}` },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'No recipients found for campaign' },
        { status: 400 }
      );
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
      campaign_id: params.id,
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
          .eq('campaign_id', params.id)
          .eq('email', email);
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        failedCount++;

        // Mark as failed in tracking table
        await supabase
          .from('waitlist_campaign_recipients')
          .update({ status: 'failed' })
          .eq('campaign_id', params.id)
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
      .eq('id', params.id);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: emailMap.size,
    });
  } catch (error) {
    console.error('Failed to send campaign:', error);
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
