'use client';

import { useEffect, useState } from 'react';

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
  // Effects: Fetch on Mount and Set Up Auto-Refresh
  // ========================================================================
  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // ========================================================================
  // Helper: Semantic Status Configuration
  // ========================================================================
  // Each status type has specific colors, backgrounds, and text
  const getStatusConfig = (service: 'up' | 'down' | 'error') => {
    switch (service) {
      case 'up':
        return {
          bg: 'bg-green-50 dark:bg-gray-800',
          border: 'border-green-200 dark:border-gray-700',
          badgeBg: 'bg-green-600',
          badgeText: 'text-green-900 dark:text-green-100',
          statusText: 'text-green-700 dark:text-green-300',
          label: 'Operational',
        };
      case 'down':
        return {
          bg: 'bg-red-50 dark:bg-gray-800',
          border: 'border-red-200 dark:border-gray-700',
          badgeBg: 'bg-red-600',
          badgeText: 'text-red-900 dark:text-red-100',
          statusText: 'text-red-700 dark:text-red-300',
          label: 'Down',
        };
      case 'error':
        return {
          bg: 'bg-yellow-50 dark:bg-gray-800',
          border: 'border-yellow-200 dark:border-gray-700',
          badgeBg: 'bg-yellow-600',
          badgeText: 'text-yellow-900 dark:text-yellow-100',
          statusText: 'text-yellow-700 dark:text-yellow-300',
          label: 'Error',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
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
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            health.status === 'healthy'
              ? 'bg-green-100 dark:bg-gray-800 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-gray-800 text-red-700 dark:text-red-300'
          }`}
        >
          {health.status === 'healthy' ? 'All Operational' : 'Issues Detected'}
        </span>
      </div>

      {/* Service Status Cards Grid */}
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        {/* Redis Service */}
        {renderServiceCard('Redis', health.services.redis, getStatusConfig)}

        {/* Supabase Service */}
        {renderServiceCard('Supabase', health.services.supabase, getStatusConfig)}

        {/* App Service */}
        {renderServiceCard('App', health.services.app, getStatusConfig)}
      </div>

      {/* Footer: Last Updated Info */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Last checked: {lastUpdated ? formatTime(health.timestamp) : 'Never'}
          <span className="mx-2">•</span>
          Refreshes every 30 seconds
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
