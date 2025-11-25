import Link from 'next/link';
import { siteConfig } from '@/config/site.config';

// ============================================================================
// Home Page - NeedThisDone Landing Page
// ============================================================================
// The main landing page that introduces the service and invites visitors
// to learn more or submit a project request.

export const metadata = {
  title: 'NeedThisDone - Get Your Projects Done Right',
  description: 'Professional project services - submit your project, get it done right.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">

        {/* Hero Section */}
        <div className="text-center mb-16">
          {/* Yellow badge - creates warmth and urgency */}
          <span className="inline-block bg-yellow-100 dark:bg-transparent text-yellow-800 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-500 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            Fast 2-Day Response
          </span>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {siteConfig.project.name}
          </h1>
          <p className="text-2xl text-blue-600 dark:text-blue-400 font-medium mb-4">
            {siteConfig.project.tagline}
          </p>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
            {siteConfig.project.description}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/how-it-works"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
            >
              See How It Works
            </Link>
            <Link
              href="/features"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              View Services
            </Link>
          </div>
        </div>

        {/* Services Preview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {siteConfig.services.map((service, index) => {
              // Color classes for each service
              const colorClasses = {
                blue: 'border-l-blue-500 hover:border-l-blue-600',
                purple: 'border-l-purple-500 hover:border-l-purple-600',
                green: 'border-l-green-500 hover:border-l-green-600',
              };
              const titleColors = {
                blue: 'text-blue-600 dark:text-blue-400',
                purple: 'text-purple-600 dark:text-purple-400',
                green: 'text-green-600 dark:text-green-400',
              };
              return (
                <div
                  key={index}
                  className={`p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-l-4 ${colorClasses[service.color]} transition-all hover:shadow-lg`}
                >
                  <h3 className={`font-semibold mb-2 text-lg ${titleColors[service.color]}`}>
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
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
        </div>

        {/* How It Works Preview */}
        <div className="mb-16 bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Simple Process
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Submit Your Project</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Tell us what you need done. Include details, files, and any questions.
              </p>
            </div>
            <div>
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Get a Response</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We review your request and get back to you within 2 business days.
              </p>
            </div>
            <div>
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Project Complete</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We handle the work and deliver results you can count on.
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/how-it-works"
              className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
            >
              Learn more about our process
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 mb-6">
            Have a project in mind? We would love to hear about it.
          </p>
          <Link
            href="/docs"
            className="inline-block px-8 py-3 bg-white text-red-600 font-semibold rounded-full hover:bg-red-50 border-2 border-red-100 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
