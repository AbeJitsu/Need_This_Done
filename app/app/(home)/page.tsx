export const dynamic = 'force-dynamic';

import HealthStatus from '@/components/HealthStatus';
import { templateConfig } from '@/config/template.config';

// ============================================================================
// Home Page - Landing & System Overview
// ============================================================================
// Introduces the template and shows system is running.
// Demonstrates key concepts before diving into specific demos.

export const metadata = {
  title: 'Full-Stack Template - Home',
  description: 'A production-ready full-stack web application template',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {templateConfig.project.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
            {templateConfig.project.description}
          </p>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            Everything below is live and working right now. Try it yourself.
          </p>
        </div>

        {/* System Status */}
        <div className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Everything Is Running
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time monitoring of your infrastructure.
            </p>
          </div>
          <HealthStatus />
        </div>

        {/* Explore Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Explore the System
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Use the navigation menu at the top to explore different parts of the system.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { href: '/demos/speed', label: 'Speed Demo', desc: 'See caching in action' },
              { href: '/demos/database', label: 'Database Demo', desc: 'Real data persistence' },
              { href: '/demos/auth', label: 'Auth Demo', desc: 'User authentication' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {item.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
