'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

function TriggerNodeComponent({ data, selected }: NodeProps) {
  return (
    <div className={`px-1.5 py-1 rounded-md border shadow-xs min-w-[90px] bg-white text-xs ${selected ? 'border-emerald-500 ring-1 ring-emerald-100' : 'border-emerald-200'}`}>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-1.5 !h-1.5 !border !border-white" />
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-2 h-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="leading-none">
          <div className="text-[8px] font-medium text-emerald-600 uppercase tracking-tight">Trigger</div>
          <div className="text-[9px] font-semibold text-gray-800">{data.label || 'Trigger'}</div>
        </div>
      </div>
    </div>
  );
}

export const TriggerNode = memo(TriggerNodeComponent);
