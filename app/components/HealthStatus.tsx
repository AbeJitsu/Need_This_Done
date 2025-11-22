'use client';

import { useEffect, useState } from 'react';

// ============================================================================
// HealthStatus Component
// ============================================================================
// Displays the live status of all services (Redis, Supabase, App)
// Fetches from /api/health endpoint and auto-refreshes every 30 seconds
// Shows color-coded indicators for service health (green = up, red = down)

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
    // Fetch immediately on mount
    fetchHealth();

    // Set up interval to refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  // ========================================================================
  // Helper: Get Status Indicator Color and Text
  // ========================================================================
  const getStatusIndicator = (service: 'up' | 'down' | 'error') => {
    switch (service) {
      case 'up':
        return { icon: '🟢', text: 'Up', color: 'text-green-600' };
      case 'down':
        return { icon: '🔴', text: 'Down', color: 'text-red-600' };
      case 'error':
        return { icon: '⚠️', text: 'Error', color: 'text-yellow-600' };
      default:
        return { icon: '❓', text: 'Unknown', color: 'text-gray-600' };
    }
  };

  // ========================================================================
  // Helper: Format Timestamp
  // ========================================================================
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-3">⏳ System Status</h2>
        <p className="text-gray-800">Loading service status...</p>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-3">⚠️ System Status</h2>
        <p className="text-gray-800">Unable to fetch service status</p>
      </div>
    );
  }

  // ========================================================================
  // Render: Service Status Cards
  // ========================================================================
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        {health.status === 'healthy' ? '✅ System Status' : '⚠️ System Status'}
      </h2>

      {/* Service Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {/* Redis Status */}
        <div className="border border-gray-200 rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={getStatusIndicator(health.services.redis).icon}></span>
            <h3 className="font-semibold">Redis</h3>
          </div>
          <p className={`text-sm ${getStatusIndicator(health.services.redis).color}`}>
            {getStatusIndicator(health.services.redis).text}
          </p>
        </div>

        {/* Supabase Status */}
        <div className="border border-gray-200 rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={getStatusIndicator(health.services.supabase).icon}></span>
            <h3 className="font-semibold">Supabase</h3>
          </div>
          <p className={`text-sm ${getStatusIndicator(health.services.supabase).color}`}>
            {getStatusIndicator(health.services.supabase).text}
          </p>
        </div>

        {/* App Status */}
        <div className="border border-gray-200 rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={getStatusIndicator(health.services.app).icon}></span>
            <h3 className="font-semibold">App</h3>
          </div>
          <p className={`text-sm ${getStatusIndicator(health.services.app).color}`}>
            {getStatusIndicator(health.services.app).text}
          </p>
        </div>
      </div>

      {/* Last Updated */}
      <p className="text-xs text-gray-500">
        Last updated: {lastUpdated ? formatTime(health.timestamp) : 'Never'}
        <br />
        (Refreshes every 30 seconds)
      </p>
    </div>
  );
}
