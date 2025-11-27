'use client';

import StatusBadge from './StatusBadge';

// ============================================================================
// Project Card Component - Display Project Summary
// ============================================================================
// Shows key project info in a clickable card.
// What: Displays project summary with status, email, service, and date.
// Why: Provides visual preview of projects in list/grid format.
// How: Used in admin and user dashboards; click opens detail modal.

interface ProjectCardProps {
  id: string;
  name: string;
  email: string;
  service?: string;
  status: 'submitted' | 'in_review' | 'scheduled' | 'in_progress' | 'completed';
  createdAt: string;
  messagePreview: string;
  commentCount?: number;
  attachmentCount?: number;
  onClick: () => void;
}

export default function ProjectCard({
  id: _id,
  name,
  email,
  service,
  status,
  createdAt,
  messagePreview,
  commentCount = 0,
  attachmentCount = 0,
  onClick,
}: ProjectCardProps) {
  // ============================================================================
  // Format Date
  // ============================================================================

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all hover:border-gray-400 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-gray-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]"
    >
      {/* ====================================================================
          Header: Name, Status Badge, and Date
          ==================================================================== */}

      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {name}
          </h3>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      {/* ====================================================================
          Email and Date
          ==================================================================== */}

      <div className="flex items-center justify-between gap-4 mb-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {email}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
          {formatDate(createdAt)}
        </p>
      </div>

      {/* ====================================================================
          Service Tag (if provided)
          ==================================================================== */}

      {service && (
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded">
            {service}
          </span>
        </div>
      )}

      {/* ====================================================================
          Message Preview
          ==================================================================== */}

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {messagePreview}
      </p>

      {/* ====================================================================
          Footer: Metadata (Comments, Files)
          ==================================================================== */}

      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
        {commentCount > 0 && (
          <span>💬 {commentCount} comment{commentCount !== 1 ? 's' : ''}</span>
        )}
        {attachmentCount > 0 && (
          <span>📎 {attachmentCount} file{attachmentCount !== 1 ? 's' : ''}</span>
        )}
      </div>
    </button>
  );
}
