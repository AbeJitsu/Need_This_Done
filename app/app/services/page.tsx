import Link from 'next/link';
import { siteConfig, getServices } from '@/config/site.config';

// ============================================================================
// Services Page - What NeedThisDone Offers
// ============================================================================
// Lists the services available and explains what clients can expect.

export const metadata = {
  title: 'Services - NeedThisDone',
  description: 'Explore the services we offer to help you get your projects done.',
};

export default function ServicesPage() {
  const services = getServices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We help you get things done. Here is what we can do for you.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            // Color classes for each service
            const colorClasses = {
              blue: 'border-t-blue-500',
              purple: 'border-t-purple-500',
              green: 'border-t-green-500',
            };
            const titleColors = {
              blue: 'text-blue-600 dark:text-blue-400',
              purple: 'text-purple-600 dark:text-purple-400',
              green: 'text-green-600 dark:text-green-400',
            };
            return (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 border-t-4 ${colorClasses[service.color]} hover:shadow-lg transition-shadow`}
              >
                <h2 className={`text-xl font-bold mb-3 ${titleColors[service.color]}`}>
                  {service.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {service.description}
                </p>
                {service.details && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {service.details}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* What to Expect */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            What You Can Expect
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Clear Communication</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We keep you informed every step of the way. No surprises.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Quality Work</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We take pride in delivering work you can rely on.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Fair Pricing</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Transparent quotes with no hidden fees.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Timely Delivery</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We respect your deadlines and deliver on time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Learn more about our process or get in touch.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/how-it-works"
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/faq"
              className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
