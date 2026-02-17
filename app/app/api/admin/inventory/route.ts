import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-errors';
import { products, Product } from '@/lib/medusa-client';
import { emitWorkflowEvent } from '@/lib/workflow-events';

export const dynamic = 'force-dynamic';

// ============================================================================
// Admin Inventory API Route - /api/admin/inventory
// ============================================================================
// GET: List all product variants with inventory quantities
//
// What: Provides inventory data for admin dashboard
// Why: Admins need to view and manage stock levels
// How: Fetches products from Medusa and extracts variant inventory data

// ============================================================================
// Types
// ============================================================================

interface InventoryItem {
  id: string;
  variantId: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  sku?: string;
  inventoryQuantity: number;
  manageInventory: boolean;
  allowBackorder: boolean;
  price: number;
  currencyCode: string;
  lowStockThreshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

// ============================================================================
// GET - List Inventory (Admin Only)
// ============================================================================

export async function GET() {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    // Fetch all products with variants from Medusa
    const result = await products.list();
    // Handle both array and paginated response
    const productList: Product[] = Array.isArray(result) ? result : result.products;

    // Transform to inventory items
    const inventory: InventoryItem[] = [];
    const LOW_STOCK_THRESHOLD = 10;

    for (const product of productList) {
      if (!product.variants) continue;

      for (const variant of product.variants) {
        const quantity = variant.inventory_quantity ?? 0;
        const price = variant.prices?.[0]?.amount ?? 0;
        const currencyCode = variant.prices?.[0]?.currency_code ?? 'USD';

        // Determine stock status
        let status: InventoryItem['status'] = 'in_stock';
        if (quantity === 0) {
          status = 'out_of_stock';
        } else if (quantity <= LOW_STOCK_THRESHOLD) {
          status = 'low_stock';
        }

        inventory.push({
          id: `${product.id}_${variant.id}`,
          variantId: variant.id,
          productId: product.id,
          productTitle: product.title,
          variantTitle: variant.title,
          inventoryQuantity: quantity,
          manageInventory: variant.manage_inventory ?? false,
          allowBackorder: variant.allow_backorder ?? false,
          price,
          currencyCode,
          lowStockThreshold: LOW_STOCK_THRESHOLD,
          status,
        });
      }
    }

    // Calculate summary stats
    const stats = {
      total: inventory.length,
      inStock: inventory.filter(i => i.status === 'in_stock').length,
      lowStock: inventory.filter(i => i.status === 'low_stock').length,
      outOfStock: inventory.filter(i => i.status === 'out_of_stock').length,
      totalQuantity: inventory.reduce((sum, i) => sum + i.inventoryQuantity, 0),
    };

    return NextResponse.json({
      inventory,
      stats,
      success: true,
    });
  } catch (error) {
    return handleApiError(error, 'Admin Inventory GET');
  }
}

// ============================================================================
// PATCH - Bulk Update Inventory (Admin Only)
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates must be an array of { variantId, inventoryQuantity }' },
        { status: 400 }
      );
    }

    // Validate update format
    for (const update of updates) {
      if (!update.variantId || typeof update.inventoryQuantity !== 'number') {
        return NextResponse.json(
          { error: 'Each update must have variantId (string) and inventoryQuantity (number)' },
          { status: 400 }
        );
      }
    }

    // Get Medusa admin token
    const { getMedusaAdminToken } = await import('@/lib/medusa-helpers');
    const adminToken = await getMedusaAdminToken();

    // Update each variant in Medusa
    const { admin } = await import('@/lib/medusa-client');
    const results = await Promise.allSettled(
      updates.map(({ variantId, inventoryQuantity }) =>
        admin.updateVariantInventory(adminToken, variantId, inventoryQuantity)
      )
    );

    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    // Extract error details for failed updates
    const errors = results
      .map((r, i) => r.status === 'rejected' ? { variantId: updates[i].variantId, error: r.reason?.message || 'Unknown error' } : null)
      .filter(Boolean);

    // Emit workflow events for stock changes (non-blocking)
    const LOW_STOCK_THRESHOLD = 10;
    for (const update of updates) {
      try {
        if (update.inventoryQuantity === 0) {
          emitWorkflowEvent('product.out_of_stock', {
            productId: update.productId || '',
            productName: update.productName || '',
            variantId: update.variantId,
            timestamp: Date.now(),
          });
        } else if (update.inventoryQuantity <= LOW_STOCK_THRESHOLD) {
          emitWorkflowEvent('inventory.low_stock', {
            productId: update.productId || '',
            productName: update.productName || '',
            variantId: update.variantId,
            currentQuantity: update.inventoryQuantity,
            lowStockThreshold: LOW_STOCK_THRESHOLD,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        console.warn('[Inventory] Workflow event emission failed (non-blocking):', err);
      }
    }

    return NextResponse.json({
      success: failed === 0,
      message: `Updated ${successful} of ${updates.length} variants`,
      successful,
      failed,
      errors: failed > 0 ? errors : undefined,
    });
  } catch (error) {
    return handleApiError(error, 'Admin Inventory PATCH');
  }
}
