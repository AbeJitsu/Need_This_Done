export const dynamic = 'force-dynamic';

import DatabaseDemo from '@/components/DatabaseDemo';

export const metadata = {
  title: 'Database Demo',
  description: 'See real data persistence with Supabase',
};

export default function DatabaseDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Database Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Save data and watch it persist. This demonstrates real database storage with Supabase and Redis caching integration.
          </p>
        </div>
        <DatabaseDemo />
      </div>
    </div>
  );
}
