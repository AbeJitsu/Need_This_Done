import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { validateSupabaseAdminConfig } from '@/lib/supabase-client-safe';

interface CreateTemplateRequest {
  name: string;
  subject: string;
  previewText?: string;
  htmlContent: string;
  plainTextContent?: string;
  templateType: string;
  variables?: Record<string, string>;
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

    // Verify admin
    const { data: userData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all templates
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return Response.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
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
      subject,
      previewText,
      htmlContent,
      plainTextContent,
      templateType,
      variables,
    } = (await request.json()) as CreateTemplateRequest;

    if (!name || !subject || !htmlContent) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: template, error } = await supabase
      .from('email_templates')
      .insert({
        name,
        subject,
        preview_text: previewText,
        html_content: htmlContent,
        plain_text_content: plainTextContent || htmlContent,
        template_type: templateType || 'marketing',
        variables: variables || {},
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

    return Response.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
