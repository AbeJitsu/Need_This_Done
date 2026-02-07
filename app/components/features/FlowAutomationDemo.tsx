'use client';

import Link from 'next/link';
import { FadeIn } from '@/components/motion/FadeIn';
import { StaggerContainer } from '@/components/motion/StaggerContainer';
import { StaggerItem } from '@/components/motion/StaggerItem';
import StatCounter from '@/components/work/StatCounter';
import dynamic from 'next/dynamic';

// Import DemoCanvas dynamically to avoid hydration issues with React Flow
const DemoCanvas = dynamic(() => import('@/components/WorkflowBuilder/DemoCanvas'), {
  ssr: false,
  loading: () => <div className="h-[700px] bg-gray-50 flex items-center justify-center">Loading demo...</div>,
});

// ============================================================================
// STATIC DATA — trigger categories, action types, comparison table
// ============================================================================

const TRIGGER_CATEGORIES = [
  { icon: '🛒', title: 'Order Events', description: 'Placed, fulfilled, cancelled, refunded', color: 'emerald' as const },
  { icon: '📦', title: 'Product Events', description: 'Created, updated, out of stock, restocked', color: 'blue' as const },
  { icon: '👤', title: 'Customer Events', description: 'Signup, first purchase, profile changes', color: 'purple' as const },
  { icon: '📊', title: 'Inventory Events', description: 'Low stock alerts with custom thresholds', color: 'emerald' as const },
];

const CONDITION_EXAMPLES = [
  { operator: 'Equals', example: 'status = "fulfilled"' },
  { operator: 'Greater Than', example: 'order.total > 100' },
  { operator: 'Contains', example: 'tags contains "VIP"' },
  { operator: 'Less Than', example: 'inventory < 10' },
];

const ACTION_TYPES = [
  { icon: '✉️', title: 'Send Email', description: 'Notify customers or admins with dynamic templates' },
  { icon: '🏷️', title: 'Tag Resources', description: 'Auto-tag customers, orders, or products' },
  { icon: '🔗', title: 'Call Webhook', description: 'POST data to any external service or API' },
  { icon: '🔔', title: 'Notifications', description: 'Create in-app alerts for your team' },
  { icon: '🔄', title: 'Update Status', description: 'Change product status automatically' },
];

const COMPARISON_ROWS = [
  { feature: 'Visual drag-and-drop builder', us: true, shopify: true, thirdParty: false },
  { feature: 'Test runs before publishing', us: true, shopify: false, thirdParty: false },
  { feature: 'Async background execution', us: true, shopify: true, thirdParty: false },
  { feature: 'Email actions', us: true, shopify: true, thirdParty: true },
  { feature: 'Webhook integrations', us: true, shopify: true, thirdParty: true },
  { feature: 'Custom condition logic', us: true, shopify: true, thirdParty: false },
  { feature: 'Built-in retry & error handling', us: true, shopify: false, thirdParty: false },
  { feature: 'No monthly platform fee', us: true, shopify: false, thirdParty: false },
];

const colorBorder = {
  emerald: 'border-emerald-200 bg-emerald-50',
  blue: 'border-blue-200 bg-blue-50',
  purple: 'border-purple-200 bg-purple-50',
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function FlowAutomationDemo() {
  return (
    <main>
      {/* ================================================================ */}
      {/* SECTION 1 — HERO (Dark Editorial)                                */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12 pt-16 md:pt-24 pb-16 md:pb-20">
          <FadeIn>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
                Feature Deep Dive
              </span>
            </div>

            <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
              Workflow Automation{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                That Runs Your Store
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mb-12">
              Shopify Plus charges $2,500/mo for workflow automation.
              We built it from scratch — visual builder, async execution,
              test runs, and all.
            </p>
          </FadeIn>

          {/* Stat counters */}
          <FadeIn delay={0.3}>
            <div className="grid grid-cols-3 gap-6 max-w-lg">
              <StatCounter value="12" label="Trigger Types" color="emerald" />
              <StatCounter value="7" label="Action Types" color="blue" />
              <StatCounter value="8" label="Condition Ops" color="purple" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 2 — LIVE DEMO CANVAS (Dark)                             */}
      {/* ================================================================ */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-12">
          <FadeIn>
            <h2 className="font-playfair text-3xl md:text-4xl font-black text-white mb-2">
              See the Real Builder
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl">
              This is the actual drag-and-drop workflow builder you'll use. Explore the interface,
              see example workflows, and understand how powerful automation can be.
            </p>
          </FadeIn>

          {/* Live Demo Canvas */}
          <div className="h-[700px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white mb-12">
            <DemoCanvas />
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-emerald-400/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Visual Builder</h3>
              <p className="text-slate-400 text-sm">
                Drag and drop triggers, conditions, and actions. No code required.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-blue-400/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Conditional Logic</h3>
              <p className="text-slate-400 text-sm">
                Branch workflows based on order values, customer tags, inventory levels, and more.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-purple-400/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Test Before Publishing</h3>
              <p className="text-slate-400 text-sm">
                Run workflows with sample data to verify they work exactly as intended.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 3 — THREE-STEP PROCESS (Light)                           */}
      {/* ================================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-black text-gray-900 mb-3">
                Three Steps. Zero Code.
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Pick a trigger, set conditions, choose actions. Your workflow handles the rest.
              </p>
            </div>
          </FadeIn>

          {/* Step 1: Triggers */}
          <FadeIn>
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">1</span>
                <h3 className="text-xl font-bold text-gray-900">Choose a Trigger</h3>
              </div>
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TRIGGER_CATEGORIES.map((cat) => (
                  <StaggerItem key={cat.title}>
                    <div className={`p-4 rounded-xl border ${colorBorder[cat.color]} flex items-start gap-3`}>
                      <span className="text-2xl" role="img" aria-label={cat.title}>{cat.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{cat.title}</div>
                        <div className="text-sm text-gray-600">{cat.description}</div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </FadeIn>

          {/* Step 2: Conditions */}
          <FadeIn>
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">2</span>
                <h3 className="text-xl font-bold text-gray-900">Set Conditions</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CONDITION_EXAMPLES.map((cond) => (
                  <div key={cond.operator} className="p-3 rounded-xl border border-blue-200 bg-blue-50 text-center">
                    <div className="font-semibold text-blue-800 text-sm">{cond.operator}</div>
                    <code className="text-xs text-blue-600 mt-1 block">{cond.example}</code>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Step 3: Actions */}
          <FadeIn>
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">3</span>
                <h3 className="text-xl font-bold text-gray-900">Add Actions</h3>
              </div>
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ACTION_TYPES.map((action) => (
                  <StaggerItem key={action.title}>
                    <div className="p-4 rounded-xl border border-purple-200 bg-purple-50 flex items-start gap-3">
                      <span className="text-2xl" role="img" aria-label={action.title}>{action.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{action.title}</div>
                        <div className="text-sm text-gray-600">{action.description}</div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 4 — COMPARISON TABLE                                     */}
      {/* ================================================================ */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 md:px-12">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="font-playfair text-3xl md:text-4xl font-black text-gray-900 mb-3">
                How We Compare
              </h2>
              <p className="text-gray-600">
                Enterprise-grade automation without the enterprise price tag.
              </p>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold text-emerald-700">NeedThisDone</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500">Shopify Flow</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500">Third-Party Apps</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-4 text-gray-700">{row.feature}</td>
                      <td className="py-3 px-4 text-center">{row.us ? <Check /> : <Cross />}</td>
                      <td className="py-3 px-4 text-center">{row.shopify ? <Check muted /> : <Cross />}</td>
                      <td className="py-3 px-4 text-center">{row.thirdParty ? <Check muted /> : <Cross />}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-700">Monthly cost</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">Included</td>
                    <td className="py-3 px-4 text-center text-gray-500">$2,500/mo+</td>
                    <td className="py-3 px-4 text-center text-gray-500">$50–200/mo</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 5 — CTA                                                  */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 md:py-24">
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="relative max-w-3xl mx-auto px-6 sm:px-10 md:px-12 text-center">
          <FadeIn>
            <h2 className="font-playfair text-3xl md:text-4xl font-black text-white mb-4">
              Ready to Automate Your Store?
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Stop doing repetitive work by hand. Let workflows handle
              tagging, emails, and integrations while you focus on growing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
              >
                Get Started
              </Link>
              <Link
                href="/work"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-all"
              >
                See All Work
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function Check({ muted = false }: { muted?: boolean }) {
  return (
    <svg className={`w-5 h-5 mx-auto ${muted ? 'text-gray-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Cross() {
  return (
    <svg className="w-5 h-5 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
