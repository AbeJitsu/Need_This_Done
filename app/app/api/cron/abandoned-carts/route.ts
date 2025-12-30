import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { sendEmailWithRetry } from '@/lib/email';
import AbandonedCartEmail, { CartItem } from '@/emails/AbandonedCartEmail';

// ============================================================================
// Abandoned Cart Recovery Cron Job - /api/cron/abandoned-carts
// ============================================================================
// What: Sends recovery emails to customers who abandoned their carts
// Why: Recover potentially lost sales with gentle reminders
// How: Runs on schedule, checks for stale carts, sends emails, tracks in DB
//
// Schedule: Recommended every hour via Vercel Cron
// Protection: Requires CRON_SECRET header to prevent unauthorized access

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for processing

// ============================================================================
// Types
// ============================================================================

interface AbandonedCart {
  cart_id: string;
  email: string;
  customer_name?: string;
  items: CartItem[];
  subtotal: number;
  created_at: string;
}

// ============================================================================
// POST - Process Abandoned Carts
// ============================================================================
// Called by Vercel Cron or manually for testing

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, require the secret
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = await createSupabaseServerClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';

    // Get configuration
    const abandonedThresholdHours = parseInt(process.env.ABANDONED_CART_HOURS || '2');
    const maxReminders = parseInt(process.env.MAX_CART_REMINDERS || '3');
    const reminderIntervalHours = parseInt(process.env.REMINDER_INTERVAL_HOURS || '24');

    // Find abandoned carts that need reminders
    // For now, we'll use a simple query approach
    // In production, this would integrate with Medusa's cart API

    const abandonedCarts = await findAbandonedCarts(
      supabase,
      abandonedThresholdHours,
      maxReminders,
      reminderIntervalHours
    );

    if (abandonedCarts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No abandoned carts to process',
        processed: 0,
      });
    }

    // Process each abandoned cart
    const results = {
      processed: 0,
      sent: 0,
      errors: 0,
    };

    for (const cart of abandonedCarts) {
      try {
        // Send recovery email
        const emailId = await sendEmailWithRetry(
          cart.email,
          `Don't forget your cart! ${cart.items.length} item${cart.items.length > 1 ? 's' : ''} waiting`,
          AbandonedCartEmail({
            customerEmail: cart.email,
            customerName: cart.customer_name,
            cartId: cart.cart_id,
            items: cart.items,
            subtotal: cart.subtotal,
            cartUrl: `${siteUrl}/cart?id=${cart.cart_id}`,
          })
        );

        if (emailId) {
          // Record the reminder in database
          await supabase.from('cart_reminders').insert({
            cart_id: cart.cart_id,
            email: cart.email,
            cart_total: cart.subtotal,
            item_count: cart.items.length,
            reminder_count: 1, // Will increment on subsequent reminders
          });

          results.sent++;
        } else {
          results.errors++;
        }

        results.processed++;
      } catch (error) {
        console.error(`Failed to process cart ${cart.cart_id}:`, error);
        results.errors++;
        results.processed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} abandoned carts`,
      ...results,
    });
  } catch (error) {
    console.error('Abandoned cart cron error:', error);
    return NextResponse.json(
      { error: 'Failed to process abandoned carts' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Check Cron Status
// ============================================================================
// Returns stats about abandoned cart recovery

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get reminder stats
    const { data: stats, error } = await supabase
      .from('cart_reminder_stats')
      .select('*')
      .limit(7);

    if (error) {
      console.error('Failed to fetch stats:', error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    // Get recent reminders
    const { data: recent } = await supabase
      .from('cart_reminders')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      stats: stats || [],
      recent: recent || [],
      config: {
        abandonedThresholdHours: process.env.ABANDONED_CART_HOURS || '2',
        maxReminders: process.env.MAX_CART_REMINDERS || '3',
        reminderIntervalHours: process.env.REMINDER_INTERVAL_HOURS || '24',
      },
    });
  } catch (error) {
    console.error('Abandoned cart stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch abandoned cart stats' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper: Find Abandoned Carts
// ============================================================================
// Queries for carts that:
// 1. Were created more than X hours ago
// 2. Haven't been converted to orders
// 3. Haven't received a reminder recently

async function findAbandonedCarts(
  _supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  thresholdHours: number,
  maxReminders: number,
  reminderIntervalHours: number
): Promise<AbandonedCart[]> {
  // For now, return empty array - this would integrate with Medusa
  // In a real implementation, you would:
  // 1. Query Medusa for carts older than thresholdHours
  // 2. Filter out carts that have been completed
  // 3. Cross-reference with cart_reminders to avoid duplicates
  // 4. Return carts that need reminders

  // TODO: Implement Medusa cart integration
  // This is a placeholder that shows the expected structure

  // Check for carts that have been tracked in local storage but not completed
  // This would require a separate cart_tracking table or Medusa integration

  console.log(
    `[Abandoned Carts] Checking for carts older than ${thresholdHours}h, ` +
    `max ${maxReminders} reminders, ${reminderIntervalHours}h between reminders`
  );

  return [];
}
