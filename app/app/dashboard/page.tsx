'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// ============================================================================
// Dashboard Page - View Your Projects
// ============================================================================
// Protected route showing the user's submitted projects with status updates.
// Redirects to login if not authenticated.

interface Project {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  message: string;
  status: 'submitted' | 'in_review' | 'scheduled' | 'in_progress' | 'completed';
  attachments: string[] | null;
  created_at: string;
}

// ============================================================================
// Status Badge Colors
// ============================================================================

const statusColors: Record<Project['status'], { bg: string; text: string; label: string }> = {
  submitted: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Submitted' },
  in_review: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', label: 'In Review' },
  scheduled: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-300', label: 'Scheduled' },
  in_progress: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300', label: 'In Progress' },
  completed: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', label: 'Completed' },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Redirect if Not Authenticated
  // ============================================================================

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // ============================================================================
  // Fetch User's Projects
  // ============================================================================

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects/mine');
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load projects');
          return;
        }

        setProjects(data.projects || []);
      } catch (err) {
        setError('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, user]);

  // ============================================================================
  // Format Date
  // ============================================================================

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Your Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track the status of your submitted projects.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-300">Loading your projects...</p>
          </div>
        ) : projects.length === 0 ? (
          // Empty State
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Projects Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Submit a project request to get started.
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
            >
              Submit a Project
            </Link>
          </div>
        ) : (
          // Projects List
          <div className="space-y-4">
            {projects.map((project) => {
              const status = statusColors[project.status];
              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all hover:border-gray-400 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-gray-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]"
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {project.service || 'General Inquiry'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Submitted {formatDate(project.created_at)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Project Message */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {project.message}
                  </p>

                  {/* Attachments */}
                  {project.attachments && project.attachments.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Attachments ({project.attachments.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.attachments.map((path, index) => {
                          const fileName = path.split('/').pop() || `File ${index + 1}`;
                          return (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300"
                            >
                              {fileName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Submit Another Project */}
        {projects.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/contact"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Submit Another Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
