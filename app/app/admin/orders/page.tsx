'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import Button from '@/components/Button';
import DepositPaymentCard from '@/components/DepositPaymentCard';
import ReadyForDeliveryModal from '@/components/ReadyForDeliveryModal';
import { filterButtonColors, alertColors, statusBadgeColors, containerBg, uiChromeBg, mutedTextColors, headingColors, coloredLinkText, dividerColors } from '@/lib/colors';

// ============================================================================
// Orders Dashboard - /admin/orders
// ============================================================================
// What: Displays all customer orders with status management
// Why: Admins need to track and update order statuses
// How: Fetches from Supabase, shows status filters, and provides update actions

interface Order {
  id: string;
  user_id: string | null;
  medusa_order_id: string;
  total: number | null;
  status: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  // Deposit payment fields (for 50/50 payment system)
  deposit_amount?: number;
  balance_remaining?: number;
  final_payment_status?: string;
  final_payment_method?: string;
  stripe_payment_method_id?: string;
}

type StatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';

const STATUS_OPTIONS: StatusFilter[] = ['pending', 'processing', 'shipped', 'delivered', 'canceled'];

export default function OrdersDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showReadyForDeliveryModal, setShowReadyForDeliveryModal] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<Order | null>(null);

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
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();
  }, [isAdmin, fetchOrders]);

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
  // Handle status update
  // ========================================================================
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setActionLoading(orderId);

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order status');
      }

      // Refresh orders list
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setActionLoading(null);
    }
  };

  // ========================================================================
  // Handle ready for delivery modal
  // ========================================================================
  const handleOpenReadyForDeliveryModal = (order: Order) => {
    setSelectedOrderForDelivery(order);
    setShowReadyForDeliveryModal(true);
  };

  const handleReadyForDeliverySuccess = async (paymentMethod: string, charged: boolean) => {
    // Refresh orders to show updated payment status
    await fetchOrders();
    setShowReadyForDeliveryModal(false);
    setSelectedOrderForDelivery(null);

    // Show success message based on payment method and result
    let message = '';
    if (charged) {
      message = 'Card charged successfully! Order marked as ready for delivery.';
    } else {
      const methodLabels: Record<string, string> = {
        cash: 'Cash',
        check: 'Check',
        other: 'Alternative payment',
      };
      const methodLabel = methodLabels[paymentMethod] || paymentMethod;
      message = `${methodLabel} payment recorded. Order marked as ready for delivery.`;
    }
    alert(message);
  };

  // ========================================================================
  // Get status badge color from centralized statusBadgeColors
  // ========================================================================
  const getStatusBadgeClasses = (status: string) => {
    const statusKey = status as keyof typeof statusBadgeColors;
    const colors = statusBadgeColors[statusKey] || statusBadgeColors.unpaid;
    return `${colors.bg} ${colors.text}`;
  };

  // ========================================================================
  // Format currency
  // ========================================================================
  const formatCurrency = (cents: number | null) => {
    if (cents === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // ========================================================================
  // Format date
  // ========================================================================
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite" aria-busy="true">
        <p className={mutedTextColors.light}>Loading orders...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${headingColors.primary} mb-2`}>
          Orders
        </h1>
        <p className={mutedTextColors.light}>
          Track and manage customer orders
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className={`mb-6 p-4 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}>
          <p className={`text-sm ${alertColors.error.text}`}>{error}</p>
          <button
            onClick={() => setError('')}
            className={`mt-2 text-sm ${alertColors.error.link}`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter buttons */}
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter orders by status">
        <button
          onClick={() => setStatusFilter('all')}
          aria-pressed={statusFilter === 'all'}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'all'
              ? filterButtonColors.active.purple
              : filterButtonColors.inactive
          }`}
        >
          All ({orders.length})
        </button>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            aria-pressed={statusFilter === status}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === status
                ? filterButtonColors.active.purple
                : filterButtonColors.inactive
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({orders.filter((o) => o.status === status).length})
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <Card hoverEffect="none">
          <div className="p-8 text-center">
            <div className={`inline-block p-3 ${uiChromeBg.panel} rounded-full mb-4`}>
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className={mutedTextColors.light}>
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
                {/* Header row */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${headingColors.primary} mb-1`}>
                      Order #{order.medusa_order_id.slice(0, 12)}...
                    </h3>
                    {order.email && (
                      <a
                        href={`mailto:${order.email}`}
                        className={`text-sm ${coloredLinkText.purple} hover:underline`}
                      >
                        {order.email}
                      </a>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClasses(order.status || 'pending')}`}
                    >
                      {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                    </span>
                    <p className={`text-lg font-bold ${headingColors.primary} mt-2`}>
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>

                {/* Order details */}
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className={`p-3 ${containerBg.page} rounded-lg`}>
                    <p className={`text-xs font-medium ${mutedTextColors.normal} mb-1`}>Order ID</p>
                    <p className={`text-sm ${headingColors.secondary} font-mono`}>{order.medusa_order_id}</p>
                  </div>
                  <div className={`p-3 ${containerBg.page} rounded-lg`}>
                    <p className={`text-xs font-medium ${mutedTextColors.normal} mb-1`}>Created</p>
                    <p className={`text-sm ${headingColors.secondary}`}>{formatDate(order.created_at)}</p>
                  </div>
                </div>

                {/* Deposit Payment Status (if order has deposit fields) */}
                {order.deposit_amount && (
                  <DepositPaymentCard
                    depositAmount={order.deposit_amount}
                    balanceRemaining={order.balance_remaining || 0}
                    finalPaymentStatus={(order.final_payment_status || 'pending') as 'pending' | 'paid' | 'failed' | 'waived'}
                    finalPaymentMethod={order.final_payment_method}
                    onReadyForDelivery={() => handleOpenReadyForDeliveryModal(order)}
                  />
                )}

                {/* Expandable section for status updates */}
                <div className={`border-t ${dividerColors.border} pt-4`}>
                  <button
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    aria-expanded={expandedOrderId === order.id}
                    className={`flex items-center gap-2 text-sm ${coloredLinkText.purple} hover:underline`}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedOrderId === order.id ? 'rotate-90' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {expandedOrderId === order.id ? 'Hide' : 'Update'} Status
                  </button>

                  {/* Status update buttons */}
                  {expandedOrderId === order.id && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((status) => (
                        <Button
                          key={status}
                          variant={order.status === status ? 'gray' : 'purple'}
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, status)}
                          disabled={actionLoading === order.id || order.status === status}
                          isLoading={actionLoading === order.id}
                          loadingText="Updating..."
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Ready for Delivery Modal */}
              {selectedOrderForDelivery?.id === order.id && (
                <ReadyForDeliveryModal
                  isOpen={showReadyForDeliveryModal}
                  orderId={order.id}
                  orderNumber={order.medusa_order_id}
                  balanceRemaining={order.balance_remaining || 0}
                  onClose={() => setShowReadyForDeliveryModal(false)}
                  onSuccess={handleReadyForDeliverySuccess}
                />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
