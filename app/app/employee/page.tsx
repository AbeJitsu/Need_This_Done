'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import EmployeeWorkspace from '@/components/employee/EmployeeWorkspace';

export default function EmployeePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/login'); }, [isAuthenticated, isLoading, router]);
  if (isLoading) return <div className="grid min-h-[60vh] place-items-center">Loading employee workspace…</div>;
  if (!isAuthenticated) return null;
  return <EmployeeWorkspace />;
}
