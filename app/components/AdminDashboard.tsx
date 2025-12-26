'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ProjectCard from './ProjectCard';
import ProjectDetailModal from './ProjectDetailModal';
import { useDashboard, LoadingSkeleton, ErrorDisplay } from '@/hooks/useDashboard';

// ============================================================================
// Admin Dashboard Component - View All Projects with Filters
// ============================================================================
// What: Displays all projects with filtering and management capabilities.
// Why: Admins need to see and manage all client projects.
// How: Uses shared useDashboard hook with admin-specific filters.

export default function AdminDashboard() {
  // ============================================================================
  // Filter State (Admin-specific)
  // ============================================================================

  const [statusFilter, setStatusFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');

  // Memoize filters to prevent unnecessary re-fetches
  const filters = useMemo(
    () => ({ status: statusFilter, email: emailFilter }),
    [statusFilter, emailFilter]
  );

  // ============================================================================
  // Shared Dashboard Logic
  // ============================================================================

  const {
    projects,
    loading,
    error,
    selectedProjectId,
    isModalOpen,
    handleOpenProject,
    handleCloseModal,
    handleProjectUpdate,
  } = useDashboard({
    endpoint: '/api/projects/all',
    filters,
  });

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
          Quick Links
          ==================================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link
          href="/admin/content"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="text-2xl mb-2">📝</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Edit Content
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Marketing pages</p>
        </Link>
        <Link
          href="/admin/pages"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all group"
        >
          <div className="text-2xl mb-2">🎨</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
            Page Builder
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop pages</p>
        </Link>
        <Link
          href="/admin/shop"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 hover:shadow-md transition-all group"
        >
          <div className="text-2xl mb-2">🛒</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400">
            Shop
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Products & orders</p>
        </Link>
        <Link
          href="/admin/appointments"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-md transition-all group"
        >
          <div className="text-2xl mb-2">📅</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
            Appointments
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Booking requests</p>
        </Link>
        <Link
          href="/admin/users"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-pink-400 dark:hover:border-pink-500 hover:shadow-md transition-all group"
        >
          <div className="text-2xl mb-2">👥</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-pink-600 dark:group-hover:text-pink-400">
            Users
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage accounts</p>
        </Link>
        <Link
          href="/admin/dev"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md transition-all group"
        >
          <div className="text-2xl mb-2">⚙️</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400">
            Dev Tools
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">System overview</p>
        </Link>
      </div>

      {/* ====================================================================
          Filters
          ==================================================================== */}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md">
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
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/50 focus:outline-none"
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
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ====================================================================
          Projects Grid
          ==================================================================== */}

      {error ? (
        <ErrorDisplay message={error} />
      ) : loading ? (
        <LoadingSkeleton />
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
