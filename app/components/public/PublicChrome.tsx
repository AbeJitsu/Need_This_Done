'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const privatePrefixes = ['/dashboard', '/employee', '/prospecting', '/admin', '/account', '/login'];

export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPrivate = privatePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (isPrivate) return <><Navigation />{children}<Footer /></>;
  return <><PublicHeader />{children}<PublicFooter /></>;
}
