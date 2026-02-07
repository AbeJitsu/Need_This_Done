'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

function ActionNodeComponent({ data, selected }: NodeProps) {
  return (
    <div
      className={`px-2 py-1.5 rounded-lg border-1.5 shadow-sm min-w-[120px] bg-white ${
        selected ? 'border-purple-500 ring-1 ring-purple-200' : 'border-purple-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !w-2 !h-2 !border-1 !border-white"
      />

      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="text-[10px] font-medium text-purple-600 uppercase tracking-tight">Action</div>
          <div className="text-xs font-semibold text-gray-800 leading-tight">{data.label || 'New Action'}</div>
        </div>
      </div>

      {data.config?.actionType && (
        <div className="mt-1 text-[9px] text-purple-700 bg-purple-50 rounded-md px-1.5 py-0.5 truncate">
          {data.config.actionType.replace(/_/g, ' ')}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !w-2 !h-2 !border-1 !border-white"
      />
    </div>
  );
}

export const ActionNode = memo(ActionNodeComponent);
