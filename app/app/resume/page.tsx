import { Metadata } from 'next';
import Button from '@/components/Button';

// ============================================================================
// Resume Page - /resume
// ============================================================================
// Bold editorial redesign matching about, pricing, contact, and login pages.
// Dark hero → Light sections → Dark featured project → Light education → Dark CTA
// Typography: Playfair Display for headlines, Inter for body text.

export const metadata: Metadata = {
  title: 'Resume - Abe Reyes | Need This Done',
  description:
    'Full-stack developer specializing in React, Next.js, and TypeScript. Army veteran, BJJ purple belt.',
};

// ============================================================================
// Data
// ============================================================================

const skills = [
  {
    category: 'Frontend & UI',
    items: ['React', 'Next.js', 'TypeScript', 'JavaScript (ES6+)', 'Tailwind CSS', 'HTML5/CSS3', 'Responsive Design', 'Component Libraries'],
    color: 'emerald',
  },
  {
    category: 'Backend & Data',
    items: ['Node.js', 'PostgreSQL', 'Supabase', 'REST APIs', 'Redis', 'Python', 'Database Design', 'Third-Party APIs'],
    color: 'blue',
  },
  {
    category: 'Testing & Quality',
    items: ['Playwright E2E', 'Vitest', 'Unit Testing', 'Integration Testing', 'WCAG AA Accessibility', 'CI/CD'],
    color: 'purple',
  },
  {
    category: 'Tools & DevOps',
    items: ['Git', 'Docker', 'GitHub Actions', 'Vercel', 'pnpm/npm', 'Linux'],
    color: 'amber',
  },
  {
    category: 'AI & Automation',
    items: ['OpenAI API', 'RAG Systems', 'Vector Embeddings', 'Web Scraping', 'Data Transformation'],
    color: 'emerald',
  },
  {
    category: 'Soft Skills',
    items: ['Technical Writing', 'Code Reviews', 'Problem Solving', 'Cross-Functional Collaboration'],
    color: 'blue',
  },
];

const experience = [
  {
    title: 'Full-Stack Developer & Consultant',
    company: 'needthisdone.com',
    type: 'Independent Consulting Practice',
    period: 'November 2023 - Present',
    color: 'emerald',
    subsections: [
      {
        label: 'Key Engagement: Acadio (Educational LMS Platform)',
        sublabel: 'April 2025 - December 2025 • Technical Operations Specialist',
        highlights: [
          'Started as contractor doing API work; proved value and expanded responsibilities',
          'Became the person leadership came to with technical questions',
          'Built Python scripts to convert messy PDFs into clean HTML for learning platform',
          'Designed automated workflows eliminating manual processes',
          'Handled data migrations turning multi-day headaches into same-day completions',
        ],
        tech: 'Python, Puppeteer, BeautifulSoup, TinyMCE',
      },
      {
        label: 'Additional Work',
        highlights: [
          'Built production e-commerce platform with AI chatbot, payment processing, and automated testing (needthisdone.com)',
          'Built automated data extraction workflows using Python (BeautifulSoup, Selenium) to convert PDFs, Excel files, and web content into clean, structured formats',
          'Scraped regulated content (FINRA rules) for RAG systems with validation and quality checks',
          'Ongoing client services: web development, data automation, and marketing analytics',
        ],
      },
    ],
  },
  {
    title: 'Finance and Insurance Manager',
    company: 'Toyota of Orlando',
    location: 'Orlando, FL',
    type: 'Salesperson → Sales Manager → F&I Manager',
    period: 'Spring 2017 - Winter 2023',
    color: 'blue',
    highlights: [
      'Earned three promotions over seven years at a high-volume dealership moving 10-30 cars daily',
      'Worked with 3-7 customers daily, walking them through their options and putting together financing across different lenders',
      'Built trust with customers by explaining options clearly. Became the go-to person when teammates had complicated deals',
    ],
  },
  {
    title: 'Military Enrollment Counselor',
    company: 'Full Sail University',
    location: 'Winter Park, FL',
    type: 'International Admissions → Military Student Services',
    period: '2012 - 2017',
    color: 'purple',
    highlights: [
      'Started in International Admissions, then moved to Military Student Services where Army background gave credibility with veterans navigating civilian life',
      'Guided service members and families through GI Bill benefits, program costs, and fitting education around military schedules',
    ],
  },
  {
    title: 'Combat Medic, Corporal (E-4)',
    company: 'U.S. Army',
    location: 'Fort Hood, TX & Fort Bragg, NC',
    period: '1996 - 2001',
    color: 'amber',
    highlights: [
      'Led a team of 3 medics and 2 combat lifesavers. Delivered emergency care where mistakes cost lives and hesitation wasn\'t an option',
      'Learned to stay calm under pressure, follow protocols precisely, and take responsibility for my team\'s performance',
    ],
  },
];

const education = [
  {
    institution: 'Full Sail University',
    period: '2016 - 2017',
    note: 'Web Design & Development coursework. After teaching myself web technologies since the early 2000s, this program provided the structure to take those skills to a professional level. Straight A\'s while working full-time.',
  },
  {
    institution: 'Continuous Professional Development',
    period: '2023 - 2026',
    note: 'Khan Academy CS Principles (100% mastery), Vue.js Complete Guide, 100 Days of Code, ongoing learning through documentation, technical blogs, and hands-on project work.',
  },
  {
    institution: 'Independent Study',
    period: '2016 - 2023',
    note: 'Seven years of consistent skill development while working full-time. Progressed from tutorials to building production applications.',
  },
  {
    institution: 'U.S. Army Medical Department Center & School',
    period: '1996 - 2001',
    note: 'Combat Medic certification. Graduated top 10% of class.',
  },
];

const books = [
  {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    lesson: 'Why I fix the small stuff before it becomes big stuff. Broken windows invite more broken windows.',
  },
  {
    title: 'Algorithms to Live By',
    author: 'Brian Christian & Tom Griffiths',
    lesson: 'Sometimes good enough now beats perfect later. Knowing when to stop optimizing is its own skill.',
  },
  {
    title: 'Never Split the Difference',
    author: 'Chris Voss',
    lesson: 'Hard conversations get easier when you stop trying to win and start trying to understand.',
  },
  {
    title: 'Seven Principles for Making Marriage Work',
    author: 'John Gottman',
    lesson: 'What keeps marriages together keeps teams together: fix things fast, assume good intent, stay curious about the people you work with.',
  },
];

// Color maps for timeline and skill cards
const timelineDot: Record<string, string> = {
  emerald: 'bg-emerald-400',
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
  amber: 'bg-amber-400',
};

const skillCardBorder: Record<string, string> = {
  emerald: 'hover:border-emerald-500/40 hover:ring-1 hover:ring-emerald-500/20',
  blue: 'hover:border-blue-500/40 hover:ring-1 hover:ring-blue-500/20',
  purple: 'hover:border-purple-500/40 hover:ring-1 hover:ring-purple-500/20',
  amber: 'hover:border-amber-500/40 hover:ring-1 hover:ring-amber-500/20',
};

const skillTitle: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  amber: 'text-amber-400',
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
        {/* Decorative blurs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12 pt-16 md:pt-24 pb-16 md:pb-20">
          {/* Accent line + label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Curriculum Vitae
            </span>
          </div>

          {/* Name */}
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-3 leading-[1.1]">
            Abiezer{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              &ldquo;Abe&rdquo;
            </span>{' '}
            Reyes
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-medium tracking-wide mb-8">
            Full-Stack Developer
          </p>

          {/* Contact pills - dark glass */}
          <div className="flex flex-wrap gap-3 mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Orlando, FL 32839
            </span>
            <a
              href="tel:407-873-6713"
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-white/20 transition-colors"
            >
              407-873-6713
            </a>
            <a
              href="mailto:abe.raise@gmail.com"
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-white/20 transition-colors"
            >
              abe.raise@gmail.com
            </a>
            <a
              href="https://needthisdone.com"
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-white/20 transition-colors"
            >
              needthisdone.com
            </a>
            <a
              href="https://github.com/AbeJitsu"
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-white/20 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/weneedthisdone"
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-white/20 transition-colors"
            >
              LinkedIn
            </a>
          </div>

          {/* Summary */}
          <div className="max-w-3xl">
            <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-4">
              Full-stack developer specializing in React, Next.js, and TypeScript for building modern web applications.
              I build complete systems from database design through responsive frontends, with production experience
              in e-commerce platforms, AI integration, and data automation.
            </p>
            <p className="text-base text-slate-400 leading-relaxed mb-4">
              My approach combines clean code with practical problem-solving. I write tests, document decisions,
              and build for maintainability. Strong communication skills from years of translating complex information
              help me collaborate effectively across teams.
            </p>
            <p className="text-base text-slate-400 leading-relaxed">
              Before software, I earned three promotions at Toyota and led a medic team in the Army.
              That background taught me discipline, ownership, and how to deliver under pressure.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          Technical Skills - Dark Glass Cards
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12 py-16 md:py-20">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Technical Skills
            </span>
          </div>

          {/* Skills grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.map((skill) => (
              <div
                key={skill.category}
                className={`p-6 rounded-2xl bg-white/5 border border-white/10 ${skillCardBorder[skill.color]} transition-all duration-300 backdrop-blur-sm`}
              >
                <h3 className={`font-black text-base mb-4 tracking-tight ${skillTitle[skill.color]}`}>
                  {skill.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map((item) => (
                    <span
                      key={item}
                      className="inline-block px-3 py-1 text-sm rounded-lg bg-white/5 text-slate-300 font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          Experience - Light Section with Timeline
          ================================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-500">
              Professional Experience
            </span>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical spine */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-300 via-blue-300 via-purple-300 to-amber-300" />

            {/* Experience items */}
            <div className="space-y-10">
              {experience.map((job) => (
                <div key={`${job.company}-${job.title}`} className="relative pl-14 md:pl-18">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-2 md:left-4 top-2 w-5 h-5 rounded-full ${timelineDot[job.color]} ring-4 ring-white shadow-lg`}
                  />

                  {/* Content card */}
                  <div className="p-6 md:p-8 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors duration-300">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                      <div>
                        <h3 className="font-playfair text-xl md:text-2xl font-black text-gray-900 tracking-tight mb-1">
                          {job.title}
                        </h3>
                        <p className="text-lg text-gray-700 font-medium">{job.company}</p>
                        {job.location && <p className="text-base text-gray-500">{job.location}</p>}
                        {job.type && <p className="text-base text-gray-500">{job.type}</p>}
                      </div>
                      <span className="inline-flex self-start px-4 py-1.5 text-sm font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        {job.period}
                      </span>
                    </div>

                    {/* Subsections (for the consulting role) */}
                    {'subsections' in job && job.subsections ? (
                      <div className="space-y-6">
                        {job.subsections.map((sub, si) => (
                          <div key={si}>
                            <p className="font-bold text-gray-800 mb-1">{sub.label}</p>
                            {sub.sublabel && (
                              <p className="text-sm text-gray-500 mb-3">{sub.sublabel}</p>
                            )}
                            <ul className="space-y-2.5">
                              {sub.highlights.map((h, hi) => (
                                <li key={hi} className="flex items-start gap-3 text-base text-gray-600 leading-relaxed">
                                  <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${timelineDot[job.color]}`} />
                                  {h}
                                </li>
                              ))}
                            </ul>
                            {sub.tech && (
                              <p className="text-sm text-gray-500 mt-3">
                                <span className="font-semibold">Tech:</span> {sub.tech}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="space-y-2.5">
                        {job.highlights?.map((highlight, i) => (
                          <li key={i} className="flex items-start gap-3 text-base text-gray-600 leading-relaxed">
                            <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${timelineDot[job.color]}`} />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Featured Project - Dark Editorial Card
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 md:py-24">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Featured Project
            </span>
          </div>

          <div className="p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  needthisdone.com
                </h3>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-lg text-slate-300">
                Full-stack e-commerce platform with Next.js, TypeScript, and React serving real customers
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                'Shopping cart & Stripe payments',
                'Appointment booking system',
                'User authentication & admin dashboards',
                'AI chatbot (Supabase pgvector + OpenAI)',
                'Redis caching & optimistic UI',
                'Playwright E2E & Vitest unit tests',
                'WCAG AA accessibility compliance',
                'Component-based page builder (Puck)',
                'CI/CD pipeline',
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-base text-slate-300">
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 mt-2" />
                  {feature}
                </div>
              ))}
            </div>

            {/* Tech stack */}
            <div className="flex flex-wrap gap-2.5">
              {['Next.js 14', 'React', 'TypeScript', 'Supabase', 'Redis', 'Stripe', 'Docker', 'Playwright', 'OpenAI'].map(
                (tech) => (
                  <span
                    key={tech}
                    className="px-4 py-1.5 text-sm font-medium rounded-full bg-white/10 text-slate-200 border border-white/10"
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Bridgette Automation */}
          <div className="mt-8 p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-playfair text-2xl md:text-3xl font-black text-white tracking-tight">
                  Bridgette Automation
                </h3>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase tracking-wider">
                  Open Source
                </span>
              </div>
              <p className="text-lg text-slate-300">
                Claude Code CLI wrapper with scheduled automation via launchd daemons
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                'Claude Code CLI integration',
                'Scheduled task automation',
                'launchd daemon management',
                'TypeScript 90%+ coverage',
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-base text-slate-300">
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-400 mt-2" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {['Next.js 14', 'TypeScript', 'Node.js', 'launchd'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-1.5 text-sm font-medium rounded-full bg-white/10 text-slate-200 border border-white/10"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* View full portfolio */}
          <div className="mt-8 text-center">
            <Button variant="blue" href="/work" size="lg" className="shadow-lg shadow-blue-500/25">
              View Full Portfolio
            </Button>
          </div>
        </div>
      </section>

      {/* ================================================================
          Education & Books - Light Two-Column
          ================================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Education */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
                <span className="text-sm font-semibold tracking-widest uppercase text-slate-500">
                  Education
                </span>
              </div>

              <div className="space-y-5">
                {education.map((edu) => (
                  <div key={edu.institution} className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-black text-base text-gray-900 tracking-tight">{edu.institution}</h3>
                      <span className="text-sm text-gray-500 font-medium whitespace-nowrap">{edu.period}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{edu.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Books */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-purple-400 to-amber-400" />
                <span className="text-sm font-semibold tracking-widest uppercase text-slate-500">
                  Books That Shaped My Approach
                </span>
              </div>

              <div className="space-y-5">
                {books.map((book) => (
                  <div key={book.title} className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                    <h3 className="font-black text-base text-gray-900 tracking-tight">{book.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">by {book.author}</p>
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      {book.lesson}
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
          {/* Accent lines */}
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
            Learn more about who I am, see what services I offer, or start a conversation about your project.
          </p>

          {/* CTA buttons - BJJ belt progression */}
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
