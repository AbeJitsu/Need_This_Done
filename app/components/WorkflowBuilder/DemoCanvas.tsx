'use client';

import { useState } from 'react';
import { Node, Edge } from 'reactflow';
import WorkflowCanvas from './Canvas';
import Link from 'next/link';

// ============================================================================
// EXAMPLE WORKFLOWS
// ============================================================================

interface ExampleWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  triggerType: string;
}

// ============================================================================
// CENTER-BASED POSITIONING
// ============================================================================
// These constants ensure that the condition node (middle node) is centered
// vertically in the visible canvas area, with trigger above and actions below.
const CANVAS_CENTER_Y = 150;      // Vertical center of visible canvas
const NODE_SPACING_Y = 90;        // Spacing between each row of nodes

const EXAMPLE_WORKFLOWS: ExampleWorkflow[] = [
  {
    id: 'demo-vip',
    name: 'VIP Customer Auto-Tagger',
    description: 'Automatically tag high-value customers and send them a welcome email',
    triggerType: 'order.placed',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 50, y: CANVAS_CENTER_Y - NODE_SPACING_Y },
        data: {
          label: 'Order Placed',
          triggerType: 'order.placed',
        },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 50, y: CANVAS_CENTER_Y },
        data: {
          label: 'Total > $100?',
          field: 'total',
          operator: 'greater_than',
          value: '100',
        },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: -50, y: CANVAS_CENTER_Y + NODE_SPACING_Y },
        data: {
          label: 'Tag as VIP',
          actionType: 'tag_customer',
          tag: 'VIP',
        },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 110, y: CANVAS_CENTER_Y + NODE_SPACING_Y },
        data: {
          label: 'Send Welcome Email',
          actionType: 'send_email',
          template: 'vip_welcome',
        },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'condition-1',
        animated: true,
        style: { stroke: '#6b7280', strokeWidth: 2 },
      },
      {
        id: 'edge-2',
        source: 'condition-1',
        target: 'action-1',
        sourceHandle: 'true',
        label: 'Yes',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'edge-3',
        source: 'condition-1',
        target: 'action-2',
        sourceHandle: 'false',
        label: 'No',
        animated: true,
        style: { stroke: '#ef4444', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'demo-low-stock',
    name: 'Low Stock Alert',
    description: 'Alert admins when product inventory drops below 10 units',
    triggerType: 'inventory.low_stock',
    nodes: [
      {
        id: 'trigger-2',
        type: 'trigger',
        position: { x: 50, y: CANVAS_CENTER_Y - NODE_SPACING_Y },
        data: {
          label: 'Low Stock Alert',
          triggerType: 'inventory.low_stock',
        },
      },
      {
        id: 'condition-2',
        type: 'condition',
        position: { x: 50, y: CANVAS_CENTER_Y },
        data: {
          label: 'Inventory < 10?',
          field: 'inventory_count',
          operator: 'less_than',
          value: '10',
        },
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 50, y: CANVAS_CENTER_Y + NODE_SPACING_Y },
        data: {
          label: 'Email Admin',
          actionType: 'send_email',
          template: 'low_stock_alert',
        },
      },
    ],
    edges: [
      {
        id: 'edge-4',
        source: 'trigger-2',
        target: 'condition-2',
        animated: true,
        style: { stroke: '#6b7280', strokeWidth: 2 },
      },
      {
        id: 'edge-5',
        source: 'condition-2',
        target: 'action-3',
        sourceHandle: 'true',
        label: 'Yes',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'demo-abandoned-cart',
    name: 'Abandoned Cart Recovery',
    description: 'Email customers who started checkout but didn\'t complete',
    triggerType: 'manual',
    nodes: [
      {
        id: 'trigger-3',
        type: 'trigger',
        position: { x: 50, y: CANVAS_CENTER_Y - NODE_SPACING_Y },
        data: {
          label: 'Cart Created',
          triggerType: 'manual',
        },
      },
      {
        id: 'condition-3',
        type: 'condition',
        position: { x: 50, y: CANVAS_CENTER_Y },
        data: {
          label: 'Cart Abandoned?',
          field: 'status',
          operator: 'equals',
          value: 'abandoned',
        },
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 50, y: CANVAS_CENTER_Y + NODE_SPACING_Y },
        data: {
          label: 'Send Recovery Email',
          actionType: 'send_email',
          template: 'abandoned_cart',
        },
      },
    ],
    edges: [
      {
        id: 'edge-6',
        source: 'trigger-3',
        target: 'condition-3',
        animated: true,
        style: { stroke: '#6b7280', strokeWidth: 2 },
      },
      {
        id: 'edge-7',
        source: 'condition-3',
        target: 'action-4',
        sourceHandle: 'true',
        label: 'Yes',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
    ],
  },
];

// ============================================================================
// DEMO CANVAS COMPONENT
// ============================================================================

export default function DemoCanvas() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(EXAMPLE_WORKFLOWS[0]);

  return (
    <div className="relative h-full flex flex-col">
      {/* Top Bar: Demo Mode Banner + Workflow Selector */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between gap-4 max-w-full">
          {/* Demo Mode Badge */}
          <div className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-lg whitespace-nowrap">
            🎨 Demo Mode — View Only
          </div>

          {/* Workflow Selector */}
          <div className="flex gap-2 flex-wrap justify-end flex-1">
            {EXAMPLE_WORKFLOWS.map((workflow) => (
              <button
                key={workflow.id}
                onClick={() => setSelectedWorkflow(workflow)}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedWorkflow.id === workflow.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                title={workflow.name}
              >
                {workflow.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Workflow Description */}
        <p className="text-sm text-gray-600 mt-3 ml-0">
          {selectedWorkflow.description}
        </p>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative mt-32">
        <WorkflowCanvas
          key={selectedWorkflow.id}
          initialNodes={selectedWorkflow.nodes}
          initialEdges={selectedWorkflow.edges}
          initialName={selectedWorkflow.name}
          initialDescription={selectedWorkflow.description}
          initialTriggerType={selectedWorkflow.triggerType as any}
          readOnly={true}
          showDebug={true}
        />

        {/* CTA Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-xl max-w-sm">
          <p className="text-sm font-medium mb-2">Want to build workflows like this?</p>
          <Link
            href="/contact"
            className="inline-block px-4 py-2 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors text-sm"
          >
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
}
