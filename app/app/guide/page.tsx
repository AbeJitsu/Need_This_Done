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
      alt: 'Shop page displaying three consultation packages: 15-minute, 30-minute, and 55-minute sessions with pricing and descriptions',
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
      alt: 'Shopping cart page showing a selected consultation with quantity controls and checkout button',
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
      alt: 'Get Started page with a quote number input field and instructions for authorizing a project',
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
      alt: 'Blog page featuring article cards with titles, excerpts, and publication dates',
    },
    ctaText: 'Read the Blog',
    ctaLink: '/blog',
  },
  // ============================================================================
  // Admin Guides - Page Builder & Content Management
  // ============================================================================
  {
    id: 'page-wizard',
    title: 'Create Pages with the Wizard',
    description: 'Build custom pages in 5 easy steps using our guided wizard.',
    icon: '✨',
    steps: [
      {
        number: 1,
        title: 'Choose a Category',
        description:
          'Select from landing, course, shop, content, or utility page types to filter templates.',
      },
      {
        number: 2,
        title: 'Pick a Template',
        description: 'Browse pre-built templates designed for your chosen category.',
      },
      {
        number: 3,
        title: 'Select Your Colors',
        description: 'Choose an accent color (purple, blue, green, orange, teal, or gray) for your page.',
      },
      {
        number: 4,
        title: 'Fill in Your Content',
        description: 'Replace placeholder text with your headline, description, and other details.',
      },
      {
        number: 5,
        title: 'Preview & Create',
        description: 'Review your page and click Create to publish it to your site.',
      },
    ],
    ctaText: 'Create a Page',
    ctaLink: '/admin/pages/new',
  },
  {
    id: 'puck-editor',
    title: 'Visual Page Builder',
    description: 'Drag-and-drop editor with 28 components for complete creative control.',
    icon: '🎨',
    steps: [
      {
        number: 1,
        title: 'Open the Editor',
        description: 'Go to Admin > Pages and click "Open Editor" on any page.',
      },
      {
        number: 2,
        title: 'Browse Components',
        description:
          'The left sidebar shows all 28 components: layouts, media, content, interactive elements, and e-commerce blocks.',
      },
      {
        number: 3,
        title: 'Drag & Drop',
        description: 'Drag components onto the canvas. Click any component to edit its properties.',
      },
      {
        number: 4,
        title: 'Customize Settings',
        description:
          'The right panel shows settings for spacing, colors, content, and responsive behavior.',
      },
      {
        number: 5,
        title: 'Save & Publish',
        description: 'Click Save to update your page. Changes go live immediately.',
      },
    ],
    ctaText: 'Open Page Builder',
    ctaLink: '/admin/pages',
  },
  {
    id: 'blog-management',
    title: 'Manage Blog Posts',
    description: 'Create, edit, and publish articles to share insights with your audience.',
    icon: '📝',
    steps: [
      {
        number: 1,
        title: 'Go to Blog Admin',
        description: 'Navigate to Admin > Blog to see all your posts.',
      },
      {
        number: 2,
        title: 'Create New Post',
        description: 'Click "New Post" to open the editor. Enter your title, content, and excerpt.',
      },
      {
        number: 3,
        title: 'Add Media & Formatting',
        description: 'Use the rich text editor to add images, links, headings, and lists.',
      },
      {
        number: 4,
        title: 'Set SEO Details',
        description: 'Add a slug, meta description, and featured image for search optimization.',
      },
      {
        number: 5,
        title: 'Publish',
        description: 'Click Publish to make your post live. Edit anytime from the blog list.',
      },
    ],
    ctaText: 'Manage Blog',
    ctaLink: '/admin/blog',
  },
  {
    id: 'submit-project',
    title: 'Submit a Project Inquiry',
    description: 'Tell us about your project and attach files for a custom quote.',
    icon: '📋',
    steps: [
      {
        number: 1,
        title: 'Visit Get Started',
        description: 'Go to the Get Started page to begin your project inquiry.',
      },
      {
        number: 2,
        title: 'Describe Your Project',
        description: 'Fill in details about what you need help with, your timeline, and budget range.',
      },
      {
        number: 3,
        title: 'Attach Files',
        description: 'Upload up to 3 files (mockups, specs, or reference documents) to help us understand.',
      },
      {
        number: 4,
        title: 'Submit',
        description: 'Click Submit and we will review your inquiry within 24 hours.',
      },
      {
        number: 5,
        title: 'Receive Your Quote',
        description: 'You will get an email with a custom quote. Use the quote number to authorize.',
      },
    ],
    screenshot: {
      src: '/screenshots/december-2025-release/get-started-desktop-light.png',
      alt: 'Get Started page with project inquiry form and file upload section',
    },
    ctaText: 'Start a Project',
    ctaLink: '/get-started',
  },
];

// ============================================================================
// Guide Card Component
// ============================================================================

function GuideCard({ guide }: { guide: Guide }) {
  // Dev-time warning for missing screenshots
  if (process.env.NODE_ENV === 'development' && !guide.screenshot) {
    console.warn(
      `[Guide] Missing screenshot for "${guide.title}" (id: ${guide.id}). ` +
      `Add a screenshot to improve the user experience.`
    );
  }

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

      {/* Screenshot - show placeholder in dev mode if missing */}
      {guide.screenshot ? (
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
      ) : process.env.NODE_ENV === 'development' ? (
        <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700">
          <div className="relative aspect-video bg-amber-100 dark:bg-amber-900/30 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-amber-300 dark:border-amber-600">
            <div className="text-center p-4">
              <span className="text-4xl mb-2 block">📸</span>
              <p className="font-medium text-amber-800 dark:text-amber-200">Missing Screenshot</p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                Add screenshot for &quot;{guide.title}&quot;
              </p>
              <code className="text-xs bg-amber-200 dark:bg-amber-800 px-2 py-1 rounded mt-2 inline-block text-amber-900 dark:text-amber-100">
                id: {guide.id}
              </code>
            </div>
          </div>
        </div>
      ) : null}

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
