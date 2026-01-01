// ============================================================================
// Pre-built Page Sections
// ============================================================================
// What: Complete, ready-to-use page sections for the visual builder
// Why: Let users add entire sections instead of building from components
// How: Each section is a pre-configured Puck component with sensible defaults

import type { Data } from '@measured/puck';

// ============================================================================
// Types
// ============================================================================

export interface SectionDefinition {
  id: string;
  name: string;
  description: string;
  category: SectionCategory;
  preview?: string;
  icon: string;
  tags: string[];
  component: Data['content'][number];
}

export type SectionCategory =
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'cta'
  | 'content'
  | 'gallery'
  | 'contact'
  | 'faq'
  | 'team'
  | 'stats';

export interface CategoryInfo {
  id: SectionCategory;
  name: string;
  description: string;
  icon: string;
}

// ============================================================================
// Category Definitions
// ============================================================================

export const sectionCategories: CategoryInfo[] = [
  { id: 'hero', name: 'Hero', description: 'Attention-grabbing top sections', icon: '🎯' },
  { id: 'features', name: 'Features', description: 'Showcase product features', icon: '✨' },
  { id: 'testimonials', name: 'Testimonials', description: 'Customer reviews and quotes', icon: '💬' },
  { id: 'pricing', name: 'Pricing', description: 'Pricing tables and plans', icon: '💰' },
  { id: 'cta', name: 'Call to Action', description: 'Conversion-focused sections', icon: '🚀' },
  { id: 'content', name: 'Content', description: 'Text and media sections', icon: '📝' },
  { id: 'gallery', name: 'Gallery', description: 'Image and portfolio displays', icon: '🖼️' },
  { id: 'contact', name: 'Contact', description: 'Contact forms and info', icon: '📧' },
  { id: 'faq', name: 'FAQ', description: 'Frequently asked questions', icon: '❓' },
  { id: 'team', name: 'Team', description: 'Team member showcases', icon: '👥' },
  { id: 'stats', name: 'Stats', description: 'Numbers and metrics', icon: '📊' },
];

// ============================================================================
// Section Definitions
// ============================================================================

export const sections: SectionDefinition[] = [
  // ============================================================================
  // HERO SECTIONS
  // ============================================================================
  {
    id: 'hero-simple',
    name: 'Simple Hero',
    description: 'Clean hero with heading, subtext, and CTA button',
    category: 'hero',
    icon: '🎯',
    tags: ['simple', 'clean', 'minimal'],
    component: {
      type: 'Hero',
      props: {
        title: 'Welcome to Your Site',
        subtitle: 'A compelling tagline that captures your value proposition',
        buttonText: 'Get Started',
        buttonLink: '/get-started',
        color: 'blue',
      },
    },
  },
  {
    id: 'hero-split',
    name: 'Split Hero',
    description: 'Two-column hero with text and image',
    category: 'hero',
    icon: '🖼️',
    tags: ['split', 'image', 'visual'],
    component: {
      type: 'Hero',
      props: {
        title: 'Build Something Amazing',
        subtitle: 'Transform your ideas into reality with our powerful platform',
        buttonText: 'Start Free Trial',
        buttonLink: '/signup',
        color: 'purple',
      },
    },
  },

  // ============================================================================
  // FEATURES SECTIONS
  // ============================================================================
  {
    id: 'features-grid',
    name: 'Feature Grid',
    description: '3-column grid of features with icons',
    category: 'features',
    icon: '✨',
    tags: ['grid', 'icons', 'three-column'],
    component: {
      type: 'CardGrid',
      props: {
        title: 'Why Choose Us',
        subtitle: 'Everything you need to succeed',
        cards: [
          { title: 'Fast & Reliable', description: 'Lightning-fast performance you can count on', icon: '⚡', color: 'blue' },
          { title: 'Easy to Use', description: 'Intuitive interface that anyone can master', icon: '🎨', color: 'green' },
          { title: 'Secure', description: 'Enterprise-grade security for peace of mind', icon: '🔒', color: 'purple' },
        ],
        columns: 3,
        color: 'blue',
      },
    },
  },
  {
    id: 'features-list',
    name: 'Feature List',
    description: 'Vertical list of features with descriptions',
    category: 'features',
    icon: '📋',
    tags: ['list', 'vertical', 'detailed'],
    component: {
      type: 'CardGrid',
      props: {
        title: 'Everything You Need',
        subtitle: 'Packed with powerful features',
        cards: [
          { title: 'Drag & Drop Builder', description: 'Create beautiful pages without any coding', icon: '🖱️', color: 'blue' },
          { title: 'Mobile Responsive', description: 'Looks great on all devices automatically', icon: '📱', color: 'green' },
          { title: 'SEO Optimized', description: 'Rank higher in search results', icon: '🔍', color: 'purple' },
          { title: '24/7 Support', description: 'We\'re here whenever you need help', icon: '💬', color: 'blue' },
        ],
        columns: 2,
        color: 'blue',
      },
    },
  },

  // ============================================================================
  // TESTIMONIALS SECTIONS
  // ============================================================================
  {
    id: 'testimonials-cards',
    name: 'Testimonial Cards',
    description: 'Customer testimonials in card format',
    category: 'testimonials',
    icon: '💬',
    tags: ['cards', 'quotes', 'reviews'],
    component: {
      type: 'Testimonials',
      props: {
        title: 'What Our Customers Say',
        testimonials: [
          { quote: 'This product completely transformed our workflow. Highly recommended!', author: 'Sarah J.', role: 'Marketing Director', rating: 5 },
          { quote: 'The best investment we\'ve made for our business this year.', author: 'Mike R.', role: 'CEO, TechCorp', rating: 5 },
          { quote: 'Incredible support team and an amazing product.', author: 'Lisa M.', role: 'Product Manager', rating: 5 },
        ],
        color: 'blue',
      },
    },
  },

  // ============================================================================
  // PRICING SECTIONS
  // ============================================================================
  {
    id: 'pricing-three-tier',
    name: 'Three-Tier Pricing',
    description: 'Classic three-column pricing comparison',
    category: 'pricing',
    icon: '💰',
    tags: ['tiers', 'comparison', 'three-column'],
    component: {
      type: 'Pricing',
      props: {
        title: 'Simple, Transparent Pricing',
        subtitle: 'Choose the plan that\'s right for you',
        plans: [
          { name: 'Starter', price: '$9', period: 'month', features: ['5 Projects', '1GB Storage', 'Email Support'], buttonText: 'Start Free', featured: false },
          { name: 'Pro', price: '$29', period: 'month', features: ['Unlimited Projects', '10GB Storage', 'Priority Support', 'Analytics'], buttonText: 'Get Pro', featured: true },
          { name: 'Enterprise', price: '$99', period: 'month', features: ['Everything in Pro', 'Unlimited Storage', 'Dedicated Support', 'Custom Integrations'], buttonText: 'Contact Us', featured: false },
        ],
        color: 'blue',
      },
    },
  },

  // ============================================================================
  // CTA SECTIONS
  // ============================================================================
  {
    id: 'cta-simple',
    name: 'Simple CTA',
    description: 'Clean call-to-action with heading and button',
    category: 'cta',
    icon: '🚀',
    tags: ['simple', 'clean', 'button'],
    component: {
      type: 'CTA',
      props: {
        title: 'Ready to Get Started?',
        subtitle: 'Join thousands of happy customers today',
        buttonText: 'Start Your Free Trial',
        buttonLink: '/signup',
        color: 'blue',
      },
    },
  },
  {
    id: 'cta-newsletter',
    name: 'Newsletter CTA',
    description: 'Email signup call-to-action',
    category: 'cta',
    icon: '📧',
    tags: ['newsletter', 'email', 'signup'],
    component: {
      type: 'CTA',
      props: {
        title: 'Stay in the Loop',
        subtitle: 'Get the latest updates and tips delivered to your inbox',
        buttonText: 'Subscribe',
        buttonLink: '/subscribe',
        color: 'green',
      },
    },
  },

  // ============================================================================
  // CONTENT SECTIONS
  // ============================================================================
  {
    id: 'content-text-image',
    name: 'Text with Image',
    description: 'Content section with text and image side by side',
    category: 'content',
    icon: '📝',
    tags: ['text', 'image', 'split'],
    component: {
      type: 'TextBlock',
      props: {
        title: 'Our Story',
        content: 'We started with a simple idea: make technology accessible to everyone. Today, we help thousands of businesses grow and succeed online.',
        alignment: 'left',
        color: 'blue',
      },
    },
  },

  // ============================================================================
  // FAQ SECTIONS
  // ============================================================================
  {
    id: 'faq-accordion',
    name: 'FAQ Accordion',
    description: 'Expandable frequently asked questions',
    category: 'faq',
    icon: '❓',
    tags: ['accordion', 'expandable', 'questions'],
    component: {
      type: 'FAQ',
      props: {
        title: 'Frequently Asked Questions',
        faqs: [
          { question: 'How do I get started?', answer: 'Simply sign up for a free account and follow our quick setup wizard. You\'ll be up and running in minutes.' },
          { question: 'Is there a free trial?', answer: 'Yes! We offer a 14-day free trial with no credit card required.' },
          { question: 'Can I cancel anytime?', answer: 'Absolutely. You can cancel your subscription at any time, no questions asked.' },
          { question: 'Do you offer support?', answer: 'We provide 24/7 support via email and chat. Our team is always ready to help.' },
        ],
        color: 'blue',
      },
    },
  },

  // ============================================================================
  // STATS SECTIONS
  // ============================================================================
  {
    id: 'stats-counter',
    name: 'Stats Counter',
    description: 'Key metrics and numbers display',
    category: 'stats',
    icon: '📊',
    tags: ['numbers', 'metrics', 'counter'],
    component: {
      type: 'Stats',
      props: {
        title: 'By the Numbers',
        stats: [
          { value: '10K+', label: 'Happy Customers' },
          { value: '99%', label: 'Uptime' },
          { value: '24/7', label: 'Support' },
          { value: '50+', label: 'Countries' },
        ],
        color: 'blue',
      },
    },
  },

  // ============================================================================
  // TEAM SECTIONS
  // ============================================================================
  {
    id: 'team-grid',
    name: 'Team Grid',
    description: 'Team member cards with photos',
    category: 'team',
    icon: '👥',
    tags: ['team', 'members', 'grid'],
    component: {
      type: 'Team',
      props: {
        title: 'Meet Our Team',
        subtitle: 'The people behind the product',
        members: [
          { name: 'Alex Johnson', role: 'CEO & Founder', bio: 'Visionary leader with 15 years of industry experience' },
          { name: 'Sam Williams', role: 'CTO', bio: 'Tech expert passionate about building scalable solutions' },
          { name: 'Jordan Lee', role: 'Head of Design', bio: 'Award-winning designer with an eye for detail' },
        ],
        color: 'blue',
      },
    },
  },

  // ============================================================================
  // CONTACT SECTIONS
  // ============================================================================
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Simple contact form section',
    category: 'contact',
    icon: '📧',
    tags: ['form', 'contact', 'message'],
    component: {
      type: 'Contact',
      props: {
        title: 'Get in Touch',
        subtitle: 'We\'d love to hear from you',
        email: 'hello@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, City, Country',
        color: 'blue',
      },
    },
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all sections
 */
export function getAllSections(): SectionDefinition[] {
  return sections;
}

/**
 * Get sections by category
 */
export function getSectionsByCategory(category: SectionCategory): SectionDefinition[] {
  return sections.filter(s => s.category === category);
}

/**
 * Get a section by ID
 */
export function getSectionById(id: string): SectionDefinition | undefined {
  return sections.find(s => s.id === id);
}

/**
 * Search sections by name or tags
 */
export function searchSections(query: string): SectionDefinition[] {
  const lowerQuery = query.toLowerCase();
  return sections.filter(s =>
    s.name.toLowerCase().includes(lowerQuery) ||
    s.description.toLowerCase().includes(lowerQuery) ||
    s.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get all categories that have sections
 */
export function getCategoriesWithSections(): CategoryInfo[] {
  const categoriesWithSections = new Set(sections.map(s => s.category));
  return sectionCategories.filter(c => categoriesWithSections.has(c.id));
}
