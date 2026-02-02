import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/auth';

// ============================================================================
// GET /api/admin/waitlist-analytics
// ============================================================================
// What: Provides waitlist metrics for admin dashboard
// Returns: Demand patterns, conversion rates, popular waitlisted products
// Auth: Admin only

interface WaitlistMetrics {
  totalWaitlistEntries: number;
  uniqueProducts: number;
  uniqueCustomers: number;
  notifiedCount: number;
  notificationRate: number;
  topWaitlistedProducts: Array<{
    productId: string;
    productName: string;
    waitlistCount: number;
    notifiedCount: number;
    pendingCount: number;
    thumbnail?: string;
  }>;
  trendsByDate: Array<{
    date: string;
    signups: number;
    notified: number;
  }>;
  statusBreakdown: {
    pending: number;
    notified: number;
    cancelled: number;
  };
  conversionMetrics: {
    avgDaysToNotification: number;
    recentConversionRate: number; // Last 7 days
  };
}

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Get date range from query params (default: last 30 days)
    const searchParams = request.nextUrl.searchParams;
    const daysBack = parseInt(searchParams.get('days') || '30', 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // ========================================================================
    // 1. Total waitlist metrics
    // ========================================================================
    const { data: allWaitlist } = await supabase
      .from('product_waitlist')
      .select('id, status, created_at, notified_at, product_id, email');

    const totalWaitlistEntries = allWaitlist?.length || 0;
    const uniqueProducts = new Set(allWaitlist?.map(w => w.product_id)).size;
    const uniqueCustomers = new Set(allWaitlist?.map(w => w.email)).size;
    const statusBreakdown = {
      pending: allWaitlist?.filter(w => w.status === 'pending').length || 0,
      notified: allWaitlist?.filter(w => w.status === 'notified').length || 0,
      cancelled: allWaitlist?.filter(w => w.status === 'cancelled').length || 0,
    };

    const notifiedCount = statusBreakdown.notified;
    const notificationRate = totalWaitlistEntries > 0
      ? (notifiedCount / totalWaitlistEntries) * 100
      : 0;

    // ========================================================================
    // 2. Top waitlisted products with Medusa product names
    // ========================================================================
    const topWaitlistedProducts = await Promise.all(
      (allWaitlist || [])
        .reduce((acc, item) => {
          const existing = acc.find(x => x.productId === item.product_id);
          if (existing) {
            existing.count += 1;
            if (item.status === 'notified') existing.notified += 1;
            if (item.status === 'pending') existing.pending += 1;
          } else {
            acc.push({
              productId: item.product_id,
              count: 1,
              notified: item.status === 'notified' ? 1 : 0,
              pending: item.status === 'pending' ? 1 : 0,
            });
          }
          return acc;
        }, [] as Array<{ productId: string; count: number; notified: number; pending: number }>)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(async (item) => {
          try {
            // Fetch from Medusa API
            const medusaResponse = await fetch(
              `https://need-this-done-production.up.railway.app/admin/products/${item.productId}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.MEDUSA_ADMIN_TOKEN}`,
                },
              }
            );

            if (!medusaResponse.ok) {
              return {
                productId: item.productId,
                productName: `Product ${item.productId.slice(0, 8)}...`,
                waitlistCount: item.count,
                notifiedCount: item.notified,
                pendingCount: item.pending,
              };
            }

            const product = await medusaResponse.json();
            return {
              productId: item.productId,
              productName: product.product?.title || 'Unknown Product',
              waitlistCount: item.count,
              notifiedCount: item.notified,
              pendingCount: item.pending,
              thumbnail: product.product?.thumbnail,
            };
          } catch (error) {
            console.error(`Failed to fetch product ${item.productId}:`, error);
            return {
              productId: item.productId,
              productName: 'Unknown Product',
              waitlistCount: item.count,
              notifiedCount: item.notified,
              pendingCount: item.pending,
            };
          }
        })
    );

    // ========================================================================
    // 3. Trends by date
    // ========================================================================
    const trendsByDate: { [key: string]: { signups: number; notified: number } } = {};

    (allWaitlist || []).forEach(entry => {
      const date = new Date(entry.created_at).toISOString().split('T')[0];
      if (!trendsByDate[date]) {
        trendsByDate[date] = { signups: 0, notified: 0 };
      }
      trendsByDate[date].signups += 1;

      if (entry.status === 'notified' && entry.notified_at) {
        const notifiedDate = new Date(entry.notified_at).toISOString().split('T')[0];
        if (!trendsByDate[notifiedDate]) {
          trendsByDate[notifiedDate] = { signups: 0, notified: 0 };
        }
        trendsByDate[notifiedDate].notified += 1;
      }
    });

    const trendsArray = Object.entries(trendsByDate)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // ========================================================================
    // 4. Conversion metrics
    // ========================================================================
    let avgDaysToNotification = 0;
    const notifiedEntries = (allWaitlist || []).filter(w => w.status === 'notified' && w.notified_at);

    if (notifiedEntries.length > 0) {
      const totalDays = notifiedEntries.reduce((sum, entry) => {
        const created = new Date(entry.created_at);
        const notified = new Date(entry.notified_at!);
        const days = (notified.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      avgDaysToNotification = Math.round(totalDays / notifiedEntries.length);
    }

    // Recent conversion rate (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentWaitlist = (allWaitlist || []).filter(
      w => new Date(w.created_at) >= sevenDaysAgo
    );
    const recentNotified = recentWaitlist.filter(w => w.status === 'notified').length;
    const recentConversionRate = recentWaitlist.length > 0
      ? (recentNotified / recentWaitlist.length) * 100
      : 0;

    // ========================================================================
    // Response
    // ========================================================================
    const metrics: WaitlistMetrics = {
      totalWaitlistEntries,
      uniqueProducts,
      uniqueCustomers,
      notifiedCount,
      notificationRate: Math.round(notificationRate * 100) / 100,
      topWaitlistedProducts,
      trendsByDate: trendsArray,
      statusBreakdown,
      conversionMetrics: {
        avgDaysToNotification,
        recentConversionRate: Math.round(recentConversionRate * 100) / 100,
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Waitlist analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist analytics' },
      { status: 500 }
    );
  }
}
