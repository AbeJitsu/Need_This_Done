'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import type { Product, Order } from '@/lib/medusa-client';
import { alertColors, statusBadgeColors, formInputColors, cardBgColors, cardBorderColors, mutedTextColors, headingColors, coloredLinkText, dividerColors, navigationColors, iconButtonColors } from '@/lib/colors';

// ============================================================================
// Admin Shop Dashboard - /admin/shop
// ============================================================================
// What: Central hub for managing ecommerce (products and orders)
// Why: Admins need to manage inventory and track orders
// How: Fetches products and orders from Medusa, displays in admin UI

export default function AdminShopDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'inventory'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Import/Export state
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

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
  // Fetch products and orders
  // ========================================================================
  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch products and orders in parallel
        const [productsResponse, ordersResponse] = await Promise.all([
          fetch('/api/shop/products'),
          fetch('/api/admin/orders'),
        ]);

        if (!productsResponse.ok) {
          throw new Error('Failed to load products');
        }
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData.orders || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shop data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  // ========================================================================
  // Auth loading state
  // ========================================================================
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className={mutedTextColors.normal}>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  // ========================================================================
  // Export handlers
  // ========================================================================
  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/admin/products/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showToast(`Products exported as ${format.toUpperCase()}`, 'success');
      setShowExportOptions(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Export failed', 'error');
    }
  };

  // ========================================================================
  // Delete product handler
  // ========================================================================
  const handleDeleteProduct = async (productId: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${productTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingProductId(productId);
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }

      showToast('Product deleted successfully', 'success');

      // Remove product from local state
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete product', 'error');
    } finally {
      setDeletingProductId(null);
    }
  };

  // ========================================================================
  // Import handlers
  // ========================================================================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportError(null);

    if (!file) {
      setImportFile(null);
      return;
    }

    // Validate file type
    const validTypes = ['application/json', 'text/csv', 'text/plain'];
    const validExtensions = ['.json', '.csv'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      setImportError('Invalid file format. Please upload a JSON or CSV file.');
      setImportFile(null);
      return;
    }

    setImportFile(file);
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImporting(true);
    setImportError(null);

    try {
      const text = await importFile.text();
      let products: unknown[];

      if (importFile.name.endsWith('.csv')) {
        // Parse CSV
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());

        products = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const product: Record<string, unknown> = {};
          headers.forEach((header, i) => {
            product[header] = header === 'price' ? Number(values[i]) : values[i];
          });
          return product;
        });
      } else {
        // Parse JSON
        const data = JSON.parse(text);
        products = Array.isArray(data) ? data : data.products;
      }

      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      showToast(`Successfully imported ${result.imported} products`, 'success');
      setShowImportModal(false);
      setImportFile(null);

      // Refresh products list
      const productsResponse = await fetch('/api/shop/products');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${headingColors.primary} mb-2`}>
          Shop Management
        </h1>
        <p className={mutedTextColors.normal}>
          Manage products and track orders
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className={`mb-6 p-4 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}>
          <p className={`text-sm ${alertColors.error.text}`}>{error}</p>
        </div>
      )}

      {/* Tab navigation */}
      <div className={`mb-6 border-b ${dividerColors.border}`}>
        <div className="flex gap-1" role="tablist" aria-label="Shop management sections">
          <button
            onClick={() => setActiveTab('products')}
            role="tab"
            aria-selected={activeTab === 'products'}
            aria-controls="products-panel"
            id="products-tab"
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'products'
                ? `${coloredLinkText.blue} border-blue-600`
                : `${navigationColors.link} border-transparent ${navigationColors.linkHover}`
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            role="tab"
            aria-selected={activeTab === 'orders'}
            aria-controls="orders-panel"
            id="orders-tab"
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'orders'
                ? `${coloredLinkText.blue} border-blue-600`
                : `${navigationColors.link} border-transparent ${navigationColors.linkHover}`
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => router.push('/admin/shop/inventory')}
            role="tab"
            aria-selected={activeTab === 'inventory'}
            aria-controls="inventory-panel"
            id="inventory-tab"
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'inventory'
                ? `${coloredLinkText.blue} border-blue-600`
                : `${navigationColors.link} border-transparent ${navigationColors.linkHover}`
            }`}
          >
            Inventory
          </button>
        </div>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div role="tabpanel" id="products-panel" aria-labelledby="products-tab">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-semibold ${headingColors.primary}`}>
              Products
            </h2>
            <div className="flex gap-2">
              {/* Export Button with Dropdown */}
              <div className="relative">
                <Button
                  variant="gray"
                  onClick={() => setShowExportOptions(!showExportOptions)}
                >
                  Export
                </Button>
                {showExportOptions && (
                  <div className={`absolute right-0 mt-2 w-32 ${cardBgColors.base} rounded-lg shadow-lg ${cardBorderColors.light} z-10`}>
                    <button
                      onClick={() => handleExport('json')}
                      className={`w-full px-4 py-2 text-left text-sm ${headingColors.secondary} ${iconButtonColors.bg} rounded-t-lg`}
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className={`w-full px-4 py-2 text-left text-sm ${headingColors.secondary} ${iconButtonColors.bg} rounded-b-lg`}
                    >
                      CSV
                    </button>
                  </div>
                )}
              </div>

              {/* Import Button */}
              <Button
                variant="blue"
                onClick={() => setShowImportModal(true)}
              >
                Import
              </Button>

              <Button variant="purple" href="/admin/shop/products/new">
                Add Product
              </Button>
            </div>
          </div>

          {/* Import Modal */}
          {showImportModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className={`${cardBgColors.base} rounded-lg p-6 max-w-md w-full mx-4 shadow-xl`}>
                <h3 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
                  Import Products
                </h3>

                <div className="mb-4">
                  <label className={`block text-sm font-medium ${headingColors.secondary} mb-2`}>
                    Select file (JSON or CSV)
                  </label>
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileSelect}
                    className={`w-full px-3 py-2 border rounded-lg ${formInputColors.base} ${formInputColors.focus}`}
                  />
                </div>

                {importError && (
                  <div className={`mb-4 p-3 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}>
                    <p className={`text-sm ${alertColors.error.text}`}>{importError}</p>
                  </div>
                )}

                {importFile && !importError && (
                  <div className={`mb-4 p-3 rounded-lg ${alertColors.info.bg} ${alertColors.info.border}`}>
                    <p className={`text-sm ${alertColors.info.text}`}>
                      Ready to import: {importFile.name}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="gray"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                      setImportError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="purple"
                    onClick={handleImport}
                    disabled={!importFile || importing}
                  >
                    {importing ? 'Importing...' : 'Import'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <Card hoverEffect="none">
              <div className="p-8 text-center">
                <p className={`${mutedTextColors.normal} mb-4`}>
                  No products yet. Create your first product to get started.
                </p>
                <Button variant="purple" href="/admin/shop/products/new">
                  Create Product
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id} hoverEffect="lift">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-lg font-semibold ${headingColors.primary} mb-2`}>
                          {product.title}
                        </h3>
                        <p className={`text-sm ${mutedTextColors.normal} mb-1`}>
                          ID: {product.id}
                        </p>
                        <p className={`text-sm ${mutedTextColors.normal}`}>
                          Handle: {product.handle}
                        </p>
                        {product.prices && product.prices.length > 0 && (
                          <p className={`text-lg font-semibold ${headingColors.primary} mt-2`}>
                            ${(product.prices[0].amount / 100).toFixed(2)} {product.prices[0].currency_code}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="blue"
                          href={`/admin/shop/products/${product.id}/edit`}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="gray"
                          onClick={() => handleDeleteProduct(product.id, product.title)}
                          disabled={deletingProductId === product.id}
                        >
                          {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div role="tabpanel" id="orders-panel" aria-labelledby="orders-tab">
          <h2 className={`text-xl font-semibold ${headingColors.primary} mb-6`}>
            Recent Orders
          </h2>

          {orders.length === 0 ? (
            <Card hoverEffect="none">
              <div className="p-8 text-center">
                <p className={mutedTextColors.normal}>
                  No orders yet. Orders will appear here when customers make purchases.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id} hoverEffect="lift">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-lg font-semibold ${headingColors.primary} mb-2`}>
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <p className={`text-sm ${mutedTextColors.normal} mb-1`}>
                          Customer: {order.email}
                        </p>
                        <p className={`text-sm ${mutedTextColors.normal}`}>
                          Items: {order.items?.length || 0}
                        </p>
                        <p className={`text-lg font-semibold ${headingColors.primary} mt-2`}>
                          ${(order.total / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'completed'
                              ? `${statusBadgeColors.completed.bg} ${statusBadgeColors.completed.text}`
                              : order.status === 'pending'
                              ? `${statusBadgeColors.pending.bg} ${statusBadgeColors.pending.text}`
                              : `${statusBadgeColors.cancelled.bg} ${statusBadgeColors.cancelled.text}`
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
