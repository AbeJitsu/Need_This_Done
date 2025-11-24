export const dynamic = 'force-dynamic';

import SpeedDemo from '@/components/SpeedDemo';

export const metadata = {
  title: 'Speed & Caching Demo',
  description: 'See how Redis caching makes requests 10-20x faster',
};

export default function SpeedDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Speed & Caching Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            See how caching makes your application blazingly fast. The first request hits the database. Subsequent requests return from cache in milliseconds.
          </p>
        </div>
        <SpeedDemo />
      </div>
    </div>
  );
}
