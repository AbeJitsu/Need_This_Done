'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from './Card';
import { headingColors, formInputColors, accentColors } from '@/lib/colors';

// ============================================================================
// ProductRecommendations Component
// ============================================================================
// What: Displays product recommendations in various formats
// Why: Increase conversions through relevant product suggestions
// How: Fetches recommendations from API, displays as grid or carousel

type RecommendationType = 'popular' | 'trending' | 'personalized' | 'related' | 'bought_together';
type AccentColor = 'blue' | 'green' | 'purple';

interface Recommendation {
  product_id: string;
  score: number;
  reason: string;
}

export interface ProductRecommendationsProps {
  type?: RecommendationType;
  productId?: string;
  limit?: number;
  title?: string;
  color?: AccentColor;
  layout?: 'grid' | 'row';
}

export default function ProductRecommendations({
  type = 'popular',
  productId,
  limit = 4,
  title,
  color = 'blue',
  layout = 'grid',
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default titles based on type
  const defaultTitles: Record<RecommendationType, string> = {
    popular: 'Popular Products',
    trending: 'Trending Now',
    personalized: 'Recommended for You',
    related: 'You Might Also Like',
    bought_together: 'Frequently Bought Together',
  };

  const displayTitle = title || defaultTitles[type];
  const colors = accentColors[color];

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          type,
          limit: String(limit),
        });

        if (productId) {
          params.append('product_id', productId);
        }

        const response = await fetch(`/api/recommendations?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch recommendations');
        }

        setRecommendations(data.recommendations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [type, productId, limit]);

  // Don't render if no recommendations and not loading
  if (!isLoading && recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8" data-testid="product-recommendations">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${headingColors.primary}`}>
          {displayTitle}
        </h2>
        <Link
          href="/shop"
          className={`text-sm font-medium ${colors.text} ${colors.hoverText}`}
        >
          View All →
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          className={`grid gap-4 ${
            layout === 'grid'
              ? 'grid-cols-2 md:grid-cols-4'
              : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
          }`}
        >
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} hoverEffect="none">
              <div className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-40 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`text-center py-8 ${formInputColors.helper}`}>
          <p>Unable to load recommendations</p>
        </div>
      )}

      {/* Recommendations Grid */}
      {!isLoading && !error && recommendations.length > 0 && (
        <div
          className={`grid gap-4 ${
            layout === 'grid'
              ? 'grid-cols-2 md:grid-cols-4'
              : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
          }`}
        >
          {recommendations.map((rec) => (
            <Link
              key={rec.product_id}
              href={`/shop/${rec.product_id}`}
              className="group"
            >
              <Card hoverEffect="lift">
                {/* Placeholder image - in real implementation, fetch product details */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 h-40 rounded-t-lg flex items-center justify-center">
                  <span className="text-4xl opacity-50">📦</span>
                </div>
                <div className="p-4">
                  <p className={`font-medium ${headingColors.primary} truncate`}>
                    Product {rec.product_id.slice(0, 8)}
                  </p>
                  <p className={`text-sm ${formInputColors.helper} truncate`}>
                    {rec.reason}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
