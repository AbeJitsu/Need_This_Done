// ============================================================================
// Mock Project Data - Development preview only
// ============================================================================
// What: Sample project data for previewing dashboards without authentication.
// Why: Makes it easy to develop and test dashboard UI during development.
// How: Add ?preview=admin or ?preview=user to the dashboard URL.
//
// SAFETY: Only works when NODE_ENV === 'development'
// Production builds completely ignore the preview parameter.

// Type matching the Project interface from useDashboard
type ProjectStatus = 'submitted' | 'in_review' | 'scheduled' | 'in_progress' | 'completed';

interface MockProject {
  id: string;
  name: string;
  email: string;
  service: string | null;
  status: ProjectStatus;
  created_at: string;
  message: string;
  project_comments: { count: number }[];
  attachments: string[] | null;
}

export const mockProjects: MockProject[] = [
  {
    id: 'mock-1',
    name: 'Website Redesign',
    email: 'sarah@example.com',
    service: 'Premium Service',
    status: 'in_progress',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    message:
      'Looking to refresh our company website with a modern design. We want something clean and professional that represents our brand well.',
    project_comments: [{ count: 5 }],
    attachments: ['file1.pdf', 'file2.png'],
  },
  {
    id: 'mock-2',
    name: 'Logo Design',
    email: 'mike@startup.io',
    service: 'Quick Task',
    status: 'completed',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    message:
      'Need a modern logo for my tech startup. Something minimal and memorable.',
    project_comments: [{ count: 3 }],
    attachments: null,
  },
  {
    id: 'mock-3',
    name: 'E-commerce Setup',
    email: 'jane@company.com',
    service: 'Premium Service',
    status: 'submitted',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    message:
      'We need a full e-commerce solution with payment processing and inventory management.',
    project_comments: [{ count: 0 }],
    attachments: ['requirements.pdf', 'mockup.png', 'brand-guide.pdf'],
  },
  {
    id: 'mock-4',
    name: 'Content Writing',
    email: 'alex@agency.co',
    service: 'Standard Task',
    status: 'in_review',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Need blog posts and website copy for our marketing campaign.',
    project_comments: [{ count: 2 }],
    attachments: ['brief.docx'],
  },
];

// ============================================================================
// Preview Mode Detection
// ============================================================================

export function isDevPreview(): boolean {
  if (typeof window === 'undefined') return false;
  if (process.env.NODE_ENV !== 'development') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('preview') === 'admin' || params.get('preview') === 'user';
}

export function getPreviewMode(): 'admin' | 'user' | null {
  if (typeof window === 'undefined') return null;
  if (process.env.NODE_ENV !== 'development') return null;
  const params = new URLSearchParams(window.location.search);
  const preview = params.get('preview');
  if (preview === 'admin' || preview === 'user') return preview;
  return null;
}
