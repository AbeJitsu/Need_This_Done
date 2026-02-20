// ============================================================================
// Portfolio Data - Static content for the /work page
// ============================================================================
// Why static? These are curated case studies, not CMS content.
// The data changes rarely and benefits from type safety over editability.

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  role: string;
  period: string;
  description: string;
  impact: string[];
  features: string[];
  tech: string[];
  links?: { label: string; href: string }[];
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}

export interface StatItem {
  label: string;
  value: string;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}

// ============================================================================
// Stats - Headline numbers for the hero
// ============================================================================

export const heroStats: StatItem[] = [
  { label: 'API Routes', value: '74', color: 'emerald' },
  { label: 'Components', value: '160+', color: 'blue' },
  { label: 'Test Files', value: '71', color: 'purple' },
  { label: 'DB Migrations', value: '53', color: 'amber' },
];

// ============================================================================
// Case Studies
// ============================================================================

export const caseStudies: CaseStudy[] = [
  {
    id: 'needthisdone',
    title: 'NeedThisDone.com',
    subtitle: 'Full-Stack E-Commerce Platform',
    role: 'Solo Developer & Architect',
    period: 'November 2025 - Present',
    description:
      'Online store and business platform built from scratch. Handles payments, bookings, email campaigns, and customer accounts — everything a growing business needs in one place.',
    impact: [
      'Built from zero to production in under 3 months',
      'Built-in safeguards so nothing breaks — if something goes wrong, the system recovers automatically',
      'AI chatbot that learns from the website to answer customer questions automatically',
      'Accessible to everyone, including visitors who use screen readers',
    ],
    features: [
      'Shopping cart & Stripe payments',
      'Appointment booking system',
      'Admin dashboards (10+ panels)',
      'AI chatbot with semantic search',
      'Inline CMS page editor',
      'Customer loyalty points',
      'Referral program',
      'Email campaign system',
      'Product waitlist & notifications',
      'Playwright E2E + Vitest unit tests',
    ],
    tech: [
      'Next.js 14',
      'React',
      'TypeScript',
      'Supabase',
      'PostgreSQL',
      'Redis',
      'Stripe',
      'Medusa',
      'OpenAI',
      'Playwright',
      'Docker',
      'Vercel',
    ],
    links: [
      { label: 'Live Site', href: 'https://needthisdone.com' },
      { label: 'GitHub', href: 'https://github.com/AbeJitsu/Need_This_Done' },
    ],
    color: 'emerald',
  },
  {
    id: 'acadio',
    title: 'Acadio',
    subtitle: 'Educational LMS Platform',
    role: 'Contractor → Technical Operations Specialist',
    period: 'April 2025 - December 2025',
    description:
      'Started as a contractor building backend tools. Earned a promotion to full-time by turning weeks of manual work into automated pipelines.',
    impact: [
      'Promoted from contractor to Technical Operations Specialist based on performance',
      'PDF-to-HTML conversion pipeline eliminated weeks of manual formatting',
      'Automated extraction of regulated financial content for compliance training',
      'Automated flashcard generation from structured course content',
    ],
    features: [
      'PDF to clean HTML conversion pipeline',
      'FINRA regulatory content scraping',
      'Automated flashcard generation',
      'Data migration tooling',
      'Content validation workflows',
    ],
    tech: ['Python', 'Puppeteer', 'BeautifulSoup', 'Selenium', 'TinyMCE'],
    color: 'blue',
  },
  {
    id: 'bridgette',
    title: 'Bridgette Automation',
    subtitle: 'AI-Powered Development Automation',
    role: 'Creator & Maintainer',
    period: 'January 2026 - Present',
    description:
      'Automation tool that runs development tasks on a schedule — no manual work required. Combines AI with background processes to keep projects moving.',
    impact: [
      'Clean, well-tested codebase',
      'Runs tasks automatically in the background, hands-free',
      'Extensible plugin architecture for custom workflows',
    ],
    features: [
      'Claude Code CLI integration',
      'Scheduled task automation',
      'launchd daemon management',
      'Plugin system for workflows',
    ],
    tech: ['Next.js 14', 'TypeScript', 'Node.js', 'launchd'],
    links: [
      { label: 'GitHub', href: 'https://github.com/AbeJitsu/bridgette-automation' },
    ],
    color: 'purple',
  },
];

// ============================================================================
// Architecture layers for NeedThisDone diagram
// ============================================================================

export interface ArchLayer {
  label: string;
  items: string[];
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}

export const architectureLayers: ArchLayer[] = [
  {
    label: 'Frontend',
    items: ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS'],
    color: 'emerald',
  },
  {
    label: 'Backend & APIs',
    items: ['Next.js API Routes', 'Medusa Commerce', 'Redis Cache'],
    color: 'blue',
  },
  {
    label: 'Data & Auth',
    items: ['Supabase (PostgreSQL)', 'pgvector Embeddings', 'Google OAuth'],
    color: 'purple',
  },
  {
    label: 'Infrastructure',
    items: ['Vercel', 'Stripe Payments', 'Docker', 'GitHub Actions'],
    color: 'amber',
  },
];

// ============================================================================
// Process steps for "How I Work" section
// ============================================================================

export const processSteps = [
  {
    number: 1,
    title: 'Understand the Problem',
    description: 'I start by listening. What are you trying to accomplish? What have you tried? What does success look like?',
    color: 'emerald' as const,
  },
  {
    number: 2,
    title: 'Plan the Architecture',
    description: 'I map out the system design, integrations, and launch plan before writing a single line of code.',
    color: 'blue' as const,
  },
  {
    number: 3,
    title: 'Build with Tests',
    description: 'Test-driven development from day one. Every feature gets automated tests. Every deploy runs the full suite. No surprises.',
    color: 'purple' as const,
  },
  {
    number: 4,
    title: 'Ship and Support',
    description: 'I deploy to production with monitoring and stick around to make sure everything works. Your project doesn\'t end at launch.',
    color: 'amber' as const,
  },
];
