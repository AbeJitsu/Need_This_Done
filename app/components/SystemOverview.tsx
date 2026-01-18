'use client';

import { useEffect, useState } from 'react';
import { uiChromeBg, statusIndicatorBg, cardBgColors, cardBorderColors } from '@/lib/colors';

// ============================================================================
// SystemOverview Component - Friendly System Health at a Glance
// ============================================================================
// What: Shows if everything is working, in plain language
// Why: Admins need confidence that the system is healthy, explained in plain language
// How: Simple status message with optional details for the curious

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  services: {
    redis: 'up' | 'down' | 'error';
    supabase: 'up' | 'down' | 'error';
    medusa?: 'up' | 'down' | 'error' | 'unknown';
    app: 'up' | 'down' | 'error';
  };
}

// Friendly names and descriptions for each service
const serviceInfo = {
  app: {
    name: 'Website',
    healthy: 'Your site is live and responding',
    unhealthy: 'Website may be slow or unresponsive',
  },
  redis: {
    name: 'Speed Boost',
    healthy: 'Pages are loading fast',
    unhealthy: 'Pages may load slower than usual',
  },
  supabase: {
    name: 'Database',
    healthy: 'User data is safe and accessible',
    unhealthy: 'Having trouble accessing stored data',
  },
  medusa: {
    name: 'Shop',
    healthy: 'Products and cart are ready',
    unhealthy: 'Shop features may be limited',
  },
};

export default function SystemOverview() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // ========================================================================
  // Fetch Health Status
  // ========================================================================
  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
      setLastChecked(new Date());
    } catch {
      setHealth({
        status: 'unhealthy',
        services: { redis: 'error', supabase: 'error', app: 'error' },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  // ========================================================================
  // Loading State
  // ========================================================================
  if (loading) {
    return (
      <div className={`${cardBgColors.base} rounded-xl ${cardBorderColors.light} p-6`}>
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full ${statusIndicatorBg.loading} flex items-center justify-center`}>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <span className="text-gray-600 dark:text-gray-300">Checking systems...</span>
        </div>
      </div>
    );
  }

  if (!health) return null;

  // ========================================================================
  // Calculate Status
  // ========================================================================
  const isHealthy = health.status === 'healthy';
  const services = [
    { key: 'app', status: health.services.app },
    { key: 'redis', status: health.services.redis },
    { key: 'supabase', status: health.services.supabase },
    { key: 'medusa', status: health.services.medusa || 'unknown' },
  ] as const;

  const healthyCount = services.filter(
    (s) => s.status === 'up' || s.status === 'unknown'
  ).length;

  // ========================================================================
  // Render
  // ========================================================================
  return (
    <div className={`${cardBgColors.base} rounded-xl ${cardBorderColors.light} overflow-hidden`}>
      {/* Main Status - The only thing you need to see at a glance */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Status Icon */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isHealthy
                  ? statusIndicatorBg.healthy
                  : statusIndicatorBg.warning
              }`}
            >
              {isHealthy ? (
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-gold-600 dark:text-gold-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
            </div>

            {/* Status Message */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {isHealthy ? 'Everything looks good' : 'Something needs attention'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {isHealthy
                  ? 'All systems are running smoothly'
                  : `${healthyCount} of ${services.length} services are healthy`}
              </p>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchHealth}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2"
            title="Refresh status"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Expandable Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          {showDetails ? 'Hide details' : 'Show details'}
          <svg
            className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expandable Details Section */}
      {showDetails && (
        <div className={`border-t border-gray-400 dark:border-gray-700 ${uiChromeBg.panel} p-4`}>
          <div className="grid sm:grid-cols-2 gap-3">
            {services.map(({ key, status }) => {
              const info = serviceInfo[key as keyof typeof serviceInfo];
              const isUp = status === 'up' || status === 'unknown';

              return (
                <div
                  key={key}
                  className={`p-3 rounded-lg border ${
                    isUp
                      ? `${cardBgColors.base} border-gray-400 dark:border-gray-700`
                      : `${statusIndicatorBg.warning} border-gold-200 dark:border-gold-600`
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isUp ? 'bg-green-500' : 'bg-gold-500'
                      }`}
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {info.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    {isUp ? info.healthy : info.unhealthy}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Last Checked */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            Last checked {lastChecked?.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
