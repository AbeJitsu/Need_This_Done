'use client';

import { useState } from 'react';

// ============================================================================
// What Can You Build Component - Project Examples
// ============================================================================
// Shows real-world examples of what users can build with this setup.
// Demonstrates that all the pieces work together for common projects.

interface ProjectExample {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  timeEstimate: string;
}

const projects: ProjectExample[] = [
  {
    id: 'social',
    name: 'Social Network',
    description: 'A platform where people share updates, follow each other, and engage with content',
    icon: '👥',
    features: [
      'User accounts and profiles',
      'Create and share posts',
      'Follow other users',
      'Like and comment on posts',
      'Real-time notifications',
      'Search and discover users',
      'Direct messaging',
    ],
    timeEstimate: '2-3 hours setup (vs 4-6 weeks from scratch)',
  },
  {
    id: 'store',
    name: 'Online Store',
    description: 'An e-commerce platform where you can list products and customers can buy them',
    icon: '🛒',
    features: [
      'Product catalog with search',
      'Shopping cart',
      'Secure checkout',
      'Order history for customers',
      'Admin dashboard to manage products',
      'Payment processing integration',
      'Inventory tracking',
    ],
    timeEstimate: '2-3 hours setup (vs 4-6 weeks from scratch)',
  },
  {
    id: 'blog',
    name: 'Blog Platform',
    description: 'A publishing platform for writing and sharing articles with readers',
    icon: '📝',
    features: [
      'Write and edit articles',
      'Publish with custom URLs',
      'Categories and tags',
      'Reader comments',
      'Author profiles',
      'Search articles',
      'Email subscriber list',
    ],
    timeEstimate: '1-2 hours setup (vs 2-3 weeks from scratch)',
  },
  {
    id: 'dashboard',
    name: 'Admin Dashboard',
    description: 'An internal tool to manage data, view analytics, and make business decisions',
    icon: '📊',
    features: [
      'User authentication',
      'Real-time data display',
      'Charts and analytics',
      'Data tables with filtering',
      'Export to CSV/Excel',
      'Team collaboration',
      'Audit logs',
    ],
    timeEstimate: '2-3 hours setup (vs 3-5 weeks from scratch)',
  },
];

export default function WhatCanYouBuild() {
  const [selectedProject, setSelectedProject] = useState<ProjectExample>(projects[0]);

  // ========================================================================
  // Handle Keyboard Navigation for Tabs
  // ========================================================================
  const handleTabKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % projects.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + projects.length) % projects.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = projects.length - 1;
    }

    if (nextIndex !== currentIndex) {
      setSelectedProject(projects[nextIndex]);
      // Focus the button that was just activated
      const buttons = document.querySelectorAll('[role="tab"]');
      (buttons[nextIndex] as HTMLButtonElement)?.focus();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          What Can You Build?
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          All the pieces work together. Pick a project below to see what's included.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2" role="tablist">
        {projects.map((project, index) => (
          <button
            key={project.id}
            role="tab"
            {...{ 'aria-selected': selectedProject.id === project.id }}
            {...{ 'aria-controls': `tabpanel-${project.id}` }}
            onClick={() => setSelectedProject(project)}
            onKeyDown={(e) => handleTabKeyDown(e, index)}
            className={`
              px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all text-sm
              ${
                selectedProject.id === project.id
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
            <span role="img" aria-label={`${project.name} icon`}>{project.icon}</span> {project.name}
          </button>
        ))}
      </div>

      {/* Project Details */}
      <div id={`tabpanel-${selectedProject.id}`} role="tabpanel" className="space-y-6">
        {/* Project Header */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            <span role="img" aria-label={`${selectedProject.name} icon`}>{selectedProject.icon}</span> {selectedProject.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {selectedProject.description}
          </p>

          {/* Time Estimate */}
          <div className="p-3 bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong><span role="img" aria-label="Timer">⏱️</span> Setup Time:</strong> {selectedProject.timeEstimate}
            </p>
          </div>
        </div>

        {/* Features List */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-3">
            What's Included
          </p>
          <div className="grid gap-2">
            {selectedProject.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <span className="text-green-700 dark:text-green-300 font-bold" role="img" aria-label="Included">✓</span>
                <span className="text-gray-900 dark:text-gray-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Why It Matters */}
        <div className="p-4 bg-blue-50 dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <strong><span role="img" aria-label="Tip">💡</span> Why This Matters:</strong> Every feature listed above is already connected and working.
            You don't need to figure out how to build user accounts, payment processing, or data security.
            You can start building your specific features immediately.
          </p>
        </div>

        {/* Next Steps */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-100 mb-3">
            <strong>Next Steps:</strong>
          </p>
          <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-decimal list-inside">
            <li>Clone this template</li>
            <li>Customize the features for your project</li>
            <li>Deploy it (takes 5 minutes)</li>
            <li>Start building your idea</li>
          </ol>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          These are just examples. With this foundation, you can build almost anything that involves
          data storage, user accounts, and a web interface. The infrastructure is ready. You focus on
          what makes your project unique.
        </p>
      </div>
    </div>
  );
}
