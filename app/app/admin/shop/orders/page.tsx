'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/Card';
import type { Order } from '@/lib/medusa-client';

// ============================================================================
// Orders Dashboard - /admin/shop/orders
// ============================================================================
// What: Displays all orders from Medusa
// Why: Admins need to track orders and fulfill them
// How: Fetches orders from Medusa admin API with status tracking

export default function OrdersDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'canceled'>('all');

  // ========================================================================
  // Auth protection
  // ========================================================================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // ========================================================================
  // Fetch orders
  // ========================================================================
  useEffect(() => {
    if (!isAdmin) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch orders from Medusa admin API
        // Note: In a real implementation, this would use the admin token
        // and fetch from /api/admin/orders
        const response = await fetch('/api/admin/orders');

        if (!response.ok) {
          // It's OK if this fails - we just show empty orders
          console.log('Orders not available yet');
          setOrders([]);
        } else {
          const data = await response.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAdmin]);

  // ========================================================================
  // Filter orders by status
  // ========================================================================
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === statusFilter));
    }
  }, [orders, statusFilter]);

  // ========================================================================
  // Get status badge color
  // ========================================================================
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'canceled':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Orders
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track and manage customer orders
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Filter buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'pending'
              ? 'bg-yellow-600 dark:bg-yellow-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Pending ({orders.filter((o) => o.status === 'pending').length})
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'completed'
              ? 'bg-green-600 dark:bg-green-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Completed ({orders.filter((o) => o.status === 'completed').length})
        </button>
        <button
          onClick={() => setStatusFilter('canceled')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'canceled'
              ? 'bg-red-600 dark:bg-red-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Canceled ({orders.filter((o) => o.status === 'canceled').length})
        </button>
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <Card hoverEffect="none">
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {orders.length === 0
                ? 'No orders yet. Orders will appear here when customers make purchases.'
                : 'No orders match the selected filter.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} hoverEffect="lift">
              <div className="p-6">
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  {/* Order ID */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Order ID</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
                      {order.id.slice(0, 12)}...
                    </p>
                  </div>

                  {/* Customer Email */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Customer</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{order.email}</p>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Items</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Total */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      ${(order.total / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Status and Date */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()} at{' '}
                    {new Date(order.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
