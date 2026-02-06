'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, Suspense } from 'react';
import type { Node, Edge } from 'reactflow';
import WorkflowCanvas from '@/components/WorkflowBuilder/Canvas';
import type { TriggerType } from '@/lib/workflow-validator';

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('id');

  const [initialData, setInitialData] = useState<{
    nodes: Node[];
    edges: Edge[];
    name: string;
    description: string;
    triggerType: TriggerType;
  } | null>(null);
  const [loading, setLoading] = useState(!!workflowId);

  // Load existing workflow if editing
  useEffect(() => {
    if (!workflowId) {
      setInitialData({
        nodes: [],
        edges: [],
        name: '',
        description: '',
        triggerType: 'manual',
      });
      return;
    }

    async function loadWorkflow() {
      try {
        const res = await fetch(`/api/workflows/${workflowId}`);
        if (!res.ok) throw new Error('Failed to load workflow');
        const data = await res.json();
        setInitialData({
          nodes: data.nodes || [],
          edges: data.edges || [],
          name: data.name || '',
          description: data.description || '',
          triggerType: data.trigger_type || 'manual',
        });
      } catch (error) {
        console.error('[Builder] Failed to load workflow:', error);
        setInitialData({
          nodes: [],
          edges: [],
          name: '',
          description: '',
          triggerType: 'manual',
        });
      } finally {
        setLoading(false);
      }
    }

    loadWorkflow();
  }, [workflowId]);

  const handleSave = useCallback(
    async (data: {
      name: string;
      description: string;
      triggerType: TriggerType;
      nodes: Node[];
      edges: Edge[];
    }) => {
      const payload = {
        name: data.name,
        description: data.description,
        trigger_type: data.triggerType,
        nodes: data.nodes,
        edges: data.edges,
      };

      if (workflowId) {
        // Update existing
        const res = await fetch(`/api/workflows/${workflowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update workflow');
      } else {
        // Create new
        const res = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create workflow');
        const created = await res.json();
        // Navigate to edit mode with the new ID
        router.replace(`/admin/automation/builder?id=${created.id}`);
      }
    },
    [workflowId, router]
  );

  if (loading || !initialData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-gray-50">
        <div className="text-center text-gray-400">
          <svg className="animate-spin w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <WorkflowCanvas
      workflowId={workflowId || undefined}
      initialNodes={initialData.nodes}
      initialEdges={initialData.edges}
      initialName={initialData.name}
      initialDescription={initialData.description}
      initialTriggerType={initialData.triggerType}
      onSave={handleSave}
    />
  );
}

export default function AutomationBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-gray-50">
          <p className="text-sm text-gray-400">Loading builder...</p>
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
