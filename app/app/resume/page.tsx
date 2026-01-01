import { Metadata } from 'next';
import {
  headingColors,
  formInputColors,
  accentColors,
  dividerColors,
  linkColors,
  titleColors,
  cardBgColors,
} from '@/lib/colors';

// ============================================================================
// Resume Page - /resume
// ============================================================================
// Public resume page for Abe Reyes. Shows professional background,
// skills, and experience. Useful for both potential clients and employers.

export const metadata: Metadata = {
  title: 'Resume - Abe Reyes | Full-Stack Developer',
  description:
    'Full-stack developer with 3 years building production applications. React, Next.js, TypeScript, Node.js, PostgreSQL.',
};

// ============================================================================
// Skills Data
// ============================================================================

const skills = [
  {
    category: 'Frontend Development',
    items: 'React, Next.js, Vue.js, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS',
  },
  {
    category: 'Backend & Databases',
    items: 'Node.js, Python, REST APIs, PostgreSQL, Supabase, Redis, MongoDB',
  },
  {
    category: 'Design & Responsive',
    items: 'Responsive Web Design, Mobile-First Development, Figma, Photoshop, Cross-Browser Testing',
  },
  {
    category: 'Testing & DevOps',
    items: 'Git/GitHub, Docker, Nginx, Playwright, Vitest, CI/CD, Vercel',
  },
  {
    category: 'E-commerce Systems',
    items: 'Stripe Payments, Medusa Commerce, Shopping Cart Systems, Checkout Flows, Order Management',
  },
  {
    category: 'AI & Modern Tools',
    items: 'Claude Code, OpenAI API, AI Chatbots, Workflow Automation, Data Processing',
  },
];

// ============================================================================
// Experience Data
// ============================================================================

const experience = [
  {
    title: 'Full Stack Developer',
    company: 'needthisdone.com',
    subtitle: 'Professional Services Platform',
    dates: 'November 2025 - Present',
    bullets: [
      'Built and launched a responsive e-commerce platform that\'s live and handling real customer orders. Designed mobile-first so it works on any device',
      'Handled the full stack myself: React/Next.js frontend, Node.js backend, PostgreSQL database, and Stripe for payments',
      'Added an AI chatbot that answers customer questions by searching the actual site content. Saves time for both customers and me',
      'Set up automated testing with Playwright so I can ship updates confidently without breaking what\'s already working',
    ],
  },
  {
    title: 'Technical Operations Specialist',
    company: 'Acadio',
    subtitle: 'Educational Platform for Financial Certifications',
    dates: 'Spring 2025 - Winter 2025',
    bullets: [
      'Started as a contractor doing API integration work. Did good work, got brought on for client onboarding',
      'Became the person the CEO came to with technical questions. Not because I was the only developer, but because I took the time to explain things in a way that made sense to him',
      'Automated the repetitive stuff that was slowing the team down so people could focus on work that actually mattered',
      'Handled data migrations during client onboarding. Turned multi-day headaches into same-day completions while improving accuracy',
    ],
  },
  {
    title: 'Freelance Web Developer',
    company: 'Self-Employed',
    subtitle: 'Independent Contractor',
    dates: 'January 2023 - March 2024',
    bullets: [
      'Built websites and automation tools for clients while learning the craft',
      'Went from studying tutorials to building things clients actually use',
    ],
  },
  {
    title: 'Finance Manager',
    company: 'Toyota of Orlando',
    subtitle: 'Salesperson → Sales Manager → Finance Manager',
    dates: 'Spring 2017 - Winter 2023',
    bullets: [
      'Earned three promotions over seven years at a high-volume dealership moving 10-30 cars daily',
      'Worked with 3-7 customers daily, walking them through their options and putting together financing across different lenders',
      'Built trust with customers by explaining options clearly. Became the go-to person when teammates had complicated deals',
    ],
  },
  {
    title: 'Military Enrollment Counselor',
    company: 'Full Sail University',
    subtitle: 'International Admissions → Military Student Services',
    dates: '2012 - 2017',
    bullets: [
      'Started in International Admissions, then moved to Military Student Services where my Army background gave me credibility with veterans navigating civilian life',
      'Guided service members and families through GI Bill benefits, program costs, and fitting education around military schedules',
    ],
  },
  {
    title: 'Combat Medic, Corporal (E-4)',
    company: 'U.S. Army',
    subtitle: 'Fort Hood, TX & Fort Bragg, NC',
    dates: '1996 - 2001',
    bullets: [
      'Led a team of 3 medics and 2 combat lifesavers. Delivered emergency care where mistakes cost lives and hesitation wasn\'t an option',
      'Learned to stay calm under pressure, follow protocols precisely, and take responsibility for my team\'s performance',
    ],
  },
];

// ============================================================================
// Education Data
// ============================================================================

const education = [
  {
    institution: 'Full Sail University',
    dates: '2016 - 2017',
    description:
      'Web Design & Development coursework, 4.0 GPA. Started learning web development here and haven\'t stopped since.',
  },
  {
    institution: 'Self-Directed Learning',
    dates: '2016 - 2023',
    description:
      'Eight years of consistent skill development while working full-time. Progressed from tutorials to building production applications. This sustained commitment built the foundation for professional development work.',
  },
  {
    institution: 'Structured Coursework',
    dates: '2023 - Present',
    description:
      'freeCodeCamp Full Stack Developer Certification (in progress), Khan Academy CS Principles (100% mastery), Vue.js Complete Guide, 100 Days of Code. Filling in gaps and sharpening skills I\'ve been building for years.',
  },
  {
    institution: 'U.S. Army Medical Department Center & School',
    dates: '1996 - 2001',
    description: 'Combat Medic certification. Graduated top 10% of class.',
  },
];

// ============================================================================
// Page Component
// ============================================================================

export default function ResumePage() {
  return (
    <div className="max-w-4xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 py-8">
      {/* Header */}
      <header className={`text-center mb-6 pb-4 border-b-2 ${accentColors.blue.border}`}>
        <h1 className={`text-2xl md:text-3xl font-bold ${titleColors.blue} mb-1`}>
          ABIEZER &quot;ABE&quot; REYES
        </h1>
        <p className={`text-xs uppercase tracking-widest ${formInputColors.helper} mb-3`}>
          Full-Stack Developer
        </p>
        <div className={`flex flex-wrap justify-center gap-2 text-xs ${formInputColors.helper}`}>
          <span>Orlando, FL</span>
          <span className="hidden sm:inline">•</span>
          <a
            href="mailto:abe.raise@gmail.com"
            className={`${linkColors.blue} hover:underline`}
          >
            abe.raise@gmail.com
          </a>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://needthisdone.com"
            className={`${linkColors.blue} hover:underline`}
          >
            needthisdone.com
          </a>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://github.com/AbeJitsu"
            className={`${linkColors.blue} hover:underline`}
          >
            GitHub
          </a>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://www.linkedin.com/in/weneedthisdone"
            className={`${linkColors.blue} hover:underline`}
          >
            LinkedIn
          </a>
        </div>
      </header>

      {/* Summary */}
      <section className={`mb-6 p-4 rounded ${cardBgColors.elevated}`}>
        <div className={`text-sm leading-relaxed ${headingColors.secondary} space-y-3`}>
          <p>
            Three years building production applications, grounded in seven years of learning the
            craft while working full-time. I started with tutorials in 2016 and kept at it until I
            was confident enough to go all-in as a developer in 2023. I&apos;m still learning today,
            currently working through freeCodeCamp&apos;s Full Stack Developer certification.
          </p>
          <p>
            Before tech, I led a five-person medic team in the Army and earned three promotions at
            Toyota over seven years.
          </p>
          <p>
            What&apos;s stayed consistent: I stay calm when things break, I explain technical stuff
            without making people feel dumb, and I follow through on what I say I&apos;ll do.
          </p>
        </div>
      </section>

      {/* Technical Skills */}
      <section className={`mb-6 p-4 rounded ${cardBgColors.elevated}`}>
        <h2
          className={`text-sm font-bold uppercase tracking-wide ${titleColors.blue} mb-3 pb-2 border-b ${dividerColors.border}`}
        >
          Technical Skills
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-4">
          {skills.map((skill) => (
            <div key={skill.category}>
              <h3 className={`font-semibold text-xs ${accentColors.green.text} mb-1`}>
                {skill.category}
              </h3>
              <p className={`text-xs ${formInputColors.helper}`}>{skill.items}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Professional Experience */}
      <section className={`mb-6 p-4 rounded ${cardBgColors.elevated}`}>
        <h2
          className={`text-sm font-bold uppercase tracking-wide ${titleColors.blue} mb-3 pb-2 border-b ${dividerColors.border}`}
        >
          Professional Experience
        </h2>
        <div className="space-y-4 ml-4">
          {experience.map((job) => (
            <div key={`${job.company}-${job.title}`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                <h3 className={`font-bold text-xs ${titleColors.red}`}>{job.title}</h3>
                <span className={`text-xs ${formInputColors.helper}`}>{job.dates}</span>
              </div>
              <p className={`text-xs ${formInputColors.helper} mb-2 ml-2`}>
                {job.company} | {job.subtitle}
              </p>
              <ul className={`list-disc list-outside ml-6 space-y-1 text-xs ${headingColors.secondary}`}>
                {job.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Project */}
      <section className={`mb-6 p-4 rounded ${cardBgColors.elevated}`}>
        <h2
          className={`text-sm font-bold uppercase tracking-wide ${titleColors.blue} mb-3 pb-2 border-b ${dividerColors.border}`}
        >
          Featured Project
        </h2>
        <div className="ml-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
            <h3 className={`font-bold text-xs ${titleColors.blue}`}>needthisdone.com</h3>
            <a
              href="https://needthisdone.com"
              className={`text-xs ${formInputColors.helper} hover:underline`}
            >
              Live at needthisdone.com
            </a>
          </div>
          <p className={`text-xs ${headingColors.secondary} mb-2 ml-4`}>
            A responsive, mobile-first e-commerce platform built from the ground up. Features
            include user authentication, product browsing, shopping cart, secure checkout with
            Stripe, and order tracking. The admin dashboard provides business management tools. An
            AI-powered chatbot handles customer questions using semantic search. Comprehensive
            automated testing ensures reliable deployments.
          </p>
          <p className={`text-xs italic ${formInputColors.helper} ml-4`}>
            React/Next.js • TypeScript • Node.js • PostgreSQL/Supabase • Redis • Stripe • Playwright
            • Vercel
          </p>
        </div>
      </section>

      {/* Education */}
      <section className={`mb-6 p-4 rounded ${cardBgColors.elevated}`}>
        <h2
          className={`text-sm font-bold uppercase tracking-wide ${titleColors.blue} mb-3 pb-2 border-b ${dividerColors.border}`}
        >
          Education
        </h2>
        <div className="space-y-3 ml-4">
          {education.map((edu) => (
            <div key={edu.institution}>
              <p className={`text-xs ${headingColors.secondary}`}>
                <span className="font-semibold">{edu.institution}</span>{' '}
                <span className={formInputColors.helper}>({edu.dates})</span>: {edu.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
