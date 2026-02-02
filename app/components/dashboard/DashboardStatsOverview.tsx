'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import { headingColors, formInputColors } from '@/lib/colors';
import { Calendar, ShoppingBag, Star, TrendingUp } from 'lucide-react';

// ============================================================================
// Dashboard Stats Overview Component
// ============================================================================
// What: Shows key metrics about customer's account at a glance
// Why: Customers want to quickly see their engagement summary
// How: Aggregates data from appointments, orders, and reviews APIs

interface DashboardStats {
  upcomingAppointments: number;
  totalOrders: number;
  totalSpent: number;
  submittedReviews: number;
}

export default function DashboardStatsOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    totalOrders: 0,
    totalSpent: 0,
    submittedReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch appointments
        const appointmentsRes = await fetch('/api/user/appointments');
        const appointmentsData = appointmentsRes.ok ? await appointmentsRes.json() : { appointments: [] };
        const upcomingCount = (appointmentsData.appointments || []).filter(
          (apt: any) => apt.status !== 'cancelled' && apt.status !== 'completed'
        ).length;

        // Fetch orders
        const ordersRes = await fetch('/api/user/orders');
        const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] };
        const orders = ordersData.orders || [];
        const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

        // Fetch reviews
        const reviewsRes = await fetch('/api/user/reviews');
        const reviewsData = reviewsRes.ok ? await reviewsRes.json() : { reviews: [] };
        const submittedReviews = (reviewsData.reviews || []).filter((review: any) => review.status === 'published').length;

        setStats({
          upcomingAppointments: upcomingCount,
          totalOrders: orders.length,
          totalSpent,
          submittedReviews,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    {
      icon: Calendar,
      label: 'Upcoming Appointments',
      value: stats.upcomingAppointments,
      color: 'emerald',
    },
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: stats.totalOrders,
      color: 'blue',
    },
    {
      icon: TrendingUp,
      label: 'Total Spent',
      value: `$${(stats.totalSpent / 100).toFixed(2)}`,
      color: 'purple',
    },
    {
      icon: Star,
      label: 'Published Reviews',
      value: stats.submittedReviews,
      color: 'gold',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} hoverEffect="none">
            <div className="p-4 h-24 bg-gray-100 rounded animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        const colorMap: Record<string, string> = {
          emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          blue: 'bg-blue-50 text-blue-700 border-blue-200',
          purple: 'bg-purple-50 text-purple-700 border-purple-200',
          gold: 'bg-amber-50 text-amber-700 border-amber-200',
        };

        return (
          <Card key={stat.label} hoverEffect="lift">
            <div className={`p-6 border ${colorMap[stat.color]}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm font-medium ${formInputColors.helper}`}>
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${headingColors.primary} mt-2`}>
                    {stat.value}
                  </p>
                </div>
                <Icon className="w-8 h-8 opacity-40" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
