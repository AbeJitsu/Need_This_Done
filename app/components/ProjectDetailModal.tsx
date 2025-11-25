'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from './StatusBadge';

// ============================================================================
// Project Detail Modal Component
// ============================================================================
// What: Displays full project details, comments, and allows interactions.
// Why: Shows everything about a project and enables communication.
// How: Opens as a modal overlay; renders different features based on user role.

interface ProjectComment {
  id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  user: { email: string };
}

interface ProjectDetailModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void; // Callback to refresh parent list
}

export default function ProjectDetailModal({
  projectId,
  isOpen,
  onClose,
  onUpdate,
}: ProjectDetailModalProps) {
  // ============================================================================
  // State Management
  // ============================================================================

  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // Fetch Project and Comments
  // ============================================================================

  useEffect(() => {
    if (!isOpen || !projectId) return;

    const fetchProjectAndComments = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch project from projects/mine (user's own projects)
        const projectRes = await fetch(`/api/projects/mine`);
        if (!projectRes.ok) throw new Error('Failed to fetch projects');

        const { projects } = await projectRes.json();
        const proj = projects.find((p: any) => p.id === projectId);

        if (!proj) {
          setError('Project not found');
          return;
        }

        setProject(proj);
        setNewStatus(proj.status);

        // Fetch comments
        const commentsRes = await fetch(
          `/api/projects/${projectId}/comments`
        );
        if (!commentsRes.ok) throw new Error('Failed to fetch comments');

        const { comments: fetchedComments } = await commentsRes.json();
        setComments(fetchedComments || []);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndComments();
  }, [isOpen, projectId]);

  // ============================================================================
  // Auto-scroll to Latest Comment
  // ============================================================================

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // ============================================================================
  // Handle Add Comment
  // ============================================================================

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setSubmittingComment(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          is_internal: isInternalNote && isAdmin,
        }),
      });

      if (!res.ok) throw new Error('Failed to add comment');

      const { comment } = await res.json();

      setComments([...comments, comment]);
      setNewComment('');
      setIsInternalNote(false);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // ============================================================================
  // Handle Status Update (Admin Only)
  // ============================================================================

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStatus || newStatus === project.status) return;

    setSubmittingStatus(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote,
        }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      const { project: updatedProject } = await res.json();

      setProject(updatedProject);
      setStatusNote('');

      // Refresh comments to show status update comment
      const commentsRes = await fetch(
        `/api/projects/${projectId}/comments`
      );
      if (commentsRes.ok) {
        const { comments: fetchedComments } = await commentsRes.json();
        setComments(fetchedComments || []);
      }

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  // ============================================================================
  // Format Date and Time
  // ============================================================================

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================================================
  // Don't render if modal is closed
  // ============================================================================

  if (!isOpen) return null;

  // ============================================================================
  // Render Modal
  // ============================================================================

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ====================================================================
            Header
            ==================================================================== */}

        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {project?.name || 'Loading...'}
            </h2>
            {project && <p className="text-sm text-gray-600 dark:text-gray-400">{project.email}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* ====================================================================
            Content
            ==================================================================== */}

        <div className="p-6 space-y-6">
          {loading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              Loading project details...
            </p>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          ) : project ? (
            <>
              {/* Status and Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <div className="mt-2">
                    <StatusBadge status={project.status} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Service
                  </label>
                  <p className="mt-2 text-gray-900 dark:text-gray-100">
                    {project.service || '—'}
                  </p>
                </div>
              </div>

              {/* Company */}
              {project.company && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company
                  </label>
                  <p className="mt-2 text-gray-900 dark:text-gray-100">
                    {project.company}
                  </p>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Details
                </label>
                <p className="mt-2 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {project.message}
                </p>
              </div>

              {/* Attachments */}
              {project.attachments && project.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Attachments ({project.attachments.length})
                  </label>
                  <ul className="mt-2 space-y-2">
                    {project.attachments.map((path: string, idx: number) => (
                      <li key={idx}>
                        <a
                          href={`/api/files/${path}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          📎 {path.split('/').pop()}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ============================================================
                  Admin: Status Update Section
                  ============================================================ */}

              {isAdmin && (
                <form
                  onSubmit={handleUpdateStatus}
                  className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Update Status
                  </h3>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="in_review">In Review</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Note (Optional)
                    </label>
                    <textarea
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="Add a note that will be visible to the client..."
                      className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingStatus || newStatus === project.status}
                    className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingStatus ? 'Updating...' : 'Update Status'}
                  </button>
                </form>
              )}

              {/* ============================================================
                  Comments Thread
                  ============================================================ */}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Comments & Updates
                </h3>

                {/* Comments List */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  {comments.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No comments yet
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3 rounded-lg ${
                          comment.is_internal
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                            : 'bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {comment.user.email}
                            {comment.is_internal && (
                              <span className="ml-2 text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded">
                                Internal
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDateTime(comment.created_at)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                  <div ref={commentsEndRef} />
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                  />

                  {isAdmin && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Internal note (not visible to client)
                      </span>
                    </label>
                  )}

                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="w-full py-2 px-4 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingComment ? 'Sending...' : 'Send Comment'}
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
