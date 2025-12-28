import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Appointments - Admin | NeedThisDone',
  description: 'Review and manage customer appointment requests.',
};

export default function AppointmentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
