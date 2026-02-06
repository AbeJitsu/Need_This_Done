'use client';

import { useState } from 'react';
import type { Node } from 'reactflow';
import { WORKFLOW_TRIGGER_REGISTRY, WORKFLOW_ACTIONS, CONDITION_OPERATORS } from '@/lib/workflow-validator';

interface NodeConfigPanelProps {
  node: Node;
  onUpdate: (nodeId: string, data: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

export function NodeConfigPanel({ node, onUpdate, onDelete, onClose }: NodeConfigPanelProps) {
  const [label, setLabel] = useState(node.data.label || '');
  const [config, setConfig] = useState<Record<string, unknown>>(node.data.config || {});

  const updateConfig = (key: string, value: unknown) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate(node.id, { label, config: newConfig });
  };

  const updateLabel = (newLabel: string) => {
    setLabel(newLabel);
    onUpdate(node.id, { label: newLabel, config });
  };

  const colorMap: Record<string, { header: string; headerText: string; accent: string }> = {
    trigger: { header: 'bg-emerald-50', headerText: 'text-emerald-800', accent: 'emerald' },
    condition: { header: 'bg-blue-50', headerText: 'text-blue-800', accent: 'blue' },
    action: { header: 'bg-purple-50', headerText: 'text-purple-800', accent: 'purple' },
  };

  const colors = colorMap[node.type || 'action'] || colorMap.action;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`px-4 py-3 ${colors.header} border-b border-gray-200 flex items-center justify-between`}>
        <h3 className={`text-sm font-bold ${colors.headerText} uppercase tracking-wide`}>
          Configure {node.type}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Label */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => updateLabel(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Node label..."
          />
        </div>

        {/* Trigger Config */}
        {node.type === 'trigger' && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Trigger Type</label>
            <select
              value={(config.triggerType as string) || ''}
              onChange={(e) => updateConfig('triggerType', e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select trigger...</option>
              {Object.entries(WORKFLOW_TRIGGER_REGISTRY).map(([key, trigger]) => (
                <option key={key} value={key}>
                  {trigger.icon} {trigger.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Condition Config */}
        {node.type === 'condition' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Field</label>
              <input
                type="text"
                value={(config.field as string) || ''}
                onChange={(e) => updateConfig('field', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. totalAmount, customerEmail"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Operator</label>
              <select
                value={(config.operator as string) || 'equals'}
                onChange={(e) => updateConfig('operator', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CONDITION_OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Value</label>
              <input
                type="text"
                value={(config.value as string) || ''}
                onChange={(e) => updateConfig('value', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Value to compare against"
              />
            </div>
          </>
        )}

        {/* Action Config */}
        {node.type === 'action' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Action Type</label>
              <select
                value={(config.actionType as string) || ''}
                onChange={(e) => updateConfig('actionType', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select action...</option>
                {Object.entries(WORKFLOW_ACTIONS).map(([key, action]) => (
                  <option key={key} value={key}>
                    {action.icon} {action.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic fields based on action type */}
            {config.actionType === 'send_email' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">To (template)</label>
                  <input
                    type="text"
                    value={(config.to as string) || ''}
                    onChange={(e) => updateConfig('to', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="{{customerEmail}}"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Subject</label>
                  <input
                    type="text"
                    value={(config.subject as string) || ''}
                    onChange={(e) => updateConfig('subject', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Email subject..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Body</label>
                  <textarea
                    value={(config.body as string) || ''}
                    onChange={(e) => updateConfig('body', e.target.value)}
                    rows={4}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Use {{field}} for template variables..."
                  />
                </div>
              </>
            )}

            {config.actionType === 'webhook' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">URL</label>
                  <input
                    type="url"
                    value={(config.url as string) || ''}
                    onChange={(e) => updateConfig('url', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Method</label>
                  <select
                    value={(config.method as string) || 'POST'}
                    onChange={(e) => updateConfig('method', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
              </>
            )}

            {(config.actionType === 'tag_customer' || config.actionType === 'tag_order' || config.actionType === 'tag_product') && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tag</label>
                <input
                  type="text"
                  value={(config.tag as string) || ''}
                  onChange={(e) => updateConfig('tag', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g. vip, high-value, needs-follow-up"
                />
              </div>
            )}

            {config.actionType === 'create_notification' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={(config.title as string) || ''}
                    onChange={(e) => updateConfig('title', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Notification title..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Message</label>
                  <textarea
                    value={(config.message as string) || ''}
                    onChange={(e) => updateConfig('message', e.target.value)}
                    rows={3}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Use {{field}} for variables..."
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => onDelete(node.id)}
          className="w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}
