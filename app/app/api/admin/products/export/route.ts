import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

// ============================================================================
// Admin Products Export API Route - /api/admin/products/export
// ============================================================================
// GET: Export products in JSON or CSV format (admin only)
//
// What: Admin endpoint for bulk exporting products
// Why: Admins need to export products for backup, migration, or analysis
// How: Fetches products from Medusa, formats as JSON or CSV based on query param

// ============================================================================
// GET - Export Products (Admin Only)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Fetch products from our API
    const productsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/shop/products`
    );

    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await productsResponse.json();
    const products = data.products || [];

    // Format products for export (flatten nested data)
    const exportProducts = products.map((product: Record<string, unknown>) => ({
      id: product.id,
      title: product.title,
      description: product.description || '',
      handle: product.handle,
      status: product.status || 'active',
      price: (product.prices as Array<{ amount: number }>)?.[0]?.amount || 0,
      currency_code: (product.prices as Array<{ currency_code: string }>)?.[0]?.currency_code || 'USD',
    }));

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['id', 'title', 'description', 'handle', 'status', 'price', 'currency_code'];
      const csvRows = [
        headers.join(','),
        ...exportProducts.map((p: Record<string, unknown>) =>
          headers.map(h => {
            const value = String(p[h] || '');
            // Escape quotes and wrap in quotes if contains comma or newline
            if (value.includes(',') || value.includes('\n') || value.includes('"')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        ),
      ];

      return new NextResponse(csvRows.join('\n'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="products-${Date.now()}.csv"`,
        },
      });
    }

    // Default: JSON format
    return NextResponse.json(
      {
        products: exportProducts,
        exportedAt: new Date().toISOString(),
        count: exportProducts.length,
      },
      {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="products-${Date.now()}.json"`,
        },
      }
    );
  } catch (error) {
    return handleApiError(error, 'Admin Products Export GET');
  }
}
