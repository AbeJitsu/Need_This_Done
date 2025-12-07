import { getServices } from '@/config/site.config';
import ServiceCard from '@/components/ServiceCard';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CTASection from '@/components/CTASection';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <PageHeader
          title="How We Can Help"
          description="Too busy? Not sure where to start? We handle the tasks you don't have time for, so you can focus on what matters most."
        />

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
        <Card hoverColor="green" hoverEffect="glow" className="mb-10">
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
        </Card>

        {/* CTA */}
        <CTASection
          title="Ready to Get Started?"
          description="Tell us about your project and we'll get back to you with a personalized quote."
          buttons={[
            { text: 'Get a Quote', variant: 'orange', href: '/contact' },
            { text: 'How It Works', variant: 'blue', href: '/how-it-works' },
            { text: 'FAQ', variant: 'teal', href: '/faq' }
          ]}
          hoverColor="orange"
        />
    </div>
  );
}
