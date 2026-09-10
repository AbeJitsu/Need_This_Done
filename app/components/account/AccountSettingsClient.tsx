'use client';

import { useState, useEffect } from 'react';
import { User, LogOut, Mail, Save, Loader2, Check, AlertCircle, Copy, KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';
import { accentColors, cardBgColors, cardBorderColors, headingColors, mutedTextColors } from '@/lib/colors';

// ============================================================================
// Account Settings Client Component
// ============================================================================
// What: Customer account profile and settings management
// Why: Let users view and edit their information
// How: Loads from session, allows edits, syncs with API

interface UserProfile {
  email: string;
  name?: string;
  image?: string;
}

interface McpCredential {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  expiresAt: string | null;
}

function formatCredentialDate(value: string | null) {
  if (!value) return 'Never';
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
    : 'Unknown';
}

export default function AccountSettingsClient() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mcpTokens, setMcpTokens] = useState<McpCredential[]>([]);
  const [mcpName, setMcpName] = useState('');
  const [mcpExpiresAt, setMcpExpiresAt] = useState('');
  const [mcpLoading, setMcpLoading] = useState(false);
  const [mcpSaving, setMcpSaving] = useState(false);
  const [mcpRevokingId, setMcpRevokingId] = useState<string | null>(null);
  const [mcpError, setMcpError] = useState('');
  const [mcpStatus, setMcpStatus] = useState('');
  const [mcpRawToken, setMcpRawToken] = useState<string | null>(null);
  const [mcpCopied, setMcpCopied] = useState(false);

  // Load profile data
  useEffect(() => {
    if (user?.email) {
      setProfile({
        email: user.email,
        name: user.name || undefined,
        image: user.image || undefined,
      });
      setEditedName(user.name || '');
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setMcpTokens([]);
      setMcpLoading(false);
      setMcpRawToken(null);
      setMcpStatus('');
      return () => { cancelled = true; };
    }

    setMcpLoading(true);
    setMcpError('');
    fetch('/api/mcp/tokens', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'MCP credentials could not be loaded.');
        if (!cancelled) setMcpTokens(Array.isArray(data.tokens) ? data.tokens : []);
      })
      .catch((error) => {
        if (!cancelled) setMcpError(error instanceof Error ? error.message : 'MCP credentials could not be loaded.');
      })
      .finally(() => {
        if (!cancelled) setMcpLoading(false);
      });

    return () => { cancelled = true; };
  }, [user?.id]);

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      setErrorMessage('Name cannot be empty');
      setSaveStatus('error');
      return;
    }

    setSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save profile');
      }

      const data = await response.json();
      setProfile(data.user);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save profile');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    window.location.assign('/');
  };

  const handleCreateMcpToken = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mcpName.trim()) {
      setMcpError('Give the credential a name before creating it.');
      return;
    }

    setMcpSaving(true);
    setMcpError('');
    setMcpStatus('');
    setMcpRawToken(null);
    setMcpCopied(false);
    try {
      const expiresAt = mcpExpiresAt
        ? new Date(`${mcpExpiresAt}T23:59:59`).toISOString()
        : null;
      const response = await fetch('/api/mcp/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: mcpName.trim(), expiresAt }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'MCP credential could not be created.');
      setMcpTokens((current) => [data.credential as McpCredential, ...current]);
      setMcpRawToken(data.token as string);
      setMcpName('');
      setMcpExpiresAt('');
      setMcpStatus('Credential created. Copy the token now; it will not be shown again.');
    } catch (error) {
      setMcpError(error instanceof Error ? error.message : 'MCP credential could not be created.');
    } finally {
      setMcpSaving(false);
    }
  };

  const handleCopyMcpToken = async () => {
    if (!mcpRawToken) return;
    try {
      await navigator.clipboard.writeText(mcpRawToken);
      setMcpCopied(true);
      setMcpStatus('Token copied. Store it in the MCP client before hiding it.');
    } catch {
      setMcpError('The token could not be copied. Select it and copy it manually.');
    }
  };

  const handleRevokeMcpToken = async (id: string) => {
    setMcpRevokingId(id);
    setMcpError('');
    setMcpStatus('');
    try {
      const response = await fetch(`/api/mcp/tokens/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'MCP credential could not be revoked.');
      if (data.credential) {
        setMcpTokens((current) => current.map((token) => (
          token.id === id ? data.credential as McpCredential : token
        )));
      }
      setMcpStatus('Credential revoked. Existing MCP calls using it will be rejected.');
    } catch (error) {
      setMcpError(error instanceof Error ? error.message : 'MCP credential could not be revoked.');
    } finally {
      setMcpRevokingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="border-b border-gray-200 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className={`text-3xl md:text-4xl font-bold ${headingColors.primary} mb-2`}>
            Account Settings
          </h1>
          <p className={`${mutedTextColors.normal} text-lg`}>
            Manage your account information and preferences
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        {/* Profile Card */}
        <div className={`${cardBgColors.base} rounded-xl border-2 ${cardBorderColors.light} p-8 mb-8`}>
          <div className="flex items-start gap-6 mb-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className={`
                w-20 h-20 rounded-full ${accentColors.blue.bg}
                flex items-center justify-center text-white
              `}>
                {profile?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
            </div>

            {/* Profile Brief */}
            <div className="flex-1">
              <h2 className={`text-2xl font-semibold ${headingColors.primary} mb-1`}>
                {profile?.name || 'User'}
              </h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{profile?.email}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-8">
            {/* Name Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => {
                  setEditedName(e.target.value);
                  setSaveStatus('idle');
                }}
                className={`
                  w-full px-4 py-2 border-2 border-gray-400 rounded-lg transition-colors
                  bg-white text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-emerald-500
                `}
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Field (Read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className={`
                  w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed
                  text-gray-600
                `}
              />
              <p className={`text-xs ${mutedTextColors.normal} mt-2`}>
                Email address cannot be changed
              </p>
            </div>

            {/* Status Messages */}
            {saveStatus === 'error' && errorMessage && (
              <div role="alert" aria-live="polite" aria-atomic="true" className="mb-6 p-4 rounded-lg bg-red-50 border-2 border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            {saveStatus === 'success' && (
              <div role="status" aria-live="polite" aria-atomic="true" className="mb-6 p-4 rounded-lg bg-emerald-50 border-2 border-emerald-200 flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-emerald-700">Profile updated successfully!</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="green"
                onClick={handleSaveProfile}
                disabled={isSaving || editedName === profile?.name}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>

              {editedName !== profile?.name && (
                <button
                  onClick={() => setEditedName(profile?.name || '')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MCP Connection Card */}
        <div className={`${cardBgColors.base} rounded-xl border-2 ${cardBorderColors.light} p-8 mb-8`}>
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <KeyRound className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className={`text-2xl font-semibold ${headingColors.primary} mb-1`}>MCP connection</h2>
              <p className={`${mutedTextColors.normal} text-sm leading-6`}>
                Your site login identifies you here. An MCP credential authorizes a compatible LLM client to call
                the NeedThisDone endpoint for your account. Hermes and OpenClaw remain separately authenticated on
                the private worker host.
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <p>Only a SHA-256 hash is stored. The raw token appears once after creation and is never shown in this list.</p>
            </div>
          </div>

          <form onSubmit={handleCreateMcpToken} className="border-t border-gray-200 pt-6">
            <h3 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>Create a credential</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Credential name
                <input
                  required
                  maxLength={120}
                  value={mcpName}
                  onChange={(event) => setMcpName(event.target.value)}
                  className="mt-2 w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ChatGPT desktop"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Optional expiration
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={mcpExpiresAt}
                  onChange={(event) => setMcpExpiresAt(event.target.value)}
                  className="mt-2 w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </label>
            </div>
            <Button
              type="submit"
              variant="green"
              size="md"
              disabled={mcpSaving}
              isLoading={mcpSaving}
              loadingText="Creating..."
              className="mt-5"
            >
              Create MCP credential
            </Button>
          </form>

          {mcpRawToken && (
            <div className="mt-6 rounded-lg border-2 border-amber-300 bg-amber-50 p-5" role="status" aria-live="polite">
              <h3 className="font-semibold text-amber-950">Copy this token now</h3>
              <p className="mt-1 text-sm text-amber-900">For your security, it will disappear when you hide it or leave this page.</p>
              <code className="mt-3 block overflow-x-auto rounded-lg bg-white p-3 text-xs text-gray-900" aria-label="New MCP token">
                {mcpRawToken}
              </code>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" variant="gold" size="sm" onClick={handleCopyMcpToken}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {mcpCopied ? 'Copied' : 'Copy token'}
                </Button>
                <button
                  type="button"
                  onClick={() => setMcpRawToken(null)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-amber-950 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                >
                  I stored it — hide token
                </button>
              </div>
            </div>
          )}

          {(mcpError || mcpStatus) && (
            <div
              role={mcpError ? 'alert' : 'status'}
              aria-live="polite"
              className={`mt-6 flex items-start gap-3 rounded-lg border-2 p-4 ${mcpError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}
            >
              {mcpError ? <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" /> : <Check className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />}
              <p className="text-sm">{mcpError || mcpStatus}</p>
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>Your credentials</h3>
            {mcpLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-600" role="status">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading credentials...
              </div>
            ) : mcpTokens.length === 0 ? (
              <p className="text-sm text-gray-600">No MCP credentials have been created.</p>
            ) : (
              <div className="space-y-3">
                {mcpTokens.map((token) => {
                  const expired = Boolean(token.expiresAt && Date.parse(token.expiresAt) <= Date.now());
                  const status = token.revokedAt ? 'Revoked' : expired ? 'Expired' : 'Active';
                  return (
                    <div key={token.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{token.name}</p>
                          <p className="mt-1 font-mono text-xs text-gray-600">{token.tokenPrefix}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                          {status}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-gray-600">
                        Created {formatCredentialDate(token.createdAt)} · Last used {formatCredentialDate(token.lastUsedAt)}
                        {token.expiresAt && ` · Expires ${formatCredentialDate(token.expiresAt)}`}
                      </p>
                      {!token.revokedAt && (
                        <button
                          type="button"
                          onClick={() => handleRevokeMcpToken(token.id)}
                          disabled={mcpRevokingId === token.id}
                          className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border-2 border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          {mcpRevokingId === token.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                          {mcpRevokingId === token.id ? 'Revoking...' : 'Revoke'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-8 mt-8">
          <h3 className="text-lg font-semibold text-red-900 mb-3">Danger Zone</h3>
          <p className={`${mutedTextColors.normal} mb-6`}>
            Sign out of your account. You'll be able to sign back in anytime.
          </p>
          <Button
            variant="gray"
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
