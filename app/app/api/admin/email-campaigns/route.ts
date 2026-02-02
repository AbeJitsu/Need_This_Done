import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { validateSupabaseAdminConfig } from '@/lib/supabase-client-safe';

interface CreateCampaignRequest {
  name: string;
  templateId: string;
  subject: string;
  segmentFilter?: Record<string, unknown>;
  segmentName?: string;
  scheduledAt?: string;
}

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

    // Fetch campaigns with template info
    const { data: campaigns, error } = await supabase
      .from('email_campaigns')
      .select('*, email_templates(name)')
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return Response.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const {
      name,
      templateId,
      subject,
      segmentFilter,
      segmentName,
      scheduledAt,
    } = (await request.json()) as CreateCampaignRequest;

    if (!name || !templateId || !subject) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('id')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return Response.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert({
        name,
        template_id: templateId,
        subject,
        segment_filter: segmentFilter || {},
        segment_name: segmentName,
        scheduled_at: scheduledAt,
        status: scheduledAt ? 'scheduled' : 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return Response.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
