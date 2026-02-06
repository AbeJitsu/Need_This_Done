import { Metadata } from 'next';
import Button from '@/components/Button';

// ============================================================================
// Resume Page - /resume
// ============================================================================
// Matches PDF resume content. Tech-focused: no non-tech roles.
// Dark editorial design: Playfair Display headlines, Inter body, glass cards.

export const metadata: Metadata = {
  title: 'Resume - Abe Reyes | Need This Done',
  description:
    'Full Stack Developer & AI Systems Builder. Production e-commerce, RAG chatbot, Python automation.',
  openGraph: {
    title: 'Resume - Abe Reyes | Full Stack Developer & AI Systems Builder',
    description:
      '150+ React components, 70+ API routes, 1,300+ commits. Claude Code max subscriber shipping production systems.',
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume - Abe Reyes | Full Stack Developer & AI Systems Builder',
    description:
      '150+ React components, 70+ API routes, 1,300+ commits. Production e-commerce with AI/RAG.',
  },
};

// ============================================================================
// Data — mirrors PDF resume exactly
// ============================================================================

const skills = [
  {
    category: 'Frontend',
    items: 'React, Next.js 14, TypeScript, Tailwind, Storybook, state management',
    color: 'emerald',
  },
  {
    category: 'Backend',
    items: 'API design, middleware, authentication, rate limiting, webhooks',
    color: 'blue',
  },
  {
    category: 'Databases',
    items: 'PostgreSQL, Supabase, Redis, pgvector, semantic search',
    color: 'purple',
  },
  {
    category: 'DevOps',
    items: 'Docker, GitHub Actions, CI/CD, Railway, Vercel',
    color: 'amber',
  },
  {
    category: 'AI & Automation',
    items: 'Claude/OpenAI APIs, RAG systems, Python, data transformation',
    color: 'emerald',
  },
  {
    category: 'Testing',
    items: 'Playwright E2E, Vitest, accessibility (WCAG AA)',
    color: 'blue',
  },
];

const experience = [
  {
    title: 'Full Stack Developer',
    org: 'needthisdone.com',
    orgNote: 'Own Platform',
    period: '2023 - Present',
    color: 'emerald',
    stats: '150+ React components | 70+ API routes | 20+ public pages | 15+ admin pages | 1,300+ commits | 50+ E2E tests',
    subsections: [
      {
        heading: 'Features',
        items: [
          'RAG chatbot with pgvector semantic search',
          'Appointment booking system',
          'Stripe payment processing (refunds, disputes, subscriptions)',
          'Visual page builder for non-technical users',
          'Redis caching layer',
          '7 Context providers for state management',
          'WCAG AA accessibility (100% Lighthouse)',
        ],
      },
      {
        heading: 'Testing & Quality',
        items: [
          '50+ Playwright E2E tests covering checkout, booking, account flows',
          'Vitest unit tests with business logic isolation',
          'Storybook documentation for component API reference',
          'GitHub Actions CI/CD: Dev → Testing → Production',
        ],
      },
      {
        heading: 'Built With',
        items: [
          'Payment processing (Stripe with webhooks) | Real-time notifications (Resend email)',
          'Caching layer | Semantic search (pgvector)',
          'CI/CD pipeline for three environments | Comprehensive test coverage',
        ],
      },
    ],
  },
  {
    title: 'Technical Operations Developer',
    org: 'Acadio',
    orgNote: 'EdTech Platform',
    period: 'Apr 2025 - Dec 2025',
    color: 'blue',
    stats: '10+ Python automation scripts | Multiple data migration pipelines | Weeks of work converted to hours',
    highlights: [
      'PDF to clean HTML conversion pipeline handling variable formatting',
      'Multi-phase validation systems with auto-correction',
      'FINRA web scraping infrastructure for AI study content generation',
      'Excel macros and VBA scripts automating client data entry',
    ],
    tech: 'Python, Puppeteer, BeautifulSoup, PDF processing, HTML generation, TinyMCE',
  },
  {
    title: 'Founder & Developer',
    org: 'Bridgette Automation Dashboard',
    period: 'Jan 2026 - Present',
    color: 'purple',
    highlights: [
      'Claude Code CLI wrapper with real-time streaming chat UI',
      'Next.js 14 with three-panel responsive layout',
      'Task automation scheduling via launchd',
      'TypeScript 90%+ of codebase',
    ],
  },
];

const education = [
  {
    title: 'Self-Directed Development',
    detail: '2016-Present | 10 years building software through deliberate practice and production experience',
  },
  {
    title: 'freeCodeCamp Full Stack Track',
    detail: 'Responsive Web Design (completed) | Full Stack Developer (in progress)',
  },
  {
    title: 'Khan Academy - AP Computer Science Principles',
    detail: '100% mastery | Algorithms, data structures, networking, cybersecurity',
  },
];

// Color maps
const dotColor: Record<string, string> = {
  emerald: 'bg-emerald-400',
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
  amber: 'bg-amber-400',
};

const cardHover: Record<string, string> = {
  emerald: 'hover:border-emerald-500/40 hover:ring-1 hover:ring-emerald-500/20',
  blue: 'hover:border-blue-500/40 hover:ring-1 hover:ring-blue-500/20',
  purple: 'hover:border-purple-500/40 hover:ring-1 hover:ring-purple-500/20',
  amber: 'hover:border-amber-500/40 hover:ring-1 hover:ring-amber-500/20',
};

const titleColor: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  amber: 'text-amber-400',
};

const statsBorder: Record<string, string> = {
  emerald: 'border-emerald-500/20 bg-emerald-500/5',
  blue: 'border-blue-500/20 bg-blue-500/5',
  purple: 'border-purple-500/20 bg-purple-500/5',
};

const subsectionColor: Record<string, string> = {
  emerald: 'text-emerald-300',
  blue: 'text-blue-300',
  purple: 'text-purple-300',
};

// ============================================================================
// Page Component
// ============================================================================

export default function ResumePage() {
  return (
    <div className="min-h-screen">
      {/* ================================================================
          Open to Opportunities Banner
          ================================================================ */}
      <section className="bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-semibold tracking-wide">
              Open to full-time and contract opportunities
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/abe-reyes-resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              Download PDF
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full bg-white text-emerald-700 hover:bg-gray-100 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================
          Hero - Dark Editorial Header
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12 pt-16 md:pt-24 pb-16 md:pb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Curriculum Vitae
            </span>
          </div>

          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-3 leading-[1.1]">
            Abiezer{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              &ldquo;Abe&rdquo;
            </span>{' '}
            Reyes
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-medium tracking-wide mb-8">
            Full Stack Developer & AI Systems Builder
          </p>

          {/* Contact pills */}
          <div className="flex flex-wrap gap-3 mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Orlando, FL 32839
            </span>
            <a href="tel:407-873-6713" className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-white/20 transition-colors">
              407-873-6713
            </a>
            <a href="mailto:abe.raise@gmail.com" className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-white/20 transition-colors">
              abe.raise@gmail.com
            </a>
            <a href="https://needthisdone.com" className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-white/20 transition-colors">
              needthisdone.com
            </a>
            <a href="https://github.com/AbeJitsu" className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-white/20 transition-colors">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/weneedthisdone" className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-white/20 transition-colors">
              LinkedIn
            </a>
          </div>

          {/* Overview — matches PDF */}
          <div className="max-w-3xl">
            <p className="text-base md:text-lg text-slate-300 leading-relaxed">
              Full-stack developer shipping production systems. Claude Code max subscriber using
              LLM-driven development daily. Built complete e-commerce platform with AI/RAG. Python
              automation specialist who transformed months of manual work into hours. Comfortable from
              database schema to deployment pipelines.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          Technical Experience - Dark Glass Cards
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12 py-16 md:py-20">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Technical Experience
            </span>
          </div>

          <div className="space-y-8">
            {experience.map((job) => (
              <div
                key={job.org}
                className={`p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 ${cardHover[job.color]} transition-all duration-300 backdrop-blur-sm`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
                  <h3 className={`font-playfair text-xl md:text-2xl font-black tracking-tight ${titleColor[job.color]}`}>
                    {job.title}
                  </h3>
                  <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
                    {job.period}
                  </span>
                </div>
                <p className="text-base text-slate-300 mb-4">
                  {job.org}
                  {'orgNote' in job && job.orgNote && (
                    <span className="text-slate-500"> ({job.orgNote})</span>
                  )}
                </p>

                {/* Stats strip */}
                {'stats' in job && job.stats && (
                  <div className={`mb-6 px-4 py-3 rounded-xl border-l-4 ${statsBorder[job.color]}`}>
                    <p className="text-sm font-semibold text-slate-200 leading-relaxed">
                      {job.stats}
                    </p>
                  </div>
                )}

                {/* Subsections (NeedThisDone) */}
                {'subsections' in job && job.subsections ? (
                  <div className="space-y-5">
                    {job.subsections.map((sub) => (
                      <div key={sub.heading}>
                        <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${subsectionColor[job.color]}`}>
                          {sub.heading}
                        </h4>
                        <ul className="space-y-2">
                          {sub.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                              <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${dotColor[job.color]}`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <ul className="space-y-2">
                      {job.highlights?.map((h, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                          <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${dotColor[job.color]}`} />
                          {h}
                        </li>
                      ))}
                    </ul>
                    {'tech' in job && job.tech && (
                      <p className="text-xs text-slate-500 mt-4">
                        <span className="font-semibold text-slate-400">Tech:</span> {job.tech}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          Technical Skills - 2-col grid on dark
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12 py-16 md:py-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Technical Skills
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.map((skill) => (
              <div
                key={skill.category}
                className={`p-5 rounded-2xl bg-white/5 border border-white/10 ${cardHover[skill.color]} transition-all duration-300 backdrop-blur-sm`}
              >
                <h3 className={`font-black text-sm mb-3 tracking-tight uppercase ${titleColor[skill.color]}`}>
                  {skill.category}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">{skill.items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          Education & Learning - Light Section
          ================================================================ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-500">
              Education & Learning
            </span>
          </div>

          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.title} className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <h3 className="font-black text-base text-gray-900 tracking-tight mb-1">{edu.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{edu.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA - Dark Editorial
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 md:py-24">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 sm:px-10 md:px-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Let&apos;s Connect
            </span>
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
          </div>

          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-5">
            Ready to work together?
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            See what I&apos;ve built, learn more about who I am, or start a conversation about your project.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="green" href="/work" size="lg" className="shadow-lg shadow-emerald-500/25">
              View My Work
            </Button>
            <Button variant="blue" href="/about" size="lg" className="shadow-lg shadow-blue-500/25">
              About Me
            </Button>
            <Button variant="purple" href="/contact" size="lg" className="shadow-lg shadow-purple-500/25">
              Start a Project
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
