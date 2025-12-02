'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';

// ============================================================================
// Admin Users Page - User Management
// ============================================================================
// What: Displays all users and allows admins to manage roles and accounts.
// Why: Admins need to view users, change roles, disable accounts, and trigger resets.
// How: Fetches from /api/admin/users and provides action buttons for each user.

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  is_admin: boolean;
  is_disabled: boolean;
  name: string | null;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  // ============================================================================
  // State Management
  // ============================================================================

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ============================================================================
  // Redirect Non-Admins
  // ============================================================================

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // ============================================================================
  // Fetch Users
  // ============================================================================

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/users');

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to access this page');
          return;
        }
        if (res.status === 403) {
          setError('Admin access required');
          return;
        }
        throw new Error('Failed to fetch users');
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin]);

  // ============================================================================
  // User Actions
  // ============================================================================

  const handleAction = async (
    userId: string,
    action: 'setAdmin' | 'disable' | 'resetPassword',
    value?: boolean
  ) => {
    setActionLoading(userId);
    setSuccessMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, value }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Action failed');
        return;
      }

      setSuccessMessage(data.message);

      // Refresh user list after action
      await fetchUsers();
    } catch (err) {
      console.error('Action error:', err);
      setError('Failed to perform action. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================================
  // Format Date Helper
  // ============================================================================

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ============================================================================
  // Loading and Auth States
  // ============================================================================

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Header */}
        <PageHeader
          title="User Management"
          description="View and manage all user accounts."
        />

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-green-700 dark:text-green-300">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card hoverColor="blue" hoverEffect="glow" className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {users.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Users</div>
          </Card>
          <Card hoverColor="purple" hoverEffect="glow" className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {users.filter((u) => u.is_admin).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Admins</div>
          </Card>
          <Card hoverColor="green" hoverEffect="glow" className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {users.filter((u) => !u.is_disabled).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Active</div>
          </Card>
          <Card hoverColor="orange" hoverEffect="glow" className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {users.filter((u) => u.is_disabled).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Disabled</div>
          </Card>
        </div>

        {/* Users List */}
        <Card hoverColor="gray" hoverEffect="none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            All Users
          </h2>

          {users.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
              No users found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Last Sign In
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {user.name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.is_admin
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.is_disabled
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}
                        >
                          {user.is_disabled ? 'Disabled' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(user.last_sign_in_at)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          {/* Toggle Admin */}
                          <button
                            onClick={() =>
                              handleAction(user.id, 'setAdmin', !user.is_admin)
                            }
                            disabled={actionLoading === user.id}
                            className="text-xs px-3 py-1 rounded-full border border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50 transition-colors"
                          >
                            {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                          </button>

                          {/* Toggle Disabled */}
                          <button
                            onClick={() =>
                              handleAction(user.id, 'disable', !user.is_disabled)
                            }
                            disabled={actionLoading === user.id}
                            className={`text-xs px-3 py-1 rounded-full border ${
                              user.is_disabled
                                ? 'border-green-300 text-green-700 dark:border-green-600 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'border-red-300 text-red-700 dark:border-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                            } disabled:opacity-50 transition-colors`}
                          >
                            {user.is_disabled ? 'Enable' : 'Disable'}
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => handleAction(user.id, 'resetPassword')}
                            disabled={actionLoading === user.id}
                            className="text-xs px-3 py-1 rounded-full border border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 transition-colors"
                          >
                            Reset Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Button variant="gray" href="/dashboard">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
