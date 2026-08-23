'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import EmployeeWorkspace from '@/components/employee/EmployeeWorkspace';

export default function EmployeePage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.replace('/login');
  }, [isAuthenticated, isAdmin, isLoading, router]);
  if (isLoading) return <div className="grid min-h-[60vh] place-items-center">Loading employee workspace…</div>;
  if (!isAuthenticated || !isAdmin) return null;
  return <EmployeeWorkspace />;
}
