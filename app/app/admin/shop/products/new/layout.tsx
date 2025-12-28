import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Product - Admin | NeedThisDone',
  description: 'Add a new product to your catalog.',
};

export default function NewProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
