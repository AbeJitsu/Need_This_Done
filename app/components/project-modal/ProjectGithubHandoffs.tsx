'use client';

import { useCallback, useEffect, useState } from 'react';
import { headingColors } from '@/lib/colors';

type Handoff = {
  id: string;
  github_url: string;
  note: string | null;
  notification_status?: 'pending' | 'sent' | 'failed';
  notification_attempts?: number;
  notification_error?: string | null;
  created_at: string;
};

interface ProjectGithubHandoffsProps {
  projectId: string;
  isAdmin: boolean;
}

export default function ProjectGithubHandoffs({ projectId, isAdmin }: ProjectGithubHandoffsProps) {
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [githubUrl, setGithubUrl] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHandoffs = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/deliveries`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load GitHub handoffs.');
      setHandoffs(data.handoffs || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load GitHub handoffs.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadHandoffs();
  }, [loadHandoffs]);

  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl, note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to publish GitHub handoff.');

      setHandoffs((current) => [data.handoff, ...current]);
      setGithubUrl('');
      setNote('');
      setMessage(data.notificationSent
        ? 'GitHub handoff published and the client was notified.'
        : 'GitHub handoff published, but the email failed. Retry it below.');
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Unable to publish GitHub handoff.');
    } finally {
      setSubmitting(false);
    }
  };

  const retryNotification = async (handoffId: string) => {
    setRetryingId(handoffId);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/deliveries/${handoffId}/retry-notification`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to retry delivery email.');

      setHandoffs((current) => current.map((handoff) => handoff.id === handoffId ? data.handoff : handoff));
      setMessage(data.notificationSent ? 'Delivery email sent.' : 'Delivery email failed again. You can retry it later.');
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : 'Unable to retry delivery email.');
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <section className="rounded-lg border border-gray-300 dark:border-gray-600 p-4 space-y-4">
      <div>
        <h3 className={`font-semibold ${headingColors.primary}`}>GitHub Handoffs</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          GitHub controls repository membership. This portal records the handoff link for this project.
        </p>
      </div>

      {message && <p role="status" className="rounded-md bg-green-100 p-3 text-sm text-green-800 dark:bg-green-900/50 dark:text-green-100">{message}</p>}
      {error && <p role="alert" className="rounded-md bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/50 dark:text-red-100">{error}</p>}

      {isAdmin && (
        <form onSubmit={publish} className="space-y-3 border-b border-gray-300 pb-4 dark:border-gray-600">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            GitHub URL
            <input
              type="url"
              required
              value={githubUrl}
              onChange={(event) => setGithubUrl(event.target.value)}
              placeholder="https://github.com/owner/repository"
              className="mt-1 w-full rounded-md border border-gray-400 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Handoff note <span className="font-normal">(optional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={2000}
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-400 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
          <button
            type="submit"
            disabled={submitting || !githubUrl.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Publishing…' : 'Publish GitHub handoff'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading GitHub handoffs…</p>
      ) : handoffs.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">No GitHub handoffs have been posted yet.</p>
      ) : (
        <ul className="space-y-3">
          {handoffs.map((handoff) => (
            <li key={handoff.id} className="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
              <a href={handoff.github_url} target="_blank" rel="noreferrer" className="break-all font-medium text-blue-700 underline dark:text-blue-300">
                Open GitHub handoff
              </a>
              {handoff.note && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{handoff.note}</p>}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Posted {new Date(handoff.created_at).toLocaleString()}</p>
              {isAdmin && handoff.notification_status && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className={handoff.notification_status === 'sent' ? 'text-green-700 dark:text-green-300' : handoff.notification_status === 'failed' ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}>
                    Email: {handoff.notification_status}
                  </span>
                  {handoff.notification_status === 'failed' && (
                    <button
                      type="button"
                      onClick={() => retryNotification(handoff.id)}
                      disabled={retryingId === handoff.id}
                      className="rounded-md border border-blue-600 px-3 py-1 text-blue-700 hover:bg-blue-50 disabled:opacity-60 dark:text-blue-300 dark:hover:bg-gray-700"
                    >
                      {retryingId === handoff.id ? 'Retrying…' : 'Retry email'}
                    </button>
                  )}
                  {handoff.notification_error && <span className="text-red-700 dark:text-red-300">{handoff.notification_error}</span>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
