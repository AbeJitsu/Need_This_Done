// ============================================================================
// Starter Templates - Ready-to-Use Page Templates
// ============================================================================
// These templates are the building blocks for quick page creation.
// Each template is just DATA - no logic, no side effects.
//
// TO ADD A NEW TEMPLATE:
// 1. Define it following the PageTemplate interface
// 2. Add it to the STARTER_TEMPLATES array
// 3. That's it! The picker and wizard will automatically include it.
// ============================================================================

import type { PageTemplate } from './types';

// ============================================================================
// Course Landing Template
// ============================================================================
// Perfect for: Course creators, coaches, educators
// Sections: Hero → What You'll Learn → Testimonials → Pricing → FAQ → CTA

const courseLandingTemplate: PageTemplate = {
  metadata: {
    id: 'course-landing',
    name: 'Course Landing Page',
    description: 'Sell your online course with a professional landing page. Includes curriculum preview, testimonials, and pricing.',
    category: 'course',
    audience: 'coaches',
    tags: ['course', 'education', 'coaching', 'online learning', 'curriculum'],
    featured: true,
    estimatedTime: 10,
  },
  defaultColor: 'purple',
  sections: [
    {
      type: 'Hero',
      props: {
        heading: 'Master [Your Topic] in 30 Days',
        subheading: 'A step-by-step course that takes you from beginner to confident practitioner. Join 1,000+ students who transformed their skills.',
        alignment: 'center',
        showCta: 'yes',
        ctaText: 'Enroll Now',
        ctaLink: '#pricing',
        accentColor: 'purple',
      },
    },
    {
      type: 'FeatureGrid',
      props: {
        columns: '3',
        features: [
          { title: 'Video Lessons', description: '20+ HD video lessons you can watch at your own pace', icon: 'play' },
          { title: 'Worksheets', description: 'Practical exercises to apply what you learn immediately', icon: 'document' },
          { title: 'Community', description: 'Join our private community for support and networking', icon: 'users' },
        ],
        accentColor: 'purple',
      },
    },
    {
      type: 'Testimonials',
      props: {
        layout: 'carousel',
        showRating: 'yes',
        showAvatar: 'yes',
        autoPlay: 'yes',
        testimonials: [
          { quote: 'This course changed everything for me. I went from confused to confident in just 3 weeks.', author: 'Sarah M.', role: 'Student', rating: 5 },
          { quote: 'The best investment I\'ve made in my professional development. Highly recommended!', author: 'James K.', role: 'Professional', rating: 5 },
          { quote: 'Clear, practical, and actually enjoyable. I finally understand this topic.', author: 'Maria L.', role: 'Student', rating: 5 },
        ],
        accentColor: 'purple',
      },
    },
    {
      type: 'PricingTable',
      props: {
        columns: '2',
        tiers: [
          {
            name: 'Self-Paced',
            price: '$197',
            period: 'one-time',
            description: 'Learn at your own pace with lifetime access',
            features: ['20+ video lessons', 'Downloadable worksheets', 'Lifetime access', 'Certificate of completion'],
          },
          {
            name: 'With Coaching',
            price: '$497',
            period: 'one-time',
            description: 'Get personal guidance and faster results',
            features: ['Everything in Self-Paced', '4 group coaching calls', 'Direct message access', 'Priority support'],
            highlighted: true,
          },
        ],
        accentColor: 'purple',
      },
    },
    {
      type: 'Accordion',
      props: {
        style: 'separated',
        allowMultiple: 'no',
        items: [
          { title: 'How long do I have access?', content: 'You get lifetime access! Watch the lessons as many times as you want, forever.', defaultOpen: 'open' },
          { title: 'Is there a money-back guarantee?', content: 'Yes! If you\'re not satisfied within 30 days, we\'ll refund you in full. No questions asked.' },
          { title: 'What if I get stuck?', content: 'Our community is here to help. Post your questions and get answers from fellow students and instructors.' },
          { title: 'When does the course start?', content: 'Immediately! As soon as you enroll, you\'ll get access to all the materials.' },
        ],
        accentColor: 'purple',
      },
    },
    {
      type: 'CallToAction',
      props: {
        heading: 'Ready to Get Started?',
        subheading: 'Join 1,000+ students who have already transformed their skills.',
        buttonText: 'Enroll Now',
        buttonLink: '#pricing',
        style: 'banner',
        accentColor: 'purple',
      },
    },
  ],
  placeholders: {
    fields: [
      { path: 'sections.0.props.heading', label: 'Main Headline', hint: 'What\'s your course about?', type: 'text', required: true },
      { path: 'sections.0.props.subheading', label: 'Subtitle', hint: 'Brief description of the transformation', type: 'textarea', required: true },
      { path: 'sections.0.props.ctaText', label: 'Button Text', type: 'text', defaultValue: 'Enroll Now' },
    ],
  },
};

// ============================================================================
// Business Landing Template
// ============================================================================
// Perfect for: Service providers, consultants, agencies
// Sections: Hero → Services → Stats → Testimonials → CTA

const businessLandingTemplate: PageTemplate = {
  metadata: {
    id: 'business-landing',
    name: 'Business Landing Page',
    description: 'Professional landing page for service businesses. Showcase what you do and convert visitors into clients.',
    category: 'landing',
    audience: 'services',
    tags: ['business', 'services', 'professional', 'agency', 'consultant'],
    featured: true,
    estimatedTime: 8,
  },
  defaultColor: 'blue',
  sections: [
    {
      type: 'Hero',
      props: {
        heading: 'We Help Businesses [Achieve Result]',
        subheading: 'Professional [service type] that delivers real results. Trusted by 100+ companies.',
        alignment: 'left',
        showCta: 'yes',
        ctaText: 'Get Started',
        ctaLink: '/contact',
        accentColor: 'blue',
      },
    },
    {
      type: 'FeatureGrid',
      props: {
        columns: '3',
        features: [
          { title: 'Expertise', description: '10+ years of experience delivering results for businesses like yours', icon: 'star' },
          { title: 'Process', description: 'A proven methodology that gets results every time', icon: 'chart' },
          { title: 'Support', description: 'Dedicated support team available when you need us', icon: 'support' },
        ],
        accentColor: 'blue',
      },
    },
    {
      type: 'StatsCounter',
      props: {
        stats: [
          { value: '100', label: 'Happy Clients', suffix: '+' },
          { value: '500', label: 'Projects Completed', suffix: '+' },
          { value: '10', label: 'Years Experience', suffix: '+' },
          { value: '98', label: 'Client Satisfaction', suffix: '%' },
        ],
        layout: 'row',
        accentColor: 'blue',
      },
    },
    {
      type: 'Testimonials',
      props: {
        layout: 'grid',
        showRating: 'no',
        showAvatar: 'yes',
        autoPlay: 'no',
        testimonials: [
          { quote: 'Working with this team was a game-changer for our business. They truly understand what we needed.', author: 'John D.', role: 'CEO', company: 'TechCorp' },
          { quote: 'Professional, responsive, and delivered beyond expectations. Highly recommend!', author: 'Lisa R.', role: 'Marketing Director', company: 'GrowthCo' },
        ],
        accentColor: 'blue',
      },
    },
    {
      type: 'CallToAction',
      props: {
        heading: 'Ready to Grow Your Business?',
        subheading: 'Schedule a free consultation and let\'s discuss how we can help.',
        buttonText: 'Book a Call',
        buttonLink: '/contact',
        style: 'simple',
        accentColor: 'blue',
      },
    },
  ],
  placeholders: {
    fields: [
      { path: 'sections.0.props.heading', label: 'Main Headline', hint: 'What result do you help businesses achieve?', type: 'text', required: true },
      { path: 'sections.0.props.subheading', label: 'Subtitle', hint: 'What do you do and who trusts you?', type: 'textarea', required: true },
      { path: 'sections.0.props.ctaText', label: 'Button Text', type: 'text', defaultValue: 'Get Started' },
    ],
  },
};

// ============================================================================
// Product Launch Template
// ============================================================================
// Perfect for: E-commerce, product launches, sales pages
// Sections: Hero → Video → Features → Product Grid → Testimonials → CTA

const productLaunchTemplate: PageTemplate = {
  metadata: {
    id: 'product-launch',
    name: 'Product Launch Page',
    description: 'Launch your product with impact. Video demo, features, and social proof all in one page.',
    category: 'shop',
    audience: 'ecommerce',
    tags: ['product', 'launch', 'ecommerce', 'sales', 'shop'],
    featured: true,
    estimatedTime: 12,
  },
  defaultColor: 'teal',
  sections: [
    {
      type: 'Hero',
      props: {
        heading: 'Introducing [Product Name]',
        subheading: 'The [product category] that [key benefit]. Pre-order now and be the first to experience it.',
        alignment: 'center',
        showCta: 'yes',
        ctaText: 'Shop Now',
        ctaLink: '#products',
        accentColor: 'teal',
      },
    },
    {
      type: 'VideoEmbed',
      props: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Product Demo',
        caption: 'See it in action',
        aspectRatio: '16:9',
        thumbnailMode: 'yes',
        accentColor: 'teal',
      },
    },
    {
      type: 'FeatureGrid',
      props: {
        columns: '4',
        features: [
          { title: 'Quality Materials', description: 'Premium craftsmanship built to last' },
          { title: 'Fast Shipping', description: 'Free shipping on all orders over $50' },
          { title: 'Easy Returns', description: '30-day hassle-free return policy' },
          { title: 'Support', description: '24/7 customer support team' },
        ],
        accentColor: 'teal',
      },
    },
    {
      type: 'ProductGrid',
      props: {
        productIds: [{ id: '' }, { id: '' }, { id: '' }],
        columns: '3',
        gap: 'lg',
        showPrice: 'yes',
        accentColor: 'teal',
      },
    },
    {
      type: 'Testimonials',
      props: {
        layout: 'carousel',
        showRating: 'yes',
        showAvatar: 'no',
        autoPlay: 'yes',
        testimonials: [
          { quote: 'Best purchase I\'ve made this year. Quality exceeded my expectations!', author: 'Customer', rating: 5 },
          { quote: 'Fast shipping and the product is exactly as described. Love it!', author: 'Buyer', rating: 5 },
        ],
        accentColor: 'teal',
      },
    },
    {
      type: 'CallToAction',
      props: {
        heading: 'Limited Time Offer',
        subheading: 'Order now and get 20% off your first purchase. Use code LAUNCH20.',
        buttonText: 'Shop Now',
        buttonLink: '#products',
        style: 'banner',
        accentColor: 'teal',
      },
    },
  ],
  placeholders: {
    fields: [
      { path: 'sections.0.props.heading', label: 'Product Name', hint: 'What are you launching?', type: 'text', required: true },
      { path: 'sections.0.props.subheading', label: 'Product Description', hint: 'What is it and why should people want it?', type: 'textarea', required: true },
      { path: 'sections.1.props.url', label: 'Demo Video URL', hint: 'YouTube or Vimeo link', type: 'text' },
    ],
  },
};

// ============================================================================
// Simple Portfolio Template
// ============================================================================
// Perfect for: Creators, freelancers, personal brands
// Sections: Hero → About → Work Grid → Testimonials → Contact CTA

const simplePortfolioTemplate: PageTemplate = {
  metadata: {
    id: 'simple-portfolio',
    name: 'Simple Portfolio',
    description: 'Clean, minimal portfolio to showcase your work. Perfect for freelancers and creatives.',
    category: 'content',
    audience: 'creators',
    tags: ['portfolio', 'freelance', 'creative', 'personal', 'minimal'],
    featured: false,
    estimatedTime: 8,
  },
  defaultColor: 'gray',
  sections: [
    {
      type: 'Hero',
      props: {
        heading: 'Hi, I\'m [Your Name]',
        subheading: 'I\'m a [profession] who helps [clients] with [what you do]. Let\'s create something great together.',
        alignment: 'center',
        showCta: 'yes',
        ctaText: 'View My Work',
        ctaLink: '#work',
        accentColor: 'gray',
      },
    },
    {
      type: 'RichText',
      props: {
        content: '## About Me\n\nI\'ve been doing this work for [X] years, helping clients achieve their goals. I believe in [your philosophy/approach].\n\nWhen I\'m not working, you\'ll find me [hobby/interest]. I\'m always open to interesting projects and collaborations.',
        alignment: 'left',
      },
    },
    {
      type: 'FeatureGrid',
      props: {
        columns: '3',
        features: [
          { title: 'Project One', description: 'Brief description of this project and the results achieved' },
          { title: 'Project Two', description: 'Brief description of this project and the results achieved' },
          { title: 'Project Three', description: 'Brief description of this project and the results achieved' },
        ],
        accentColor: 'gray',
      },
    },
    {
      type: 'Testimonials',
      props: {
        layout: 'single',
        showRating: 'no',
        showAvatar: 'yes',
        autoPlay: 'no',
        testimonials: [
          { quote: 'Working with [Name] was an absolute pleasure. They delivered exactly what we needed, on time and on budget.', author: 'Client Name', role: 'Title', company: 'Company' },
        ],
        accentColor: 'gray',
      },
    },
    {
      type: 'CallToAction',
      props: {
        heading: 'Let\'s Work Together',
        subheading: 'Have a project in mind? I\'d love to hear about it.',
        buttonText: 'Get in Touch',
        buttonLink: '/contact',
        style: 'simple',
        accentColor: 'gray',
      },
    },
  ],
  placeholders: {
    fields: [
      { path: 'sections.0.props.heading', label: 'Your Name', hint: 'How should we greet visitors?', type: 'text', required: true },
      { path: 'sections.0.props.subheading', label: 'Your Intro', hint: 'What do you do and who do you help?', type: 'textarea', required: true },
    ],
  },
};

// ============================================================================
// Quick Contact Template
// ============================================================================
// Perfect for: Any business needing a simple contact/thank you page

const quickContactTemplate: PageTemplate = {
  metadata: {
    id: 'quick-contact',
    name: 'Contact Page',
    description: 'Simple contact page with a clear call-to-action. Get visitors to reach out.',
    category: 'utility',
    audience: 'everyone',
    tags: ['contact', 'simple', 'utility', 'form'],
    featured: false,
    estimatedTime: 5,
  },
  defaultColor: 'green',
  sections: [
    {
      type: 'Hero',
      props: {
        heading: 'Let\'s Talk',
        subheading: 'Have a question or want to work together? We\'d love to hear from you.',
        alignment: 'center',
        showCta: 'no',
        accentColor: 'green',
      },
    },
    {
      type: 'FeatureGrid',
      props: {
        columns: '3',
        features: [
          { title: 'Email Us', description: 'hello@example.com' },
          { title: 'Call Us', description: '(555) 123-4567' },
          { title: 'Visit Us', description: '123 Main St, City' },
        ],
        accentColor: 'green',
      },
    },
    {
      type: 'RichText',
      props: {
        content: '## Office Hours\n\nMonday - Friday: 9am - 5pm\nSaturday: 10am - 2pm\nSunday: Closed\n\nWe typically respond to all inquiries within 24 hours.',
        alignment: 'center',
      },
    },
  ],
  placeholders: {
    fields: [
      { path: 'sections.0.props.heading', label: 'Page Title', type: 'text', defaultValue: "Let's Talk" },
      { path: 'sections.0.props.subheading', label: 'Subtitle', type: 'textarea', defaultValue: "Have a question or want to work together? We'd love to hear from you." },
    ],
  },
};

// ============================================================================
// Export All Templates
// ============================================================================

export const STARTER_TEMPLATES: PageTemplate[] = [
  courseLandingTemplate,
  businessLandingTemplate,
  productLaunchTemplate,
  simplePortfolioTemplate,
  quickContactTemplate,
];

/**
 * Get a template by its ID.
 */
export function getTemplateById(id: string): PageTemplate | undefined {
  return STARTER_TEMPLATES.find((t) => t.metadata.id === id);
}

/**
 * Get all templates.
 */
export function getAllTemplates(): PageTemplate[] {
  return STARTER_TEMPLATES;
}
