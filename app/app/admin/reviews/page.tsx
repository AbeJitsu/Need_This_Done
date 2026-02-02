'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { alertColors, statusBadgeColors, containerBg, mutedTextColors, coloredLinkText, accentColors } from '@/lib/colors';

// ============================================================================
// Reviews Moderation Dashboard - /admin/reviews
// ============================================================================
// What: Displays pending product reviews for admin moderation
// Why: Admins need to review and approve/reject customer reviews
// How: Fetches pending reviews, shows product info, and provides action buttons

interface Review {
  id: string;
  product_id: string;
  product?: { title: string; id: string } | null;
  rating: number;
  title: string | null;
  content: string | null;
  reviewer_name: string;
  reviewer_email: string | null;
  is_verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function ReviewsModerationDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

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
  // Fetch reviews
  // ========================================================================
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/reviews?status=${statusFilter}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchReviews();
  }, [isAdmin, fetchReviews]);

  // ========================================================================
  // Filter reviews by status
  // ========================================================================
  useEffect(() => {
    let filtered = reviews;
    setFilteredReviews(filtered);
  }, [reviews]);

  // ========================================================================
  // Approve review
  // ========================================================================
  const handleApprove = async (reviewId: string) => {
    try {
      setActionLoading(reviewId);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'approve',
          id: reviewId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve review');
      }

      // Remove from list or update status
      setReviews(reviews.filter(r => r.id !== reviewId));
      setSelectedReviewId(null);
    } catch (err) {
      console.error('Failed to approve review:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve review');
    } finally {
      setActionLoading(null);
    }
  };

  // ========================================================================
  // Reject review
  // ========================================================================
  const handleReject = async (reviewId: string) => {
    try {
      setActionLoading(reviewId);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'reject',
          id: reviewId,
          rejection_reason: rejectionReason || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject review');
      }

      // Remove from list or update status
      setReviews(reviews.filter(r => r.id !== reviewId));
      setSelectedReviewId(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Failed to reject review:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject review');
    } finally {
      setActionLoading(null);
    }
  };

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
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className={`text-4xl font-bold ${accentColors.blue.text} mb-2`}>
              Review Moderation
            </h1>
            <p className={mutedTextColors.light}>
              Review and approve customer feedback before it appears on product pages
            </p>
          </div>
          <Button
            variant="gray"
            size="sm"
            onClick={() => router.push('/admin/reviews/analytics')}
          >
            View Analytics
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className={`text-3xl font-bold ${accentColors.green.text}`}>
              {reviews.filter(r => r.status === 'pending').length}
            </div>
            <div className={mutedTextColors.light}>Pending Review</div>
          </Card>
          <Card className="p-6">
            <div className={`text-3xl font-bold ${accentColors.blue.text}`}>
              {reviews.filter(r => r.status === 'approved').length}
            </div>
            <div className={mutedTextColors.light}>Approved</div>
          </Card>
          <Card className="p-6">
            <div className={`text-3xl font-bold ${accentColors.purple.text}`}>
              {reviews.filter(r => r.status === 'rejected').length}
            </div>
            <div className={mutedTextColors.light}>Rejected</div>
          </Card>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(
            (status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'blue' : 'gray'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            )
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg ${alertColors.error.bg}`}>
            <p className={alertColors.error.text}>{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className={mutedTextColors.light}>Loading reviews...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredReviews.length === 0 && (
          <Card className="p-12 text-center">
            <p className={mutedTextColors.light}>
              {statusFilter === 'pending'
                ? 'No pending reviews to moderate'
                : `No ${statusFilter} reviews`}
            </p>
          </Card>
        )}

        {/* Reviews list */}
        {!loading && filteredReviews.length > 0 && (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Review content */}
                  <div className="flex-1">
                    {/* Product title */}
                    <div className={`text-sm font-medium ${coloredLinkText.blue} mb-2`}>
                      {review.product?.title || 'Unknown Product'}
                    </div>

                    {/* Rating and verified badge */}
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
                      {review.is_verified_purchase && (
                        <span className={`text-xs font-semibold ${statusBadgeColors.approved.bg}`}>
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>

                    {/* Title and content */}
                    {review.title && (
                      <h3 className={`font-semibold ${accentColors.blue.text} mb-1`}>
                        {review.title}
                      </h3>
                    )}
                    {review.content && (
                      <p className={`${mutedTextColors.light} mb-3 line-clamp-3`}>
                        {review.content}
                      </p>
                    )}

                    {/* Reviewer info */}
                    <div className={`text-xs ${mutedTextColors.light} space-y-1`}>
                      <div>by {review.reviewer_name}</div>
                      {review.reviewer_email && (
                        <div>{review.reviewer_email}</div>
                      )}
                      <div>
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="mt-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          review.status === 'pending'
                            ? statusBadgeColors.pending.bg
                            : review.status === 'approved'
                              ? statusBadgeColors.approved.bg
                              : statusBadgeColors.rejected.bg
                        }`}
                      >
                        {review.status.charAt(0).toUpperCase() +
                          review.status.slice(1)}
                      </span>
                      {review.rejection_reason && (
                        <p className={`text-xs ${alertColors.error.text} mt-2`}>
                          Reason: {review.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons - only for pending reviews */}
                  {review.status === 'pending' && (
                    <div className="flex flex-col gap-2 min-w-max">
                      <Button
                        variant="green"
                        size="sm"
                        onClick={() => handleApprove(review.id)}
                        disabled={actionLoading === review.id}
                      >
                        {actionLoading === review.id ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        variant="gray"
                        size="sm"
                        onClick={() =>
                          setSelectedReviewId(
                            selectedReviewId === review.id
                              ? null
                              : review.id
                          )
                        }
                        disabled={actionLoading === review.id}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                {/* Rejection reason input - shown when rejecting */}
                {selectedReviewId === review.id && review.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className={`block text-sm font-medium ${accentColors.blue.text} mb-2`}>
                      Rejection Reason (optional)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Why are you rejecting this review?"
                      className="w-full p-2 border border-gray-300 rounded text-sm mb-2"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="gray"
                        size="sm"
                        onClick={() => handleReject(review.id)}
                        disabled={actionLoading === review.id}
                      >
                        {actionLoading === review.id
                          ? 'Processing...'
                          : 'Confirm Rejection'}
                      </Button>
                      <Button
                        variant="gray"
                        size="sm"
                        onClick={() => {
                          setSelectedReviewId(null);
                          setRejectionReason('');
                        }}
                        disabled={actionLoading === review.id}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
