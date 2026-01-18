'use client';

import Button from '@/components/Button';
import { titleColors } from '@/lib/colors';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  RevealSection,
} from '@/components/motion';

// ============================================================================
// Resume Page - /resume
// ============================================================================
// Executive portfolio document style resume for Abe Reyes.
// Design: Refined document aesthetic with timeline spine and BJJ belt color accents.
// Typography: Playfair Display for headlines, Inter for body text.
// Accessibility: Minimum 14px (text-sm) for all text, 16px (text-base) for body copy.
// Animations: Framer Motion scroll-triggered reveals and staggered entries.

// ============================================================================
// Skills Data
// ============================================================================

const skills = [
  {
    category: 'Frontend & UI',
    items: ['React', 'Next.js', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'TipTap'],
    color: 'emerald',
  },
  {
    category: 'Backend & Data',
    items: ['Node.js', 'Python', 'PostgreSQL', 'Supabase', 'Redis', 'GraphQL'],
    color: 'blue',
  },
  {
    category: 'AI & Automation',
    items: ['OpenAI', 'Claude', 'RAG Systems', 'Prompting', 'Chatbots'],
    color: 'purple',
  },
  {
    category: 'Quality & Process',
    items: ['Playwright', 'Vitest', 'WCAG AA', 'TDD', 'CI/CD', 'Git'],
    color: 'amber',
  },
];

// ============================================================================
// Experience Data
// ============================================================================

const experience = [
  {
    title: 'Full Stack Developer',
    company: 'needthisdone.com',
    type: 'Professional Services Platform',
    period: 'Nov 2025 - Present',
    color: 'emerald',
    highlights: [
      'Integrated Vercel, Railway, Supabase, Redis, and Stripe with graceful degradation',
      'Built optimistic cart updates with automatic rollback on failure',
      'Created quotes-to-payment workflow with full status tracking',
      'Wired Stripe webhooks for database updates, cache clearing, and transaction logging',
    ],
  },
  {
    title: 'Technical Operations Specialist',
    company: 'Acadio',
    type: 'Educational Platform',
    period: 'Apr 2025 - Dec 2025',
    color: 'blue',
    highlights: [
      'Started as contractor, promoted to expanded role after proving value',
      'Became go-to person for CEO on technical questions',
      'Built Python scripts to convert textbooks from PDFs to clean HTML',
      'Turned multi-day data migrations into same-day completions',
    ],
  },
  {
    title: 'Freelance Developer',
    company: 'Self-Employed',
    type: 'Independent Contractor',
    period: 'Jan 2023 - Mar 2024',
    color: 'purple',
    highlights: [
      'Built websites and automation tools for clients',
      'Progressed from tutorials to production applications',
    ],
  },
  {
    title: 'F&I Manager',
    company: 'Toyota of Orlando',
    type: 'Sales → Sales Manager → F&I',
    period: '2017 - 2023',
    color: 'amber',
    highlights: [
      'Three promotions over seven years at high-volume dealership',
      'Managed 3-7 customer financing deals daily',
      'Go-to person for complicated deals requiring clear explanations',
    ],
  },
  {
    title: 'Combat Medic, Corporal',
    company: 'U.S. Army',
    type: 'Fort Hood & Fort Bragg',
    period: '1996 - 2001',
    color: 'stone',
    highlights: [
      'Led team of 3 medics and 2 combat lifesavers',
      'Delivered emergency care in high-stakes environments',
      'Learned calm under pressure and precise protocol execution',
    ],
  },
];

// ============================================================================
// Education Data
// ============================================================================

const education = [
  {
    institution: 'Full Sail University',
    focus: 'Web Design & Development',
    period: '2016 - 2017',
    note: "Straight A's while working full-time",
  },
  {
    institution: 'U.S. Army Medical Center',
    focus: 'Combat Medic Certification',
    period: '1996',
    note: 'Graduated top 10% of class',
  },
];

// ============================================================================
// Color utilities for timeline
// ============================================================================

const timelineColors: Record<string, { dot: string; line: string; badge: string }> = {
  emerald: {
    dot: 'bg-emerald-500',
    line: 'from-emerald-500',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  blue: {
    dot: 'bg-blue-500',
    line: 'from-blue-500',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  purple: {
    dot: 'bg-purple-500',
    line: 'from-purple-500',
    badge: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  amber: {
    dot: 'bg-amber-500',
    line: 'from-amber-500',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  stone: {
    dot: 'bg-stone-500',
    line: 'from-stone-500',
    badge: 'bg-stone-100 text-stone-800 border-stone-300',
  },
};

// ============================================================================
// Page Component
// ============================================================================

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      {/* ================================================================
          Header - Name Card Style
          ================================================================ */}
      <FadeIn triggerOnScroll={false} as="header" className="pt-12 pb-8 md:pt-16 md:pb-12">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          {/* Decorative top border */}
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
            <span className="text-sm tracking-[0.2em] uppercase text-stone-500 font-medium">
              Curriculum Vitae
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
          </div>

          {/* Name and title */}
          <div className="text-center mb-8">
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 mb-3">
              Abiezer{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                &ldquo;Abe&rdquo;
              </span>{' '}
              Reyes
            </h1>
            <p className="text-xl md:text-2xl text-stone-600 font-medium tracking-wide">
              Full-Stack Developer
            </p>
          </div>

          {/* Contact info - horizontal pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-stone-200 text-base text-stone-700 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Orlando, FL
            </span>
            <a
              href="mailto:abe.raise@gmail.com"
              className="inline-flex items-center px-4 py-2.5 rounded-full bg-white border border-stone-200 text-base text-stone-700 shadow-sm hover:border-stone-400 hover:shadow-md transition-all"
            >
              abe.raise@gmail.com
            </a>
            <a
              href="https://needthisdone.com"
              className="inline-flex items-center px-4 py-2.5 rounded-full bg-white border border-stone-200 text-base text-stone-700 shadow-sm hover:border-stone-400 hover:shadow-md transition-all"
            >
              needthisdone.com
            </a>
            <a
              href="https://github.com/AbeJitsu"
              className="inline-flex items-center px-4 py-2.5 rounded-full bg-white border border-stone-200 text-base text-stone-700 shadow-sm hover:border-stone-400 hover:shadow-md transition-all"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/weneedthisdone"
              className="inline-flex items-center px-4 py-2.5 rounded-full bg-white border border-stone-200 text-base text-stone-700 shadow-sm hover:border-stone-400 hover:shadow-md transition-all"
            >
              LinkedIn
            </a>
          </div>

          {/* Summary quote */}
          <div className="max-w-3xl mx-auto">
            <blockquote className="relative text-center">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl font-playfair text-stone-200 leading-none">
                &ldquo;
              </span>
              <p className="font-playfair text-lg md:text-xl text-stone-700 leading-relaxed italic pt-6">
                Over 25 years working with technology in business environments. I stay calm when things break,
                explain technical stuff so it makes sense the first time, and follow through on what I say I&apos;ll do.
              </p>
            </blockquote>
          </div>
        </div>
      </FadeIn>

      {/* ================================================================
          Skills Section - Horizontal Cards
          ================================================================ */}
      <RevealSection as="section" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm tracking-[0.15em] uppercase text-stone-500 font-semibold">
              Technical Skills
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-stone-300 to-transparent" />
          </div>

          {/* Skills grid */}
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-5" triggerOnScroll={false}>
            {skills.map((skill) => (
              <StaggerItem key={skill.category}>
                <div className="group relative p-6 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition-all duration-300 hover:shadow-lg h-full">
                  {/* Hover glow */}
                  <div
                    className={`absolute -inset-px rounded-2xl bg-gradient-to-br from-${skill.color}-500/10 to-${skill.color}-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`}
                  />

                  <h3
                    className={`font-bold text-base mb-4 ${
                      skill.color === 'emerald'
                        ? titleColors.green
                        : skill.color === 'blue'
                          ? titleColors.blue
                          : skill.color === 'purple'
                            ? titleColors.purple
                            : titleColors.gold
                    }`}
                  >
                    {skill.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skill.items.map((item) => (
                      <span
                        key={item}
                        className="inline-block px-3 py-1 text-sm rounded-lg bg-stone-100 text-stone-700 font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </RevealSection>

      {/* ================================================================
          Experience Section - Timeline
          ================================================================ */}
      <RevealSection as="section" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-10">
            <span className="text-sm tracking-[0.15em] uppercase text-stone-500 font-semibold">
              Experience
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-stone-300 to-transparent" />
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical spine */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-300 via-blue-300 via-purple-300 to-stone-300" />

            {/* Experience items */}
            <StaggerContainer className="space-y-8 md:space-y-10" triggerOnScroll={false}>
              {experience.map((job) => {
                const colors = timelineColors[job.color];
                return (
                  <StaggerItem key={`${job.company}-${job.title}`}>
                    <div className="relative pl-14 md:pl-18">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-2 md:left-4 top-2 w-5 h-5 rounded-full ${colors.dot} ring-4 ring-white shadow-lg`}
                      />

                      {/* Content card */}
                      <div className="group relative p-6 md:p-8 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition-all duration-300 hover:shadow-lg">
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                          <div>
                            <h3 className="font-playfair text-xl md:text-2xl font-bold text-stone-900 mb-1">
                              {job.title}
                            </h3>
                            <p className="text-lg text-stone-700 font-medium">{job.company}</p>
                            <p className="text-base text-stone-500">{job.type}</p>
                          </div>
                          <span
                            className={`inline-flex self-start px-4 py-1.5 text-sm font-semibold rounded-full border ${colors.badge}`}
                          >
                            {job.period}
                          </span>
                        </div>

                        {/* Highlights */}
                        <ul className="space-y-3">
                          {job.highlights.map((highlight, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-3 text-base text-stone-600 leading-relaxed"
                            >
                              <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${colors.dot}`} />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </div>
      </RevealSection>

      {/* ================================================================
          Featured Project - Highlighted Card
          ================================================================ */}
      <FadeIn as="section" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm tracking-[0.15em] uppercase text-stone-500 font-semibold">
              Featured Project
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-stone-300 to-transparent" />
          </div>

          {/* Project card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-8 md:p-12">
            {/* Decorative gradient orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="mb-8">
                <h3 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
                  needthisdone.com
                </h3>
                <p className="text-lg text-stone-300">
                  Full-stack Next.js application serving real customers in production
                </p>
              </div>

              {/* Feature grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                  'PostgreSQL schema design',
                  'Type-safe TypeScript + Zod',
                  'Admin dashboard',
                  'Stripe payment integration',
                  'Playwright E2E tests',
                  'Vitest unit tests',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-base text-stone-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-2.5">
                {['React', 'Next.js', 'TypeScript', 'Medusa', 'PostgreSQL', 'Redis', 'Stripe', 'Vercel'].map(
                  (tech) => (
                    <span
                      key={tech}
                      className="px-4 py-1.5 text-sm font-medium rounded-full bg-white/10 text-stone-200 border border-white/10"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ================================================================
          Education & Reading - Two Column
          ================================================================ */}
      <RevealSection as="section" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            {/* Education */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm tracking-[0.15em] uppercase text-stone-500 font-semibold">
                  Education
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-stone-300 to-transparent" />
              </div>

              <StaggerContainer className="space-y-5" triggerOnScroll={false}>
                {education.map((edu) => (
                  <StaggerItem key={edu.institution}>
                    <div className="p-6 rounded-2xl bg-white border border-stone-200">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-bold text-lg text-stone-900">{edu.institution}</h3>
                        <span className="text-sm text-stone-500 font-medium">{edu.period}</span>
                      </div>
                      <p className="text-base text-stone-700 mb-1">{edu.focus}</p>
                      <p className="text-sm text-stone-500 italic">{edu.note}</p>
                    </div>
                  </StaggerItem>
                ))}

                {/* Ongoing learning */}
                <StaggerItem>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
                    <h3 className="font-bold text-lg text-stone-900 mb-2">Continuous Learning</h3>
                    <p className="text-base text-stone-700 leading-relaxed">
                      freeCodeCamp Full Stack (in progress), Khan Academy CS Principles (100% mastery),
                      Vue.js Complete Guide, 100 Days of Code
                    </p>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>

            {/* Books */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm tracking-[0.15em] uppercase text-stone-500 font-semibold">
                  Influential Reading
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-stone-300 to-transparent" />
              </div>

              <StaggerContainer className="space-y-5" triggerOnScroll={false}>
                {[
                  {
                    title: 'The Pragmatic Programmer',
                    author: 'Thomas & Hunt',
                    lesson: 'Fix small things before they become big things.',
                  },
                  {
                    title: 'Algorithms to Live By',
                    author: 'Christian & Griffiths',
                    lesson: 'Sometimes good enough now beats perfect later.',
                  },
                  {
                    title: 'Never Split the Difference',
                    author: 'Chris Voss',
                    lesson: 'Hard conversations get easier when you understand first.',
                  },
                  {
                    title: 'Seven Principles for Marriage',
                    author: 'John Gottman',
                    lesson: 'What keeps marriages together keeps teams together.',
                  },
                ].map((book) => (
                  <StaggerItem key={book.title}>
                    <div className="p-6 rounded-2xl bg-white border border-stone-200">
                      <h3 className="font-bold text-base text-stone-900">{book.title}</h3>
                      <p className="text-sm text-stone-500 mb-2">by {book.author}</p>
                      <p className="text-base text-stone-700 italic leading-relaxed">
                        &ldquo;{book.lesson}&rdquo;
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ================================================================
          CTA Section
          ================================================================ */}
      <FadeIn as="section" className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          <div className="text-center">
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-stone-300" />
              <span className="text-sm tracking-[0.2em] uppercase text-stone-500 font-semibold">
                Let&apos;s Connect
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-stone-300" />
            </div>

            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 mb-5">
              Ready to work together?
            </h2>
            <p className="text-lg md:text-xl text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Learn more about who I am, see what services I offer, or start a conversation about your project.
            </p>

            {/* CTA buttons - BJJ belt progression */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="green" href="/about" size="lg" className="shadow-lg shadow-emerald-500/25">
                About Me
              </Button>
              <Button variant="blue" href="/services" size="lg" className="shadow-lg shadow-blue-500/25">
                Services
              </Button>
              <Button variant="purple" href="/contact" size="lg" className="shadow-lg shadow-purple-500/25">
                Get in Touch
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
