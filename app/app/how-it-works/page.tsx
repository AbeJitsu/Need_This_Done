import StepCard from '@/components/StepCard';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CTASection from '@/components/CTASection';
import { AccentVariant } from '@/lib/colors';

// ============================================================================
// How It Works Page - The NeedThisDone Process
// ============================================================================
// Explains the step-by-step process for clients from submission to completion.

export const metadata = {
  title: 'How It Works - NeedThisDone',
  description: 'Our simple process for getting your tasks done. Tell us what you need, and we take it from there.',
};

export default function HowItWorksPage() {
  const steps: {
    number: number;
    title: string;
    description: string;
    details: string[];
    color: AccentVariant;
  }[] = [
    {
      number: 1,
      title: 'Tell Us What You Need',
      description: 'Describe your task in your own words. Include any files, examples, or questions. No tech speak required.',
      details: [
        'Fill out our simple contact form',
        'Attach any relevant files or documents',
        'Let us know your timeline if you have one',
      ],
      color: 'purple',
    },
    {
      number: 2,
      title: 'We Review & Respond',
      description: 'We carefully review your request and get back to you within 2 business days with questions or a clear quote.',
      details: [
        'We assess what needs to be done',
        'We ask clarifying questions if needed',
        'You receive a straightforward quote',
      ],
      color: 'blue',
    },
    {
      number: 3,
      title: 'We Get to Work',
      description: 'Once you give the go-ahead, we start on your task. We keep you updated so you always know where things stand.',
      details: [
        'Work begins on your task',
        'Regular updates on progress',
        'Open communication for questions',
      ],
      color: 'green',
    },
    {
      number: 4,
      title: 'Review & Deliver',
      description: 'You review the completed work. We make any needed adjustments until you are completely satisfied.',
      details: [
        'You review what we have done',
        'We address any feedback',
        'Final delivery. Task complete!',
      ],
      color: 'orange',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <PageHeader
          title="How It Works"
          description="Here's how we work together to get your project done right."
        />

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {steps.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </div>

        {/* Timeline Note */}
        <Card hoverColor="blue" hoverEffect="glow" className="mb-10">
          <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
            Typical Timeline
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Most projects are completed within 1-2 weeks, depending on scope.
            Larger projects may take longer - we'll provide a clear timeline with your quote.
          </p>
        </Card>

        {/* CTA */}
        <CTASection
          title="Ready to Get Started?"
          description="Check out our FAQ or explore our services."
          buttons={[
            { text: 'View FAQ', variant: 'orange', href: '/faq' },
            { text: 'Our Services', variant: 'teal', href: '/services' }
          ]}
          hoverColor="orange"
        />
      </div>
    </div>
  );
}
