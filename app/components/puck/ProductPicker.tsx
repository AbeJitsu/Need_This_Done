'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/medusa-client';
import { uiChromeBg, alertColors, hoverBgColors } from '@/lib/colors';

// ============================================================================
// ProductPicker - Modal for Selecting Products from Medusa
// ============================================================================
// Opens a modal to browse and select products from the Medusa catalog

interface ProductPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
  multiple?: boolean;
  title?: string;
}

export default function ProductPicker({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  title = 'Select Product',
}: ProductPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ============================================================================
  // Fetch Products
  // ============================================================================

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/shop/products');
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      setSelectedId(null);
    }
  }, [isOpen, fetchProducts]);

  // ============================================================================
  // Filter Products
  // ============================================================================

  const filteredProducts = products.filter((product) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      product.title?.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.handle?.toLowerCase().includes(searchLower)
    );
  });

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSelect = (product: Product) => {
    if (multiple) {
      // For multiple selection, immediately add
      onSelect(product);
    } else {
      setSelectedId(product.id);
    }
  };

  const handleConfirm = () => {
    if (!selectedId) return;
    const product = products.find((p) => p.id === selectedId);
    if (product) {
      onSelect(product);
      onClose();
    }
  };

  // ============================================================================
  // Helpers
  // ============================================================================

  const getPrice = (product: Product) => {
    const variant = product.variants?.[0];
    const price = variant?.prices?.[0];
    if (!price) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency_code,
    }).format(price.amount / 100);
  };

  const getImage = (product: Product) => {
    return product.images?.[0]?.url || null;
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${uiChromeBg.toolbar}`}>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className={`mb-4 p-4 ${alertColors.error.bg} ${alertColors.error.text} rounded-lg`}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {search ? 'No products match your search' : 'No products available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isSelected = selectedId === product.id;
                const image = getImage(product);
                const price = getPrice(product);

                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className={`
                      group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all
                      ${isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                      {image ? (
                        <Image
                          src={image}
                          alt={product.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-white dark:bg-gray-800">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {product.title}
                      </h3>
                      {price && (
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mt-1">
                          {price}
                        </p>
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!multiple && (
          <div className={`flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${uiChromeBg.footer}`}>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedId}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ProductField - Custom Puck Field for Product Selection
// ============================================================================

interface ProductFieldProps {
  value?: string; // Product ID
  onChange: (value: string) => void;
  label?: string;
}

export function ProductField({ value, onChange, label }: ProductFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // Load product details when value changes
  useEffect(() => {
    if (!value) {
      setProduct(null);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/shop/products/${value}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.product);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [value]);

  const handleSelect = (selectedProduct: Product) => {
    onChange(selectedProduct.id);
    setProduct(selectedProduct);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setProduct(null);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {loading ? (
        <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
      ) : product ? (
        <div className="relative group flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {product.images?.[0]?.url ? (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
              <Image
                src={product.images[0].url}
                alt={product.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              {product.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ID: {product.id}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={`p-1.5 text-gray-400 hover:text-purple-600 rounded-lg ${hoverBgColors.purple} transition-colors`}
              title="Change product"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className={`p-1.5 text-gray-400 hover:text-red-600 rounded-lg ${hoverBgColors.red} transition-colors`}
              title="Remove product"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Click to select product
          </span>
        </button>
      )}

      <ProductPicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
      />
    </div>
  );
}
