// ============================================================================
// Saved Addresses API - GET, POST, PUT, DELETE
// What: Manage customer saved addresses for faster checkout
// Why: Improve checkout UX with address auto-fill
// How: CRUD operations on saved_addresses table
// ============================================================================

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { createClient } from '@supabase/supabase-js';
import { validateSupabaseAdminConfig } from '@/lib/supabase-client-safe';
import { z } from 'zod';

// ============================================================================
// Validation Schema
// ============================================================================

const SavedAddressSchema = z.object({
  label: z.string().min(1).max(50),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  street_address: z.string().min(1).max(200),
  apartment: z.string().max(50).optional(),
  city: z.string().min(1).max(100),
  state_province: z.string().min(2).max(100),
  postal_code: z.string().min(1).max(20),
  country: z.string().default('US'),
  phone: z.string().max(20).optional(),
  is_default: z.boolean().default(false),
  address_type: z.enum(['shipping', 'billing', 'both']).default('shipping'),
});

// ============================================================================
// GET: List saved addresses for current user
// ============================================================================

export async function GET() {
  try {
    const config = validateSupabaseAdminConfig();
    if (!config.isValid) return config.error;

    const supabase = createClient(config.url, config.key, {
      auth: { persistSession: false }
    });

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: addresses, error } = await supabase
      .from('saved_addresses')
      .select('*')
      .eq('user_email', session.user.email)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      return Response.json({ error: 'Failed to load addresses' }, { status: 500 });
    }

    return Response.json({ addresses: addresses || [] });
  } catch (error) {
    console.error('GET /api/account/saved-addresses error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST: Create new saved address
// ============================================================================

export async function POST(request: Request) {
  try {
    const config = validateSupabaseAdminConfig();
    if (!config.isValid) return config.error;

    const supabase = createClient(config.url, config.key, {
      auth: { persistSession: false }
    });

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = SavedAddressSchema.parse(body);

    // If setting as default, unset other defaults
    if (validated.is_default) {
      await supabase
        .from('saved_addresses')
        .update({ is_default: false })
        .eq('user_email', session.user.email)
        .eq('address_type', validated.address_type);
    }

    const { data: address, error } = await supabase
      .from('saved_addresses')
      .insert([
        {
          user_email: session.user.email,
          ...validated,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating address:', error);
      return Response.json({ error: 'Failed to save address' }, { status: 500 });
    }

    return Response.json({ address }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('POST /api/account/saved-addresses error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PUT: Update saved address
// ============================================================================

export async function PUT(request: Request) {
  try {
    const config = validateSupabaseAdminConfig();
    if (!config.isValid) return config.error;

    const supabase = createClient(config.url, config.key, {
      auth: { persistSession: false }
    });

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');
    if (!addressId) {
      return Response.json({ error: 'Address ID required' }, { status: 400 });
    }

    const body = await request.json();
    const validated = SavedAddressSchema.partial().parse(body);

    // Verify ownership
    const { data: existing } = await supabase
      .from('saved_addresses')
      .select('id')
      .eq('id', addressId)
      .eq('user_email', session.user.email)
      .single();

    if (!existing) {
      return Response.json({ error: 'Address not found' }, { status: 404 });
    }

    // If setting as default, unset other defaults
    if (validated.is_default) {
      const addressType = validated.address_type || 'shipping';
      await supabase
        .from('saved_addresses')
        .update({ is_default: false })
        .eq('user_email', session.user.email)
        .eq('address_type', addressType)
        .neq('id', addressId);
    }

    const { data: address, error } = await supabase
      .from('saved_addresses')
      .update(validated)
      .eq('id', addressId)
      .select()
      .single();

    if (error) {
      console.error('Error updating address:', error);
      return Response.json({ error: 'Failed to update address' }, { status: 500 });
    }

    return Response.json({ address });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('PUT /api/account/saved-addresses error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// DELETE: Remove saved address
// ============================================================================

export async function DELETE(request: Request) {
  try {
    const config = validateSupabaseAdminConfig();
    if (!config.isValid) return config.error;

    const supabase = createClient(config.url, config.key, {
      auth: { persistSession: false }
    });

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');
    if (!addressId) {
      return Response.json({ error: 'Address ID required' }, { status: 400 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('saved_addresses')
      .select('id')
      .eq('id', addressId)
      .eq('user_email', session.user.email)
      .single();

    if (!existing) {
      return Response.json({ error: 'Address not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('saved_addresses')
      .delete()
      .eq('id', addressId);

    if (error) {
      console.error('Error deleting address:', error);
      return Response.json({ error: 'Failed to delete address' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/account/saved-addresses error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
