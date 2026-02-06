'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

function ConditionNodeComponent({ data, selected }: NodeProps) {
  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 shadow-md min-w-[200px] bg-white ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Condition</div>
          <div className="text-sm font-semibold text-gray-800">{data.label || 'New Condition'}</div>
        </div>
      </div>

      {data.config?.field && (
        <div className="mt-2 text-xs text-blue-700 bg-blue-50 rounded-md px-2 py-1 truncate">
          {data.config.field} {data.config.operator} {String(data.config.value)}
        </div>
      )}

      {/* Two output handles: true (left) and false (right) */}
      <div className="flex justify-between mt-3 -mx-1 text-[10px] font-medium">
        <span className="text-emerald-600 ml-1">Yes</span>
        <span className="text-red-500 mr-1">No</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white !left-[25%]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white !left-[75%]"
      />
    </div>
  );
}

export const ConditionNode = memo(ConditionNodeComponent);
