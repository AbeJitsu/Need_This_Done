'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import { alertColors, statusBadgeColors, containerBg, mutedTextColors, coloredLinkText, accentColors } from '@/lib/colors';

// ============================================================================
// Review Analytics Dashboard - /admin/reviews/analytics
// ============================================================================
// What: Displays review metrics, rating trends, and product performance
// Why: Admins need insights into customer feedback patterns
// How: Aggregates review data to show trends, distribution, and insights

interface ProductReviewStats {
  product_id: string;
  product_title: string;
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
  pending_count: number;
  rejected_count: number;
  approved_count: number;
}

interface ReviewAnalytics {
  total_reviews: number;
  pending_reviews: number;
  approved_reviews: number;
  average_rating: number;
  products: ProductReviewStats[];
  date_range: {
    start: string;
    end: string;
  };
}

export default function ReviewAnalyticsDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'reviews' | 'rating' | 'pending'>('reviews');

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
  // Fetch analytics
  // ========================================================================
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // For now, use the reviews endpoint to aggregate data
      const response = await fetch('/api/admin/reviews?status=all&limit=1000', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch analytics');
      }

      const data = await response.json();
      const reviews = data.reviews || [];

      // Aggregate analytics
      const productStats = new Map<string, ProductReviewStats>();
      let totalApproved = 0;
      let totalPending = 0;
      let totalRejected = 0;
      let ratingSum = 0;
      let ratingCount = 0;

      reviews.forEach((review: any) => {
        const productId = review.product_id;
        const productTitle = review.product?.title || 'Unknown Product';

        if (!productStats.has(productId)) {
          productStats.set(productId, {
            product_id: productId,
            product_title: productTitle,
            total_reviews: 0,
            average_rating: 0,
            rating_distribution: {
              five: 0,
              four: 0,
              three: 0,
              two: 0,
              one: 0,
            },
            pending_count: 0,
            rejected_count: 0,
            approved_count: 0,
          });
        }

        const stats = productStats.get(productId)!;
        stats.total_reviews += 1;

        // Update rating distribution
        const ratingKey = `${review.rating}` as any;
        if (ratingKey === '5') stats.rating_distribution.five += 1;
        if (ratingKey === '4') stats.rating_distribution.four += 1;
        if (ratingKey === '3') stats.rating_distribution.three += 1;
        if (ratingKey === '2') stats.rating_distribution.two += 1;
        if (ratingKey === '1') stats.rating_distribution.one += 1;

        // Update status counts
        if (review.status === 'approved') {
          stats.approved_count += 1;
          totalApproved += 1;
        } else if (review.status === 'pending') {
          stats.pending_count += 1;
          totalPending += 1;
        } else if (review.status === 'rejected') {
          stats.rejected_count += 1;
          totalRejected += 1;
        }

        ratingSum += review.rating;
        ratingCount += 1;
      });

      // Calculate average ratings for each product
      productStats.forEach((stats) => {
        if (stats.total_reviews > 0) {
          const sum =
            stats.rating_distribution.five * 5 +
            stats.rating_distribution.four * 4 +
            stats.rating_distribution.three * 3 +
            stats.rating_distribution.two * 2 +
            stats.rating_distribution.one * 1;
          stats.average_rating = sum / stats.total_reviews;
        }
      });

      // Sort products by selected criteria
      let sortedProducts = Array.from(productStats.values());
      if (sortBy === 'reviews') {
        sortedProducts.sort((a, b) => b.total_reviews - a.total_reviews);
      } else if (sortBy === 'rating') {
        sortedProducts.sort((a, b) => b.average_rating - a.average_rating);
      } else if (sortBy === 'pending') {
        sortedProducts.sort((a, b) => b.pending_count - a.pending_count);
      }

      setAnalytics({
        total_reviews: reviews.length,
        pending_reviews: totalPending,
        approved_reviews: totalApproved,
        average_rating: ratingCount > 0 ? ratingSum / ratingCount : 0,
        products: sortedProducts,
        date_range: {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          end: new Date().toISOString().split('T')[0],
        },
      });
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAnalytics();
  }, [isAdmin, fetchAnalytics]);

  // ========================================================================
  // Render
  // ========================================================================
  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className={`min-h-screen ${containerBg} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${accentColors.blue.text} mb-2`}>
            Review Analytics
          </h1>
          <p className={mutedTextColors.light}>
            Customer feedback metrics and rating trends
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className={`text-3xl font-bold ${accentColors.green.text}`}>
              {analytics?.total_reviews || 0}
            </div>
            <div className={mutedTextColors.light}>Total Reviews</div>
          </Card>
          <Card className="p-6">
            <div className={`text-3xl font-bold ${accentColors.blue.text}`}>
              {analytics?.approved_reviews || 0}
            </div>
            <div className={mutedTextColors.light}>Published</div>
          </Card>
          <Card className="p-6">
            <div className={`text-3xl font-bold text-yellow-600`}>
              {analytics?.pending_reviews || 0}
            </div>
            <div className={mutedTextColors.light}>Pending Moderation</div>
          </Card>
          <Card className="p-6">
            <div className={`text-3xl font-bold ${accentColors.purple.text}`}>
              {analytics?.average_rating.toFixed(1) || '0.0'}
            </div>
            <div className={mutedTextColors.light}>Avg Rating</div>
          </Card>
        </div>

        {/* Error message */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg ${alertColors.error.bg}`}>
            <p className={alertColors.error.text}>{error}</p>
          </div>
        )}

        {/* Sort buttons */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setSortBy('reviews')}
            className={`px-4 py-2 rounded font-medium transition ${
              sortBy === 'reviews'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            By Review Count
          </button>
          <button
            onClick={() => setSortBy('rating')}
            className={`px-4 py-2 rounded font-medium transition ${
              sortBy === 'rating'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            By Avg Rating
          </button>
          <button
            onClick={() => setSortBy('pending')}
            className={`px-4 py-2 rounded font-medium transition ${
              sortBy === 'pending'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            By Pending Count
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className={mutedTextColors.light}>Loading analytics...</p>
          </div>
        )}

        {/* Products table */}
        {!loading && analytics && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className={`text-left p-4 font-semibold ${accentColors.blue.text}`}>
                    Product
                  </th>
                  <th className={`text-center p-4 font-semibold ${accentColors.blue.text}`}>
                    Reviews
                  </th>
                  <th className={`text-center p-4 font-semibold ${accentColors.blue.text}`}>
                    Avg Rating
                  </th>
                  <th className={`text-center p-4 font-semibold ${accentColors.blue.text}`}>
                    Distribution
                  </th>
                  <th className={`text-center p-4 font-semibold ${accentColors.blue.text}`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.products.map((product) => (
                  <tr key={product.product_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className={`p-4 font-medium ${coloredLinkText.blue}`}>
                      {product.product_title}
                    </td>
                    <td className="text-center p-4">
                      <span className={`font-bold ${accentColors.green.text}`}>
                        {product.total_reviews}
                      </span>
                    </td>
                    <td className="text-center p-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold">{product.average_rating.toFixed(1)}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={
                                star <= Math.round(product.average_rating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="text-center p-4">
                      <div className="flex justify-center gap-1 text-xs">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          5★ {product.rating_distribution.five}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          4★ {product.rating_distribution.four}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          3★ {product.rating_distribution.three}
                        </span>
                      </div>
                    </td>
                    <td className="text-center p-4">
                      <div className="flex justify-center gap-2 text-xs font-semibold">
                        {product.approved_count > 0 && (
                          <span className={statusBadgeColors.approved.bg}>
                            ✓ {product.approved_count}
                          </span>
                        )}
                        {product.pending_count > 0 && (
                          <span className={statusBadgeColors.pending.bg}>
                            ⏳ {product.pending_count}
                          </span>
                        )}
                        {product.rejected_count > 0 && (
                          <span className={statusBadgeColors.rejected.bg}>
                            ✗ {product.rejected_count}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!loading && analytics && analytics.products.length === 0 && (
          <Card className="p-12 text-center">
            <p className={mutedTextColors.light}>No reviews yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}
