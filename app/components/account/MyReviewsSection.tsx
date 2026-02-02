'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { alertColors, statusBadgeColors, headingColors, mutedTextColors, coloredLinkText } from '@/lib/colors';

// ============================================================================
// My Reviews Section - Shows user's submitted product reviews
// ============================================================================

interface UserReview {
  id: string;
  product_id: string;
  product?: { title: string; id: string } | null;
  rating: number;
  title: string | null;
  content: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export default function MyReviewsSection() {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // ========================================================================
  // Fetch user's reviews
  // ========================================================================
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError('');

        const session = await getSession();
        if (!session?.access_token) {
          setLoading(false);
          return;
        }

        // Fetch all reviews and filter by current user
        const response = await fetch('/api/reviews?status=all&limit=1000', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const data = await response.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error('Failed to load reviews:', err);
        setError('Failed to load your reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // ========================================================================
  // Delete review (only pending reviews)
  // ========================================================================
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(reviewId);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/reviews?id=${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete review');
      }

      // Remove from list
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('Failed to delete review:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    } finally {
      setDeleteLoading(null);
    }
  };

  // ========================================================================
  // Render
  // ========================================================================

  if (loading) {
    return (
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h2 className={`text-2xl font-bold ${headingColors.primary} mb-4`}>
          My Reviews
        </h2>
        <p className={mutedTextColors.normal}>Loading your reviews...</p>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h2 className={`text-2xl font-bold ${headingColors.primary} mb-4`}>
        My Reviews
      </h2>

      {error && (
        <div className={`mb-4 p-4 rounded-lg ${alertColors.error.bg}`}>
          <p className={alertColors.error.text}>{error}</p>
        </div>
      )}

      {reviews.length === 0 ? (
        <Card className="p-6 text-center">
          <p className={mutedTextColors.normal}>
            You haven't submitted any reviews yet. Start reviewing products you've purchased!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Review content */}
                <div className="flex-1">
                  {/* Product title */}
                  <div className={`text-sm font-medium ${coloredLinkText.blue} mb-2`}>
                    {review.product?.title || 'Unknown Product'}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= review.rating
                              ? 'text-yellow-400 text-lg'
                              : 'text-gray-300 text-lg'
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-semibold">{review.rating}/5</span>
                  </div>

                  {/* Title and content */}
                  {review.title && (
                    <h3 className={`font-semibold ${headingColors.primary} mb-1`}>
                      {review.title}
                    </h3>
                  )}
                  {review.content && (
                    <p className={`${mutedTextColors.normal} mb-3 line-clamp-2`}>
                      {review.content}
                    </p>
                  )}

                  {/* Status badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        review.status === 'pending'
                          ? statusBadgeColors.pending.bg
                          : review.status === 'approved'
                            ? statusBadgeColors.published.bg
                            : statusBadgeColors.rejected.bg
                      }`}
                    >
                      {review.status === 'pending' && '⏳ Pending Approval'}
                      {review.status === 'approved' && '✓ Published'}
                      {review.status === 'rejected' && '✗ Rejected'}
                    </span>

                    {review.rejection_reason && (
                      <span className={`text-xs ${alertColors.error.text}`}>
                        {review.rejection_reason}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div className={`text-xs ${mutedTextColors.normal}`}>
                    Submitted {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions - only for pending reviews */}
                {review.status === 'pending' && (
                  <Button
                    variant="gray"
                    size="sm"
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deleteLoading === review.id}
                  >
                    {deleteLoading === review.id ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info box */}
      <Card className="mt-4 p-4 bg-blue-50 border border-blue-100">
        <p className={`text-sm ${mutedTextColors.normal}`}>
          <strong>ℹ️ How reviews work:</strong> When you submit a review, it goes through
          moderation before being published. You'll see your review status here, and we'll
          notify you by email when it's approved.
        </p>
      </Card>
    </div>
  );
}
