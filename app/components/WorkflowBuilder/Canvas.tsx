'use client';

import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
  type OnConnect,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { TriggerNode } from './TriggerNode';
import { ConditionNode } from './ConditionNode';
import { ActionNode } from './ActionNode';
import { NodePalette } from './NodePalette';
import { NodeConfigPanel } from './NodeConfigPanel';
import { TestRunPanel } from './TestRunPanel';
import type { TriggerType } from '@/lib/workflow-validator';

// ============================================================================
// TYPES
// ============================================================================

export interface WorkflowCanvasProps {
  workflowId?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  initialName?: string;
  initialDescription?: string;
  initialTriggerType?: TriggerType;
  readOnly?: boolean;
  onSave?: (data: {
    name: string;
    description: string;
    triggerType: TriggerType;
    nodes: Node[];
    edges: Edge[];
  }) => Promise<void>;
}

// ============================================================================
// CUSTOM NODE TYPES
// ============================================================================

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
};

// ============================================================================
// NODE ID GENERATOR
// ============================================================================

let nodeIdCounter = 0;
function generateNodeId(type: string): string {
  nodeIdCounter += 1;
  return `${type}_${nodeIdCounter}_${Date.now()}`;
}

// ============================================================================
// CANVAS COMPONENT (Inner — needs ReactFlowProvider wrapper)
// ============================================================================

function WorkflowCanvasInner({
  workflowId,
  initialNodes = [],
  initialEdges = [],
  initialName = '',
  initialDescription = '',
  initialTriggerType = 'manual',
  readOnly = false,
  onSave,
}: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Workflow metadata
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [triggerType, setTriggerType] = useState<TriggerType>(initialTriggerType);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // UI state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showTestRun, setShowTestRun] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Connect nodes
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        id: `edge_${params.source}_${params.target}`,
        // For condition nodes, label the edges
        label: params.sourceHandle === 'true' ? 'Yes' : params.sourceHandle === 'false' ? 'No' : undefined,
        style: {
          strokeWidth: 2,
          stroke: params.sourceHandle === 'true' ? '#10b981' : params.sourceHandle === 'false' ? '#ef4444' : '#6b7280',
        },
        animated: true,
      } as Edge;
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  // Handle node click → open config panel
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowTestRun(false);
  }, []);

  // Handle pane click → deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Drop handler for drag-and-drop from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/workflow-node-type');
      const nodeData = event.dataTransfer.getData('application/workflow-node-data');

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const parsedData = nodeData ? JSON.parse(nodeData) : {};

      const newNode: Node = {
        id: generateNodeId(type),
        type,
        position,
        data: {
          label: parsedData.label || `New ${type}`,
          config: parsedData.config || {},
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );

  // Update node config
  const updateNodeData = useCallback(
    (nodeId: string, newData: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...newData } };
          }
          return node;
        })
      );
      // Also update selected node for the config panel
      setSelectedNode((prev) =>
        prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...newData } } : prev
      );
    },
    [setNodes]
  );

  // Delete node
  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNode(null);
    },
    [setNodes, setEdges]
  );

  // Save workflow
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setSaveMessage('Please enter a workflow name');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      if (onSave) {
        await onSave({ name, description, triggerType, nodes, edges });
        setSaveMessage('Saved!');
      }
    } catch (error) {
      setSaveMessage('Failed to save');
      console.error('[WorkflowBuilder] Save failed:', error);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  }, [name, description, triggerType, nodes, edges, onSave]);

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50">
      {/* Left: Node Palette */}
      {!readOnly && <NodePalette triggerType={triggerType} />}

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar: Workflow metadata */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          {readOnly ? (
            <div>
              <div className="text-lg font-semibold text-gray-800">{name}</div>
              {description && <div className="text-sm text-gray-500">{description}</div>}
            </div>
          ) : (
            <>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workflow name..."
                className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none px-1 py-0.5 flex-1 max-w-xs"
              />

              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none px-1 py-0.5 flex-1 max-w-xs text-gray-500"
              />

              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="" disabled>Select trigger...</option>
                <option value="product.out_of_stock">Product Out of Stock</option>
                <option value="product.back_in_stock">Product Back in Stock</option>
                <option value="product.created">New Product Added</option>
                <option value="product.updated">Product Updated</option>
                <option value="order.placed">Order Placed</option>
                <option value="order.fulfilled">Order Shipped</option>
                <option value="order.cancelled">Order Cancelled</option>
                <option value="order.refunded">Order Refunded</option>
                <option value="customer.signup">Customer Signed Up</option>
                <option value="customer.first_purchase">First Purchase</option>
                <option value="inventory.low_stock">Low Stock Alert</option>
                <option value="manual">Manual Trigger</option>
              </select>
            </>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {!readOnly && (
              <>
                <button
                  onClick={() => { setShowTestRun(true); setSelectedNode(null); }}
                  className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Test Run
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>

                {saveMessage && (
                  <span className={`text-sm ${saveMessage === 'Saved!' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {saveMessage}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* React Flow Canvas */}
        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={readOnly ? undefined : onNodesChange}
            onEdgesChange={readOnly ? undefined : onEdgesChange}
            onConnect={readOnly ? undefined : onConnect}
            onNodeClick={readOnly ? undefined : onNodeClick}
            onPaneClick={readOnly ? undefined : onPaneClick}
            onDragOver={readOnly ? undefined : onDragOver}
            onDrop={readOnly ? undefined : onDrop}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={2}
            deleteKeyCode={readOnly ? null : 'Delete'}
            className="bg-gray-50"
          >
            <Controls className="!bg-white !border-gray-200 !shadow-lg" />
            <MiniMap
              className="!bg-white !border-gray-200"
              nodeColor={(node) => {
                switch (node.type) {
                  case 'trigger': return '#10b981';
                  case 'condition': return '#3b82f6';
                  case 'action': return '#8b5cf6';
                  default: return '#6b7280';
                }
              }}
            />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />

            {/* Empty state */}
            {nodes.length === 0 && (
              <Panel position="top-center">
                <div className="mt-32 text-center text-gray-400">
                  <p className="text-lg font-medium">Drag nodes from the left panel</p>
                  <p className="text-sm mt-1">Start with a trigger, then add conditions and actions</p>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>

      {/* Right: Config Panel or Test Run */}
      {!readOnly && (selectedNode || showTestRun) && (
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          {showTestRun ? (
            <TestRunPanel
              workflowId={workflowId}
              onClose={() => setShowTestRun(false)}
            />
          ) : selectedNode ? (
            <NodeConfigPanel
              node={selectedNode}
              onUpdate={updateNodeData}
              onDelete={deleteNode}
              onClose={() => setSelectedNode(null)}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXPORTED COMPONENT (with ReactFlowProvider wrapper)
// ============================================================================

export default function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
