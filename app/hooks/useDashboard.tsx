'use client';

import { useState, useEffect, useCallback } from 'react';
import { mockProjects, isDevPreview } from '@/lib/mockProjects';
import { alertColors } from '@/lib/colors';

// ============================================================================
// Dashboard Hook - Shared Logic for Admin and User Dashboards
// ============================================================================
// What: Manages project fetching, loading states, and modal interactions.
// Why: Both dashboards share the same core logic, just with different endpoints.
// How: Accepts configuration for endpoint, filters, and mock data slicing.

// ============================================================================
// Type Definitions
// ============================================================================

export type ProjectStatus = 'submitted' | 'in_review' | 'scheduled' | 'in_progress' | 'completed';

export interface Project {
  id: string;
  name: string;
  email: string;
  service: string | null;
  status: ProjectStatus;
  message: string;
  created_at: string;
  attachments: string[] | null;
  project_comments?: { count: number }[];
}

export interface DashboardConfig {
  endpoint: string;
  mockDataSlice?: [number, number?]; // [start, end] for mock data
  filters?: Record<string, string>;
}

export interface DashboardState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  selectedProjectId: string | null;
  isModalOpen: boolean;
}

export interface DashboardActions {
  fetchProjects: () => Promise<void>;
  handleOpenProject: (projectId: string) => void;
  handleCloseModal: () => void;
  handleProjectUpdate: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useDashboard(config: DashboardConfig): DashboardState & DashboardActions {
  const { endpoint, mockDataSlice, filters = {} } = config;

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ============================================================================
  // Fetch Projects
  // ============================================================================

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Dev preview mode - use mock data
    if (isDevPreview()) {
      const data = mockDataSlice
        ? mockProjects.slice(mockDataSlice[0], mockDataSlice[1])
        : mockProjects;
      setProjects(data);
      setLoading(false);
      return;
    }

    try {
      // Build query string from filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
      const res = await fetch(url);

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to view projects');
          return;
        }
        if (res.status === 403) {
          setError('You do not have permission to view these projects');
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
  }, [endpoint, filters, mockDataSlice]);

  // ============================================================================
  // Modal Handlers
  // ============================================================================

  const handleOpenProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProjectId(null);
  }, []);

  const handleProjectUpdate = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ============================================================================
  // Initial Load
  // ============================================================================

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    // State
    projects,
    loading,
    error,
    selectedProjectId,
    isModalOpen,
    // Actions
    fetchProjects,
    handleOpenProject,
    handleCloseModal,
    handleProjectUpdate,
  };
}

// ============================================================================
// Shared UI Components
// ============================================================================

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 animate-pulse h-48"
        />
      ))}
    </div>
  );
}

export function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className={`p-6 rounded-xl ${alertColors.error.bg} ${alertColors.error.border}`}>
      <p className={alertColors.error.text}>{message}</p>
    </div>
  );
}
