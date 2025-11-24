export const dynamic = 'force-dynamic';

import HealthStatus from '@/components/HealthStatus';
import { templateConfig } from '@/config/template.config';

// ============================================================================
// Home Page - Landing & System Overview
// ============================================================================
// Introduces the template and shows the system is running.
// Visitors navigate to specific demos using the main navigation.

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

        {/* System Status - Show everything is running */}
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

        {/* Interactive Demos Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Interactive Demos
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="/demos/speed"
              className="group p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Speed Demo
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                See caching in action with 10-20x performance improvements
              </p>
            </a>

            <a
              href="/demos/database"
              className="group p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="text-3xl mb-2">💾</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Database Demo
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Save and retrieve real data with Supabase
              </p>
            </a>

            <a
              href="/demos/auth"
              className="group p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Auth Demo
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Experience secure user authentication
              </p>
            </a>
          </div>
        </div>

        {/* Learn More Section */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Want to Learn More?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Explore the features, understand how the system works, or check out the documentation.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/features"
              className="px-6 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              Features
            </a>
            <a
              href="/how-it-works"
              className="px-6 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              How It Works
            </a>
            <a
              href="/docs"
              className="px-6 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
