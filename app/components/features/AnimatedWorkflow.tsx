'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  type Node,
  type Edge,
  Position,
  MarkerType,
} from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import 'reactflow/dist/style.css';

// ============================================================================
// ANIMATED WORKFLOW DEMO
// ============================================================================
// What: A read-only React Flow canvas that auto-builds a workflow step by step
// Why: Shows potential clients exactly how the automation system works
// How: Nodes/edges appear on a timer triggered by IntersectionObserver

// ============================================================================
// CUSTOM NODE COMPONENTS (simplified for demo — no handles needed)
// ============================================================================

function DemoTriggerNode({ data }: { data: { label: string } }) {
  return (
    <div className="px-4 py-3 rounded-xl border-2 border-emerald-400 shadow-lg min-w-[180px] bg-white">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Trigger</div>
          <div className="text-sm font-semibold text-gray-800">{data.label}</div>
        </div>
      </div>
    </div>
  );
}

function DemoConditionNode({ data }: { data: { label: string } }) {
  return (
    <div className="px-4 py-3 rounded-xl border-2 border-blue-400 shadow-lg min-w-[180px] bg-white">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Condition</div>
          <div className="text-sm font-semibold text-gray-800">{data.label}</div>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Yes</span>
        <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">No</span>
      </div>
    </div>
  );
}

function DemoActionNode({ data }: { data: { label: string } }) {
  return (
    <div className="px-4 py-3 rounded-xl border-2 border-purple-400 shadow-lg min-w-[180px] bg-white">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">Action</div>
          <div className="text-sm font-semibold text-gray-800">{data.label}</div>
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  trigger: DemoTriggerNode,
  condition: DemoConditionNode,
  action: DemoActionNode,
};

// ============================================================================
// STEP DEFINITIONS — the sequence the demo plays through
// ============================================================================

interface DemoStep {
  annotation: string;
  nodes: Node[];
  edges: Edge[];
}

const DEMO_STEPS: DemoStep[] = [
  {
    annotation: 'A trigger listens for a store event — like an order being placed.',
    nodes: [
      { id: 'trigger-1', type: 'trigger', position: { x: 200, y: 20 }, data: { label: 'Order Placed' }, sourcePosition: Position.Bottom, targetPosition: Position.Top },
    ],
    edges: [],
  },
  {
    annotation: 'Conditions filter the event. Here we check if the order total exceeds $100.',
    nodes: [
      { id: 'condition-1', type: 'condition', position: { x: 200, y: 140 }, data: { label: 'Total > $100?' }, sourcePosition: Position.Bottom, targetPosition: Position.Top },
    ],
    edges: [
      { id: 'e-trigger-cond', source: 'trigger-1', target: 'condition-1', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    ],
  },
  {
    annotation: 'If the condition is true, the "Yes" branch tags the customer as VIP.',
    nodes: [
      { id: 'action-yes', type: 'action', position: { x: 60, y: 280 }, data: { label: 'Tag as VIP' }, sourcePosition: Position.Bottom, targetPosition: Position.Top },
    ],
    edges: [
      { id: 'e-cond-yes', source: 'condition-1', target: 'action-yes', animated: true, label: 'Yes', style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    ],
  },
  {
    annotation: 'If not, the "No" branch sends a welcome email instead.',
    nodes: [
      { id: 'action-no', type: 'action', position: { x: 340, y: 280 }, data: { label: 'Send Welcome Email' }, sourcePosition: Position.Bottom, targetPosition: Position.Top },
    ],
    edges: [
      { id: 'e-cond-no', source: 'condition-1', target: 'action-no', animated: true, label: 'No', style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnimatedWorkflow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Accumulate nodes and edges up to the current step
  const visibleNodes: Node[] = [];
  const visibleEdges: Edge[] = [];
  for (let i = 0; i <= currentStep; i++) {
    visibleNodes.push(...DEMO_STEPS[i].nodes);
    visibleEdges.push(...DEMO_STEPS[i].edges);
  }

  const playSequence = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);
    setCurrentStep(-1);

    const stepDelay = prefersReducedMotion.current ? 0 : 1200;
    DEMO_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setCurrentStep(i);
        if (i === DEMO_STEPS.length - 1) {
          setIsPlaying(false);
          setHasPlayed(true);
        }
      }, stepDelay * (i + 1));
    });
  }, [isPlaying]);

  // Trigger on scroll into view
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isPlaying && !hasPlayed) {
          playSequence();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [playSequence, isPlaying, hasPlayed]);

  const currentAnnotation = currentStep >= 0 ? DEMO_STEPS[currentStep].annotation : 'Watch how a workflow builds itself...';

  return (
    <div ref={containerRef} className="relative">
      {/* Annotation bar */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mb-4 flex items-start gap-3 min-h-[48px]"
        >
          <div className="flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
            {currentStep >= 0 ? currentStep + 1 : '?'}
          </div>
          <p className="text-slate-300 text-base leading-relaxed">
            {currentAnnotation}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* React Flow Canvas */}
      <div className="w-full h-[380px] rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#334155" gap={20} size={1} />
        </ReactFlow>
      </div>

      {/* Replay button */}
      {hasPlayed && !isPlaying && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => { setHasPlayed(false); playSequence(); }}
          className="mt-4 text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Replay animation
        </motion.button>
      )}
    </div>
  );
}
