export const dynamic = 'force-dynamic';

import HowItWorks from '@/components/HowItWorks';
import TechnicalFlow from '@/components/TechnicalFlow';

export const metadata = {
  title: 'How It Works',
  description: 'Technical deep-dive into the architecture',
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          How It Works
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-3xl">
          Understand the architecture and technology stack that powers this application. From caching strategies to database queries, every layer explained.
        </p>

        <div className="space-y-12">
          <HowItWorks />
          <TechnicalFlow />
        </div>
      </div>
    </div>
  );
}
