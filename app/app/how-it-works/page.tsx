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
    href?: string;
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
      color: 'green',
      href: '/contact',
    },
    {
      number: 2,
      title: 'We Review & Respond',
      description: 'We carefully review your request and get back to you within 2 business days with a personalized quote.',
      details: [
        'We assess what needs to be done',
        'We ask clarifying questions if needed',
        'You receive a clear, transparent quote',
      ],
      color: 'blue',
      href: '/login',
    },
    {
      number: 3,
      title: 'Authorize & Start',
      description: 'Love the quote? Pay a 50% deposit to authorize work and we get started right away.',
      details: [
        '50% deposit to begin work',
        'Secure online payment',
        "We'll keep you updated on progress",
      ],
      color: 'purple',
      href: '/get-started',
    },
    {
      number: 4,
      title: 'Approve & Receive',
      description: 'You review the completed work. Once you approve, pay the remaining 50% and receive everything.',
      details: [
        'You review what we have done',
        'We address any feedback',
        "Final 50% on approval, then it's yours!",
      ],
      color: 'orange',
      href: '/login',
    },
  ];

  return (
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
          description="Tell us what you need and we'll get back with a personalized quote."
          buttons={[
            { text: 'Get a Quote', variant: 'orange', href: '/contact' },
            { text: 'View Pricing', variant: 'teal', href: '/pricing' }
          ]}
          hoverColor="orange"
        />
    </div>
  );
}
