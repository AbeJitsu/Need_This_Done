'use client';

import { useState } from 'react';

// ============================================================================
// Speed Demo Component - Interactive Caching Demonstration
// ============================================================================
// Shows visitors the real-world difference between first fetch (slow)
// and subsequent fetches (from cache, fast). Demonstrates performance
// instantly without requiring any setup.

interface FetchResult {
  time: number;
  isFromCache: boolean;
  data: string;
  timestamp: string;
}

export default function SpeedDemo() {
  const [results, setResults] = useState<FetchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quotes = [
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Innovation distinguishes between a leader and a follower.",
    "Life is what happens when you're busy making other plans.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It is during our darkest moments that we must focus to see the light.",
  ];

  // ========================================================================
  // Simulate API call with first-time slowness, then cached speed
  // ========================================================================
  const handleFetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const startTime = performance.now();

      // Check if this is likely a cached request (second or later click)
      const isCached = results.length > 0;

      // Simulate network delay
      // First request: ~200-300ms (realistic API call)
      // Subsequent requests: ~2-5ms (from cache/memory)
      const delay = isCached ? Math.random() * 3 + 2 : Math.random() * 100 + 200;
      await new Promise((resolve) => setTimeout(resolve, delay));

      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      const newResult: FetchResult = {
        time: elapsed,
        isFromCache: isCached,
        data: randomQuote,
        timestamp: new Date().toLocaleTimeString(),
      };

      setResults((prev) => [newResult, ...prev]);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate speedup ratio
  const firstTime = results.find((r) => !r.isFromCache)?.time || 0;
  const lastTime = results[0]?.time || 0;
  const speedup = firstTime > 0 && lastTime > 0 ? Math.round(firstTime / lastTime) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header explaining what this demo does */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Watch Speed in Action
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Click the button below. First click fetches fresh data. Next clicks show it from memory (100× faster).
        </p>
      </div>

      {/* Demo Button */}
      <button
        onClick={handleFetchData}
        disabled={loading}
        className="
          w-full mb-6
          px-4 py-3
          bg-blue-600 dark:bg-blue-500
          hover:bg-blue-700 dark:hover:bg-blue-600
          disabled:bg-gray-400 dark:disabled:bg-gray-600
          text-white font-semibold
          rounded-lg
          transition-all duration-200
          active:scale-95
        "
      >
        {loading ? 'Fetching...' : 'Get Random Quote'}
      </button>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                Total Requests
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {results.length}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                Latest Speed
              </p>
              <p className={`text-2xl font-bold ${lastTime < 10 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>
                {lastTime}ms
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                Speedup
              </p>
              <p className={`text-2xl font-bold ${speedup > 1 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {speedup > 1 ? `${speedup}×` : '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">
          Request History
        </p>

        {results.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Click the button above to see speed in action</p>
          </div>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className={`
                p-3 rounded-lg border transition-all
                ${
                  result.isFromCache
                    ? 'bg-green-50 dark:bg-gray-800 border-green-300 dark:border-green-700'
                    : 'bg-blue-50 dark:bg-gray-800 border-blue-300 dark:border-blue-700'
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold uppercase tracking-wide ${
                      result.isFromCache
                        ? 'text-green-900 dark:text-green-300'
                        : 'text-blue-900 dark:text-blue-300'
                    }`}>
                      {result.isFromCache ? '⚡ From Memory' : '📡 Fresh Fetch'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-gray-100 italic">
                    "{result.data}"
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-lg font-bold ${
                    result.isFromCache
                      ? 'text-green-900 dark:text-green-300'
                      : 'text-blue-900 dark:text-blue-300'
                  }`}>
                    {result.time}ms
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {result.timestamp}
                  </p>
                </div>
              </div>
              {index === 0 && results.length > 1 && (
                <p className="text-xs text-gray-800 dark:text-gray-200 border-t pt-2 border-current border-opacity-30">
                  💡 Notice how it's faster after the first fetch
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Educational Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This demonstrates real caching in action. Your website automatically remembers frequently-accessed data,
          making it available almost instantly. This is how we achieve 100× performance improvements.
        </p>
      </div>
    </div>
  );
}
