'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

function TriggerNodeComponent({ data, selected }: NodeProps) {
  return (
    <div className={`px-2 py-1.5 rounded-lg border-1.5 shadow-sm min-w-[120px] bg-white ${selected ? 'border-emerald-500 ring-1 ring-emerald-200' : 'border-emerald-300'}`}>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-2 !h-2 !border-1 !border-white" />
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <div className="text-[10px] font-medium text-emerald-600 uppercase tracking-tight">Trigger</div>
          <div className="text-xs font-semibold text-gray-800 leading-tight">{data.label || 'New Trigger'}</div>
        </div>
      </div>
      {data.config?.triggerType && (
        <div className="mt-1 text-[9px] text-emerald-700 bg-emerald-50 rounded-md px-1.5 py-0.5 truncate">
          {data.config.triggerType}
        </div>
      )}
    </div>
  );
}

export const TriggerNode = memo(TriggerNodeComponent);
