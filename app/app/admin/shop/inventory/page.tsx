'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import {
  statusBadgeColors,
  alertColors,
  filterButtonColors,
  formInputColors,
  headingColors,
  verySoftBgColors,
} from '@/lib/colors';

// ============================================================================
// Admin Inventory Page - Stock Management
// ============================================================================
// What: Displays product variants with inventory quantities
// Why: Admins need to track and update stock levels
// How: Fetches from /api/admin/inventory, allows inline quantity updates

interface InventoryItem {
  id: string;
  variantId: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  inventoryQuantity: number;
  manageInventory: boolean;
  allowBackorder: boolean;
  price: number;
  currencyCode: string;
  lowStockThreshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface InventoryStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalQuantity: number;
}

export default function AdminInventoryPage() {
  // Auth handled by layout/middleware

  // ============================================================================
  // State Management
  // ============================================================================

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // ============================================================================
  // Fetch Inventory
  // ============================================================================
  // Note: Auth is handled by the admin layout, so we don't need to check here.
  // The layout will redirect non-admins before this page even renders.

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[Inventory] Fetching from /api/admin/inventory...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/admin/inventory', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log('[Inventory] Response status:', res.status);

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to access this page');
          return;
        }
        if (res.status === 403) {
          setError('Admin access required');
          return;
        }
        throw new Error(`Failed to fetch inventory: ${res.status}`);
      }

      const data = await res.json();
      console.log('[Inventory] Got data:', data.inventory?.length, 'items');
      setInventory(data.inventory || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('[Inventory] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount - auth is already verified by the admin layout
  useEffect(() => {
    fetchInventory();
  }, []);

  // ============================================================================
  // Filter & Sort Inventory
  // ============================================================================

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.productTitle.toLowerCase().includes(searchLower) ||
        item.variantTitle.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventory, searchQuery, statusFilter]);

  // ============================================================================
  // Update Quantity
  // ============================================================================

  const handleStartEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditQuantity(item.inventoryQuantity);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuantity(0);
  };

  const handleSaveQuantity = async (item: InventoryItem) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ variantId: item.variantId, inventoryQuantity: editQuantity }],
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update inventory');
      }

      // Update local state
      setInventory(prev =>
        prev.map(i =>
          i.id === item.id
            ? {
                ...i,
                inventoryQuantity: editQuantity,
                status:
                  editQuantity === 0
                    ? 'out_of_stock'
                    : editQuantity <= i.lowStockThreshold
                    ? 'low_stock'
                    : 'in_stock',
              }
            : i
        )
      );

      setSuccessMessage('Inventory updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // Status Badge Component
  // ============================================================================

  const StatusBadge = ({ status }: { status: InventoryItem['status'] }) => {
    const colorMap = {
      in_stock: statusBadgeColors.active,
      low_stock: statusBadgeColors.pending,
      out_of_stock: statusBadgeColors.cancelled,
    };
    const labelMap = {
      in_stock: 'In Stock',
      low_stock: 'Low Stock',
      out_of_stock: 'Out of Stock',
    };
    const colors = colorMap[status];

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
        {labelMap[status]}
      </span>
    );
  };

  // ============================================================================
  // Loading State
  // ============================================================================
  // Auth is handled by the admin layout - we just handle loading state here

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" role="status" aria-live="polite" aria-busy="true">
        <div className="text-gray-600 dark:text-gray-300">Loading inventory...</div>
      </div>
    );
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title="Inventory Management"
        description="Track and manage stock levels for all product variants"
      />

      {/* Success/Error Messages */}
      {successMessage && (
        <div className={`mb-6 p-4 rounded-lg ${alertColors.success.bg} ${alertColors.success.border}`}>
          <p className={alertColors.success.text}>{successMessage}</p>
        </div>
      )}
      {error && (
        <div className={`mb-6 p-4 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}>
          <p className={alertColors.error.text}>{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div data-testid="inventory-stats" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card hoverColor="blue" hoverEffect="glow" className="text-center p-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <div className={`text-sm ${headingColors.secondary}`}>Total Variants</div>
          </Card>
          <Card hoverColor="green" hoverEffect="glow" className="text-center p-4">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.inStock}</div>
            <div className={`text-sm ${headingColors.secondary}`}>In Stock</div>
          </Card>
          <Card hoverColor="orange" hoverEffect="glow" className="text-center p-4">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.lowStock}</div>
            <div className={`text-sm ${headingColors.secondary}`}>Low Stock</div>
          </Card>
          <Card hoverColor="red" hoverEffect="glow" className="text-center p-4">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.outOfStock}</div>
            <div className={`text-sm ${headingColors.secondary}`}>Out of Stock</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${formInputColors.base} ${formInputColors.focus}`}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'in_stock', 'low_stock', 'out_of_stock'] as const).map(status => {
              const isActive = statusFilter === status;
              const labels = {
                all: 'All',
                in_stock: 'In Stock',
                low_stock: 'Low Stock',
                out_of_stock: 'Out of Stock',
              };
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? filterButtonColors.active.purple
                      : filterButtonColors.inactive
                  }`}
                  aria-pressed={isActive}
                  aria-label={`Filter by ${labels[status]}`}
                >
                  {labels[status]}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="inventory-list">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${headingColors.secondary}`}>
                  Product
                </th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${headingColors.secondary}`}>
                  Variant
                </th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${headingColors.secondary}`}>
                  Stock
                </th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${headingColors.secondary}`}>
                  Status
                </th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${headingColors.secondary}`}>
                  Price
                </th>
                <th className={`px-4 py-3 text-right text-sm font-semibold ${headingColors.secondary}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {inventory.length === 0
                      ? 'No inventory items found'
                      : 'No items match your filters'}
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => (
                  <tr
                    key={item.id}
                    className={`${
                      item.status === 'out_of_stock'
                        ? verySoftBgColors.red
                        : item.status === 'low_stock'
                        ? verySoftBgColors.orange
                        : ''
                    }`}
                  >
                    <td className={`px-4 py-3 ${headingColors.primary}`}>{item.productTitle}</td>
                    <td className={`px-4 py-3 ${headingColors.secondary}`}>{item.variantTitle}</td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          value={editQuantity}
                          onChange={e => setEditQuantity(parseInt(e.target.value) || 0)}
                          className={`w-20 px-2 py-1 border rounded ${formInputColors.base} ${formInputColors.focus}`}
                          aria-label="Quantity"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveQuantity(item);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                      ) : (
                        <span className={headingColors.primary}>{item.inventoryQuantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className={`px-4 py-3 ${headingColors.secondary}`}>
                      ${(item.price / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === item.id ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="green"
                            size="sm"
                            onClick={() => handleSaveQuantity(item)}
                            disabled={saving}
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button variant="gray" size="sm" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button variant="blue" size="sm" onClick={() => handleStartEdit(item)}>
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
