'use client';

import { useState } from 'react';
import StarRating from '@/components/StarRating';
import Button from '@/components/Button';

// ============================================================================
// ReviewForm Component
// ============================================================================
// What: Form for customers to submit product reviews
// Why: Collect customer feedback and ratings
// How: Validates input, submits to API, handles auth redirects

interface ReviewFormProps {
  productId: string;
  onSubmitSuccess?: () => void;
  isAuthenticated?: boolean;
}

export default function ReviewForm({
  productId,
  onSubmitSuccess,
  isAuthenticated = false,
}: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  // ========================================================================
  // Handle form submit
  // ========================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Review title is required');
      return;
    }

    if (!content.trim()) {
      setError('Review content is required');
      return;
    }

    if (!isAuthenticated && !reviewerEmail.trim()) {
      setError('Email is required for anonymous reviews');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          product_id: productId,
          rating,
          title: title.trim(),
          content: content.trim(),
          reviewer_name:
            reviewerName.trim() ||
            (isAuthenticated ? 'Verified Customer' : 'Anonymous'),
          reviewer_email: reviewerEmail.trim() || null,
        }),
      });

      if (response.status === 401) {
        setError('Please log in to submit a review');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        // Handle rate-limited responses (429) with retry-after info
        if (response.status === 429 && data.retryAfter) {
          setRetryAfter(data.retryAfter);
        }
        throw new Error(data.error || 'Failed to submit review');
      }

      // Success
      setSuccess(true);
      setTitle('');
      setContent('');
      setReviewerName('');
      setReviewerEmail('');
      setRating(5);

      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        onSubmitSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Submit failed:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to submit review'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================================
  // Closed state - show button to open form
  // ========================================================================
  if (!isOpen) {
    return (
      <div className="mb-8">
        <Button
          variant="green"
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto"
        >
          Write a Review
        </Button>
      </div>
    );
  }

  // ========================================================================
  // Open form state
  // ========================================================================
  return (
    <div className="mb-8 border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close form"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm font-medium">
              Thank you! Your review has been submitted and is pending approval.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
            {retryAfter && (
              <p className="text-red-600 text-xs mt-2 font-medium">
                You can submit another review in {retryAfter} seconds.
              </p>
            )}
          </div>
        )}

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <StarRating
            value={rating}
            onChange={setRating}
            size="lg"
            color="blue"
            showValue
          />
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="review-title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Review Title *
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Great product, highly recommend!"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-transparent hover:border-gray-400 transition-colors"
            maxLength={255}
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-700 dark:text-gray-200 mt-1">
            {title.length}/255 characters
          </p>
        </div>

        {/* Content */}
        <div>
          <label
            htmlFor="review-content"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Review *
          </label>
          <textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell us what you think about this product..."
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-transparent hover:border-gray-400 transition-colors"
            maxLength={2000}
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-700 dark:text-gray-200 mt-1">
            {content.length}/2000 characters
          </p>
        </div>

        {/* Reviewer Info (for anonymous reviews) */}
        {!isAuthenticated && (
          <>
            <div>
              <label
                htmlFor="review-name"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
              >
                Your Name
              </label>
              <input
                id="review-name"
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Leave blank to submit as Anonymous"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-transparent hover:border-gray-400 transition-colors"
                maxLength={255}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="review-email"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
              >
                Email * (kept private)
              </label>
              <input
                id="review-email"
                type="email"
                value={reviewerEmail}
                onChange={(e) => setReviewerEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-transparent hover:border-gray-400 transition-colors"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-700 dark:text-gray-200 mt-1">
                Your email won't be published and is used to verify your
                identity.
              </p>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="blue"
            disabled={isSubmitting || success}
            className="flex-1 sm:flex-initial"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
          <Button
            type="button"
            variant="gray"
            onClick={() => {
              setIsOpen(false);
              setError(null);
            }}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 pt-2">
          Reviews are moderated and may take 24-48 hours to appear. Reviews
          should be constructive and family-friendly.
        </p>
      </form>
    </div>
  );
}
