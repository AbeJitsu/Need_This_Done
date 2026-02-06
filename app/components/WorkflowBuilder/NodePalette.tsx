'use client';

import { WORKFLOW_TRIGGER_REGISTRY, WORKFLOW_ACTIONS, CONDITION_OPERATORS } from '@/lib/workflow-validator';

interface NodePaletteProps {
  triggerType: string;
}

interface DraggableNodeProps {
  type: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  data?: Record<string, unknown>;
}

function DraggableNode({ type, label, description, icon, color, data }: DraggableNodeProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/workflow-node-type', type);
    event.dataTransfer.setData(
      'application/workflow-node-data',
      JSON.stringify({ label, config: data || {} })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200 hover:border-emerald-400',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200 hover:border-blue-400',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200 hover:border-purple-400',
      text: 'text-purple-700',
      iconBg: 'bg-purple-100',
    },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing transition-colors ${colors.bg} ${colors.border}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <div>
          <div className={`text-xs font-semibold ${colors.text}`}>{label}</div>
          <div className="text-[10px] text-gray-500 leading-tight">{description}</div>
        </div>
      </div>
    </div>
  );
}

export function NodePalette({ triggerType: _triggerType }: NodePaletteProps) {
  const triggerEntries = Object.entries(WORKFLOW_TRIGGER_REGISTRY);
  const actionEntries = Object.entries(WORKFLOW_ACTIONS);

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-1">Node Palette</h3>
        <p className="text-xs text-gray-500 mb-4">Drag nodes onto the canvas</p>

        {/* Triggers */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
            Triggers
          </h4>
          <div className="space-y-1.5">
            {triggerEntries.map(([key, trigger]) => (
              <DraggableNode
                key={key}
                type="trigger"
                label={trigger.label}
                description={trigger.category}
                icon={trigger.icon}
                color="emerald"
                data={{ triggerType: key }}
              />
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
            Conditions
          </h4>
          <div className="space-y-1.5">
            <DraggableNode
              type="condition"
              label="If / Else"
              description="Branch based on data"
              icon="🔀"
              color="blue"
            />
            {CONDITION_OPERATORS.slice(0, 4).map((op) => (
              <DraggableNode
                key={op.value}
                type="condition"
                label={`Check: ${op.label}`}
                description={`Compare using ${op.value}`}
                icon="🔀"
                color="blue"
                data={{ operator: op.value }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
            Actions
          </h4>
          <div className="space-y-1.5">
            {actionEntries.map(([key, action]) => (
              <DraggableNode
                key={key}
                type="action"
                label={action.label}
                description={action.category}
                icon={action.icon}
                color="purple"
                data={{ actionType: key }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
