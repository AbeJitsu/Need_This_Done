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
    // Always require the secret when configured, regardless of environment
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

    // Process each abandoned cart with robust error handling
    const results = {
      processed: 0,
      sent: 0,
      errors: 0,
    };

    for (const cart of abandonedCarts) {
      try {
        // Validate cart data before processing
        if (!cart.cart_id || !cart.email) {
          console.error('[Abandoned Carts Cron] Invalid cart data, skipping:', { cart });
          results.errors++;
          results.processed++;
          continue;
        }

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
          // Get existing reminder count for this cart
          const { data: existingReminder } = await supabase
            .from('cart_reminders')
            .select('reminder_count')
            .eq('cart_id', cart.cart_id)
            .order('sent_at', { ascending: false })
            .limit(1)
            .single();

          // Handle case where no previous reminder exists (not an error)
          const newReminderCount = (existingReminder?.reminder_count || 0) + 1;

          // Record the reminder in database with explicit error handling
          const { error: insertError } = await supabase.from('cart_reminders').insert({
            cart_id: cart.cart_id,
            email: cart.email,
            cart_total: cart.subtotal,
            item_count: cart.items.length,
            reminder_count: newReminderCount,
          });

          if (insertError) {
            console.error('[Abandoned Carts Cron] Failed to log cart reminder:', {
              cart_id: cart.cart_id,
              email: cart.email,
              error: insertError,
              errorCode: (insertError as any).code,
            });
            // Email was sent but logging failed - still count as sent but track error separately
            results.sent++;
            results.errors++;
          } else {
            results.sent++;
          }
        } else {
          console.warn('[Abandoned Carts Cron] Email send failed, no emailId returned:', {
            cart_id: cart.cart_id,
            email: cart.email,
          });
          results.errors++;
        }

        results.processed++;
      } catch (error) {
        console.error(`[Abandoned Carts Cron] Failed to process cart ${(cart as any)?.cart_id}:`, error);
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

export async function GET(request: NextRequest) {
  try {
    // Require cron secret or admin auth to view stats
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Fall back to admin auth check
      const { verifyAdmin } = await import('@/lib/api-auth');
      const auth = await verifyAdmin();
      if (auth.error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else if (!cronSecret) {
      // No cron secret configured - require admin auth
      const { verifyAdmin } = await import('@/lib/api-auth');
      const auth = await verifyAdmin();
      if (auth.error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

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
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  thresholdHours: number,
  maxReminders: number,
  reminderIntervalHours: number
): Promise<AbandonedCart[]> {
  try {
    // Import Medusa helpers dynamically to avoid circular dependencies
    const { getMedusaAdminToken, listAbandonedCarts } = await import('@/lib/medusa-helpers');

    // Get admin token for Medusa API
    const token = await getMedusaAdminToken();

    // Fetch abandoned carts from Medusa (carts older than threshold hours)
    const medusaCarts = await listAbandonedCarts(token, thresholdHours);

    if (medusaCarts.length === 0) {
      return [];
    }

    // Get cart IDs that have already received reminders
    const cartIds = medusaCarts.map(cart => cart.id);
    const { data: existingReminders } = await supabase
      .from('cart_reminders')
      .select('cart_id, reminder_count, sent_at')
      .in('cart_id', cartIds);

    // Create a map of cart_id -> reminder info
    const reminderMap = new Map<string, { count: number; lastSent: string }>();
    (existingReminders || []).forEach(reminder => {
      const existing = reminderMap.get(reminder.cart_id);
      if (!existing || new Date(reminder.sent_at) > new Date(existing.lastSent)) {
        reminderMap.set(reminder.cart_id, {
          count: reminder.reminder_count,
          lastSent: reminder.sent_at,
        });
      }
    });

    // Filter carts based on reminder rules
    const now = new Date();
    const eligibleCarts: AbandonedCart[] = [];

    for (const cart of medusaCarts) {
      const reminderInfo = reminderMap.get(cart.id);

      // Skip if already sent max reminders
      if (reminderInfo && reminderInfo.count >= maxReminders) {
        continue;
      }

      // Skip if reminder sent too recently
      if (reminderInfo) {
        const lastSentDate = new Date(reminderInfo.lastSent);
        const hoursSinceLastReminder =
          (now.getTime() - lastSentDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastReminder < reminderIntervalHours) {
          continue;
        }
      }

      // Transform Medusa cart to AbandonedCart format
      const items: CartItem[] = cart.items.map(item => ({
        name: item.title || item.variant?.product?.title || 'Product',
        quantity: item.quantity,
        price: item.unit_price,
      }));

      eligibleCarts.push({
        cart_id: cart.id,
        email: cart.email!,
        customer_name: undefined, // Medusa v2 doesn't include customer name in cart
        items,
        subtotal: cart.subtotal,
        created_at: cart.created_at,
      });
    }

    return eligibleCarts;
  } catch (error) {
    console.error('Error finding abandoned carts:', error);
    // Return empty array on error to allow cron to continue
    return [];
  }
}
