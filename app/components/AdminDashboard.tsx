'use client';

import { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import ProjectDetailModal from './ProjectDetailModal';
import { mockProjects, isDevPreview } from '@/lib/mockProjects';

// ============================================================================
// Admin Dashboard Component - View All Projects with Filters
// ============================================================================
// What: Displays all projects with filtering and management capabilities.
// Why: Admins need to see and manage all client projects.
// How: Fetches from /api/projects/all with optional filters.

export default function AdminDashboard() {
  // ============================================================================
  // State Management
  // ============================================================================

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');

  // ============================================================================
  // Fetch Projects
  // ============================================================================

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    // Dev preview mode - skip API call, use mock data
    if (isDevPreview()) {
      setProjects(mockProjects);
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (emailFilter) params.append('email', emailFilter);

      const res = await fetch(
        `/api/projects/all${params.toString() ? '?' + params.toString() : ''}`
      );

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to view projects');
          return;
        }
        if (res.status === 403) {
          setError('You do not have permission to view all projects');
          return;
        }
        throw new Error('Failed to fetch projects');
      }

      const { projects: fetchedProjects } = await res.json();
      setProjects(fetchedProjects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Initial Load and Filter Changes
  // ============================================================================

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, emailFilter]);

  // ============================================================================
  // Handle Modal
  // ============================================================================

  const handleOpenProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProjectId(null);
  };

  const handleProjectUpdate = () => {
    fetchProjects();
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* ====================================================================
          Header
          ==================================================================== */}

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Project Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Everything in one place. Click a project to dig in.
        </p>
      </div>

      {/* ====================================================================
          Filters
          ==================================================================== */}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Find what you need
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Show me
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              title="Filter by project status"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Email Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search by client
            </label>
            <input
              type="text"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="Name or email..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* ====================================================================
          Projects Grid
          ==================================================================== */}

      {error ? (
        <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 animate-pulse h-48"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No matches
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try different filters or clear them to see everything.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('');
              setEmailFilter('');
            }}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              email={project.email}
              service={project.service}
              status={project.status}
              createdAt={project.created_at}
              messagePreview={project.message.substring(0, 100)}
              commentCount={
                project.project_comments && project.project_comments.length > 0
                  ? project.project_comments[0].count
                  : 0
              }
              attachmentCount={
                project.attachments ? project.attachments.length : 0
              }
              onClick={() => handleOpenProject(project.id)}
            />
          ))}
        </div>
      )}

      {/* ====================================================================
          Project Detail Modal
          ==================================================================== */}

      {selectedProjectId && (
        <ProjectDetailModal
          projectId={selectedProjectId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleProjectUpdate}
        />
      )}
    </div>
  );
}
