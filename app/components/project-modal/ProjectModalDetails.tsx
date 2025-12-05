import StatusBadge from '../StatusBadge';

// ============================================================================
// Project Modal Details Component
// ============================================================================
// What: Displays project metadata, message, and attachments.
// Why: Separates project information display from modal orchestration.
// How: Renders status, service, company, message, and file links.

interface Project {
  status: 'submitted' | 'in_review' | 'scheduled' | 'in_progress' | 'completed';
  service?: string;
  company?: string;
  message: string;
  attachments?: string[];
}

interface ProjectModalDetailsProps {
  project: Project;
}

export default function ProjectModalDetails({
  project,
}: ProjectModalDetailsProps) {
  return (
    <>
      {/* Status and Meta */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <div className="mt-2">
            <StatusBadge status={project.status} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Service
          </label>
          <p className="mt-2 text-gray-900 dark:text-gray-100">
            {project.service || '—'}
          </p>
        </div>
      </div>

      {/* Company */}
      {project.company && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Company
          </label>
          <p className="mt-2 text-gray-900 dark:text-gray-100">
            {project.company}
          </p>
        </div>
      )}

      {/* Message */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Project Details
        </label>
        <p className="mt-2 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
          {project.message}
        </p>
      </div>

      {/* Attachments */}
      {project.attachments && project.attachments.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Attachments ({project.attachments.length})
          </label>
          <ul className="mt-2 space-y-2">
            {project.attachments.map((path: string, idx: number) => (
              <li key={idx}>
                <a
                  href={`/api/files/${path}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  📎 {path.split('/').pop()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
