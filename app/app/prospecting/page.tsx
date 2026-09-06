import ProspectingWorkspacePage from '@/components/prospecting/ProspectingWorkspacePage';
import { requireOperator } from '@/lib/operator-access';

export const dynamic = 'force-dynamic';

export default async function ProspectingPage() {
  await requireOperator();

  return <ProspectingWorkspacePage />;
}
