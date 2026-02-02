'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import Button from '@/components/Button';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/shop/CategoryFilter';
import EmptyState from '@/components/ui/EmptyState';

interface Product {
  id: string;
  title: string;
  description?: string;
  handle: string;
  images?: { url: string }[];
  variants?: Array<{
    calculated_price?: { calculated_amount: number };
  }>;
}

interface SearchResponse {
  products: Product[];
  count: number;
  total: number;
}

export default function ProductListingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products based on search and filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/products/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to load products. Please check your connection and try again.');
      }

      const data: SearchResponse = await response.json();
      setProducts(data.products);
      setHasSearched(true);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err instanceof Error ? err.message : 'Unable to load products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, minPrice, maxPrice, selectedCategory]);

  // Fetch products on mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  // Handle filter change with debounce
  const handleFilterChange = () => {
    fetchProducts();
  };

  const getProductPrice = (product: Product): number => {
    return (
      product.variants?.[0]?.calculated_price?.calculated_amount ??
      0
    );
  };

  const formatPrice = (cents: number): string => {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Discover Our Products
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Find exactly what you need with our advanced search and filtering
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <label htmlFor="product-search" className="sr-only">Search products</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input
                  id="product-search"
                  type="text"
                  placeholder="Search products by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors duration-200"
                />
              </div>
              <Button
                variant="green"
                type="submit"
                className="px-6"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Category and Price Filters Row */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={(category) => {
                setSelectedCategory(category);
                setHasSearched(true);
              }}
            />

              <button
              id="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-controls="price-filters"
              className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 md:w-auto w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:hover:scale-[1.02]"
            >
              <span className="text-sm font-medium text-gray-700">Price Range</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  showFilters ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Price Filters */}
          {showFilters && (
            <div id="price-filters" className="bg-white border border-gray-200 rounded-lg p-4 mb-6" role="region" aria-labelledby="filter-toggle">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        handleFilterChange();
                      }}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        handleFilterChange();
                      }}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
              {(minPrice || maxPrice || selectedCategory) && (
                <button
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setSelectedCategory('');
                    handleFilterChange();
                  }}
                  className="mt-3 text-sm text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 underline transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded px-2 py-1"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20" role="status" aria-live="polite" aria-label="Loading products">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" aria-hidden="true" />
                <span className="text-gray-600">Loading products...</span>
              </div>
            </div>
          ) : error ? (
            <div role="alert">
              <EmptyState
                icon="search"
                title="Unable to Load Products"
                description={error}
                actionLabel="Try Again"
                actionVariant="blue"
                onAction={() => fetchProducts()}
              />
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={hasSearched ? 'search' : 'folder'}
              title={hasSearched ? 'No Products Found' : 'No Products Available'}
              description={
                hasSearched
                  ? 'We couldn\'t find any products matching your criteria. Try adjusting your search terms or filters.'
                  : 'No products are currently available. Please check back soon!'
              }
              actionLabel={hasSearched ? 'Clear Filters' : 'Back to Shop'}
              actionVariant="blue"
              onAction={
                hasSearched
                  ? () => {
                      setSearchQuery('');
                      setMinPrice('');
                      setMaxPrice('');
                      setShowFilters(false);
                    }
                  : undefined
              }
              actionHref={!hasSearched ? '/shop' : undefined}
            />
          ) : (
            <>
              <div className="mb-6 text-gray-600" role="status" aria-live="polite">
                Showing <span className="font-semibold" aria-label={`${products.length} product${products.length !== 1 ? 's' : ''}`}>{products.length}</span> product
                {products.length !== 1 ? 's' : ''}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const price = getProductPrice(product);
                  return (
                    <div key={product.id} className="h-full">
                      <ProductCard
                        product={product}
                        price={formatPrice(price)}
                        href={`/shop/${product.handle || product.id}`}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
