'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

function ConditionNodeComponent({ data, selected }: NodeProps) {
  return (
    <div
      className={`px-1.5 py-1 rounded-md border shadow-xs min-w-[100px] bg-white text-xs ${
        selected ? 'border-blue-500 ring-1 ring-blue-100' : 'border-blue-200'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-1.5 !h-1.5 !border !border-white"
      />

      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-2 h-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="leading-none">
          <div className="text-[8px] font-medium text-blue-600 uppercase tracking-tight">Condition</div>
          <div className="text-[9px] font-semibold text-gray-800">{data.label || 'Condition'}</div>
        </div>
      </div>

      {/* Two output handles: true (left) and false (right) */}
      <div className="flex justify-between mt-1 -mx-1 text-[7px] font-medium">
        <span className="text-emerald-600">Yes</span>
        <span className="text-red-500">No</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!bg-emerald-500 !w-1.5 !h-1.5 !border !border-white !left-[25%]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!bg-red-500 !w-1.5 !h-1.5 !border !border-white !left-[75%]"
      />
    </div>
  );
}

export const ConditionNode = memo(ConditionNodeComponent);
