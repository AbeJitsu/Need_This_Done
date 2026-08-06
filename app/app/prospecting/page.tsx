'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProspectingDashboard from '@/components/ProspectingDashboard';

export default function ProspectingPage() {
  const router = useRouter(); const { isAuthenticated, isAdmin, isLoading } = useAuth();
  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/login'); else if (!isLoading && isAuthenticated && !isAdmin) router.replace('/dashboard'); }, [isAuthenticated, isAdmin, isLoading, router]);
  if (isLoading || !isAuthenticated || !isAdmin) return <div className="grid min-h-[60vh] place-items-center">Loading prospecting workspace…</div>;
  return <ProspectingDashboard />;
}
