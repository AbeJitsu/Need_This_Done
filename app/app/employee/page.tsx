import EmployeeWorkspacePage from '@/components/employee/EmployeeWorkspacePage';
import { requireOperator } from '@/lib/operator-access';

export const dynamic = 'force-dynamic';

export default async function EmployeePage() {
  await requireOperator();

  return <EmployeeWorkspacePage />;
}
