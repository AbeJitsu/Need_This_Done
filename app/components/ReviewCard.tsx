'use client';

import { useState, useCallback } from 'react';
import StarRating from './StarRating';
import { accentColors, alertColors } from '@/lib/colors';

// ============================================================================
// ReviewCard Component
// ============================================================================
// What: Display a single customer review with voting and reporting
// Why: Social proof for potential customers
// How: Shows rating, content, helpful votes, and actions

type AccentColor = 'blue' | 'green' | 'purple';

export interface Review {
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

export interface ReviewCardProps {
  review: Review;
  onVote?: (reviewId: string, voteType: 'helpful' | 'not_helpful') => Promise<void>;
  onReport?: (reviewId: string) => void;
  color?: AccentColor;
  showActions?: boolean;
  className?: string;
}

export default function ReviewCard({
  review,
  onVote,
  onReport,
  color = 'blue',
  showActions = true,
  className = '',
}: ReviewCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [voted, setVoted] = useState<'helpful' | 'not_helpful' | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const colors = accentColors[color];

  const handleVote = useCallback(async (voteType: 'helpful' | 'not_helpful') => {
    if (isVoting || !onVote) return;

    setIsVoting(true);
    try {
      await onVote(review.id, voteType);

      // Update local state
      if (voted === voteType) {
        // Unvoting
        setVoted(null);
        if (voteType === 'helpful') {
          setHelpfulCount(prev => prev - 1);
        }
      } else {
        // New vote or changing vote
        if (voted === 'helpful' && voteType !== 'helpful') {
          setHelpfulCount(prev => prev - 1);
        } else if (voteType === 'helpful') {
          setHelpfulCount(prev => prev + 1);
        }
        setVoted(voteType);
      }
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setIsVoting(false);
    }
  }, [isVoting, onVote, review.id, voted]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className={`
        p-4 rounded-lg border
        border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        ${className}
      `}
      data-testid="review-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Rating */}
          <div className="flex items-center gap-2 mb-1">
            <StarRating value={review.rating} readonly size="sm" color={color} />
            {review.is_verified_purchase && (
              <span className={`
                text-xs font-medium px-2 py-0.5 rounded-full
                ${alertColors.success.bg} ${alertColors.success.text}
              `}>
                Verified Purchase
              </span>
            )}
          </div>

          {/* Title */}
          {review.title && (
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              {review.title}
            </h4>
          )}

          {/* Reviewer info */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By {review.reviewer_name || 'Anonymous'} • {formatDate(review.created_at)}
          </p>
        </div>
      </div>

      {/* Content */}
      {review.content && (
        <p className="mt-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {review.content}
        </p>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4">
          {/* Helpful button */}
          <button
            type="button"
            onClick={() => handleVote('helpful')}
            disabled={isVoting}
            className={`
              flex items-center gap-1.5 text-sm
              ${voted === 'helpful'
                ? `${colors.text} font-medium`
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
              disabled:opacity-50
              transition-colors
            `}
            aria-pressed={voted === 'helpful'}
          >
            <svg
              className="w-4 h-4"
              fill={voted === 'helpful' ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            Helpful ({helpfulCount})
          </button>

          {/* Report button */}
          {onReport && (
            <button
              type="button"
              onClick={() => onReport(review.id)}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Report
            </button>
          )}
        </div>
      )}
    </div>
  );
}
