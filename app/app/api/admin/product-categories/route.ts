import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/auth';

// ============================================================================
// GET /api/admin/product-categories - List all categories
// POST /api/admin/product-categories - Create new category
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Generate handle from name
    const handle = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Get the highest sort_order
    const { data: existing } = await supabase
      .from('product_categories')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    const sort_order = (existing?.[0]?.sort_order ?? -1) + 1;

    const { data, error } = await supabase
      .from('product_categories')
      .insert({
        name,
        handle,
        description: description || null,
        icon: icon || null,
        color: color || 'blue',
        sort_order,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
