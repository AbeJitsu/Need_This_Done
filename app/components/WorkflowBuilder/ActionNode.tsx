'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

function ActionNodeComponent({ data, selected }: NodeProps) {
  return (
    <div
      className={`px-1.5 py-1 rounded-md border shadow-xs min-w-[90px] bg-white text-xs ${
        selected ? 'border-purple-500 ring-1 ring-purple-100' : 'border-purple-200'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !w-1.5 !h-1.5 !border !border-white"
      />

      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded bg-purple-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-2 h-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="leading-none">
          <div className="text-[8px] font-medium text-purple-600 uppercase tracking-tight">Action</div>
          <div className="text-[9px] font-semibold text-gray-800">{data.label || 'Action'}</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !w-1.5 !h-1.5 !border !border-white"
      />
    </div>
  );
}

export const ActionNode = memo(ActionNodeComponent);
