'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import { titleTextColors, mutedTextColors, headingColors } from '@/lib/colors';

// ============================================================================
// Admin Product Categories Management - /admin/products/categories
// ============================================================================
// What: Manage product categories for filtering and organization
// Why: Give admins control over category hierarchy and presentation
// How: CRUD operations on categories with drag-to-reorder

interface ProductCategory {
  id: string;
  name: string;
  handle: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AVAILABLE_COLORS = [
  'emerald',
  'blue',
  'purple',
  'gold',
  'red',
  'orange',
  'pink',
  'cyan',
  'teal',
  'violet',
];

export default function CategoriesManagementPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue',
  });

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
  // Fetch categories
  // ========================================================================
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/product-categories', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin && !authLoading) {
      fetchCategories();
    }
  }, [isAuthenticated, isAdmin, authLoading, fetchCategories]);

  // ========================================================================
  // Handle form submission
  // ========================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setError('');
      const session = await getSession();

      if (editingId) {
        // Update
        const response = await fetch(`/api/admin/product-categories/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to update category');
      } else {
        // Create
        const response = await fetch('/api/admin/product-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to create category');
      }

      setFormData({ name: '', description: '', color: 'blue' });
      setEditingId(null);
      setShowForm(false);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  // ========================================================================
  // Handle delete
  // ========================================================================
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setError('');
      const session = await getSession();

      const response = await fetch(`/api/admin/product-categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete category');
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  // ========================================================================
  // Handle edit
  // ========================================================================
  const handleEdit = (category: ProductCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || 'blue',
    });
    setShowForm(true);
  };

  // ========================================================================
  // Handle cancel
  // ========================================================================
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '', color: 'blue' });
  };

  // ========================================================================
  // Render
  // ========================================================================
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className={`text-4xl font-bold ${titleTextColors.blue} mb-2`}>
            Product Categories
          </h1>
          <p className={`text-lg ${mutedTextColors.normal}`}>
            Create and manage product categories for better organization
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Action button */}
        {!showForm && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              + Add Category
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <Card className="p-8 mb-8">
            <h2 className={`text-2xl font-bold ${headingColors.primary} mb-6`}>
              {editingId ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className={`block text-sm font-medium ${headingColors.primary} mb-2`}>
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Electronics"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium ${headingColors.primary} mb-2`}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional category description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Color */}
              <div>
                <label className={`block text-sm font-medium ${headingColors.primary} mb-3`}>
                  Color
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? `border-${color}-600 bg-${color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded bg-${color}-500`} />
                      <div className="text-xs text-gray-600 mt-2 capitalize">{color}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  {editingId ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Categories list */}
        {!loading && categories.length === 0 && (
          <Card className="p-8 text-center">
            <p className={mutedTextColors.normal}>
              No categories yet. Create your first one to get started.
            </p>
          </Card>
        )}

        {!loading && categories.length > 0 && (
          <div className="space-y-3">
            {categories.map((category) => (
              <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full bg-${category.color}-500`} />
                      <h3 className={`text-lg font-bold ${headingColors.primary}`}>
                        {category.name}
                      </h3>
                    </div>
                    {category.description && (
                      <p className={`mt-2 text-sm ${mutedTextColors.normal}`}>
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>Handle: <code className="font-mono">{category.handle}</code></span>
                      <span>Order: {category.sort_order}</span>
                      <span className={category.is_active ? 'text-emerald-600' : 'text-gray-500'}>
                        {category.is_active ? '✓ Active' : '○ Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(category)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
