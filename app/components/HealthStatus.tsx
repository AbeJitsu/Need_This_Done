'use client';

import { useEffect, useState } from 'react';
import { alertColors, neutralAccentBg } from '@/lib/colors';

// ============================================================================
// HealthStatus Component - Premium Semantic Status Display
// ============================================================================
// Displays live service health with semantic color meanings:
// - Green: Service is up and operational
// - Red: Service is down or critical error
// - Yellow: Service has warnings or errors (degraded)
// Fetches from /api/health endpoint and auto-refreshes every 30 seconds

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    redis: 'up' | 'down' | 'error';
    supabase: 'up' | 'down' | 'error';
    medusa?: 'up' | 'down' | 'error' | 'unknown';
    app: 'up' | 'down' | 'error';
  };
}

export default function HealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ========================================================================
  // Fetch Health Status
  // ========================================================================
  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch health status:', error);
      setHealth({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          redis: 'error',
          supabase: 'error',
          app: 'error',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // Effects: Fetch on Mount
  // ========================================================================
  useEffect(() => {
    fetchHealth();
  }, []);

  // ========================================================================
  // Helper: Semantic Status Configuration
  // ========================================================================
  // Each status type has specific colors, backgrounds, and text
  const getStatusConfig = (service: 'up' | 'down' | 'error') => {
    switch (service) {
      case 'up':
        return {
          bg: alertColors.success.bg,
          border: alertColors.success.border,
          badgeBg: 'bg-green-600',
          badgeText: alertColors.success.text,
          statusText: alertColors.success.text,
          label: 'Operational',
        };
      case 'down':
        return {
          bg: alertColors.error.bg,
          border: alertColors.error.border,
          badgeBg: 'bg-red-600',
          badgeText: alertColors.error.text,
          statusText: alertColors.error.text,
          label: 'Down',
        };
      case 'error':
        return {
          bg: alertColors.warning.bg,
          border: alertColors.warning.border,
          badgeBg: 'bg-gold-600',
          badgeText: alertColors.warning.text,
          statusText: alertColors.warning.text,
          label: 'Error',
        };
      default:
        return {
          bg: neutralAccentBg.gray,
          border: 'border-gray-200 dark:border-gray-700',
          badgeBg: 'bg-gray-600',
          badgeText: 'text-gray-900 dark:text-gray-100',
          statusText: 'text-gray-700 dark:text-gray-300',
          label: 'Unknown',
        };
    }
  };

  // ========================================================================
  // Helper: Format Timestamp
  // ========================================================================
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  // ========================================================================
  // Loading State
  // ========================================================================
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
        </div>
        <p className="text-gray-600">Checking services...</p>
      </div>
    );
  }

  // ========================================================================
  // Error State
  // ========================================================================
  if (!health) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">System Status</h2>
        <p className="text-gray-600">Unable to fetch service status</p>
      </div>
    );
  }

  // ========================================================================
  // Render: Premium Service Status Display
  // ========================================================================
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header with Overall Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              health.status === 'healthy' ? 'bg-green-600' : 'bg-red-600'
            }`}
          />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Status</h2>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              health.status === 'healthy'
                ? 'bg-green-100 dark:bg-gray-800 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-gray-800 text-red-700 dark:text-red-300'
            }`}
          >
            {health.status === 'healthy' ? 'All Operational' : 'Issues Detected'}
          </span>
          <button
            onClick={fetchHealth}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2"
            title="Refresh status"
            aria-label="Refresh status"
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
      </div>

      {/* Service Status Cards Grid */}
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        {/* Speed System (Redis) - Makes pages load fast */}
        {renderServiceCard('Speed System', health.services.redis, getStatusConfig)}

        {/* Database (Supabase) - Stores data safely */}
        {renderServiceCard('Database', health.services.supabase, getStatusConfig)}

        {/* Your Website (App) - The code running now */}
        {renderServiceCard('Your Website', health.services.app, getStatusConfig)}
      </div>

      {/* Footer: Last Updated Info */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Last checked: {lastUpdated ? formatTime(health.timestamp) : 'Never'}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Helper Component: Service Card
// ============================================================================
function renderServiceCard(
  name: string,
  status: 'up' | 'down' | 'error',
  getStatusConfig: (s: 'up' | 'down' | 'error') => {
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    statusText: string;
    label: string;
  }
) {
  const config = getStatusConfig(status);

  return (
    <div
      key={name}
      className={`
        p-3 rounded-lg border-2
        ${config.bg} ${config.border}
        transition-all duration-200
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{name}</h3>
        <div className={`w-2 h-2 rounded-full ${config.badgeBg}`} />
      </div>
      <p className={`text-xs font-medium ${config.statusText}`}>
        {config.label}
      </p>
    </div>
  );
}
