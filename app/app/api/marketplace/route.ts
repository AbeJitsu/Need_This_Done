import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// ============================================================================
// Template Marketplace API - /api/marketplace
// ============================================================================
// What: CRUD operations for the template marketplace
// Why: Let users discover, share, and sell page templates
// How: List, search, purchase, download, and review templates

export const dynamic = 'force-dynamic';

// ============================================================================
// GET - Fetch templates
// ============================================================================
// ?action=list - List templates (with filters)
// ?action=featured - Get featured templates
// ?action=categories - Get all categories
// ?id=xxx - Get single template
// ?action=my-templates - Get user's templates
// ?action=my-purchases - Get user's purchased templates

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const templateId = searchParams.get('id');

    // Get single template
    if (templateId) {
      const { data: template, error } = await supabase
        .from('marketplace_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error || !template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      // Increment view count
      await supabase
        .from('marketplace_templates')
        .update({ view_count: template.view_count + 1 })
        .eq('id', templateId);

      // Check if user owns this template
      const { data: { user } } = await supabase.auth.getUser();
      let hasPurchased = false;
      if (user) {
        const { data: purchase } = await supabase
          .from('template_purchases')
          .select('id')
          .eq('template_id', templateId)
          .eq('user_id', user.id)
          .single();
        hasPurchased = !!purchase;
      }

      return NextResponse.json({
        template,
        hasPurchased,
        isOwner: user?.id === template.author_id,
      });
    }

    switch (action) {
      case 'list': {
        const category = searchParams.get('category');
        const priceType = searchParams.get('price_type'); // free, paid
        const sort = searchParams.get('sort') || 'popular'; // popular, recent, rating
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabase
          .from('marketplace_templates')
          .select('*', { count: 'exact' })
          .eq('status', 'approved');

        // Filters
        if (category) query = query.eq('category', category);
        if (priceType) query = query.eq('price_type', priceType);
        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Sorting
        switch (sort) {
          case 'recent':
            query = query.order('published_at', { ascending: false });
            break;
          case 'rating':
            query = query.order('average_rating', { ascending: false });
            break;
          case 'popular':
          default:
            query = query.order('download_count', { ascending: false });
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data: templates, error, count } = await query;

        if (error) {
          console.error('Failed to fetch templates:', error);
          return NextResponse.json(
            { error: 'Failed to fetch templates' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          templates: templates || [],
          pagination: {
            total: count || 0,
            limit,
            offset,
            hasMore: (count || 0) > offset + limit,
          },
        });
      }

      case 'featured': {
        const { data: templates, error } = await supabase
          .from('marketplace_templates')
          .select('*')
          .eq('status', 'approved')
          .eq('is_featured', true)
          .order('featured_order', { ascending: true })
          .limit(10);

        if (error) {
          console.error('Failed to fetch featured templates:', error);
          return NextResponse.json(
            { error: 'Failed to fetch featured templates' },
            { status: 500 }
          );
        }

        return NextResponse.json({ templates: templates || [] });
      }

      case 'categories': {
        const { data: categories, error } = await supabase
          .from('template_categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Failed to fetch categories:', error);
          return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
          );
        }

        return NextResponse.json({ categories: categories || [] });
      }

      case 'my-templates': {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        const { data: templates, error } = await supabase
          .from('marketplace_templates')
          .select('*')
          .eq('author_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch user templates:', error);
          return NextResponse.json(
            { error: 'Failed to fetch templates' },
            { status: 500 }
          );
        }

        return NextResponse.json({ templates: templates || [] });
      }

      case 'my-purchases': {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        const { data: purchases, error } = await supabase
          .from('template_purchases')
          .select(`
            *,
            template:marketplace_templates(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch purchases:', error);
          return NextResponse.json(
            { error: 'Failed to fetch purchases' },
            { status: 500 }
          );
        }

        return NextResponse.json({ purchases: purchases || [] });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Marketplace API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create template, purchase, or download
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    const { action = 'create' } = body;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    switch (action) {
      case 'create': {
        const {
          name,
          description,
          category,
          tags,
          content,
          thumbnail_url,
          preview_images,
          price_type,
          price_cents,
        } = body;

        if (!name || !category || !content) {
          return NextResponse.json(
            { error: 'Missing required fields: name, category, content' },
            { status: 400 }
          );
        }

        // Generate slug
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          + '-' + Date.now();

        const templateData = {
          author_id: user.id,
          author_name: user.user_metadata?.full_name || user.email || 'Anonymous',
          name,
          slug,
          description: description || null,
          category,
          tags: tags || [],
          content,
          thumbnail_url: thumbnail_url || null,
          preview_images: preview_images || [],
          price_type: price_type || 'free',
          price_cents: price_type === 'paid' ? (price_cents || 0) : 0,
          status: 'pending',
        };

        const { data: template, error } = await supabase
          .from('marketplace_templates')
          .insert(templateData)
          .select()
          .single();

        if (error) {
          console.error('Failed to create template:', error);
          return NextResponse.json(
            { error: 'Failed to create template' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          template,
          message: 'Template submitted for review',
        }, { status: 201 });
      }

      case 'download': {
        const { template_id } = body;

        if (!template_id) {
          return NextResponse.json(
            { error: 'Missing required field: template_id' },
            { status: 400 }
          );
        }

        const { data, error } = await supabase
          .rpc('download_template', {
            p_template_id: template_id,
            p_user_id: user.id,
          });

        if (error) {
          console.error('Download failed:', error);
          return NextResponse.json(
            { error: 'Failed to download template' },
            { status: 500 }
          );
        }

        if (data.error) {
          return NextResponse.json(
            { error: data.error },
            { status: 400 }
          );
        }

        return NextResponse.json(data, { status: 200 });
      }

      case 'review': {
        const { template_id, rating, title, content: reviewContent } = body;

        if (!template_id || !rating) {
          return NextResponse.json(
            { error: 'Missing required fields: template_id, rating' },
            { status: 400 }
          );
        }

        if (rating < 1 || rating > 5) {
          return NextResponse.json(
            { error: 'Rating must be between 1 and 5' },
            { status: 400 }
          );
        }

        // Check if user has purchased/downloaded this template
        const { data: purchase } = await supabase
          .from('template_purchases')
          .select('id')
          .eq('template_id', template_id)
          .eq('user_id', user.id)
          .single();

        if (!purchase) {
          return NextResponse.json(
            { error: 'You must download the template before reviewing' },
            { status: 400 }
          );
        }

        // Upsert review
        const { data: review, error } = await supabase
          .from('template_reviews')
          .upsert({
            template_id,
            user_id: user.id,
            rating,
            title: title || null,
            content: reviewContent || null,
          }, {
            onConflict: 'template_id,user_id',
          })
          .select()
          .single();

        if (error) {
          console.error('Failed to submit review:', error);
          return NextResponse.json(
            { error: 'Failed to submit review' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          review,
        }, { status: 201 });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Marketplace POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Update template
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    const { id, name, description, category, tags, thumbnail_url, preview_images } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get existing template
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('marketplace_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existingTemplate.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this template' },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (preview_images !== undefined) updateData.preview_images = preview_images;

    const { data: template, error } = await supabase
      .from('marketplace_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update template:', error);
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('Marketplace PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Delete template
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get existing template
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('marketplace_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Verify ownership or admin
    const isAdmin = user.user_metadata?.role === 'admin';
    if (existingTemplate.author_id !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to delete this template' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('marketplace_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete template:', error);
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Marketplace DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
