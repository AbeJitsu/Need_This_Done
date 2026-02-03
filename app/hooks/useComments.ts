import { useState, useEffect, useRef } from 'react';
import { scrollIntoViewWithMotionPreference } from '@/lib/scroll-utils';

// ============================================================================
// useComments Hook
// ============================================================================
// What: Manages comment state, fetching, and submission logic.
// Why: Extracts complex comment logic from ProjectDetailModal.
// How: Handles comment CRUD operations and auto-scroll behavior.

interface ProjectComment {
  id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  user: { email: string };
}

export function useComments(projectId: string | null, isOpen: boolean, isAdmin: boolean) {
  // ============================================================================
  // State Management
  // ============================================================================

  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // Fetch Comments
  // ============================================================================

  useEffect(() => {
    if (!isOpen || !projectId) return;

    const fetchComments = async () => {
      try {
        const commentsRes = await fetch(`/api/projects/${projectId}/comments`);
        if (commentsRes.ok) {
          const { comments: fetchedComments } = await commentsRes.json();
          setComments(fetchedComments || []);
        } else {
          console.warn('Could not load comments - comments table may not exist');
          setComments([]);
        }
      } catch (commentErr) {
        console.warn('Error fetching comments:', commentErr);
        setComments([]);
      }
    };

    fetchComments();
  }, [isOpen, projectId]);

  // ============================================================================
  // Auto-scroll to Latest Comment (respects prefers-reduced-motion)
  // ============================================================================

  useEffect(() => {
    scrollIntoViewWithMotionPreference(commentsEndRef.current);
  }, [comments]);

  // ============================================================================
  // Handle Add Comment
  // ============================================================================

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setSubmittingComment(true);

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
      throw err;
    } finally {
      setSubmittingComment(false);
    }
  };

  // ============================================================================
  // Refresh Comments (used after status update)
  // ============================================================================

  const refreshComments = async () => {
    if (!projectId) return;

    try {
      const commentsRes = await fetch(`/api/projects/${projectId}/comments`);
      if (commentsRes.ok) {
        const { comments: fetchedComments } = await commentsRes.json();
        setComments(fetchedComments || []);
      }
    } catch (err) {
      console.warn('Error refreshing comments:', err);
    }
  };

  return {
    comments,
    newComment,
    setNewComment,
    isInternalNote,
    setIsInternalNote,
    submittingComment,
    handleAddComment,
    commentsEndRef,
    refreshComments,
  };
}
