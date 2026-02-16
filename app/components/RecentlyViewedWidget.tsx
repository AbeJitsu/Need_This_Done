'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBrowsingHistory } from '@/context/BrowsingHistoryContext';
import Button from '@/components/Button';
import { headingColors, formInputColors } from '@/lib/colors';

// ============================================================================
// RECENTLY VIEWED WIDGET
// ============================================================================
// What: Compact display of recently viewed products
// Why: Helps users quickly revisit products they browsed
// How: Shows up to 3 most recent products with preview

export default function RecentlyViewedWidget() {
  const { viewedProducts, isLoading } = useBrowsingHistory();

  // Get the 3 most recent products
  const recentItems = useMemo(() => viewedProducts.slice(0, 3), [viewedProducts]);

  if (isLoading || recentItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6 md:p-8">
      <h3 className={`text-xl font-bold ${headingColors.primary} mb-4 flex items-center gap-2`}>
        <span>👀</span> Recently Viewed
      </h3>

      <div className="grid gap-4 mb-6">
        {recentItems.map((item) => (
          <Link
            key={item.product_id}
            href={`/shop/${item.product_id}`}
            className="flex items-center gap-4 p-3 rounded-lg bg-white hover:bg-gray-50 transition border border-gray-200 hover:border-blue-300"
          >
            {item.image && (
              <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-200">
                <Image
                  src={item.image}
                  alt={item.title || 'Product'}
                  width={64}
                  unoptimized
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`${headingColors.primary} font-semibold text-sm truncate`}>
                {item.title || `Product ${item.product_id.slice(0, 8)}`}
              </p>
              <p className={`${formInputColors.helper} text-xs`}>
                View product →
              </p>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/recently-viewed" className="block">
        <Button variant="blue" className="w-full">
          View All ({viewedProducts.length})
        </Button>
      </Link>
    </div>
  );
}
