import { useState } from 'react';

// ============================================================================
// useProjectStatus Hook
// ============================================================================
// What: Manages project status update logic (admin only).
// Why: Extracts status update functionality from ProjectDetailModal.
// How: Handles status change and optional note submission.

export function useProjectStatus(projectId: string | null, currentStatus: string) {
  // ============================================================================
  // State Management
  // ============================================================================

  const [newStatus, setNewStatus] = useState(currentStatus);
  const [statusNote, setStatusNote] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // ============================================================================
  // Handle Status Update
  // ============================================================================

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStatus || newStatus === currentStatus) return;

    setSubmittingStatus(true);

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

      setStatusNote('');

      return updatedProject;
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    } finally {
      setSubmittingStatus(false);
    }
  };

  return {
    newStatus,
    setNewStatus,
    statusNote,
    setStatusNote,
    submittingStatus,
    handleUpdateStatus,
  };
}
