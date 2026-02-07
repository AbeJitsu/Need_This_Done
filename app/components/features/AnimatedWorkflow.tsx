'use client';

import { ArrowDown, GitBranch, Zap, HelpCircle, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/motion/FadeIn';
import { StaggerContainer } from '@/components/motion/StaggerContainer';
import { StaggerItem } from '@/components/motion/StaggerItem';

// ============================================================================
// ANIMATED WORKFLOW DEMO
// ============================================================================
// What: Scroll-triggered cards that show workflow steps in sequence
// Why: Clearer visual explanation of trigger → condition → actions pattern
// How: Each card animates into view on scroll, retriggering when scrolling back up
//
// Connectors use Lucide icons + animated SVG paths with gradient strokes
// to create a professional, high-end appearance inspired by Stripe/Apple designs

// ============================================================================
// CARD COMPONENT (Reusable workflow card)
// ============================================================================

interface WorkflowCardProps {
  step: string;
  type: 'trigger' | 'condition' | 'action';
  icon: React.ReactNode;
  label: string;
  description: string;
  color: 'emerald' | 'blue' | 'purple';
  badge?: string;
}

function WorkflowCard({
  step,
  type,
  icon,
  label,
  description,
  color,
  badge,
}: WorkflowCardProps) {
  const colorMap = {
    emerald: {
      border: 'border-emerald-400',
      bg: 'bg-emerald-50/10',
      icon: 'bg-emerald-400/20',
      text: 'text-emerald-300',
    },
    blue: {
      border: 'border-blue-400',
      bg: 'bg-blue-50/10',
      icon: 'bg-blue-400/20',
      text: 'text-blue-300',
    },
    purple: {
      border: 'border-purple-400',
      bg: 'bg-purple-50/10',
      icon: 'bg-purple-400/20',
      text: 'text-purple-300',
    },
  };

  const colors = colorMap[color];

  return (
    <div
      className={`relative px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 rounded-2xl border ${colors.border} ${colors.bg} backdrop-blur-sm min-h-[180px] lg:h-[220px] flex flex-col justify-between`}
    >
      {/* Step badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl ${colors.icon} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
              Step {step}
            </div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              {type}
            </div>
          </div>
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white">
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2">
          {label}
        </h3>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// CONNECTOR COMPONENTS (High-end animated SVG with Lucide icons)
// ============================================================================

function DownArrowConnector() {
  return (
    <motion.div
      className="flex flex-col items-center my-6 relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, margin: '-50px' }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Animated gradient line (emerald → blue) */}
      <svg
        className="w-1 h-16 overflow-visible"
        viewBox="0 0 4 64"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="emeraldToBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" /> {/* emerald-500 */}
            <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
          </linearGradient>
        </defs>
        <motion.line
          x1="2"
          y1="0"
          x2="2"
          y2="64"
          stroke="url(#emeraldToBlue)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>

      {/* Arrow icon at bottom */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <ArrowDown className="w-5 h-5 text-blue-400" strokeWidth={2.5} />
      </motion.div>
    </motion.div>
  );
}

function BranchConnector() {
  return (
    <motion.div
      className="relative my-6 h-20 w-full"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, margin: '-50px' }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 100 80"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Blue to Purple gradient for branches */}
          <linearGradient id="blueToPurple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" /> {/* blue-500 */}
            <stop offset="100%" stopColor="#8b5cf6" /> {/* purple-500 */}
          </linearGradient>
        </defs>

        {/* Center stem (blue line going down) */}
        <motion.line
          x1="50"
          y1="0"
          x2="50"
          y2="25"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
        />

        {/* Left branch (Yes path) - quadratic bezier for smooth curve */}
        <motion.path
          d="M 50 25 Q 35 40 25 60"
          stroke="url(#blueToPurple)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.6 }}
        />

        {/* Right branch (No path) - quadratic bezier for smooth curve */}
        <motion.path
          d="M 50 25 Q 65 40 75 60"
          stroke="url(#blueToPurple)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.6 }}
        />

        {/* "Yes" label */}
        <motion.text
          x="30"
          y="45"
          fontSize="10"
          fill="currentColor"
          className="text-slate-400 font-medium"
          textAnchor="middle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.3, delay: 1.0 }}
        >
          Yes
        </motion.text>

        {/* "No" label */}
        <motion.text
          x="70"
          y="45"
          fontSize="10"
          fill="currentColor"
          className="text-slate-400 font-medium"
          textAnchor="middle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.3, delay: 1.0 }}
        >
          No
        </motion.text>
      </svg>

      {/* GitBranch icon at junction point (centered) */}
      <motion.div
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/80 rounded-full p-1.5 backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.4, delay: 0.5, type: 'spring', stiffness: 200 }}
      >
        <GitBranch className="w-4 h-4 text-blue-400" strokeWidth={2.5} />
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnimatedWorkflow() {
  return (
    <div className="space-y-0">
      {/* Instruction text */}
      <FadeIn delay={0} once={false}>
        <p className="text-slate-400 text-center text-sm sm:text-base mb-12">
          Scroll down to watch a workflow assemble step by step
        </p>
      </FadeIn>

      {/* Step 1: Trigger */}
      <FadeIn direction="up" once={false} delay={0}>
        <WorkflowCard
          step="1"
          type="trigger"
          icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-emerald-400" strokeWidth={2} />}
          label="Order Placed"
          description="Listens for store events like orders, signups, or inventory changes."
          color="emerald"
        />
      </FadeIn>

      {/* Down Arrow Connector */}
      <DownArrowConnector />

      {/* Step 2: Condition */}
      <FadeIn direction="up" once={false} delay={0}>
        <WorkflowCard
          step="2"
          type="condition"
          icon={<HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-400" strokeWidth={2} />}
          label="Total > $100?"
          description="Filters events based on your criteria — amount, product type, customer tags, etc."
          color="blue"
        />
      </FadeIn>

      {/* Branch Connector */}
      <BranchConnector />

      {/* Step 3: Actions (Yes/No branches with stagger) */}
      <StaggerContainer staggerDelay={0.15} triggerOnScroll={true} once={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StaggerItem>
            <WorkflowCard
              step="3a"
              type="action"
              icon={<Play className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-purple-400" strokeWidth={2} />}
              label="Tag as VIP"
              description="Auto-tag high-value customers for special treatment and rewards."
              color="purple"
              badge="Yes"
            />
          </StaggerItem>
          <StaggerItem>
            <WorkflowCard
              step="3b"
              type="action"
              icon={<Play className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-purple-400" strokeWidth={2} />}
              label="Send Welcome Email"
              description="Engage new customers with a friendly introduction and first-purchase offer."
              color="purple"
              badge="No"
            />
          </StaggerItem>
        </div>
      </StaggerContainer>

      {/* Replay instruction */}
      <FadeIn direction="up" once={false} delay={0.3}>
        <p className="text-slate-500 text-xs sm:text-sm text-center mt-12">
          ↑ Scroll back up to replay the animation
        </p>
      </FadeIn>
    </div>
  );
}
