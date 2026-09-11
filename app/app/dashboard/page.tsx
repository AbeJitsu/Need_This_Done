import WorkspacePage from '@/components/workspace/WorkspacePage';
import { requireAuthenticatedUser } from '@/lib/authenticated-access';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'My Workspace | NeedThisDone',
  description: 'Review your NeedThisDone requests, status, evidence, and results.',
  robots: { index: false, follow: false },
};

// The authenticated workspace is intentionally separate from the operator
// cockpit. Access is decided before the workspace content is rendered or
// hydrated, while the API applies the same owner boundary to durable records.
export default async function DashboardPage() {
  await requireAuthenticatedUser();

  return <WorkspacePage />;
}
