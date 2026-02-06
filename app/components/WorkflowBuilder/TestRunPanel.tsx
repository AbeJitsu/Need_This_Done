'use client';

import { useState } from 'react';

interface StepResult {
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: 'success' | 'skipped' | 'error';
  output?: Record<string, unknown>;
  error?: string;
  durationMs: number;
}

interface TestRunPanelProps {
  workflowId?: string;
  onClose: () => void;
}

export function TestRunPanel({ workflowId, onClose }: TestRunPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<StepResult[]>([]);
  const [error, setError] = useState('');

  const runTest = async () => {
    if (!workflowId) {
      setError('Save the workflow first before running a test');
      return;
    }

    setIsRunning(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(`/api/workflows/${workflowId}/test-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Test run failed');
      }

      const data = await response.json();
      setResults(data.steps || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test run failed');
    } finally {
      setIsRunning(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'skipped': return '⏭️';
      case 'error': return '❌';
      default: return '⬜';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-emerald-200 bg-emerald-50';
      case 'skipped': return 'border-gray-200 bg-gray-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-blue-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide">Test Run</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Run Button */}
        <button
          onClick={runTest}
          disabled={isRunning}
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors shadow-sm mb-4"
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Running...
            </span>
          ) : (
            '▶ Run Test'
          )}
        </button>

        {!workflowId && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            Save the workflow first to enable test runs.
          </div>
        )}

        {/* Description */}
        {results.length === 0 && !error && !isRunning && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm font-medium">Preview execution path</p>
            <p className="text-xs mt-1">Test runs use sample data and skip side effects (no emails sent, no data changed).</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Execution Trace ({results.length} steps)
            </div>
            {results.map((step, i) => (
              <div
                key={`${step.nodeId}-${i}`}
                className={`border rounded-lg px-3 py-2 ${statusColor(step.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{statusIcon(step.status)}</span>
                    <div>
                      <div className="text-xs font-semibold text-gray-800">{step.nodeLabel}</div>
                      <div className="text-[10px] text-gray-500">{step.nodeType}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">{step.durationMs}ms</span>
                </div>
                {step.output && Object.keys(step.output).length > 0 && (
                  <pre className="mt-1.5 text-[10px] text-gray-600 bg-white/60 rounded px-2 py-1 overflow-x-auto max-h-24">
                    {JSON.stringify(step.output, null, 2)}
                  </pre>
                )}
                {step.error && (
                  <div className="mt-1.5 text-[10px] text-red-600">{step.error}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
