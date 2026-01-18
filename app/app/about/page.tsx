import { Metadata } from 'next';
import Button from '@/components/Button';
import {
  titleColors,
  accentColors,
} from '@/lib/colors';

// ============================================================================
// About Page - /about
// ============================================================================
// Editorial magazine-style profile page about Abe Reyes, the founder.
// Design: Warm, personal, storytelling through visual hierarchy.
// Typography: Playfair Display for headlines (editorial feel), Inter for body.

export const metadata: Metadata = {
  title: 'About - Abe Reyes | Need This Done',
  description:
    'Meet Abe Reyes, the founder of Need This Done. Full-stack developer, Army veteran, Brazilian Jiu-Jitsu purple belt.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      {/* ================================================================
          Hero Section - Editorial Magazine Style
          ================================================================ */}
      <section className="pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          {/* Decorative line */}
          <div className="flex items-center gap-4 mb-8 md:mb-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
            <span className="text-xs tracking-[0.3em] uppercase text-stone-400 font-medium">
              The Founder
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
          </div>

          {/* Hero content - asymmetric */}
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end">
            {/* Main headline - takes 7 columns */}
            <div className="md:col-span-7">
              <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold text-stone-900 leading-[1.1] mb-6">
                Hey, I&apos;m{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Abe
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-stone-600 leading-relaxed max-w-xl">
                Full-stack developer. Army veteran. BJJ purple belt.
                I help people get their projects across the finish line.
              </p>
            </div>

            {/* Location badge - takes 5 columns, aligned right */}
            <div className="md:col-span-5 md:text-right">
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-stone-100 border border-stone-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-stone-600">
                  Orlando, Florida
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Journey Timeline Section
          ================================================================ */}
      <section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          {/* Section header */}
          <div className="mb-10 md:mb-16">
            <span className="text-xs tracking-[0.2em] uppercase text-stone-400 font-medium block mb-3">
              The Path
            </span>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-stone-900">
              How I got here
            </h2>
          </div>

          {/* Timeline cards */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Army */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 md:p-8 rounded-2xl bg-white border border-stone-500 hover:border-emerald-300 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🎖️</span>
                  <span className={`text-xs font-bold tracking-wider uppercase ${accentColors.green.text}`}>
                    5 Years
                  </span>
                </div>
                <h3 className="font-playfair text-xl font-bold text-stone-900 mb-2">
                  U.S. Army
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Combat Medic. Learned to stay calm when everything&apos;s on fire.
                  High stakes, zero room for error.
                </p>
              </div>
            </div>

            {/* Toyota */}
            <div className="group relative md:translate-y-8">
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 md:p-8 rounded-2xl bg-white border border-stone-500 hover:border-blue-300 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🚗</span>
                  <span className={`text-xs font-bold tracking-wider uppercase ${accentColors.blue.text}`}>
                    7 Years
                  </span>
                </div>
                <h3 className="font-playfair text-xl font-bold text-stone-900 mb-2">
                  Toyota Finance
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Automotive finance. Learned to explain complicated things simply
                  and follow through on commitments.
                </p>
              </div>
            </div>

            {/* Developer */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 md:p-8 rounded-2xl bg-white border border-stone-500 hover:border-purple-300 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💻</span>
                  <span className={`text-xs font-bold tracking-wider uppercase ${accentColors.purple.text}`}>
                    Now
                  </span>
                </div>
                <h3 className="font-playfair text-xl font-bold text-stone-900 mb-2">
                  Full-Stack Dev
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Building Need This Done. Combining all those lessons
                  to help others ship their projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Featured Pull Quote - BJJ Section
          ================================================================ */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Purple belt badge */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full blur-2xl opacity-30 scale-110" />

                {/* Badge */}
                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-2xl shadow-purple-500/25">
                  <div className="text-center text-white">
                    <div className="text-4xl md:text-5xl mb-1">🥋</div>
                    <div className="font-playfair text-lg md:text-xl font-bold">Purple Belt</div>
                    <div className="text-xs opacity-80 mt-1">Brazilian Jiu-Jitsu</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="md:col-span-8">
              <blockquote className="relative">
                {/* Quote mark */}
                <span className="absolute -top-4 -left-2 text-6xl font-playfair text-purple-200 leading-none">
                  &ldquo;
                </span>

                <p className="font-playfair text-2xl md:text-3xl lg:text-4xl text-stone-800 leading-relaxed pl-6 md:pl-8">
                  BJJ and coding have more in common than you&apos;d think. Both require patience,
                  learning from failures, and breaking complex problems into smaller pieces.
                </p>

                <footer className="mt-6 pl-6 md:pl-8">
                  <p className="text-stone-600">
                    Every submission starts with a grip. Every feature starts with a line of code.
                  </p>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          How I Work Section
          ================================================================ */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          {/* Section header */}
          <div className="mb-10 md:mb-16 text-center">
            <span className="text-xs tracking-[0.2em] uppercase text-stone-400 font-medium block mb-3">
              Working Together
            </span>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-stone-900">
              What you can expect
            </h2>
          </div>

          {/* Values grid */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {/* Clear Communication */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className={`font-bold text-lg ${titleColors.green} mb-2`}>
                Clear Communication
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                I explain what I&apos;m doing and why, without the jargon.
                You&apos;ll always know where your project stands.
              </p>
            </div>

            {/* Reliable Follow-through */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className={`font-bold text-lg ${titleColors.blue} mb-2`}>
                Reliable Follow-through
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                When I say I&apos;ll do something, it gets done.
                Army discipline meets software craftsmanship.
              </p>
            </div>

            {/* Calm Under Pressure */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 flex items-center justify-center">
                <span className="text-2xl">🧘</span>
              </div>
              <h3 className={`font-bold text-lg ${titleColors.purple} mb-2`}>
                Calm Under Pressure
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Deadlines and bugs don&apos;t rattle me.
                I&apos;ve dealt with higher stakes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          AI Philosophy Section - Minimal
          ================================================================ */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 md:px-12">
          <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-gold-50 to-gold-50 border border-gold-200/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-lg shadow-gold-500/25">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <h3 className={`font-playfair text-xl font-bold ${titleColors.gold} mb-3`}>
                  On AI
                </h3>
                <p className="text-stone-700 leading-relaxed mb-3">
                  I use AI tools to deliver better work faster. But AI doesn&apos;t replace expertise—it amplifies it.
                </p>
                <p className="text-stone-600 text-sm">
                  The strategy, quality control, and client relationships are 100% human.
                  You get cutting-edge technology guided by real experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA Section - Warm invitation
          ================================================================ */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900" />

        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 sm:px-10 md:px-12 text-center">
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-stone-600" />
            <span className="text-xs tracking-[0.3em] uppercase text-stone-500 font-medium">
              Let&apos;s Connect
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-stone-600" />
          </div>

          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to get something done?
          </h2>
          <p className="text-lg text-stone-400 mb-10 max-w-2xl mx-auto">
            Check out my full professional background, see what I build, or let&apos;s talk about your project.
          </p>

          {/* CTA buttons - BJJ belt progression */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="green" href="/resume" size="lg" className="shadow-lg shadow-green-500/25">
              View Resume
            </Button>
            <Button variant="blue" href="/services" size="lg" className="shadow-lg shadow-blue-500/25">
              See Services
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
