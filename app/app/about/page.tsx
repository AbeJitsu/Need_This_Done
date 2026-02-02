import { Metadata } from 'next';
import Button from '@/components/Button';

// ============================================================================
// About Page - /about
// ============================================================================
// Bold editorial redesign matching pricing, contact, and login pages.
// Dark → Dark → Dark → Light → Dark rhythm for visual contrast.
// Typography: Playfair Display for headlines (editorial feel), Inter for body.

export const metadata: Metadata = {
  title: 'About - Abe Reyes | Need This Done',
  description:
    'Meet Abe Reyes, the founder of Need This Done. Full-stack developer, Army veteran, Brazilian Jiu-Jitsu purple belt.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* ================================================================
          Hero Section - Dark Editorial
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Decorative blurs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12 pt-16 md:pt-24 pb-16 md:pb-20">
          {/* Asymmetric grid */}
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end">
            {/* Main headline - 7 columns */}
            <div className="md:col-span-7">
              {/* Accent line + uppercase label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
                <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
                  The Founder
                </span>
              </div>

              <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
                Hey, I&apos;m{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Abe
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-xl">
                Full-stack developer. Army veteran. BJJ purple belt.
                I help people get their projects across the finish line.
              </p>
            </div>

            {/* Location badge - 5 columns, aligned right */}
            <div className="md:col-span-5 md:text-right">
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-slate-300">
                  Orlando, Florida
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Journey Timeline Section - Dark Glass Cards
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-900">
        {/* Subtle gradient seam between hero and this section */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12 py-16 md:py-24">
          {/* Section header */}
          <div className="mb-10 md:mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
                The Path
              </span>
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl font-black text-white tracking-tight">
              How I got here
            </h2>
          </div>

          {/* Timeline cards */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Army */}
            <div className="group relative">
              <div className="relative p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:ring-1 hover:ring-emerald-500/20 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🎖️</span>
                  <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                    5 Years
                  </span>
                </div>
                <h3 className="font-playfair text-xl font-black text-white mb-2 tracking-tight">
                  U.S. Army
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Combat Medic. Learned to stay calm when everything&apos;s on fire.
                  High stakes, zero room for error.
                </p>
              </div>
            </div>

            {/* Toyota */}
            <div className="group relative md:translate-y-8">
              <div className="relative p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 hover:ring-1 hover:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🚗</span>
                  <span className="text-xs font-bold tracking-wider uppercase text-blue-400">
                    7 Years
                  </span>
                </div>
                <h3 className="font-playfair text-xl font-black text-white mb-2 tracking-tight">
                  Toyota Finance
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Automotive finance. Learned to explain complicated things simply
                  and follow through on commitments.
                </p>
              </div>
            </div>

            {/* Developer */}
            <div className="group relative">
              <div className="relative p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 hover:ring-1 hover:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💻</span>
                  <span className="text-xs font-bold tracking-wider uppercase text-purple-400">
                    Now
                  </span>
                </div>
                <h3 className="font-playfair text-xl font-black text-white mb-2 tracking-tight">
                  Full-Stack Dev
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Building Need This Done. Combining all those lessons
                  to help others ship their projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Featured Pull Quote - BJJ Section (Dark Statement)
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900">
        {/* Purple decorative blurs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        {/* Divider */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12 py-16 md:py-24">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Purple belt badge */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative">
                {/* Stronger glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full blur-3xl opacity-40 scale-125" />

                {/* Badge */}
                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-2xl shadow-purple-500/30 ring-1 ring-purple-500/30">
                  <div className="text-center text-white">
                    <div className="text-4xl md:text-5xl mb-1">🥋</div>
                    <div className="font-playfair text-lg md:text-xl font-black tracking-tight">Purple Belt</div>
                    <div className="text-xs opacity-80 mt-1">Brazilian Jiu-Jitsu</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="md:col-span-8">
              <blockquote className="relative">
                {/* Quote mark */}
                <span className="absolute -top-4 -left-2 text-6xl font-playfair text-white/10 leading-none">
                  &ldquo;
                </span>

                <p className="font-playfair text-2xl md:text-3xl lg:text-4xl text-white leading-relaxed pl-6 md:pl-8">
                  BJJ and coding have more in common than you&apos;d think. Both require patience,
                  learning from failures, and breaking complex problems into smaller pieces.
                </p>

                <footer className="mt-6 pl-6 md:pl-8">
                  <p className="text-slate-400">
                    Every submission starts with a grip. Every feature starts with a line of code.
                  </p>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          How I Work Section - Light Breather
          ================================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          {/* Editorial left-aligned header */}
          <div className="mb-10 md:mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-slate-500">
                Working Together
              </span>
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              What you can expect
            </h2>
          </div>

          {/* Values grid */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {/* Clear Communication */}
            <div>
              <div className="w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-black text-lg text-emerald-700 mb-2 tracking-tight">
                Clear Communication
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                I explain what I&apos;m doing and why, without the jargon.
                You&apos;ll always know where your project stands.
              </p>
            </div>

            {/* Reliable Follow-through */}
            <div>
              <div className="w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-black text-lg text-blue-700 mb-2 tracking-tight">
                Reliable Follow-through
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                When I say I&apos;ll do something, it gets done.
                Army discipline meets software craftsmanship.
              </p>
            </div>

            {/* Calm Under Pressure */}
            <div>
              <div className="w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 flex items-center justify-center">
                <span className="text-2xl">🧘</span>
              </div>
              <h3 className="font-black text-lg text-purple-700 mb-2 tracking-tight">
                Calm Under Pressure
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Deadlines and bugs don&apos;t rattle me.
                I&apos;ve dealt with higher stakes.
              </p>
            </div>
          </div>

          {/* AI Philosophy card - standalone gold accent */}
          <div className="mt-12 md:mt-16 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-amber-50/80 to-yellow-50/80 border border-amber-200/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <h3 className="font-playfair text-xl font-black text-amber-800 mb-3 tracking-tight">
                  On AI
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  I use AI tools to deliver better work faster. But AI doesn&apos;t replace expertise—it amplifies it.
                </p>
                <p className="text-gray-600 text-sm">
                  The strategy, quality control, and client relationships are 100% human.
                  You get cutting-edge technology guided by real experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA Section - Consistent Dark Editorial
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 md:py-24">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 sm:px-10 md:px-12 text-center">
          {/* Accent line + uppercase label */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Let&apos;s Connect
            </span>
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
          </div>

          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Ready to get something done?
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Check out my full professional background, see what I build, or let&apos;s talk about your project.
          </p>

          {/* CTA buttons - BJJ belt progression */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="green" href="/resume" size="lg" className="shadow-lg shadow-emerald-500/25">
              View Resume
            </Button>
            <Button variant="blue" href="/#services-section" size="lg" className="shadow-lg shadow-blue-500/25">
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
