import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import { buttonColors } from '@/lib/colors';
import ServiceCard from '@/components/ServiceCard';
import CircleBadge from '@/components/CircleBadge';

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Hero Section */}
        <div className="text-center mb-10">
          {/* Yellow badge - creates warmth and urgency */}
          <span className="inline-block bg-yellow-100 dark:bg-transparent text-yellow-800 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-500 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            Fast 2-Day Response
          </span>
          <h1 className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {siteConfig.project.tagline}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6 max-w-3xl mx-auto">
            {siteConfig.project.description}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/how-it-works"
              className={`px-8 py-3 font-semibold rounded-full transition-all ${buttonColors.blue}`}
            >
              See How It Works
            </Link>
            <Link
              href="/services"
              className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500 hover:bg-gray-600 hover:text-white hover:border-gray-600 dark:hover:bg-gray-200 dark:hover:text-gray-800 dark:hover:border-gray-300 transition-all"
            >
              View Services
            </Link>
          </div>
        </div>

        {/* Services Preview */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {siteConfig.services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                tagline={service.tagline}
                description={service.description}
                details={service.details}
                color={service.color}
                variant="compact"
              />
            ))}
          </div>
        </div>

        {/* How It Works Preview */}
        <div className="mb-10 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all hover:border-gray-400 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-gray-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Simple Process
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-3">
                <CircleBadge number={1} color="purple" size="md" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Tell Us What You Need</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Describe your task, attach any files, and let us know your timeline.
              </p>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <CircleBadge number={2} color="blue" size="md" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Get a Response</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We review your request and get back to you within 2 business days.
              </p>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <CircleBadge number={3} color="green" size="md" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Task Complete</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We handle the work and deliver results you can count on.
              </p>
            </div>
          </div>
          <div className="text-center mt-6">
            <Link
              href="/how-it-works"
              className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
            >
              Learn more about our process
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Have a task in mind? We'd love to help.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-amber-100 text-amber-900 font-semibold rounded-full border border-amber-300 dark:bg-yellow-500 dark:text-gray-900 dark:border-yellow-100 hover:bg-amber-600 hover:text-white hover:border-amber-600 dark:hover:bg-yellow-200 dark:hover:text-yellow-900 dark:hover:border-yellow-300 transition-all"
          >
            Tell Us What You Need
          </Link>
        </div>
      </div>
    </div>
  );
}
