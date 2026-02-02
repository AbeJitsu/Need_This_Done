'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, Mail, Save, Loader2, Check, AlertCircle } from 'lucide-react';
import Button from '@/components/Button';
import MyReviewsSection from './MyReviewsSection';
import NotificationPreferencesSection from './NotificationPreferencesSection';
import SavedAddressesSection from './SavedAddressesSection';
import SpendingAnalyticsSection from './SpendingAnalyticsSection';
import LoyaltyPointsSection from './LoyaltyPointsSection';
import { ReferralDashboard } from '@/components/ReferralDashboard';
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

export default function AccountSettingsClient() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load profile data
  useEffect(() => {
    if (session?.user?.email) {
      setProfile({
        email: session.user.email,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
      });
      setEditedName(session.user.name || '');
    }
    setIsLoading(false);
  }, [session]);

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
    await signOut({ callbackUrl: '/' });
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

        {/* Loyalty Points Section */}
        <div className="mb-8">
          <LoyaltyPointsSection />
        </div>

        {/* Referral Dashboard Section */}
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
          <ReferralDashboard />
        </div>

        {/* Spending Analytics Section */}
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
          <SpendingAnalyticsSection />
        </div>

        {/* Saved Addresses Section */}
        <div className="mb-8">
          <SavedAddressesSection />
        </div>

        {/* Notification Preferences Section */}
        <NotificationPreferencesSection />

        {/* My Reviews Section */}
        <MyReviewsSection />

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
