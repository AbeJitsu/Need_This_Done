import DashboardWorkspace from '@/components/dashboard/DashboardWorkspace';
import { requireOperator } from '@/lib/operator-access';

export const dynamic = 'force-dynamic';

// The workspace itself remains interactive, but access is decided before any
// workspace content is rendered or hydrated.
export default async function DashboardPage() {
  await requireOperator();

  return <DashboardWorkspace />;
}
