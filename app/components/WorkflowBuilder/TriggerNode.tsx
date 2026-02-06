'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

function TriggerNodeComponent({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-3 rounded-xl border-2 shadow-md min-w-[180px] bg-white ${selected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-emerald-300'}`}>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Trigger</div>
          <div className="text-sm font-semibold text-gray-800">{data.label || 'New Trigger'}</div>
        </div>
      </div>
      {data.config?.triggerType && (
        <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 rounded-md px-2 py-1 truncate">
          {data.config.triggerType}
        </div>
      )}
    </div>
  );
}

export const TriggerNode = memo(TriggerNodeComponent);
