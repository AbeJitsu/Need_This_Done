import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Management - Admin | NeedThisDone',
  description: 'Manage products, inventory, and track orders.',
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
