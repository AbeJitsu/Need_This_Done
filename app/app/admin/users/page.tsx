'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { statusBadgeColors, alertColors, filterButtonColors, formInputColors, hoverBgColors } from '@/lib/colors';

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
  // Filtering, Sorting & Column Visibility State
  // ============================================================================

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Sorting
  type SortField = 'name' | 'email' | 'role' | 'status' | 'lastSignIn';
  const [sortField, setSortField] = useState<SortField>('email');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    user: true,      // name + email (always visible)
    role: true,
    status: true,
    lastSignIn: true,
    actions: true,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

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
  // Filtered & Sorted Users (computed from state)
  // ============================================================================

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        // Search filter (name or email)
        const matchesSearch =
          searchQuery === '' ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

        // Role filter
        const matchesRole =
          roleFilter === 'all' ||
          (roleFilter === 'admin' && user.is_admin) ||
          (roleFilter === 'user' && !user.is_admin);

        // Status filter
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && !user.is_disabled) ||
          (statusFilter === 'disabled' && user.is_disabled);

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;

        switch (sortField) {
          case 'name': {
            const nameA = a.name?.toLowerCase() ?? '';
            const nameB = b.name?.toLowerCase() ?? '';
            return nameA.localeCompare(nameB) * direction;
          }
          case 'email':
            return a.email.localeCompare(b.email) * direction;
          case 'role': {
            const roleA = a.is_admin ? 1 : 0;
            const roleB = b.is_admin ? 1 : 0;
            return (roleA - roleB) * direction;
          }
          case 'status': {
            const statusA = a.is_disabled ? 0 : 1;
            const statusB = b.is_disabled ? 0 : 1;
            return (statusA - statusB) * direction;
          }
          case 'lastSignIn': {
            const dateA = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
            const dateB = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
            return (dateA - dateB) * direction;
          }
          default:
            return 0;
        }
      });
  }, [users, searchQuery, roleFilter, statusFilter, sortField, sortDirection]);

  // ============================================================================
  // Sort Handler
  // ============================================================================

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Close column menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================================
  // Loading and Auth States
  // ============================================================================

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20" role="status" aria-live="polite" aria-busy="true">
        <div className="text-gray-600 dark:text-gray-300">Loading users...</div>
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Header */}
        <PageHeader
          title="User Management"
          description="View and manage all user accounts."
        />

        {/* Messages */}
        {successMessage && (
          <div className={`mb-6 p-4 rounded-lg ${alertColors.success.bg} ${alertColors.success.border}`}>
            <p className={alertColors.success.text}>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className={`mb-6 p-4 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}>
            <p className={alertColors.error.text}>{error}</p>
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
          <Card hoverColor="gold" hoverEffect="glow" className="text-center">
            <div className="text-3xl font-bold text-gold-600 dark:text-gold-400">
              {users.filter((u) => u.is_disabled).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Disabled</div>
          </Card>
        </div>

        {/* Table Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <label htmlFor="user-search" className="sr-only">
              Search users by name or email
            </label>
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              id="user-search"
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${formInputColors.base} ${formInputColors.placeholder} ${formInputColors.focus}`}
            />
          </div>

          {/* Filter Buttons & Controls Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Role:</span>
              <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                <button
                  onClick={() => setRoleFilter('all')}
                  aria-pressed={roleFilter === 'all'}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    roleFilter === 'all'
                      ? filterButtonColors.active.purple
                      : filterButtonColors.inactive
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setRoleFilter('admin')}
                  aria-pressed={roleFilter === 'admin'}
                  className={`px-3 py-1.5 text-sm transition-colors border-l border-gray-300 dark:border-gray-600 ${
                    roleFilter === 'admin'
                      ? filterButtonColors.active.purple
                      : filterButtonColors.inactive
                  }`}
                >
                  Admins
                </button>
                <button
                  onClick={() => setRoleFilter('user')}
                  aria-pressed={roleFilter === 'user'}
                  className={`px-3 py-1.5 text-sm transition-colors border-l border-gray-300 dark:border-gray-600 ${
                    roleFilter === 'user'
                      ? filterButtonColors.active.purple
                      : filterButtonColors.inactive
                  }`}
                >
                  Users
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
              <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                <button
                  onClick={() => setStatusFilter('all')}
                  aria-pressed={statusFilter === 'all'}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    statusFilter === 'all'
                      ? filterButtonColors.active.green
                      : filterButtonColors.inactive
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  aria-pressed={statusFilter === 'active'}
                  className={`px-3 py-1.5 text-sm transition-colors border-l border-gray-300 dark:border-gray-600 ${
                    statusFilter === 'active'
                      ? filterButtonColors.active.green
                      : filterButtonColors.inactive
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter('disabled')}
                  aria-pressed={statusFilter === 'disabled'}
                  className={`px-3 py-1.5 text-sm transition-colors border-l border-gray-300 dark:border-gray-600 ${
                    statusFilter === 'disabled'
                      ? filterButtonColors.active.red
                      : filterButtonColors.inactive
                  }`}
                >
                  Disabled
                </button>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-field" className="text-sm text-gray-600 dark:text-gray-400">
                Sort:
              </label>
              <select
                id="sort-field"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className={`px-3 py-1.5 text-sm rounded-lg border ${formInputColors.base} ${formInputColors.focus}`}
              >
                <option value="email">Email</option>
                <option value="name">Name</option>
                <option value="role">Role</option>
                <option value="status">Status</option>
                <option value="lastSignIn">Last Sign In</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                className={`px-2 py-1.5 text-sm rounded-lg border ${formInputColors.base} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>

            {/* Column Visibility Dropdown */}
            <div className="relative ml-auto" ref={columnMenuRef}>
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                aria-expanded={showColumnMenu}
                aria-haspopup="menu"
                aria-label="Toggle column visibility"
                className={`p-2 rounded-lg border ${formInputColors.base} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                <svg
                  className="h-5 w-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              {showColumnMenu && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10"
                >
                  <div className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    Show Columns
                  </div>
                  <label className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-50">
                    <input type="checkbox" checked disabled className="mr-2" />
                    User
                  </label>
                  {(['role', 'status', 'lastSignIn', 'actions'] as const).map((col) => (
                    <label
                      key={col}
                      className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[col]}
                        onChange={(e) =>
                          setVisibleColumns((prev) => ({ ...prev, [col]: e.target.checked }))
                        }
                        className="mr-2"
                      />
                      {col === 'lastSignIn' ? 'Last Sign In' : col.charAt(0).toUpperCase() + col.slice(1)}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          )}
        </div>

        {/* Users List */}
        <Card hoverColor="gray" hoverEffect="none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' ? 'Filtered Users' : 'All Users'}
          </h2>

          {filteredUsers.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
              {users.length === 0 ? 'No users found.' : 'No users match your filters.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <caption className="sr-only">User accounts with role, status, and available actions</caption>
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {/* User column (always visible) */}
                    <th
                      onClick={() => handleSort('email')}
                      aria-sort={sortField === 'email' ? sortDirection === 'asc' ? 'ascending' : 'descending' : undefined}
                      className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
                    >
                      <span className="flex items-center gap-1">
                        User
                        {sortField === 'email' && (
                          <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </span>
                    </th>
                    {visibleColumns.role && (
                      <th
                        onClick={() => handleSort('role')}
                        aria-sort={sortField === 'role' ? sortDirection === 'asc' ? 'ascending' : 'descending' : undefined}
                        className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
                      >
                        <span className="flex items-center gap-1">
                          Role
                          {sortField === 'role' && (
                            <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </span>
                      </th>
                    )}
                    {visibleColumns.status && (
                      <th
                        onClick={() => handleSort('status')}
                        aria-sort={sortField === 'status' ? sortDirection === 'asc' ? 'ascending' : 'descending' : undefined}
                        className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
                      >
                        <span className="flex items-center gap-1">
                          Status
                          {sortField === 'status' && (
                            <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </span>
                      </th>
                    )}
                    {visibleColumns.lastSignIn && (
                      <th
                        onClick={() => handleSort('lastSignIn')}
                        aria-sort={sortField === 'lastSignIn' ? sortDirection === 'asc' ? 'ascending' : 'descending' : undefined}
                        className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
                      >
                        <span className="flex items-center gap-1">
                          Last Sign In
                          {sortField === 'lastSignIn' && (
                            <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </span>
                      </th>
                    )}
                    {visibleColumns.actions && (
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {/* User column (always visible) */}
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
                      {visibleColumns.role && (
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.is_admin
                                ? `${statusBadgeColors.admin.bg} ${statusBadgeColors.admin.text}`
                                : `${statusBadgeColors.user.bg} ${statusBadgeColors.user.text}`
                            }`}
                          >
                            {user.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.is_disabled
                                ? `${statusBadgeColors.disabled.bg} ${statusBadgeColors.disabled.text}`
                                : `${statusBadgeColors.active.bg} ${statusBadgeColors.active.text}`
                            }`}
                          >
                            {user.is_disabled ? 'Disabled' : 'Active'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.lastSignIn && (
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(user.last_sign_in_at)}
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="py-4 px-4">
                          <div className="flex justify-end gap-2">
                            {/* Toggle Admin */}
                            <button
                              onClick={() =>
                                handleAction(user.id, 'setAdmin', !user.is_admin)
                              }
                              disabled={actionLoading === user.id}
                              aria-label={user.is_admin ? `Remove admin role from ${user.email}` : `Grant admin role to ${user.email}`}
                              className={`text-xs px-3 py-1 rounded-full border border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300 ${hoverBgColors.purple} disabled:opacity-50 transition-colors`}
                            >
                              {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                            </button>

                            {/* Toggle Disabled */}
                            <button
                              onClick={() =>
                                handleAction(user.id, 'disable', !user.is_disabled)
                              }
                              disabled={actionLoading === user.id}
                              aria-label={user.is_disabled ? `Enable account for ${user.email}` : `Disable account for ${user.email}`}
                              className={`text-xs px-3 py-1 rounded-full border ${
                                user.is_disabled
                                  ? `border-green-300 text-green-700 dark:border-green-600 dark:text-green-300 ${hoverBgColors.green}`
                                  : `border-red-300 text-red-700 dark:border-red-600 dark:text-red-300 ${hoverBgColors.red}`
                              } disabled:opacity-50 transition-colors`}
                            >
                              {user.is_disabled ? 'Enable' : 'Disable'}
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => handleAction(user.id, 'resetPassword')}
                              disabled={actionLoading === user.id}
                              aria-label={`Send password reset email to ${user.email}`}
                              className={`text-xs px-3 py-1 rounded-full border border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300 ${hoverBgColors.blue} disabled:opacity-50 transition-colors`}
                            >
                              Reset Password
                            </button>
                          </div>
                        </td>
                      )}
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
  );
}
