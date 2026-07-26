'use client';

import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { headingColors } from '@/lib/colors';

interface ClientAccessSectionProps {
  projectId: string;
  email: string;
  portalAccessEnabled: boolean;
  onChanged: (portalAccessEnabled: boolean) => void;
}

type PendingAction = 'link' | 'unlink' | null;

export default function ClientAccessSection({
  projectId,
  email,
  portalAccessEnabled,
  onChanged,
}: ClientAccessSectionProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLinking = pendingAction === 'link';

  const confirmChange = async () => {
    if (!pendingAction) return;

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/access`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: pendingAction }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to update client portal access.');
      }

      onChanged(data.portalAccessEnabled === true);
      setResult(data.portalAccessEnabled
        ? 'Client portal access is now enabled for this project.'
        : 'Client portal access has been removed from this project.');
      setPendingAction(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update client portal access.');
      setPendingAction(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-lg border border-gray-300 dark:border-gray-600 p-4 space-y-3">
      <div>
        <h3 className={`font-semibold ${headingColors.primary}`}>Client Access</h3>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
          Client portal access is {portalAccessEnabled ? 'enabled' : 'not enabled'}.
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Only an existing account with the exact email <strong>{email}</strong> can be linked. This does not create an account or send an invitation.
        </p>
      </div>

      {result && (
        <p role="status" className="rounded-md bg-green-100 p-3 text-sm text-green-800 dark:bg-green-900/50 dark:text-green-100">
          {result}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-md bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/50 dark:text-red-100">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => setPendingAction(portalAccessEnabled ? 'unlink' : 'link')}
        disabled={submitting}
        className={portalAccessEnabled
          ? 'rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60'
          : 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'}
      >
        {portalAccessEnabled ? 'Remove client access' : 'Enable client access'}
      </button>

      <ConfirmDialog
        isOpen={pendingAction !== null}
        onConfirm={confirmChange}
        onCancel={() => !submitting && setPendingAction(null)}
        title={isLinking ? 'Enable client portal access?' : 'Remove client portal access?'}
        message={isLinking
          ? `This will link the project to an existing account only if its exact email is ${email}. No account will be created and no invitation will be sent.`
          : 'This will immediately remove this client account’s access to the project, its comments, and its attachments. You can link it again later only to an existing account with the same email.'}
        confirmLabel={isLinking ? 'Enable access' : 'Remove access'}
        variant={isLinking ? 'info' : 'danger'}
      />
    </section>
  );
}
