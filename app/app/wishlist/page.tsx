'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import { headingColors, formInputColors, focusRingClasses } from '@/lib/colors';

// ============================================================================
// Wishlist Page - /wishlist
// ============================================================================
// What: Display and manage saved products
// Why: Users want to save products for later or share wishlists
// How: Shows all wishlist items with remove/cart actions

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, isLoading, removeFromWishlist, error: contextError } = useWishlist();
  const [removingId, setRemovingId] = useState<string | null>(null);

  // ========================================================================
  // Auth protection - redirect non-authenticated users
  // ========================================================================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // ========================================================================
  // Handle remove from wishlist with error handling
  // ========================================================================
  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      setRemovingId(productId);
      await removeFromWishlist(productId);
    } catch (err) {
      // Error is displayed below via contextError
    } finally {
      setRemovingId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <PageHeader
          title="My Wishlist"
          description="Loading your saved items..."
        />
      </div>
    );
  }

  // ========================================================================
  // Empty state
  // ========================================================================
  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <PageHeader
          title="My Wishlist"
          description="You haven't saved any items yet"
        />

        <div className="mt-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-8 md:p-12">
          <div className="max-w-md mx-auto text-center">
            <div className="text-6xl mb-4">🤍</div>
            <h2 className={`text-2xl font-bold ${headingColors.primary} mb-3`}>
              Start Building Your Wishlist
            </h2>
            <p className={`${formInputColors.helper} mb-6 leading-relaxed`}>
              Save products you love to your wishlist. Come back anytime to review your saved items or add them to your cart.
            </p>
            <Link href="/pricing">
              <Button variant="purple" size="lg" className="w-full">
                Browse Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // Wishlist content
  // ========================================================================
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">
      {/* Error display */}
      {contextError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{contextError}</p>
        </div>
      )}

      <PageHeader
        title="My Wishlist"
        description={`${items.length} item${items.length !== 1 ? 's' : ''} saved`}
      />

      <div className="mt-8 grid gap-6">
        {items.map((item) => (
          <Card key={item.product_id} className="flex items-center justify-between p-6 hover:shadow-lg transition">
            {/* Item info */}
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${headingColors.primary} mb-2`}>
                {item.title || `Product ${item.product_id.slice(0, 8)}`}
              </h3>
              <div className="flex items-center gap-4 flex-wrap">
                <p className={`text-sm ${formInputColors.helper}`}>
                  Saved {formatDate(item.added_at)}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-4 sm:mt-0 flex-col sm:flex-row">
              <Link href={`/shop/${item.product_id}`}>
                <Button
                  variant="blue"
                  size="sm"
                >
                  View Item
                </Button>
              </Link>
              <button
                onClick={() => handleRemoveFromWishlist(item.product_id)}
                disabled={removingId === item.product_id}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  removingId === item.product_id
                    ? 'bg-red-100 text-red-400 border border-red-200 cursor-not-allowed'
                    : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                } ${focusRingClasses.blue}`}
              >
                {removingId === item.product_id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Continue shopping */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
        <p className={`${formInputColors.helper} mb-4`}>
          Interested in more? Continue browsing our services.
        </p>
        <Link href="/pricing">
          <Button variant="purple">
            Browse All Services
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ========================================================================
// Helper: Format date
// ========================================================================
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return date.toLocaleDateString();
}
