'use client';

import DailyCockpit from '@/components/DailyCockpit';
import AgentOperationsDashboard from '@/components/AgentOperationsDashboard';

export default function DashboardWorkspace() {
  return (
    <>
      <DailyCockpit />
      <AgentOperationsDashboard />
    </>
  );
}
