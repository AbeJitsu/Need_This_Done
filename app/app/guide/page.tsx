import { getDefaultContent } from '@/lib/default-page-content';
import type { GuidePageContent } from '@/lib/page-content-types';
import GuidePageClient from '@/components/guide/GuidePageClient';

// ============================================================================
// User Guide Page - Step-by-Step Walkthroughs
// ============================================================================
// Visual guides showing users how to complete common tasks on the platform.
// Each guide includes screenshots, step-by-step instructions, and direct links.
//
// INLINE EDITING: This page supports inline editing for admins.
// Click the floating pencil button to open the edit sidebar,
// then click on any section to edit its content directly.

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
      { number: 1, title: 'Visit the Shop', description: 'Head to our shop to see all available consultation packages.' },
      { number: 2, title: 'Compare Options', description: 'We offer 15, 30, and 55-minute sessions. Choose based on how much time you need.' },
      { number: 3, title: 'Click for Details', description: 'Click any consultation to see the full description and what is included.' },
    ],
    screenshot: { src: '/screenshots/december-2025-release/shop-desktop-light.png', alt: 'Shop page displaying consultation packages' },
    ctaText: 'Browse Consultations',
    ctaLink: '/shop',
  },
  {
    id: 'book-consultation',
    title: 'Book a Consultation',
    description: 'Complete your purchase and schedule your session.',
    icon: '📅',
    steps: [
      { number: 1, title: 'Add to Cart', description: 'Click "Add to Cart" on your chosen consultation package.' },
      { number: 2, title: 'Review Your Cart', description: 'Check your cart to confirm your selection and proceed to checkout.' },
      { number: 3, title: 'Complete Payment', description: 'Enter your details and complete payment securely with Stripe.' },
      { number: 4, title: 'Schedule Your Time', description: 'After payment, you will be prompted to select your preferred date and time.' },
    ],
    screenshot: { src: '/screenshots/december-2025-release/cart-desktop-light.png', alt: 'Shopping cart page' },
    ctaText: 'Start Shopping',
    ctaLink: '/shop',
  },
  {
    id: 'get-started',
    title: 'Authorize a Project',
    description: 'Already have a quote? Get your project started.',
    icon: '🚀',
    steps: [
      { number: 1, title: 'Enter Your Quote Number', description: 'Find the quote reference number from your email and enter it.' },
      { number: 2, title: 'Review Project Details', description: 'Confirm the project scope and pricing match what you discussed.' },
      { number: 3, title: 'Authorize & Pay', description: 'Complete payment to officially kick off your project.' },
    ],
    screenshot: { src: '/screenshots/december-2025-release/get-started-desktop-light.png', alt: 'Get Started page' },
    ctaText: 'Authorize a Project',
    ctaLink: '/get-started',
  },
  {
    id: 'stay-updated',
    title: 'Stay Updated',
    description: 'See what is new and follow our latest content.',
    icon: '📰',
    steps: [
      { number: 1, title: 'Check the Changelog', description: 'Visit our changelog to see the latest features and improvements.' },
      { number: 2, title: 'Read the Blog', description: 'Get insights, tips, and updates from our blog posts.' },
      { number: 3, title: 'Bookmark This Page', description: 'Come back anytime to learn about new capabilities.' },
    ],
    screenshot: { src: '/screenshots/december-2025-release/blog-desktop-light.png', alt: 'Blog page' },
    ctaText: 'Read the Blog',
    ctaLink: '/blog',
  },
];

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<GuidePageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/guide`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as GuidePageContent;
    }
  } catch (error) {
    console.error('Failed to fetch guide content:', error);
  }

  return getDefaultContent('guide') as GuidePageContent;
}

// ============================================================================
// Page Component
// ============================================================================

export default async function GuidePage() {
  const content = await getContent();

  return <GuidePageClient initialContent={content} guides={guides} />;
}
