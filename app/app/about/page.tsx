import { Metadata } from 'next';
import Button from '@/components/Button';
import {
  headingColors,
  formInputColors,
  titleColors,
  cardBgColors,
  dividerColors,
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
    <div className="max-w-3xl mx-auto px-6 sm:px-10 md:px-12 py-12">
      {/* Header */}
      <header className={`mb-10 pb-6 border-b ${dividerColors.border}`}>
        <h1 className={`text-3xl md:text-4xl font-bold ${headingColors.primary} mb-2`}>
          About the Founder
        </h1>
        <p className={`text-lg ${formInputColors.helper}`}>
          The person behind Need This Done
        </p>
      </header>

      {/* Introduction */}
      <section className="mb-10">
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
      </section>

      {/* Personal Side */}
      <section className={`mb-10 p-6 rounded-lg ${cardBgColors.elevated}`}>
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
      </section>

      {/* Values */}
      <section className="mb-10">
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
      </section>

      {/* CTA */}
      <section className={`p-6 rounded-lg ${cardBgColors.elevated} text-center`}>
        <h2 className={`text-xl font-bold ${headingColors.primary} mb-3`}>
          Want to Know More?
        </h2>
        <p className={`${formInputColors.helper} mb-4`}>
          Check out my full professional background or get in touch about your project.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="blue" href="/resume" size="lg">
            View My Resume
          </Button>
          <Button variant="gold" href="/get-started" size="lg">
            Start a Project
          </Button>
        </div>
      </section>
    </div>
  );
}
