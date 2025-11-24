'use client';

import { useState } from 'react';

// ============================================================================
// Speed Demo Component - Real Redis Caching Demonstration
// ============================================================================
// Shows visitors the real-world difference between cached and uncached
// responses using actual Redis caching. This is NOT a simulation—it's real.
//
// How it works:
// 1. Click the button to fetch a quote
// 2. First click: Data comes from simulated database (~300ms) and gets cached
// 3. Within 30 seconds: Clicks return cached data from Redis (~2ms)
// 4. After 30 seconds: Cache expires, fetches fresh data again
//
// This demonstrates the exact pattern used in production apps.

interface FetchResult {
  time: number;
  isFromCache: boolean;
  quote: string;
  message: string;
  timestamp: string;
}

export default function SpeedDemo() {
  const [results, setResults] = useState<FetchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // Fetch data from the real API with Redis caching
  // ========================================================================
  const handleFetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const startTime = performance.now();

      // Make real API call to /api/demo/speed
      // This endpoint uses Redis caching (30-second TTL)
      const response = await fetch('/api/demo/speed', { method: 'GET' });
      const data = await response.json();

      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);

      const newResult: FetchResult = {
        time: elapsed,
        isFromCache: data.isFromCache,
        quote: data.quote,
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
      };

      setResults((prev) => [newResult, ...prev]);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Fetch error:', err);
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
          Watch Real Caching in Action
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Click the button. First click fetches fresh data from "database" (~300ms). Clicks within 30 seconds load from Redis cache (~2ms). After 30 seconds, cache expires and fetches fresh again.
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
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
      >
        {loading ? 'Fetching...' : 'Fetch Quote (Watch Speed)'}
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
            <p>Click the button above to see caching in action</p>
          </div>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className={`
                p-3 rounded-lg border transition-all
                ${
                  result.isFromCache
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                }
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold uppercase tracking-wide ${
                      result.isFromCache
                        ? 'text-orange-900 dark:text-orange-300'
                        : 'text-green-900 dark:text-green-300'
                    }`}>
                      {result.isFromCache ? '⚡ REDIS CACHE' : '📡 DATABASE'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-gray-100 italic mb-2">
                    "{result.quote}"
                  </p>
                  <p className={`text-xs ${
                    result.isFromCache
                      ? 'text-orange-800 dark:text-orange-200'
                      : 'text-green-800 dark:text-green-200'
                  }`}>
                    {result.message}
                  </p>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className={`text-2xl font-bold tabular-nums ${
                    result.isFromCache
                      ? 'text-orange-900 dark:text-orange-300'
                      : 'text-green-900 dark:text-green-300'
                  }`}>
                    {result.time}ms
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {result.timestamp}
                  </p>
                </div>
              </div>
              {index === 0 && results.length > 1 && (
                <p className="text-xs text-gray-700 dark:text-gray-300 border-t pt-2 border-gray-300 dark:border-gray-600">
                  💡 Tip: Try clicking again within 30 seconds to see the cache hit
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Educational Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            What's Happening:
          </p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>First click:</strong> Fetches fresh data from "database" (~200-300ms)</li>
            <li>• <strong>Subsequent clicks (within 30 seconds):</strong> Returns cached data from Redis (~2ms)</li>
            <li>• <strong>After 30 seconds:</strong> Cache expires and fetches fresh again</li>
          </ul>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This is the cache-first pattern used in production apps. 90% of requests hit the cache, making pages feel instant.
          The 10% that miss the cache trigger a database query and refresh the cache for future requests.
        </p>
      </div>
    </div>
  );
}
