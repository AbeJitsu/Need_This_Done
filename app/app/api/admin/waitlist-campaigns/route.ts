import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';


const createCampaignSchema = z.object({
  campaign_name: z.string().min(1).max(200),
  campaign_type: z.enum(['targeted_offer', 'restock_alert', 'exclusive_discount']),
  title: z.string().min(1).max(200),
  message: z.string().optional(),
  discount_code: z.string().optional(),
  discount_percent: z.number().optional(),
  call_to_action_text: z.string().optional(),
  product_ids: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('waitlist_campaigns')
      .select('*, created_by(email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      campaigns: data,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validated = createCampaignSchema.parse(body);

    const { data, error } = await supabase
      .from('waitlist_campaigns')
      .insert({
        campaign_name: validated.campaign_name,
        campaign_type: validated.campaign_type,
        title: validated.title,
        message: validated.message || null,
        discount_code: validated.discount_code || null,
        discount_percent: validated.discount_percent || null,
        call_to_action_text: validated.call_to_action_text || 'Shop Now',
        product_ids: validated.product_ids || [],
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create campaign:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
