'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { filterButtonColors, alertColors, statusBadgeColors, containerBg, formInputColors, uiChromeBg, headingColors, mutedTextColors, dividerColors, coloredLinkText } from '@/lib/colors';

// ============================================================================
// Quotes Dashboard - /admin/quotes
// ============================================================================
// What: Displays all customer quotes with creation and status management
// Why: Admins create quotes from inquiries, send to customers, track conversions
// How: CRUD operations via /api/admin/quotes endpoints

interface Quote {
  id: string;
  reference_number: string;
  project_id: string | null;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  deposit_amount: number;
  status: string;
  expires_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

type StatusFilter = 'all' | 'draft' | 'sent' | 'authorized' | 'deposit_paid' | 'balance_paid' | 'completed';

const STATUS_OPTIONS: StatusFilter[] = ['draft', 'sent', 'deposit_paid', 'balance_paid', 'completed'];

// Status display configuration
const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  authorized: 'Authorized',
  deposit_paid: 'Deposit Paid',
  balance_paid: 'Balance Paid',
  completed: 'Completed',
};

export default function QuotesDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerName: '',
    customerEmail: '',
    totalAmount: '',
    notes: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // ========================================================================
  // Auth protection
  // ========================================================================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // ========================================================================
  // Fetch quotes
  // ========================================================================
  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/quotes', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch quotes');
      }

      const data = await response.json();
      setQuotes(data.quotes || []);
    } catch (err) {
      console.error('Failed to load quotes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quotes');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchQuotes();
  }, [isAdmin, fetchQuotes]);

  // ========================================================================
  // Filter quotes by status
  // ========================================================================
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredQuotes(quotes);
    } else {
      setFilteredQuotes(quotes.filter((quote) => quote.status === statusFilter));
    }
  }, [quotes, statusFilter]);

  // ========================================================================
  // Create quote
  // ========================================================================
  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setCreateLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Convert amount to cents
      const totalAmountCents = Math.round(parseFloat(createForm.totalAmount) * 100);

      const response = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: createForm.customerName,
          customerEmail: createForm.customerEmail,
          totalAmount: totalAmountCents,
          notes: createForm.notes || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create quote');
      }

      // Reset form and refresh list
      setCreateForm({ customerName: '', customerEmail: '', totalAmount: '', notes: '' });
      setShowCreateForm(false);
      await fetchQuotes();
    } catch (err) {
      console.error('Failed to create quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to create quote');
    } finally {
      setCreateLoading(false);
    }
  };

  // ========================================================================
  // Send quote to customer
  // ========================================================================
  const handleSendQuote = async (quoteId: string) => {
    try {
      setActionLoading(quoteId);

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/quotes/${quoteId}/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send quote');
      }

      await fetchQuotes();
    } catch (err) {
      console.error('Failed to send quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to send quote');
    } finally {
      setActionLoading(null);
    }
  };

  // ========================================================================
  // Delete quote
  // ========================================================================
  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this draft quote?')) return;

    try {
      setActionLoading(quoteId);

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete quote');
      }

      await fetchQuotes();
    } catch (err) {
      console.error('Failed to delete quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete quote');
    } finally {
      setActionLoading(null);
    }
  };

  // ========================================================================
  // Get status badge color
  // ========================================================================
  const getStatusBadgeClasses = (status: string) => {
    const statusMap: Record<string, keyof typeof statusBadgeColors> = {
      draft: 'unpaid',
      sent: 'pending',
      authorized: 'pending',
      deposit_paid: 'paid',
      balance_paid: 'paid',
      completed: 'paid',
    };
    const colorKey = statusMap[status] || 'unpaid';
    const colors = statusBadgeColors[colorKey];
    return `${colors.bg} ${colors.text}`;
  };

  // ========================================================================
  // Format currency
  // ========================================================================
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // ========================================================================
  // Format date
  // ========================================================================
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ========================================================================
  // Check if quote is expired
  // ========================================================================
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite" aria-busy="true">
        <p className={mutedTextColors.normal}>Loading quotes...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${headingColors.primary} mb-2`}>
            Quotes
          </h1>
          <p className={mutedTextColors.normal}>
            Create and manage customer quotes
          </p>
        </div>
        <Button
          variant="purple"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Quote'}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className={`mb-6 p-4 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}>
          <p className={`text-sm ${alertColors.error.text}`}>{error}</p>
          <button
            onClick={() => setError('')}
            className={`mt-2 text-sm ${alertColors.error.link}`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create Quote Form */}
      {showCreateForm && (
        <Card hoverEffect="none" className="mb-6">
          <form onSubmit={handleCreateQuote} className="p-6">
            <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
              Create New Quote
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="customerName" className={`block text-sm font-medium mb-1 ${formInputColors.label}`}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={createForm.customerName}
                  onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })}
                  required
                  className={`w-full px-3 py-2 border rounded-lg ${formInputColors.base} ${formInputColors.focus}`}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="customerEmail" className={`block text-sm font-medium mb-1 ${formInputColors.label}`}>
                  Customer Email *
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  value={createForm.customerEmail}
                  onChange={(e) => setCreateForm({ ...createForm, customerEmail: e.target.value })}
                  required
                  className={`w-full px-3 py-2 border rounded-lg ${formInputColors.base} ${formInputColors.focus}`}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="totalAmount" className={`block text-sm font-medium mb-1 ${formInputColors.label}`}>
                  Total Amount (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="totalAmount"
                    value={createForm.totalAmount}
                    onChange={(e) => setCreateForm({ ...createForm, totalAmount: e.target.value })}
                    required
                    min="0.01"
                    step="0.01"
                    className={`w-full pl-7 pr-3 py-2 border rounded-lg ${formInputColors.base} ${formInputColors.focus}`}
                    placeholder="500.00"
                  />
                </div>
                {createForm.totalAmount && (
                  <p className={`mt-1 text-sm ${formInputColors.helper}`}>
                    Deposit: {formatCurrency(Math.round(parseFloat(createForm.totalAmount) * 50))} (50%)
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="notes" className={`block text-sm font-medium mb-1 ${formInputColors.label}`}>
                  Project Description
                </label>
                <input
                  type="text"
                  id="notes"
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${formInputColors.base} ${formInputColors.focus}`}
                  placeholder="Website redesign, logo design, etc."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="gray"
                type="button"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="purple"
                type="submit"
                disabled={createLoading}
                isLoading={createLoading}
                loadingText="Creating..."
              >
                Create Quote
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter buttons */}
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter quotes by status">
        <button
          onClick={() => setStatusFilter('all')}
          aria-pressed={statusFilter === 'all'}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'all'
              ? filterButtonColors.active.purple
              : filterButtonColors.inactive
          }`}
        >
          All ({quotes.length})
        </button>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            aria-pressed={statusFilter === status}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === status
                ? filterButtonColors.active.purple
                : filterButtonColors.inactive
            }`}
          >
            {STATUS_LABELS[status]} ({quotes.filter((q) => q.status === status).length})
          </button>
        ))}
      </div>

      {/* Quotes list */}
      {filteredQuotes.length === 0 ? (
        <Card hoverEffect="none">
          <div className="p-8 text-center">
            <div className={`inline-block p-3 ${uiChromeBg.panel} rounded-full mb-4`}>
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className={mutedTextColors.normal}>
              {quotes.length === 0
                ? 'No quotes yet. Click "+ New Quote" to create one.'
                : 'No quotes match the selected filter.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} hoverEffect="lift">
              <div className="p-6">
                {/* Header row */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-lg font-semibold ${headingColors.primary}`}>
                        {quote.customer_name}
                      </h3>
                      {isExpired(quote.expires_at) && quote.status === 'sent' && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusBadgeColors.cancelled.bg} ${statusBadgeColors.cancelled.text}`}>
                          Expired
                        </span>
                      )}
                    </div>
                    <a
                      href={`mailto:${quote.customer_email}`}
                      className={`text-sm ${coloredLinkText.purple} hover:underline`}
                    >
                      {quote.customer_email}
                    </a>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClasses(quote.status)}`}
                    >
                      {STATUS_LABELS[quote.status] || quote.status}
                    </span>
                    <p className={`text-lg font-bold ${headingColors.primary} mt-2`}>
                      {formatCurrency(quote.total_amount)}
                    </p>
                  </div>
                </div>

                {/* Quote details */}
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div className={`p-3 ${containerBg.page} rounded-lg`}>
                    <p className={`text-xs font-medium ${mutedTextColors.light} mb-1`}>Reference</p>
                    <p className={`text-sm ${headingColors.secondary} font-mono`}>{quote.reference_number}</p>
                  </div>
                  <div className={`p-3 ${containerBg.page} rounded-lg`}>
                    <p className={`text-xs font-medium ${mutedTextColors.light} mb-1`}>Deposit (50%)</p>
                    <p className={`text-sm ${headingColors.secondary}`}>{formatCurrency(quote.deposit_amount)}</p>
                  </div>
                  <div className={`p-3 ${containerBg.page} rounded-lg`}>
                    <p className={`text-xs font-medium ${mutedTextColors.light} mb-1`}>Expires</p>
                    <p className={`text-sm ${headingColors.secondary}`}>{formatDate(quote.expires_at)}</p>
                  </div>
                </div>

                {quote.notes && (
                  <div className={`p-3 ${containerBg.page} rounded-lg mb-4`}>
                    <p className={`text-xs font-medium ${mutedTextColors.light} mb-1`}>Project</p>
                    <p className={`text-sm ${headingColors.secondary}`}>{quote.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className={`border-t ${dividerColors.border} pt-4 flex flex-wrap gap-2`}>
                  {quote.status === 'draft' && (
                    <>
                      <Button
                        variant="purple"
                        size="sm"
                        onClick={() => handleSendQuote(quote.id)}
                        disabled={actionLoading === quote.id}
                        isLoading={actionLoading === quote.id}
                        loadingText="Sending..."
                      >
                        Send to Customer
                      </Button>
                      <Button
                        variant="gray"
                        size="sm"
                        onClick={() => handleDeleteQuote(quote.id)}
                        disabled={actionLoading === quote.id}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                  {quote.status === 'sent' && (
                    <Button
                      variant="purple"
                      size="sm"
                      onClick={() => handleSendQuote(quote.id)}
                      disabled={actionLoading === quote.id}
                      isLoading={actionLoading === quote.id}
                      loadingText="Resending..."
                    >
                      Resend Quote
                    </Button>
                  )}
                  {['deposit_paid', 'balance_paid', 'completed'].includes(quote.status) && (
                    <span className={`text-sm ${coloredLinkText.green} flex items-center gap-1`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Customer paid
                    </span>
                  )}
                  <span className={`text-xs ${mutedTextColors.light} ml-auto`}>
                    Created {formatDate(quote.created_at)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
