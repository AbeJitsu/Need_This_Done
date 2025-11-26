import Link from 'next/link';
import { getServices } from '@/config/site.config';
import ServiceCard from '@/components/ServiceCard';

// ============================================================================
// Services Page - What NeedThisDone Offers
// ============================================================================
// Lists the services available and explains what clients can expect.

export const metadata = {
  title: 'Services - NeedThisDone',
  description: 'We handle everyday tasks for busy professionals. Data, documents, admin work, and friendly tech help.',
};

export default function ServicesPage() {
  const services = getServices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            How We Can Help
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Too busy? Not sure where to start? We handle the tasks you don't have time for, so you can focus on what matters most.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              tagline={service.tagline}
              description={service.description}
              details={service.details}
              color={service.color}
              variant="full"
            />
          ))}
        </div>

        {/* What to Expect */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-10 transition-all hover:border-gray-400 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-gray-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            What You Can Expect
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-200 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-700 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Clear Communication</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We keep you informed every step of the way. No surprises.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-200 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-700 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Quality Work</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We take pride in delivering work you can rely on.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-200 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-700 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Fair Pricing</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Transparent quotes with no hidden fees.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-200 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-700 font-bold">✓</span>
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
            See how we work, or let's get started.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/how-it-works"
              className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-full hover:bg-white hover:text-amber-600 border border-transparent hover:border-amber-500 transition-all"
            >
              How It Works
            </Link>
            <Link
              href="/faq"
              className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-full hover:bg-white hover:text-teal-600 border border-transparent hover:border-teal-500 transition-all"
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
