import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import { buttonColors, ctaColors } from '@/lib/colors';
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
              className={`px-8 py-3 font-semibold rounded-full transition-all ${buttonColors.purple}`}
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
            className={`inline-block px-8 py-3 font-semibold rounded-full ${ctaColors.amber}`}
          >
            Tell Us What You Need
          </Link>
        </div>
      </div>
    </div>
  );
}
