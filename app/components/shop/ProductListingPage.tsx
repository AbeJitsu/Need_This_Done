'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import Button from '@/components/Button';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/shop/CategoryFilter';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import RecentlyViewedWidget from '@/components/RecentlyViewedWidget';

interface Product {
  id: string;
  title: string;
  description?: string;
  handle: string;
  images?: { url: string }[];
  metadata?: Record<string, unknown>;
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
      {/* Dark Editorial Hero Section */}
      <section className="pt-8 md:pt-12 pb-4">
        <div className="relative overflow-hidden py-12 md:py-16 md:max-w-6xl md:mx-auto md:rounded-3xl">
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

          {/* Decorative glow orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 px-6 sm:px-8 md:px-12">
            <FadeIn direction="up" triggerOnScroll={false}>
              {/* Accent line + label */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-purple-400" />
                <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Shop</span>
              </div>

              {/* Dramatic heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[0.95] mb-4">
                Browse &amp; Build.
              </h1>

              <p className="text-xl text-slate-400 max-w-xl leading-relaxed mb-8">
                Find exactly what you need for your next project
              </p>
            </FadeIn>

            {/* Search Form - styled for dark background */}
            <form onSubmit={handleSearch} className="mb-6">
              <label htmlFor="product-search" className="sr-only">Search products</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" aria-hidden="true" />
                  <input
                    id="product-search"
                    type="text"
                    placeholder="Search products by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl text-white placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:border-emerald-400/50 transition-colors duration-200"
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

            {/* Category and Price Filters Row - styled for dark background */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={(category) => {
                  setSelectedCategory(category);
                  setHasSearched(true);
                }}
                variant="dark"
              />

              <button
                id="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-controls="price-filters"
                className="flex items-center justify-between gap-2 px-4 py-2 border border-white/10 rounded-lg bg-white/10 text-white hover:border-emerald-400 hover:bg-white/15 transition-all duration-200 md:w-auto w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-safe:hover:scale-[1.02]"
              >
                <span className="text-sm font-medium">Price Range</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    showFilters ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Price Filters - styled for dark background */}
            {showFilters && (
              <div id="price-filters" className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-6" role="region" aria-labelledby="filter-toggle">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="min-price" className="block text-sm font-medium text-white mb-2">
                      Min Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400" aria-hidden="true">$</span>
                      <input
                        type="number"
                        id="min-price"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => {
                          setMinPrice(e.target.value);
                          handleFilterChange();
                        }}
                        aria-label="Minimum product price"
                        className="w-full pl-8 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:border-emerald-400/50 transition-colors duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="max-price" className="block text-sm font-medium text-white mb-2">
                      Max Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400" aria-hidden="true">$</span>
                      <input
                        type="number"
                        id="max-price"
                        placeholder="No limit"
                        value={maxPrice}
                        onChange={(e) => {
                          setMaxPrice(e.target.value);
                          handleFilterChange();
                        }}
                        aria-label="Maximum product price"
                        className="w-full pl-8 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:border-emerald-400/50 transition-colors duration-200"
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
                    className="mt-3 text-sm text-slate-400 hover:text-emerald-400 underline transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-2 py-1"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recently Viewed Widget */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <RecentlyViewedWidget />
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-live="polite" aria-label="Loading products, please wait">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
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

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const price = getProductPrice(product);
                  return (
                    <StaggerItem key={product.id} className="h-full">
                      <ProductCard
                        product={product}
                        price={formatPrice(price)}
                        priceCents={price}
                        href={`/shop/${product.handle || product.id}`}
                      />
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
