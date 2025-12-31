'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import SystemOverview from '@/components/SystemOverview';
import AuthDemo from '@/components/AuthDemo';
import DatabaseDemo from '@/components/DatabaseDemo';
import SpeedDemo from '@/components/SpeedDemo';

// ============================================================================
// Admin Dev Dashboard - Development Tools & System Monitoring
// ============================================================================
// What: Central hub for development tools, system health, and demos.
// Why: Admins need quick access to system status and testing tools.
// How: Combines health monitoring with collapsible demo sections.

type DemoSection = 'auth' | 'database' | 'speed' | null;

export default function AdminDevPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [expandedDemo, setExpandedDemo] = useState<DemoSection>(null);

  // ============================================================================
  // Redirect Non-Admins
  // ============================================================================

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // ============================================================================
  // Toggle Demo Section
  // ============================================================================

  const toggleDemo = useCallback((demo: DemoSection) => {
    setExpandedDemo((prev) => (prev === demo ? null : demo));
  }, []);

  // ============================================================================
  // Loading and Auth States
  // ============================================================================

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <PageHeader
        title="Dev Dashboard"
        description="System monitoring and development tools for admins."
      />

      {/* System Overview - Unified health check */}
      <section className="mb-8">
        <SystemOverview />
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card hoverColor="blue" hoverEffect="lift" className="text-center cursor-pointer">
            <a href="/admin/users" className="block p-2">
              <div className="text-2xl mb-2" aria-hidden="true">👥</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Manage Users</div>
            </a>
          </Card>
          <Card hoverColor="purple" hoverEffect="lift" className="text-center cursor-pointer">
            <a href="/admin/pages" className="block p-2">
              <div className="text-2xl mb-2" aria-hidden="true">📄</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Manage Pages</div>
            </a>
          </Card>
          <Card hoverColor="green" hoverEffect="lift" className="text-center cursor-pointer">
            <a href="/admin/shop" className="block p-2">
              <div className="text-2xl mb-2" aria-hidden="true">🛒</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Shop Admin</div>
            </a>
          </Card>
          <Card hoverColor="gold" hoverEffect="lift" className="text-center cursor-pointer">
            <a href="/dashboard" className="block p-2">
              <div className="text-2xl mb-2" aria-hidden="true">📊</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Dashboard</div>
            </a>
          </Card>
        </div>
      </section>

      {/* Development Demos Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Development Demos
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Test and verify system functionality. Click to expand each demo.
        </p>

        <div className="space-y-4">
          {/* Auth Demo */}
          <Card hoverColor="blue" hoverEffect="glow">
            <button
              onClick={() => toggleDemo('auth')}
              aria-expanded={expandedDemo === 'auth'}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Authentication Demo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Test user authentication flows with Supabase
                </p>
              </div>
              <span className="text-2xl transform transition-transform duration-200" aria-hidden="true">
                {expandedDemo === 'auth' ? '−' : '+'}
              </span>
            </button>
            {expandedDemo === 'auth' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <AuthDemo />
              </div>
            )}
          </Card>

          {/* Database Demo */}
          <Card hoverColor="purple" hoverEffect="glow">
            <button
              onClick={() => toggleDemo('database')}
              aria-expanded={expandedDemo === 'database'}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Database Demo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Test data persistence with Supabase and Redis caching
                </p>
              </div>
              <span className="text-2xl transform transition-transform duration-200" aria-hidden="true">
                {expandedDemo === 'database' ? '−' : '+'}
              </span>
            </button>
            {expandedDemo === 'database' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <DatabaseDemo />
              </div>
            )}
          </Card>

          {/* Speed Demo */}
          <Card hoverColor="green" hoverEffect="glow">
            <button
              onClick={() => toggleDemo('speed')}
              aria-expanded={expandedDemo === 'speed'}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Speed & Caching Demo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Test Redis caching performance (10-20x faster)
                </p>
              </div>
              <span className="text-2xl transform transition-transform duration-200" aria-hidden="true">
                {expandedDemo === 'speed' ? '−' : '+'}
              </span>
            </button>
            {expandedDemo === 'speed' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <SpeedDemo />
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Back to Dashboard */}
      <div className="mt-8 text-center">
        <Button variant="gray" href="/dashboard">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
