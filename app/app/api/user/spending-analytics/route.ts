export const dynamic = 'force-dynamic';

// ============================================================================
// Customer Spending Analytics API
// ============================================================================
// What: Provides customer spending insights and purchase analytics
// Why: Help customers understand their spending patterns and favorite categories
// How: Aggregates order data with product categories and spending metrics

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { createClient } from '@supabase/supabase-js';
import { validateSupabaseAdminConfig } from '@/lib/supabase-client-safe';

// ============================================================================
// Types
// ============================================================================

interface Order {
  id: string;
  medusa_order_id: string;
  total: number | null;
  status: string;
  created_at: string;
}

interface SpendingAnalytics {
  total_spent: number;
  total_orders: number;
  average_order_value: number;
  last_order_date: string | null;
  orders_this_month: number;
  spending_this_month: number;
  most_purchased_categories: Array<{
    category: string;
    count: number;
    total_spent: number;
  }>;
  order_frequency: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
}

// ============================================================================
// GET: Retrieve spending analytics
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

    // Get all orders for current user
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, medusa_order_id, total, status, created_at')
      .eq('email', session.user.email)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return Response.json({ error: 'Failed to load analytics' }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return Response.json({
        analytics: {
          total_spent: 0,
          total_orders: 0,
          average_order_value: 0,
          last_order_date: null,
          orders_this_month: 0,
          spending_this_month: 0,
          most_purchased_categories: [],
          order_frequency: {
            monthly: 0,
            quarterly: 0,
            yearly: 0,
          },
        } as SpendingAnalytics,
      });
    }

    // Calculate metrics
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastQuarter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const typedOrders = orders as Order[];
    const totalSpent = typedOrders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);
    const totalOrders = typedOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const ordersThisMonth = typedOrders.filter((o: Order) => new Date(o.created_at) >= thisMonth).length;
    const spendingThisMonth = typedOrders
      .filter((o: Order) => new Date(o.created_at) >= thisMonth)
      .reduce((sum: number, order: Order) => sum + (order.total || 0), 0);

    const ordersLastQuarter = typedOrders.filter((o: Order) => new Date(o.created_at) >= lastQuarter).length;
    const ordersLastYear = typedOrders.filter((o: Order) => new Date(o.created_at) >= lastYear).length;

    // Try to get category data from Medusa (this is optional, returns empty if unavailable)
    const categoryMap: { [key: string]: { count: number; total: number } } = {};

    // Since we don't have direct product-category mapping in our schema,
    // we'll provide a placeholder structure that can be enhanced later
    // when category metadata becomes available from Medusa

    const analytics: SpendingAnalytics = {
      total_spent: totalSpent,
      total_orders: totalOrders,
      average_order_value: averageOrderValue,
      last_order_date: typedOrders[0]?.created_at || null,
      orders_this_month: ordersThisMonth,
      spending_this_month: spendingThisMonth,
      most_purchased_categories: Object.entries(categoryMap)
        .map(([category, data]) => ({
          category,
          count: data.count,
          total_spent: data.total,
        }))
        .sort((a, b) => b.total_spent - a.total_spent)
        .slice(0, 5),
      order_frequency: {
        monthly: ordersThisMonth,
        quarterly: ordersLastQuarter,
        yearly: ordersLastYear,
      },
    };

    return Response.json({ analytics });
  } catch (error) {
    console.error('GET /api/user/spending-analytics error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
