import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders - Admin | NeedThisDone',
  description: 'Track and manage customer orders and order statuses.',
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
