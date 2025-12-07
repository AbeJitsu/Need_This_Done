'use client';

import { useEffect, useState } from 'react';

// ============================================================================
// Container Architecture Component - Visual System Overview
// ============================================================================
// What: Shows all Docker containers and their health at a glance
// Why: Developers need to quickly understand if the system is working
// How: Fetches health status and displays containers with their roles

interface ContainerInfo {
  id: string;
  name: string;
  description: string;
  role: string;
  port?: string;
  healthEndpoint?: string;
  status: 'healthy' | 'unhealthy' | 'unknown' | 'checking';
  dependsOn?: string[];
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  services: {
    redis: 'up' | 'down' | 'error';
    supabase: 'up' | 'down' | 'error';
    app: 'up' | 'down' | 'error';
    medusa?: 'up' | 'down' | 'error';
    nginx?: 'up' | 'down' | 'error';
  };
}

export default function ContainerArchitecture() {
  const [containers, setContainers] = useState<ContainerInfo[]>([
    {
      id: 'nginx',
      name: 'NGINX',
      description: 'Front door - routes all web traffic',
      role: 'Reverse Proxy & SSL',
      port: '443 (HTTPS)',
      healthEndpoint: '/api/health',
      status: 'checking',
      dependsOn: ['app'],
    },
    {
      id: 'app',
      name: 'Next.js App',
      description: 'Your website - handles pages & API',
      role: 'Web Application',
      port: '3000 (internal)',
      healthEndpoint: '/api/health',
      status: 'checking',
      dependsOn: ['redis', 'supabase', 'medusa'],
    },
    {
      id: 'redis',
      name: 'Redis',
      description: 'Speed boost - caches data for fast loads',
      role: 'Cache & Sessions',
      port: '6379 (internal)',
      status: 'checking',
    },
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'Database - stores users, pages, data',
      role: 'Auth & Database',
      port: '54321 (local)',
      status: 'checking',
    },
    {
      id: 'medusa',
      name: 'Medusa',
      description: 'Shop backend - products, carts, orders',
      role: 'E-commerce Engine',
      port: '9000 (internal)',
      healthEndpoint: '/health',
      status: 'checking',
      dependsOn: ['medusa_postgres', 'redis'],
    },
    {
      id: 'medusa_postgres',
      name: 'Medusa DB',
      description: 'Shop database - separate from main DB',
      role: 'E-commerce Database',
      port: '6432 (internal)',
      status: 'checking',
    },
  ]);

  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [overallStatus, setOverallStatus] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');

  // ========================================================================
  // Fetch Health Status
  // ========================================================================
  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data: HealthResponse = await response.json();

      setContainers((prev) =>
        prev.map((container) => {
          let status: ContainerInfo['status'] = 'unknown';

          // Map health response to container status
          switch (container.id) {
            case 'nginx':
              // If we got a response, nginx is working (it proxies the request)
              status = response.ok ? 'healthy' : 'unhealthy';
              break;
            case 'app':
              status = data.services.app === 'up' ? 'healthy' : 'unhealthy';
              break;
            case 'redis':
              status = data.services.redis === 'up' ? 'healthy' : 'unhealthy';
              break;
            case 'supabase':
              status = data.services.supabase === 'up' ? 'healthy' : 'unhealthy';
              break;
            case 'medusa':
              // Medusa is healthy if we can reach the shop API
              status = data.services.medusa === 'up' ? 'healthy' : 'unknown';
              break;
            case 'medusa_postgres':
              // If Medusa works, its DB works
              status = data.services.medusa === 'up' ? 'healthy' : 'unknown';
              break;
            default:
              status = 'unknown';
          }

          return { ...container, status };
        })
      );

      setOverallStatus(data.status === 'healthy' ? 'healthy' : 'unhealthy');
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setContainers((prev) =>
        prev.map((container) => ({ ...container, status: 'unhealthy' }))
      );
      setOverallStatus('unhealthy');
    }
  };

  // Also check Medusa separately
  const checkMedusa = async () => {
    try {
      const response = await fetch('/api/shop/products');
      const isHealthy = response.ok;

      setContainers((prev) =>
        prev.map((container) => {
          if (container.id === 'medusa' || container.id === 'medusa_postgres') {
            return { ...container, status: isHealthy ? 'healthy' : 'unhealthy' };
          }
          return container;
        })
      );
    } catch {
      // Medusa might not be accessible
    }
  };

  useEffect(() => {
    fetchHealth();
    checkMedusa();
    const interval = setInterval(() => {
      fetchHealth();
      checkMedusa();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ========================================================================
  // Status Helpers
  // ========================================================================
  const getStatusColor = (status: ContainerInfo['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'unhealthy':
        return 'bg-red-500';
      case 'checking':
        return 'bg-blue-500 animate-pulse';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusBorder = (status: ContainerInfo['status']) => {
    switch (status) {
      case 'healthy':
        return 'border-green-200 dark:border-green-800';
      case 'unhealthy':
        return 'border-red-200 dark:border-red-800';
      case 'checking':
        return 'border-blue-200 dark:border-blue-800';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusBg = (status: ContainerInfo['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'unhealthy':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'checking':
        return 'bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-800';
    }
  };

  const healthyCount = containers.filter((c) => c.status === 'healthy').length;
  const totalCount = containers.length;

  // ========================================================================
  // Render
  // ========================================================================
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(overallStatus)}`} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Container Architecture
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {healthyCount}/{totalCount} containers healthy
            </span>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                overallStatus === 'healthy'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : overallStatus === 'checking'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}
            >
              {overallStatus === 'healthy'
                ? 'All Systems Go'
                : overallStatus === 'checking'
                ? 'Checking...'
                : 'Issues Detected'}
            </span>
          </div>
        </div>
      </div>

      {/* Traffic Flow Diagram */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">
          Traffic Flow
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
            User
          </span>
          <span>→</span>
          <span className={`px-2 py-1 rounded ${containers[0].status === 'healthy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            NGINX
          </span>
          <span>→</span>
          <span className={`px-2 py-1 rounded ${containers[1].status === 'healthy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            App
          </span>
          <span>→</span>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
            Services
          </span>
        </div>
      </div>

      {/* Container Grid */}
      <div className="p-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {containers.map((container) => (
            <div
              key={container.id}
              className={`p-3 rounded-lg border-2 transition-all ${getStatusBorder(container.status)} ${getStatusBg(container.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {container.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {container.role}
                  </p>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(container.status)}`} />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                {container.description}
              </p>
              {container.port && (
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  Port: {container.port}
                </p>
              )}
              {container.dependsOn && container.dependsOn.length > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Needs: {container.dependsOn.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Last checked: {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
          </span>
          <button
            onClick={() => {
              fetchHealth();
              checkMedusa();
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
}
