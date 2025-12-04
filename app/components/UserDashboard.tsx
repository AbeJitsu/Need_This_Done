'use client';

import Button from './Button';
import ProjectCard from './ProjectCard';
import ProjectDetailModal from './ProjectDetailModal';
import { useDashboard, LoadingSkeleton, ErrorDisplay } from '@/hooks/useDashboard';

// ============================================================================
// User Dashboard Component - View My Projects
// ============================================================================
// What: Displays only the logged-in user's projects.
// Why: Users need to track their submitted projects and updates.
// How: Uses shared useDashboard hook with user-specific endpoint.

export default function UserDashboard() {
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
    endpoint: '/api/projects/mine',
    mockDataSlice: [0, 2], // Show 2 projects for user view in dev preview
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
          Your Projects
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's where things stand. Click any project for details.
        </p>
      </div>

      {/* ====================================================================
          Projects Grid or Empty State
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
            Nothing here yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            When you're ready to get something done, we'll be here.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
            Your projects will show up right here so you can track progress and stay in the loop.
          </p>
          <Button variant="purple" href="/contact" size="md">
            Start a Project
          </Button>
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
          Additional Actions
          ==================================================================== */}

      {projects.length > 0 && (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Have another project in mind?
          </p>
          <Button variant="blue" href="/contact" size="md">
            Start a New One
          </Button>
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
