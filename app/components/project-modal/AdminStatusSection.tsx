import { solidButtonColors } from '@/lib/colors';

// ============================================================================
// Admin Status Section Component
// ============================================================================
// What: Admin-only UI for updating project status.
// Why: Separates admin-specific functionality from the main modal.
// How: Renders status dropdown, note field, and submit button.

interface AdminStatusSectionProps {
  newStatus: string;
  setNewStatus: (value: string) => void;
  statusNote: string;
  setStatusNote: (value: string) => void;
  submittingStatus: boolean;
  handleUpdateStatus: (e: React.FormEvent) => Promise<void>;
  currentStatus: string;
}

export default function AdminStatusSection({
  newStatus,
  setNewStatus,
  statusNote,
  setStatusNote,
  submittingStatus,
  handleUpdateStatus,
  currentStatus,
}: AdminStatusSectionProps) {
  return (
    <form
      onSubmit={handleUpdateStatus}
      className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4"
    >
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
        Update Status
      </h3>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          New Status
        </label>
        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className="mt-2 w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/50 focus:outline-none"
        >
          <option value="submitted">Submitted</option>
          <option value="in_review">In Review</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Note (Optional)
        </label>
        <textarea
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
          placeholder="Add a note that will be visible to the client..."
          className="mt-2 w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/50 focus:outline-none resize-none"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={submittingStatus || (newStatus === currentStatus && !statusNote.trim())}
        className={`w-full py-3 px-4 font-semibold rounded-lg transition-all duration-200 hover:shadow-md active:scale-[0.98] focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/50 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100 ${solidButtonColors.blue.bg} ${solidButtonColors.blue.text} ${solidButtonColors.blue.hover}`}
      >
        {submittingStatus ? 'Updating...' : 'Update Status'}
      </button>
    </form>
  );
}
