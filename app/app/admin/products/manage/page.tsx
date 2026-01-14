'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';

// ============================================================================
// PRODUCT MANAGEMENT INTERFACE
// ============================================================================
// Aesthetic Direction: Editorial/Magazine-inspired admin interface
// - Refined typography with serif headings
// - Sophisticated use of brand colors (purple primary, blue/green accents)
// - Orchestrated animations with staggered reveals
// - Generous spacing, clear data hierarchy
// - Professional micro-interactions

interface Product {
  id: string;
  title: string;
  description?: string;
  handle: string;
  thumbnail?: string;
  variants?: Array<{
    id: string;
    sku?: string;
    calculated_price?: {
      calculated_amount: number;
    };
    prices?: Array<{
      amount: number;
    }>;
  }>;
}

interface ProductFormData {
  title: string;
  description: string;
  handle: string;
  price: string;
  sku: string;
  thumbnail: string;
}

export default function ProductManagePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    handle: '',
    price: '',
    sku: '',
    thumbnail: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ========================================================================
  // Data Fetching
  // ========================================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products');
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Network error loading products');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // Product CRUD Operations
  // ========================================================================

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        handle: formData.handle,
        price: parseFloat(formData.price),
        sku: formData.sku,
        thumbnail: formData.thumbnail,
      };

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';

      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', data.message || 'Product saved successfully');
        setIsModalOpen(false);
        resetForm();
        fetchProducts();
      } else {
        setError(data.message || 'Failed to save product');
      }
    } catch (err) {
      setError('Network error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products/${deletingProduct.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Product deleted successfully');
        setIsDeleteModalOpen(false);
        setDeletingProduct(null);
        fetchProducts();
      } else {
        setError(data.message || 'Failed to delete product');
      }
    } catch (err) {
      setError('Network error deleting product');
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================================================
  // UI Helpers
  // ========================================================================

  const openCreateModal = () => {
    resetForm();
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    const price = product.variants?.[0]?.calculated_price?.calculated_amount ||
                  product.variants?.[0]?.prices?.[0]?.amount ||
                  0;

    setFormData({
      title: product.title,
      description: product.description || '',
      handle: product.handle,
      price: (price / 100).toString(),
      sku: product.variants?.[0]?.sku || '',
      thumbnail: product.thumbnail || '',
    });
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      handle: '',
      price: '',
      sku: '',
      thumbnail: '',
    });
    setError('');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      handle: prev.handle || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const getProductPrice = (product: Product) => {
    const price = product.variants?.[0]?.calculated_price?.calculated_amount ||
                  product.variants?.[0]?.prices?.[0]?.amount ||
                  0;
    return `$${(price / 100).toFixed(2)}`;
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/20">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl border-2 transform transition-all duration-500 ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-500 text-green-800'
              : 'bg-red-50 border-red-500 text-red-800'
          }`}
          style={{
            animation: 'slideInRight 0.5s ease-out, fadeOut 0.5s ease-in 3.5s',
          }}
        >
          <p className="font-semibold">{notification.message}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section - Editorial Style */}
        <header className="mb-12 relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -z-10" />

          <div className="flex items-end justify-between mb-6 animate-fadeInUp">
            <div>
              <p className="text-sm font-semibold text-purple-600 mb-2 tracking-wider uppercase">
                Admin Dashboard
              </p>
              <h1 className="text-5xl font-serif font-bold text-gray-900 mb-3">
                Product Management
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Create, edit, and manage your consultation products with precision and control.
              </p>
            </div>

            <Button
              variant="purple"
              onClick={openCreateModal}
              className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              + New Product
            </Button>
          </div>

          {products.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-gray-600 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{products.length} {products.length === 1 ? 'Product' : 'Products'}</span>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 rounded-full" />
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
            </div>
          </div>
        ) : error && products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">{error}</p>
            <Button variant="purple" onClick={fetchProducts} className="mt-4">
              Retry
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 animate-fadeInUp">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">No Products Yet</h2>
            <p className="text-gray-600 mb-6">Create your first product to get started</p>
            <Button variant="purple" onClick={openCreateModal}>
              Create Product
            </Button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product, index) => (
                    <tr
                      key={product.id}
                      className="group hover:bg-purple-50/30 transition-all duration-200 animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-2xl">📦</span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {product.title}
                            </h3>
                            <p className="text-sm text-gray-500">{product.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-mono text-gray-600">
                          {product.variants?.[0]?.sku || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-lg font-bold text-gray-900">
                          {getProductPrice(product)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => !submitting && setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-white z-10">
              <h2 className="text-3xl font-serif font-bold">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h2>
              <p className="text-purple-100 mt-1">
                {editingProduct ? 'Update product details' : 'Add a new consultation product'}
              </p>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all duration-200"
                  placeholder="15-Minute Consultation"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Handle
                </label>
                <input
                  type="text"
                  value={formData.handle}
                  onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all duration-200 font-mono text-sm"
                  placeholder="15-min-consultation"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-generated from title if left empty</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all duration-200"
                  placeholder="Quick consultation session to discuss your project needs..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all duration-200"
                    placeholder="20.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all duration-200 font-mono text-sm"
                    placeholder="CONSULT-15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all duration-200"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.thumbnail && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Preview:</p>
                    <img
                      src={formData.thumbnail}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="purple"
                  disabled={submitting}
                  className="flex-1 py-3 text-lg font-semibold"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="gray"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-8 py-3 text-lg font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingProduct && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => !submitting && setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-6 text-white rounded-t-2xl">
              <h2 className="text-2xl font-serif font-bold">Delete Product?</h2>
            </div>

            <div className="p-8">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{deletingProduct.title}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="red"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 py-3 font-semibold"
                >
                  {submitting ? 'Deleting...' : 'Delete Product'}
                </Button>
                <Button
                  variant="gray"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={submitting}
                  className="px-8 py-3 font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out backwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
