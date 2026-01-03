'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useComments } from '@/hooks/useComments';
import { useProjectStatus } from '@/hooks/useProjectStatus';
import { useBackdropClose } from '@/hooks/useBackdropClose';
import ProjectModalHeader from './project-modal/ProjectModalHeader';
import ProjectModalDetails from './project-modal/ProjectModalDetails';
import AdminStatusSection from './project-modal/AdminStatusSection';
import ProjectComments from './project-modal/ProjectComments';
import { alertColors, cardBgColors } from '@/lib/colors';

// ============================================================================
// Project Detail Modal Component
// ============================================================================
// What: Displays full project details, comments, and allows interactions.
// Why: Shows everything about a project and enables communication.
// How: Opens as a modal overlay; orchestrates sub-components based on user role.

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
  // Auth and State Management
  // ============================================================================

  const { user: _user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Custom Hooks
  // ============================================================================

  const {
    comments,
    newComment,
    setNewComment,
    isInternalNote,
    setIsInternalNote,
    submittingComment,
    handleAddComment: handleAddCommentBase,
    commentsEndRef,
    refreshComments,
  } = useComments(projectId, isOpen, isAdmin);

  const {
    newStatus,
    setNewStatus,
    statusNote,
    setStatusNote,
    submittingStatus,
    handleUpdateStatus: handleUpdateStatusBase,
  } = useProjectStatus(projectId, project?.status || '');

  // ============================================================================
  // Backdrop Click Handler - Close modal when clicking outside
  // ============================================================================
  const { handleBackdropClick, modalRef } = useBackdropClose({
    isOpen,
    onClose,
    includeEscape: true, // Also handles Escape key
  });

  // ============================================================================
  // Fetch Project Data
  // ============================================================================

  useEffect(() => {
    if (!isOpen || !projectId) return;

    const fetchProject = async () => {
      setLoading(true);
      setError(null);

      try {
        // Admins use /api/projects/all to see all projects
        // Regular users use /api/projects/mine to see their own
        const endpoint = isAdmin ? '/api/projects/all' : '/api/projects/mine';
        const projectRes = await fetch(endpoint);
        if (!projectRes.ok) throw new Error('Failed to fetch projects');

        const { projects } = await projectRes.json();
        const proj = projects.find((p: any) => p.id === projectId);

        if (!proj) {
          setError('Project not found');
          return;
        }

        setProject(proj);
        setNewStatus(proj.status);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [isOpen, projectId, isAdmin, setNewStatus]);

  // ============================================================================
  // Wrapped Handlers (for error handling and side effects)
  // ============================================================================

  const handleAddComment = async (e: React.FormEvent) => {
    try {
      await handleAddCommentBase(e);
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    try {
      const updatedProject = await handleUpdateStatusBase(e);
      if (updatedProject) {
        setProject(updatedProject);
        await refreshComments();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - visual layer */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        aria-hidden="true"
      />

      {/* Modal container - handles clicks outside modal */}
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
      >
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          className={`${cardBgColors.base} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
        >
        {/* Header */}
        <ProjectModalHeader
          title={project?.name || 'Loading...'}
          email={project?.email}
          onClose={onClose}
        />

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              Loading project details...
            </p>
          ) : error ? (
            <div className={`p-4 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}>
              <p className={alertColors.error.text}>{error}</p>
            </div>
          ) : project ? (
            <>
              {/* Project Details */}
              <ProjectModalDetails project={project} />

              {/* Admin: Status Update Section */}
              {isAdmin && (
                <AdminStatusSection
                  newStatus={newStatus}
                  setNewStatus={setNewStatus}
                  statusNote={statusNote}
                  setStatusNote={setStatusNote}
                  submittingStatus={submittingStatus}
                  handleUpdateStatus={handleUpdateStatus}
                  currentStatus={project.status}
                />
              )}

              {/* Comments Thread */}
              <ProjectComments
                comments={comments}
                newComment={newComment}
                setNewComment={setNewComment}
                isInternalNote={isInternalNote}
                setIsInternalNote={setIsInternalNote}
                submittingComment={submittingComment}
                handleAddComment={handleAddComment}
                commentsEndRef={commentsEndRef}
                isAdmin={isAdmin}
              />
            </>
          ) : null}
        </div>
      </div>
      </div>
    </>
  );
}
