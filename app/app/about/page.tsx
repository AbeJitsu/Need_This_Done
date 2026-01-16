import { Metadata } from 'next';
import Button from '@/components/Button';
import {
  headingColors,
  formInputColors,
  titleColors,
  cardBgColors,
} from '@/lib/colors';

// ============================================================================
// About Page - /about
// ============================================================================
// Personal page about Abe Reyes, the founder. Shows the human side beyond
// professional credentials. Links to the full resume for more details.

export const metadata: Metadata = {
  title: 'About - Abe Reyes | Need This Done',
  description:
    'Meet Abe Reyes, the founder of Need This Done. Full-stack developer, Army veteran, Brazilian Jiu-Jitsu purple belt.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* ================================================================
          Hero Section - Centered gradient like homepage
          ================================================================ */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 md:px-12">
          <div className="relative overflow-hidden py-8">
            {/* Gradient orbs - constrained to max-w container like homepage */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-100 to-gold-100 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-100 to-teal-100 blur-2xl" />
            <div className="absolute top-20 left-1/4 w-32 h-32 rounded-full bg-amber-100 blur-xl" />

            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <header className="text-center mb-10">
                <h1 className={`text-3xl md:text-4xl font-bold italic ${headingColors.primary} mb-3`}>
                  About the Founder
                </h1>
                <p className={`text-lg ${formInputColors.helper}`}>
                  The person behind Need This Done
                </p>
              </header>

              {/* Introduction */}
              <div className="mb-0">
                <h2 className={`text-2xl font-bold ${titleColors.blue} mb-4`}>
                  Hey, I&apos;m Abe
                </h2>
                <div className={`space-y-4 ${headingColors.secondary} leading-relaxed`}>
                  <p>
                    I&apos;m a full-stack developer based in Orlando, Florida. I built Need This Done
                    to help people get their projects across the finish line, whether that&apos;s a
                    website, data organization, or those tasks that keep falling to the bottom of
                    the to-do list.
                  </p>
                  <p>
                    Before I wrote code for a living, I spent five years as a Combat Medic in the
                    U.S. Army and seven years in automotive finance at Toyota. Those experiences
                    taught me how to stay calm under pressure, explain complicated things clearly,
                    and follow through on commitments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Main Content - White background
          ================================================================ */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 md:px-12">
          {/* Personal Side */}
          <div className={`mb-10 p-6 rounded-2xl ${cardBgColors.elevated} border border-gray-200/60`}>
            <h2 className={`text-xl font-bold ${titleColors.blue} mb-4`}>
              Beyond the Code
            </h2>
            <div className={`space-y-4 ${headingColors.secondary}`}>
              <p>
                When I&apos;m not building software, you&apos;ll probably find me on the mats.
                I&apos;m a <strong className={titleColors.purple}>Purple Belt in Brazilian Jiu-Jitsu</strong>,
                which has taught me as much about problem-solving and persistence as any
                programming course.
              </p>
              <p>
                BJJ and coding have more in common than you&apos;d think. Both require patience,
                learning from failures, and breaking complex problems into smaller pieces.
                Every submission starts with a grip, and every feature starts with a line of code.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-10">
            <h2 className={`text-xl font-bold ${titleColors.blue} mb-4`}>
              How I Work
            </h2>
            <ul className={`space-y-3 ${headingColors.secondary}`}>
              <li className="flex items-start gap-3">
                <span className={`font-bold ${titleColors.green}`}>•</span>
                <span>
                  <strong>Clear communication.</strong> I explain what I&apos;m doing and why,
                  without the jargon.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className={`font-bold ${titleColors.green}`}>•</span>
                <span>
                  <strong>Reliable follow-through.</strong> When I say I&apos;ll do something,
                  it gets done.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className={`font-bold ${titleColors.green}`}>•</span>
                <span>
                  <strong>Calm under pressure.</strong> Deadlines and bugs don&apos;t rattle me.
                  I&apos;ve dealt with higher stakes.
                </span>
              </li>
            </ul>
          </div>

          {/* AI Philosophy */}
          <div className="mb-0">
            <h2 className={`text-xl font-bold ${titleColors.blue} mb-4`}>
              How I Use AI
            </h2>
            <div className={`space-y-4 ${headingColors.secondary}`}>
              <p>
                I use AI tools to deliver better work faster. But AI doesn&apos;t replace
                expertise—it amplifies it. The strategy, quality control, and client
                relationships are 100% human.
              </p>
              <p>
                When you work with me, you get cutting-edge technology guided by real
                experience. That&apos;s the combination that actually gets results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA Section - Dark background for contrast
          ================================================================ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-3xl mx-auto px-6 sm:px-10 md:px-12 py-16 md:py-20">
          <div className={`p-8 rounded-2xl ${cardBgColors.base} border border-gray-200/60 text-center`}>
            <h2 className={`text-xl font-bold ${headingColors.primary} mb-3`}>
              Want to Know More?
            </h2>
            <p className={`${formInputColors.helper} mb-6`}>
              Check out my full professional background or get in touch about your project.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="gray" href="/resume" size="lg">
                View Full Resume
              </Button>
              <Button variant="blue" href="/services" size="lg">
                See What I Build
              </Button>
              <Button variant="gold" href="/contact" size="lg">
                Start a Project
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
