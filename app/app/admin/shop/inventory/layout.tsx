import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inventory Management - Admin | NeedThisDone',
  description: 'Track and manage stock levels for all products.',
};

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
