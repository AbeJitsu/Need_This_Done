'use client';

import { useState, useEffect } from 'react';
import { Bell, Loader2, Check, AlertCircle } from 'lucide-react';
import { cardBgColors, cardBorderColors, headingColors, mutedTextColors } from '@/lib/colors';

// ============================================================================
// Types
// ============================================================================

interface NotificationPreferences {
  orderUpdates: boolean;
  orderConfirmation: boolean;
  appointmentReminders: boolean;
  productWishlistAlerts: boolean;
  promotionalEmails: boolean;
  weeklyDigest: boolean;
}

type NotificationKey = keyof NotificationPreferences;

// ============================================================================
// Notification Preferences Section Component
// ============================================================================
// What: User control panel for notification settings
// Why: Let users choose which types of emails they receive
// How: Toggles persist to database via API

export default function NotificationPreferencesSection() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orderUpdates: true,
    orderConfirmation: true,
    appointmentReminders: true,
    productWishlistAlerts: false,
    promotionalEmails: false,
    weeklyDigest: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // ============================================================================
  // Load Preferences on Mount
  // ============================================================================

  useEffect(() => {
    async function loadPreferences() {
      try {
        const response = await fetch('/api/account/notification-preferences');
        if (!response.ok) {
          // If endpoint doesn't exist, use defaults (graceful degradation)
          setIsLoading(false);
          return;
        }
        const data = await response.json();
        setPreferences(data.preferences);
      } catch (error) {
        console.error('Failed to load preferences:', error);
        // Silently fail with defaults
      } finally {
        setIsLoading(false);
      }
    }

    loadPreferences();
  }, []);

  // ============================================================================
  // Handle Toggle Change
  // ============================================================================

  const handleToggle = (key: NotificationKey) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ============================================================================
  // Save Preferences
  // ============================================================================

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/account/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save preferences');
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save preferences');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================================
  // Notification Checkbox Component
  // ============================================================================

  interface CheckboxProps {
    label: string;
    description: string;
    value: boolean;
    onChange: (newValue: boolean) => void;
  }

  const NotificationCheckbox = ({ label, description, value, onChange }: CheckboxProps) => (
    <div className="flex items-start gap-4 py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {label}
        </label>
        <p className={`text-sm ${mutedTextColors.normal}`}>
          {description}
        </p>
      </div>
      <div className="flex-shrink-0 pt-1">
        <button
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
            value ? 'bg-emerald-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={`${cardBgColors.base} rounded-xl border-2 ${cardBorderColors.light} p-8 mb-8`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${cardBgColors.base} rounded-xl border-2 ${cardBorderColors.light} p-8 mb-8`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-emerald-600" />
        <h3 className={`text-xl font-semibold ${headingColors.primary}`}>
          Notification Preferences
        </h3>
      </div>

      <p className={`text-sm ${mutedTextColors.normal} mb-6`}>
        Choose which emails you'd like to receive. We'll never send spam.
      </p>

      {/* Notification Options */}
      <div className="space-y-2">
        <NotificationCheckbox
          label="Order Updates"
          description="Get notified when your order status changes"
          value={preferences.orderUpdates}
          onChange={() => handleToggle('orderUpdates')}
        />
        <NotificationCheckbox
          label="Order Confirmations"
          description="Receive confirmation when orders are placed"
          value={preferences.orderConfirmation}
          onChange={() => handleToggle('orderConfirmation')}
        />
        <NotificationCheckbox
          label="Appointment Reminders"
          description="Reminders 24 hours before scheduled appointments"
          value={preferences.appointmentReminders}
          onChange={() => handleToggle('appointmentReminders')}
        />
        <NotificationCheckbox
          label="Wishlist Alerts"
          description="Get notified when items on your wishlist go on sale"
          value={preferences.productWishlistAlerts}
          onChange={() => handleToggle('productWishlistAlerts')}
        />
        <NotificationCheckbox
          label="Promotional Emails"
          description="Exclusive offers and new product announcements"
          value={preferences.promotionalEmails}
          onChange={() => handleToggle('promotionalEmails')}
        />
        <NotificationCheckbox
          label="Weekly Digest"
          description="Summary of activity and recommendations (Sundays)"
          value={preferences.weeklyDigest}
          onChange={() => handleToggle('weeklyDigest')}
        />
      </div>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-600" />
          <p className="text-sm text-emerald-800">Preferences saved successfully</p>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            isSaving
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </div>
  );
}
