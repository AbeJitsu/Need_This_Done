// ============================================================================
// Medusa Admin API Helpers
// ============================================================================
// What: Helper functions for calling Medusa admin API
// Why: Centralize authentication and common Medusa operations
// How: JWT token-based authentication, format product data for Medusa v2

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_URL;
const MEDUSA_ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL;
const MEDUSA_ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;

// ============================================================================
// Authentication
// ============================================================================
// What: Get JWT token for Medusa admin API access
// Why: All admin endpoints require authentication
// How: POST to /admin/auth with credentials (Medusa v2)

export async function getMedusaAdminToken(): Promise<string> {
  if (!MEDUSA_BACKEND_URL) {
    throw new Error('MEDUSA_BACKEND_URL is not configured');
  }

  if (!MEDUSA_ADMIN_EMAIL || !MEDUSA_ADMIN_PASSWORD) {
    throw new Error('MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD must be set');
  }

  const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: MEDUSA_ADMIN_EMAIL,
      password: MEDUSA_ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
    throw new Error(`Failed to authenticate: ${error.message}`);
  }

  const data = await response.json();
  return data.token;
}

// ============================================================================
// Region & Sales Channel Helpers
// ============================================================================
// What: Fetch default region and sales channel for product creation
// Why: Products need to be associated with regions and sales channels
// How: GET requests to Medusa admin API with auth token

export async function getDefaultRegion(token: string) {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/regions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch regions');
  }

  const data = await response.json();
  return data.regions?.[0]; // Return first region (US)
}

export async function getDefaultSalesChannel(token: string) {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/sales-channels`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch sales channels');
  }

  const data = await response.json();
  return data.sales_channels?.[0]; // Return default sales channel
}

// ============================================================================
// Product Formatting
// ============================================================================
// What: Format product data for Medusa v2 API
// Why: Medusa has specific requirements for product structure
// How: Transform simple form data into Medusa-compatible product object

interface ProductFormData {
  title: string;
  description?: string;
  handle?: string;
  price: number;
  sku?: string;
  thumbnail?: string;
  category_ids?: string[];
}

export function formatProductForMedusa(
  formData: ProductFormData,
  _regionId: string,
  salesChannelId: string
) {
  // Auto-generate handle from title if not provided
  const handle = formData.handle || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Auto-generate SKU if not provided
  const sku = formData.sku || handle.toUpperCase().replace(/-/g, '_');

  return {
    title: formData.title,
    description: formData.description || '',
    handle,
    status: 'published',
    thumbnail: formData.thumbnail,
    images: formData.thumbnail ? [{ url: formData.thumbnail }] : [],

    // Medusa v2 requires options (even if just one default option)
    options: [{
      title: 'Type',
      values: ['Standard'],
    }],

    // Create a single variant with the provided price
    variants: [{
      title: 'Standard',
      sku,
      manage_inventory: false,
      options: {
        Type: 'Standard',
      },
      prices: [{
        amount: Math.round(formData.price * 100), // Convert dollars to cents
        currency_code: 'usd',
      }],
    }],

    // Associate with sales channel
    sales_channels: [{ id: salesChannelId }],

    // Add category if provided
    ...(formData.category_ids && formData.category_ids.length > 0
      ? { category_ids: formData.category_ids }
      : {}),
  };
}

// ============================================================================
// Product Update Formatting
// ============================================================================
// What: Format product updates for Medusa API
// Why: Only send changed fields, handle variant price updates separately
// How: Transform update data into Medusa-compatible format

interface ProductUpdateData {
  title?: string;
  description?: string;
  handle?: string;
  price?: number;
  thumbnail?: string;
  category_ids?: string[];
}

export function formatProductUpdateForMedusa(updateData: ProductUpdateData) {
  const update: Record<string, unknown> = {};

  if (updateData.title !== undefined) update.title = updateData.title;
  if (updateData.description !== undefined) update.description = updateData.description;
  if (updateData.handle !== undefined) update.handle = updateData.handle;
  if (updateData.thumbnail !== undefined) {
    update.thumbnail = updateData.thumbnail;
    if (updateData.thumbnail) {
      update.images = [{ url: updateData.thumbnail }];
    }
  }
  if (updateData.category_ids !== undefined) update.category_ids = updateData.category_ids;

  // Price updates require updating the variant separately
  // Return price separately so caller can handle variant update
  return {
    productUpdate: update,
    priceUpdate: updateData.price !== undefined
      ? Math.round(updateData.price * 100)
      : undefined,
  };
}
