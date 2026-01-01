import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// ============================================================================
// Admin Analytics API - /api/admin/analytics
// ============================================================================
// What: Provides aggregated order analytics for admin dashboard
// Why: Admins need visibility into revenue, trends, and order patterns
// How: Queries orders table and calculates summary statistics
//
// Query Parameters:
// - startDate: Filter orders from this date (YYYY-MM-DD)
// - endDate: Filter orders until this date (YYYY-MM-DD)
// - includeTrends: Include daily revenue trends (true/false)

// ============================================================================
// Types
// ============================================================================

interface OrdersByStatus {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  canceled: number;
}

interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  ordersByStatus: OrdersByStatus;
}

interface TrendDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface AnalyticsResponse {
  summary: AnalyticsSummary;
  trends?: TrendDataPoint[];
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

// ============================================================================
// GET - Analytics Summary (Admin Only)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeTrends = searchParams.get('includeTrends') === 'true';

    // Build query
    let query = supabase.from('orders').select('id, total, status, created_at');

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('created_at', `${startDate}T00:00:00Z`);
    }
    if (endDate) {
      query = query.lte('created_at', `${endDate}T23:59:59Z`);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Failed to fetch orders for analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const ordersList = orders || [];
    const totalOrders = ordersList.length;
    const totalRevenue = ordersList.reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Count orders by status
    const ordersByStatus: OrdersByStatus = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      canceled: 0,
    };

    ordersList.forEach((order) => {
      const status = (order.status || 'pending') as keyof OrdersByStatus;
      if (status in ordersByStatus) {
        ordersByStatus[status]++;
      }
    });

    // Build response
    const response: AnalyticsResponse = {
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        ordersByStatus,
      },
      dateRange: {
        startDate,
        endDate,
      },
    };

    // Calculate trends if requested
    if (includeTrends) {
      const trendsMap = new Map<string, TrendDataPoint>();

      ordersList.forEach((order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const existing = trendsMap.get(date) || { date, revenue: 0, orders: 0 };
        existing.revenue += order.total || 0;
        existing.orders += 1;
        trendsMap.set(date, existing);
      });

      // Sort trends by date
      response.trends = Array.from(trendsMap.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}
