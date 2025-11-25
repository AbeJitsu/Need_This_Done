'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProjectCard from './ProjectCard';
import ProjectDetailModal from './ProjectDetailModal';

// ============================================================================
// User Dashboard Component - View My Projects
// ============================================================================
// What: Displays only the logged-in user's projects.
// Why: Users need to track their submitted projects and updates.
// How: Fetches from /api/projects/mine.

export default function UserDashboard() {
  // ============================================================================
  // State Management
  // ============================================================================

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ============================================================================
  // Fetch User's Projects
  // ============================================================================

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/projects/mine');

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to view your projects');
          return;
        }
        throw new Error('Failed to fetch projects');
      }

      const { projects: fetchedProjects } = await res.json();
      setProjects(fetchedProjects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load your projects');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Initial Load
  // ============================================================================

  useEffect(() => {
    fetchProjects();
  }, []);

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
          Your Projects
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track the status of your submitted projects
        </p>
      </div>

      {/* ====================================================================
          Projects Grid or Empty State
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
            No Projects Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Submit a project request to get started
          </p>
          <Link
            href="/contact"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors"
          >
            Submit a Project
          </Link>
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
            Need to submit another project?
          </p>
          <Link
            href="/contact"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
          >
            Submit New Project
          </Link>
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
