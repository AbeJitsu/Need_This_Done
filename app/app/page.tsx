import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import Button from '@/components/Button';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-blue-600 dark:text-blue-400 mb-4">
            {siteConfig.project.tagline}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6 max-w-3xl mx-auto">
            {siteConfig.project.description}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="orange" href="/contact">
              Get a Quote
            </Button>
            <Button variant="blue" href="/how-it-works">
              See How It Works
            </Button>
          </div>
        </div>

        {/* Services Preview */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            What We Offer
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {siteConfig.services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                tagline={service.tagline}
                description={service.description}
                details={service.details}
                color={service.color}
                variant="compact"
                href="/services"
              />
            ))}
          </div>
        </div>

        {/* How It Works Preview */}
        <Link
          href="/how-it-works"
          className="block mb-16 bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-400 dark:border-gray-500 transition-all duration-300 hover:border-blue-400 hover:shadow-xl active:scale-98 dark:hover:border-blue-500 group"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center transition-colors">
            Simple Process
          </h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="flex justify-center mb-3">
                <CircleBadge number={1} color="green" size="md" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Tell Us</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Describe what you need
              </p>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <CircleBadge number={2} color="blue" size="md" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Get a Quote</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We respond in 2 days
              </p>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <CircleBadge number={3} color="purple" size="md" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Authorize</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                50% deposit to start
              </p>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <CircleBadge number={4} color="orange" size="md" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Review and approve
              </p>
            </div>
          </div>
          <p className="text-center mt-6 text-gray-700 dark:text-gray-300 font-medium group-hover:underline">
            Learn more about our process →
          </p>
        </Link>

        {/* CTA Section */}
        <div className="text-center bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 rounded-xl p-8 shadow-lg hover:shadow-xl hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Have a task in mind? Tell us about it and we&apos;ll get back with a personalized quote.
          </p>
          <Button variant="orange" href="/contact">
            Get a Quote
          </Button>
        </div>
      </div>
  );
}
