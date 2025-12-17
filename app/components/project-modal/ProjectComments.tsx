import { RefObject } from 'react';
import { solidButtonColors } from '@/lib/colors';

// ============================================================================
// Project Comments Component
// ============================================================================
// What: Displays comment thread and submission form.
// Why: Separates comment UI from modal orchestration.
// How: Renders existing comments with auto-scroll and a new comment form.

interface ProjectComment {
  id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  user: { email: string };
}

interface ProjectCommentsProps {
  comments: ProjectComment[];
  newComment: string;
  setNewComment: (value: string) => void;
  isInternalNote: boolean;
  setIsInternalNote: (value: boolean) => void;
  submittingComment: boolean;
  handleAddComment: (e: React.FormEvent) => Promise<void>;
  commentsEndRef: RefObject<HTMLDivElement>;
  isAdmin: boolean;
}

export default function ProjectComments({
  comments,
  newComment,
  setNewComment,
  isInternalNote,
  setIsInternalNote,
  submittingComment,
  handleAddComment,
  commentsEndRef,
  isAdmin,
}: ProjectCommentsProps) {
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

  return (
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
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900/50 focus:outline-none resize-none"
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
          className={`w-full py-3 px-4 font-semibold rounded-lg transition-all duration-200 hover:shadow-md active:scale-[0.98] focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900/50 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100 ${solidButtonColors.purple.bg} ${solidButtonColors.purple.text} ${solidButtonColors.purple.hover}`}
        >
          {submittingComment ? 'Sending...' : 'Send Comment'}
        </button>
      </form>
    </div>
  );
}
