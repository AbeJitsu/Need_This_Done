'use client';

import { useState, useEffect } from 'react';
import ReviewCard from '@/components/ReviewCard';
import StarRating from '@/components/StarRating';

// ============================================================================
// ReviewSection Component
// ============================================================================
// What: Display product reviews and rating summary
// Why: Customers need social proof to make purchasing decisions
// How: Fetches reviews from API, displays rating stats and individual reviews

interface Review {
  id: string;
  product_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  reviewer_name: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  images?: string[];
}

interface RatingStats {
  product_id: string;
  total_reviews: number;
  average_rating: number;
  distribution: {
    [key: string]: number;
  };
  verified_purchases: number;
}

interface ReviewSectionProps {
  productId: string;
  onReviewsLoaded?: (count: number) => void;
}

export default function ReviewSection({
  productId,
  onReviewsLoaded,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // Load reviews and rating stats
  // ========================================================================
  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/reviews?product_id=${encodeURIComponent(productId)}`
        );

        if (!response.ok) {
          throw new Error('Failed to load reviews');
        }

        const data = await response.json();
        const loadedReviews = data.reviews || [];
        setReviews(loadedReviews);
        onReviewsLoaded?.(loadedReviews.length);

        // Extract stats from first review or compute it
        if (data.reviews && data.reviews.length > 0) {
          // Compute stats from reviews
          const allReviews = data.reviews;
          const totalReviews = allReviews.length;
          const avgRating =
            allReviews.reduce(
              (sum: number, r: Review) => sum + r.rating,
              0
            ) / totalReviews;

          const distribution = {
            '5': allReviews.filter((r: Review) => r.rating === 5).length,
            '4': allReviews.filter((r: Review) => r.rating === 4).length,
            '3': allReviews.filter((r: Review) => r.rating === 3).length,
            '2': allReviews.filter((r: Review) => r.rating === 2).length,
            '1': allReviews.filter((r: Review) => r.rating === 1).length,
          };

          const verifiedCount = allReviews.filter(
            (r: Review) => r.is_verified_purchase
          ).length;

          setStats({
            product_id: productId,
            total_reviews: totalReviews,
            average_rating: Math.round(avgRating * 10) / 10,
            distribution,
            verified_purchases: verifiedCount,
          });
        } else {
          setStats({
            product_id: productId,
            total_reviews: 0,
            average_rating: 0,
            distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
            verified_purchases: 0,
          });
        }
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [productId, onReviewsLoaded]);

  // ========================================================================
  // Handle review votes
  // ========================================================================
  const handleVote = async (
    reviewId: string,
    voteType: 'helpful' | 'not_helpful'
  ) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vote',
          review_id: reviewId,
          vote_type: voteType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  // ========================================================================
  // Handle review reported
  // ========================================================================
  const handleReportReview = async (reviewId: string) => {
    const reason = prompt(
      'Why are you reporting this review?\n\n- spam\n- inappropriate\n- fake\n- other'
    );

    if (!reason) return;

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report',
          review_id: reviewId,
          reason: reason.toLowerCase(),
          details: `User reported via product page`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to report review');
      }

      alert('Thank you for reporting. Our team will review it shortly.');
    } catch (err) {
      console.error('Report failed:', err);
      alert('Failed to report. Please try again later.');
    }
  };

  // ========================================================================
  // Handle new review submitted - reload reviews when parent calls it
  // ========================================================================
  // Reviews are reloaded via useEffect when component mounts with new key

  // ========================================================================
  // Loading state
  // ========================================================================
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Hide entire section when there are no reviews
  if (!loading && reviews.length === 0) {
    return null;
  }

  // ========================================================================
  // Render reviews section
  // ========================================================================
  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      {stats && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Customer Reviews
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="mb-3">
                <StarRating
                  value={stats.average_rating}
                  readonly
                  showValue
                  size="lg"
                  color="blue"
                  className="justify-center"
                />
              </div>
              <p className="text-gray-600 text-sm">
                Based on {stats.total_reviews}{' '}
                {stats.total_reviews === 1 ? 'review' : 'reviews'}
              </p>
              {stats.verified_purchases > 0 && (
                <p className="text-gray-500 text-xs mt-1">
                  {stats.verified_purchases} verified{' '}
                  {stats.verified_purchases === 1 ? 'purchase' : 'purchases'}
                </p>
              )}
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-2">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = stats.distribution[String(stars)] || 0;
                  const percentage =
                    stats.total_reviews > 0
                      ? (count / stats.total_reviews) * 100
                      : 0;

                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-12">
                        {stars} star{stars > 1 ? 's' : ''}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Reviews
          </h3>
          <div className="space-y-4">
            {reviews.slice(0, 10).map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onVote={handleVote}
                onReport={handleReportReview}
                color="blue"
                showActions
              />
            ))}
          </div>

          {reviews.length > 10 && (
            <div className="mt-6 text-center text-gray-600 text-sm">
              Showing 10 of {reviews.length} reviews
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No reviews yet. Be the first to share your experience!
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
