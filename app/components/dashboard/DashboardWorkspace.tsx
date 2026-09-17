'use client';

import SystemStatusPanel from '@/components/dashboard/SystemStatusPanel';
import DailyCockpit from '@/components/DailyCockpit';
import AgentOperationsDashboard from '@/components/AgentOperationsDashboard';

export default function DashboardWorkspace() {
  return (
    <>
      <SystemStatusPanel />
      <DailyCockpit />
      <AgentOperationsDashboard />
    </>
  );
}
