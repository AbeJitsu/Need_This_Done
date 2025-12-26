import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Update Product Image in Medusa
// ============================================================================
// What: Updates a product's image URL via Medusa Admin API
// Why: Allows changing product images without direct Medusa admin access
// How: Authenticates with Medusa admin, updates product via API

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_URL;
const MEDUSA_ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL;
const MEDUSA_ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;

async function authenticateWithMedusa() {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: MEDUSA_ADMIN_EMAIL,
      password: MEDUSA_ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Medusa');
  }

  const cookies = response.headers.get('set-cookie');
  return cookies;
}

export async function POST(request: NextRequest) {
  try {
    const { productId, imageUrl } = await request.json();

    if (!productId || !imageUrl) {
      return NextResponse.json(
        { error: 'Product ID and image URL are required' },
        { status: 400 }
      );
    }

    // Authenticate with Medusa
    const authCookies = await authenticateWithMedusa();

    if (!authCookies) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Medusa' },
        { status: 401 }
      );
    }

    // Update product image
    const updateResponse = await fetch(`${MEDUSA_BACKEND_URL}/admin/products/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookies,
      },
      body: JSON.stringify({
        thumbnail: imageUrl,
        images: [{ url: imageUrl }],
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      console.error('[Update Image] Medusa error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to update product in Medusa' },
        { status: updateResponse.status }
      );
    }

    const updatedProduct = await updateResponse.json();

    return NextResponse.json({
      success: true,
      product: updatedProduct.product,
    });
  } catch (error) {
    console.error('[Update Image] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    );
  }
}
