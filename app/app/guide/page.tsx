import PageHeader from '@/components/PageHeader';
import { headingColors, formInputColors, accentColors, focusRingClasses } from '@/lib/colors';
import Image from 'next/image';
import Link from 'next/link';

// ============================================================================
// User Guide Page - Step-by-Step Walkthroughs
// ============================================================================
// Visual guides showing users how to complete common tasks on the platform.
// Each guide includes screenshots, step-by-step instructions, and direct links.

export const metadata = {
  title: 'User Guide - NeedThisDone',
  description:
    'Learn how to browse services, book consultations, and get the most out of NeedThisDone.',
};

// ============================================================================
// Types
// ============================================================================

interface GuideStep {
  number: number;
  title: string;
  description: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: GuideStep[];
  screenshot?: {
    src: string;
    alt: string;
  };
  ctaText: string;
  ctaLink: string;
}

// ============================================================================
// Guide Data
// ============================================================================

const guides: Guide[] = [
  {
    id: 'browse-shop',
    title: 'Browse Consultations',
    description: 'Find the right consultation for your needs.',
    icon: '🔍',
    steps: [
      {
        number: 1,
        title: 'Visit the Shop',
        description: 'Head to our shop to see all available consultation packages.',
      },
      {
        number: 2,
        title: 'Compare Options',
        description:
          'We offer 15, 30, and 55-minute sessions. Choose based on how much time you need.',
      },
      {
        number: 3,
        title: 'Click for Details',
        description: 'Click any consultation to see the full description and what is included.',
      },
    ],
    screenshot: {
      src: '/screenshots/december-2025-release/shop-desktop-light.png',
      alt: 'Shop page showing consultation packages',
    },
    ctaText: 'Browse Consultations',
    ctaLink: '/shop',
  },
  {
    id: 'book-consultation',
    title: 'Book a Consultation',
    description: 'Complete your purchase and schedule your session.',
    icon: '📅',
    steps: [
      {
        number: 1,
        title: 'Add to Cart',
        description: 'Click "Add to Cart" on your chosen consultation package.',
      },
      {
        number: 2,
        title: 'Review Your Cart',
        description: 'Check your cart to confirm your selection and proceed to checkout.',
      },
      {
        number: 3,
        title: 'Complete Payment',
        description: 'Enter your details and complete payment securely with Stripe.',
      },
      {
        number: 4,
        title: 'Schedule Your Time',
        description:
          'After payment, you will be prompted to select your preferred date and time.',
      },
    ],
    screenshot: {
      src: '/screenshots/december-2025-release/cart-desktop-light.png',
      alt: 'Shopping cart with consultation',
    },
    ctaText: 'Start Shopping',
    ctaLink: '/shop',
  },
  {
    id: 'get-started',
    title: 'Authorize a Project',
    description: 'Already have a quote? Get your project started.',
    icon: '🚀',
    steps: [
      {
        number: 1,
        title: 'Enter Your Quote Number',
        description: 'Find the quote reference number from your email and enter it.',
      },
      {
        number: 2,
        title: 'Review Project Details',
        description: 'Confirm the project scope and pricing match what you discussed.',
      },
      {
        number: 3,
        title: 'Authorize & Pay',
        description: 'Complete payment to officially kick off your project.',
      },
    ],
    screenshot: {
      src: '/screenshots/december-2025-release/get-started-desktop-light.png',
      alt: 'Get Started page for project authorization',
    },
    ctaText: 'Authorize a Project',
    ctaLink: '/get-started',
  },
  {
    id: 'stay-updated',
    title: 'Stay Updated',
    description: 'See what is new and follow our latest content.',
    icon: '📰',
    steps: [
      {
        number: 1,
        title: 'Check the Changelog',
        description: 'Visit our changelog to see the latest features and improvements.',
      },
      {
        number: 2,
        title: 'Read the Blog',
        description: 'Get insights, tips, and updates from our blog posts.',
      },
      {
        number: 3,
        title: 'Bookmark This Page',
        description: 'Come back anytime to learn about new capabilities.',
      },
    ],
    screenshot: {
      src: '/screenshots/december-2025-release/blog-desktop-light.png',
      alt: 'Blog page with latest posts',
    },
    ctaText: 'Read the Blog',
    ctaLink: '/blog',
  },
];

// ============================================================================
// Guide Card Component
// ============================================================================

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article
      id={guide.id}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl" aria-hidden="true">{guide.icon}</span>
          <div>
            <h2 className={`text-xl font-bold ${headingColors.primary}`}>{guide.title}</h2>
            <p className={formInputColors.helper}>{guide.description}</p>
          </div>
        </div>
      </div>

      {/* Screenshot */}
      {guide.screenshot && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <Image
              src={guide.screenshot.src}
              alt={guide.screenshot.alt}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="p-6">
        <h3 className={`font-semibold ${headingColors.secondary} mb-4`}>How it works</h3>
        <ol className="space-y-4">
          {guide.steps.map((step) => (
            <li key={step.number} className="flex gap-4">
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${accentColors.purple.bg} ${accentColors.purple.text}`}
              >
                {step.number}
              </span>
              <div>
                <p className={`font-medium ${headingColors.primary}`}>{step.title}</p>
                <p className={`text-sm ${formInputColors.helper}`}>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* CTA */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <Link
            href={guide.ctaLink}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${accentColors.purple.bg} ${accentColors.purple.text} ${accentColors.purple.hoverText} ${accentColors.purple.hoverBorder} ${focusRingClasses.purple}`}
          >
            {guide.ctaText}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// Quick Links Component
// ============================================================================

function QuickLinks() {
  return (
    <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <h2 className={`font-semibold ${headingColors.secondary} mb-4`}>Jump to a guide</h2>
      <ul className="flex flex-wrap gap-2">
        {guides.map((guide) => (
          <li key={guide.id}>
            <a
              href={`#${guide.id}`}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 ${headingColors.primary} hover:bg-gray-200 dark:hover:bg-gray-600 ${focusRingClasses.purple}`}
            >
              <span aria-hidden="true">{guide.icon}</span>
              {guide.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <PageHeader
        title="How to Use NeedThisDone"
        description="Step-by-step guides to help you get the most out of our platform. Whether you're booking your first consultation or authorizing a project, we've got you covered."
      />

      {/* Quick Links */}
      <QuickLinks />

      {/* Guides */}
      <div className="space-y-8">
        {guides.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-12 text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <h2 className={`text-xl font-bold ${headingColors.primary} mb-2`}>Still have questions?</h2>
        <p className={`${formInputColors.helper} mb-4`}>
          We are here to help. Reach out and we will get back to you as soon as possible.
        </p>
        <Link
          href="/contact"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${accentColors.blue.bg} ${accentColors.blue.text} ${accentColors.blue.hoverText} ${accentColors.blue.hoverBorder} ${focusRingClasses.blue}`}
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
