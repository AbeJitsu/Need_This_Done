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
  { label: 'Public offers', value: '2', color: 'emerald' },
  { label: 'Audit-to-intake path', value: '1', color: 'blue' },
  { label: 'Weekly briefs per pilot', value: '4', color: 'purple' },
  { label: 'Human approval for external actions', value: '100%', color: 'amber' },
];

// ============================================================================
// Case Studies
// ============================================================================

export const caseStudies: CaseStudy[] = [
  {
    id: 'needthisdone',
    title: 'NeedThisDone.com',
    subtitle: 'Lead Capture and Supervised-Operator Platform',
    role: 'Founder, Builder, and Operator',
    period: 'Current',
    description:
      'A public site that turns an audit or project request into a durable, human-led delivery workflow. The public offers stay simple while private operator surfaces preserve evidence, approvals, and outcomes.',
    impact: [
      'A site report opens a preselected Website Improvement request',
      'Project, brief, decision, and outcome records are durable in Supabase',
      'Operator surfaces remain private instead of becoming a client dashboard',
      'Every external outreach action remains behind a human approval and sender boundary',
    ],
    features: [
      'Public site analyzer and report pages',
      'Dual-offer project intake',
      'Private dashboard, employee, and prospecting workspaces',
      'Supabase RLS and authenticated lifecycle checks',
      'Accessibility, route, and browser coverage',
      'Optional model and sender boundaries that fail closed',
    ],
    tech: [
      'Next.js 14',
      'React',
      'TypeScript',
      'Supabase',
      'PostgreSQL',
      'Redis',
      'Playwright',
      'Vitest',
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
    subtitle: 'Technical Operations Delivery',
    role: 'Contractor and Technical Operations Specialist',
    period: '2025',
    description:
      'Technical-operations work for an educational platform, focused on converting repetitive content and data preparation into reviewable delivery pipelines.',
    impact: [
      'Built a PDF-to-HTML conversion pipeline for variable source material',
      'Created validation and data-migration tooling for repeatable delivery',
      'Worked with regulated educational content under defined review steps',
      'Turned recurring preparation work into documented, reusable workflows',
    ],
    features: [
      'PDF to clean HTML conversion pipeline',
      'Data migration tooling',
      'Content validation workflows',
    ],
    tech: ['Python', 'Puppeteer', 'BeautifulSoup', 'Selenium', 'TinyMCE'],
    color: 'blue',
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
    label: 'Public conversion',
    items: ['Website Audit', 'Dual Offers', 'Adaptive Intake', 'Report CTA'],
    color: 'emerald',
  },
  {
    label: 'Private operations',
    items: ['Operator Cockpit', 'Approval Queues', 'Weekly Briefs', 'Outcome Records'],
    color: 'blue',
  },
  {
    label: 'Durable truth',
    items: ['Supabase', 'PostgreSQL', 'RLS', 'Idempotency'],
    color: 'purple',
  },
  {
    label: 'Transient support',
    items: ['Redis Cache', 'Rate Limits', 'Deduplication', 'Short-lived Coordination'],
    color: 'amber',
  },
];

// ============================================================================
// Process steps for "How I Work" section
// ============================================================================

export const processSteps = [
  {
    number: 1,
    title: 'Make the scope observable',
    description: 'Start with the page, bottleneck, evidence, and desired result—not a broad promise to build everything.',
    color: 'emerald' as const,
  },
  {
    number: 2,
    title: 'Set the approval boundary',
    description: 'Write down what the work may prepare and what must still wait for a human decision.',
    color: 'blue' as const,
  },
  {
    number: 3,
    title: 'Verify the work',
    description: 'Use route, accessibility, browser, and workflow coverage to confirm the intended path still works.',
    color: 'purple' as const,
  },
  {
    number: 4,
    title: 'Hand off the next decision',
    description: 'Deliver the contained fix or a weekly brief with clear outcomes and the next recommended action.',
    color: 'amber' as const,
  },
];
