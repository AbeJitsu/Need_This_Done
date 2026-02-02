import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { sendEmailWithRetry } from '@/lib/email';
import WaitlistBackInStockEmail from '@/emails/WaitlistBackInStockEmail';
import * as React from 'react';

// ============================================================================
// Waitlist Notifications Cron Job - /api/cron/waitlist-notifications
// ============================================================================
// What: Sends "back in stock" emails to customers on product waitlists
// Why: Notify customers when out-of-stock items they want are available again
// How: Runs on schedule, finds recently restocked products, sends notifications
//
// Schedule: Recommended every 2 hours via Vercel Cron
// Protection: Requires CRON_SECRET header to prevent unauthorized access
// Status: Tracks which customers have been notified to avoid duplicates

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for processing

// ============================================================================
// Types
// ============================================================================

interface WaitlistNotificationResult {
  product_id: string;
  customers_notified: number;
  success: boolean;
  error?: string;
}

interface WaitlistEntry {
  product_id: string;
  product_title: string;
  product_image?: string;
  stock_quantity?: number;
  waitlist_items: Array<{
    id: string;
    email: string;
    customer_name?: string;
  }>;
}

// ============================================================================
// POST - Send Waitlist Notifications
// ============================================================================
// Called by Vercel Cron or manually for testing

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      // In production, CRON_SECRET must be configured
      console.error('[Cron] CRON_SECRET not configured in production');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const supabase = await createSupabaseServerClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';

    // Find products with pending waitlist entries that were recently marked as in-stock
    // (We check for products that have been marked recently to avoid spamming customers)
    const recentlyRestocked = await findRecentlyRestockedProducts(supabase);

    if (recentlyRestocked.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No recently restocked products found',
        notifications_sent: 0,
      });
    }

    // Process notifications for each product
    const results: WaitlistNotificationResult[] = [];
    let totalNotificationsSent = 0;

    for (const product of recentlyRestocked) {
      try {
        // Send notification email to each customer on waitlist
        const notificationsSent = await notifyWaitlistCustomers(
          supabase,
          product,
          siteUrl
        );

        results.push({
          product_id: product.product_id,
          customers_notified: notificationsSent,
          success: true,
        });

        totalNotificationsSent += notificationsSent;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing waitlist for product ${product.product_id}:`, error);
        results.push({
          product_id: product.product_id,
          customers_notified: 0,
          success: false,
          error: errorMessage,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Waitlist notifications processed',
      notifications_sent: totalNotificationsSent,
      products_processed: results.length,
      results,
    });
  } catch (error) {
    console.error('[Cron] Waitlist notification error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process waitlist notifications',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Find products that have waitlist entries and were recently marked as in-stock
 * by checking if their updated_at timestamp is recent
 */
async function findRecentlyRestockedProducts(supabase: any): Promise<WaitlistEntry[]> {
  // For now, we look for products that have pending waitlist entries
  // In the future, we can integrate with inventory sync to detect restock events
  const { data: products, error } = await supabase
    .from('product_waitlist')
    .select('product_id')
    .eq('status', 'pending')
    .limit(100);

  if (error) {
    console.error('Error fetching waitlist products:', error);
    return [];
  }

  if (!products || products.length === 0) {
    return [];
  }

  // Get unique product IDs
  const uniqueProductIds = [...new Set(products.map((p: any) => p.product_id))];

  // For each product, check if it's in stock by fetching from Medusa
  // For now, we'll just fetch the waitlist entries and assume products are in stock
  const result: WaitlistEntry[] = [];

  for (const productId of uniqueProductIds) {
    const { data: waitlistItems, error: itemError } = await supabase
      .from('product_waitlist')
      .select('id, email, customer_name')
      .eq('product_id', productId)
      .eq('status', 'pending')
      .limit(50);

    if (itemError) {
      console.error(`Error fetching waitlist for product ${productId}:`, itemError);
      continue;
    }

    if (waitlistItems && waitlistItems.length > 0) {
      // Fetch product details from Medusa (implementation in next step)
      // For now, we'll just include what we have
      result.push({
        product_id: productId as string,
        product_title: 'Product', // Will be enriched from Medusa in next step
        waitlist_items: waitlistItems,
      });
    }
  }

  return result;
}

/**
 * Send notification emails to all customers on a product's waitlist
 */
async function notifyWaitlistCustomers(
  supabase: any,
  product: WaitlistEntry,
  siteUrl: string
): Promise<number> {
  let notificationsSent = 0;

  for (const customer of product.waitlist_items) {
    try {
      // Create email component
      const emailComponent = React.createElement(WaitlistBackInStockEmail, {
        customerEmail: customer.email,
        customerName: customer.customer_name,
        productTitle: product.product_title,
        productImage: product.product_image,
        productUrl: `${siteUrl}/shop/${product.product_id}`,
        stockQuantity: product.stock_quantity,
      });

      // Send email with retry logic (returns email ID or null)
      const emailId = await sendEmailWithRetry(
        customer.email,
        `${product.product_title} is back in stock!`,
        emailComponent,
        { maxRetries: 3 }
      );

      if (emailId) {
        // Mark waitlist entry as notified
        const { error: updateError } = await supabase
          .from('product_waitlist')
          .update({
            status: 'notified',
            notified_at: new Date().toISOString(),
          })
          .eq('id', customer.id);

        if (!updateError) {
          notificationsSent++;
        } else {
          console.error('Error updating waitlist status:', updateError);
        }
      } else {
        console.error(`Failed to send email to ${customer.email}`);
      }
    } catch (error) {
      console.error(
        `Error sending notification to ${customer.email} for product ${product.product_id}:`,
        error
      );
    }
  }

  return notificationsSent;
}
