import DashboardWorkspace from '@/components/dashboard/DashboardWorkspace';
import { requireOperator } from '@/lib/operator-access';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Operations | NeedThisDone',
  description: 'Private NeedThisDone operator controls and workflow health.',
  robots: { index: false, follow: false },
};

export default async function OperationsPage() {
  await requireOperator();
  return <DashboardWorkspace />;
}
