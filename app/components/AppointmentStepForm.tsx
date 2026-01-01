'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { formInputColors, formValidationColors, headingColors, alertColors, hoverBgColors } from '@/lib/colors';

// ============================================================================
// Appointment Step Form Component
// ============================================================================
// What: Inline form for selecting appointment time during checkout
// Why: Customers pick their preferred time BEFORE paying, not after
// How: Collects date/time preferences, validates constraints, returns data via callback

export interface AppointmentData {
  preferredDate: string;
  preferredTimeStart: string;
  alternateDate: string;
  alternateTimeStart: string;
  notes: string;
}

interface AppointmentStepFormProps {
  durationMinutes: number;
  serviceName: string;
  onComplete: (data: AppointmentData) => void;
  onBack: () => void;
  isProcessing?: boolean;
}

export default function AppointmentStepForm({
  durationMinutes,
  serviceName,
  onComplete,
  onBack,
  isProcessing = false,
}: AppointmentStepFormProps) {
  const [formData, setFormData] = useState<AppointmentData>({
    preferredDate: '',
    preferredTimeStart: '',
    alternateDate: '',
    alternateTimeStart: '',
    notes: '',
  });
  const [error, setError] = useState('');

  // ========================================================================
  // Calculate minimum date (24 hours from now)
  // ========================================================================
  const getMinDate = () => {
    const minDateTime = new Date();
    minDateTime.setTime(minDateTime.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours

    // If the 24-hour mark falls on a weekend, push to Monday
    const day = minDateTime.getDay();
    if (day === 0) minDateTime.setDate(minDateTime.getDate() + 1); // Sunday → Monday
    if (day === 6) minDateTime.setDate(minDateTime.getDate() + 2); // Saturday → Monday

    return minDateTime.toISOString().split('T')[0];
  };

  const minDate = getMinDate();

  // Get maximum date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Business hours options (8:30 AM - 5:30 PM EST)
  const timeOptions = [
    { value: '08:30', label: '8:30 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '09:30', label: '9:30 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '10:30', label: '10:30 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '11:30', label: '11:30 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '12:30', label: '12:30 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '13:30', label: '1:30 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '14:30', label: '2:30 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '15:30', label: '3:30 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '16:30', label: '4:30 PM' },
    { value: '17:00', label: '5:00 PM' },
    { value: '17:30', label: '5:30 PM' },
  ];

  // Filter out times that would end after 6:00 PM (last start time is 5:30 PM)
  // AND times that are less than 24 hours from now for the selected date
  const availableTimeOptions = timeOptions.filter((option) => {
    const [hours, minutes] = option.value.split(':').map(Number);
    const endTimeMinutes = hours * 60 + minutes + durationMinutes;

    // Must end by 6:00 PM (allow 5:30 PM start for 30-min consultations)
    if (endTimeMinutes > 18 * 60) return false;

    // If a date is selected, check if this time is at least 24 hours from now
    if (formData.preferredDate) {
      const selectedDateTime = new Date(`${formData.preferredDate}T${option.value}`);
      const minDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Must be at least 24 hours from now
      if (selectedDateTime < minDateTime) return false;
    }

    return true;
  });

  // Filter available times for alternate date/time
  const availableAlternateTimeOptions = timeOptions.filter((option) => {
    const [hours, minutes] = option.value.split(':').map(Number);
    const endTimeMinutes = hours * 60 + minutes + durationMinutes;

    // Must end by 6:00 PM (allow 5:30 PM start for 30-min consultations)
    if (endTimeMinutes > 18 * 60) return false;

    // If alternate date is selected, check if this time is at least 24 hours from now
    if (formData.alternateDate) {
      const selectedDateTime = new Date(`${formData.alternateDate}T${option.value}`);
      const minDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Must be at least 24 hours from now
      if (selectedDateTime < minDateTime) return false;
    }

    return true;
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  // ========================================================================
  // Validate and submit
  // ========================================================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.preferredDate || !formData.preferredTimeStart) {
      setError('Please select your preferred date and time');
      return;
    }

    // Validate it's a weekday
    const preferredDay = new Date(formData.preferredDate + 'T12:00:00').getDay();
    if (preferredDay === 0 || preferredDay === 6) {
      setError('Please select a weekday (Monday-Friday)');
      return;
    }

    // Validate 24-hour minimum notice
    const now = new Date();
    const selectedDateTime = new Date(`${formData.preferredDate}T${formData.preferredTimeStart}`);
    const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (selectedDateTime < minDateTime) {
      setError('Please select a time at least 24 hours from now');
      return;
    }

    // Validate alternate date if provided
    if (formData.alternateDate) {
      const alternateDay = new Date(formData.alternateDate + 'T12:00:00').getDay();
      if (alternateDay === 0 || alternateDay === 6) {
        setError('Alternate date must be a weekday (Monday-Friday)');
        return;
      }

      // Validate alternate is also 24 hours out
      if (formData.alternateTimeStart) {
        const altDateTime = new Date(`${formData.alternateDate}T${formData.alternateTimeStart}`);
        if (altDateTime < minDateTime) {
          setError('Alternate time must also be at least 24 hours from now');
          return;
        }
      }
    }

    // All validation passed - send data to parent
    onComplete(formData);
  };

  return (
    <Card hoverEffect="none">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className={`text-xl font-bold ${headingColors.primary}`}>
              When would you like to meet?
            </h2>
            <p className={formInputColors.helper}>
              {serviceName} • {durationMinutes} minutes
            </p>
          </div>
        </div>

        {error && (
          <div className={`mb-4 p-3 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
            <p className={`text-sm ${formValidationColors.error}`}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Preferred Date/Time */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Preferred Date & Time
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={minDate}
                  max={maxDateStr}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time *
                </label>
                {!formData.preferredDate ? (
                  <p className={`text-sm ${formInputColors.helper} py-3`}>
                    Select a date first
                  </p>
                ) : availableTimeOptions.length === 0 ? (
                  <p className={`text-sm ${formValidationColors.error} py-3`}>
                    No times available for this date. Please select a later date.
                  </p>
                ) : (
                  <>
                    {/* Desktop: Dropdown select */}
                    <select
                      name="preferredTimeStart"
                      value={formData.preferredTimeStart}
                      onChange={handleChange}
                      className="hidden md:block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a time</option>
                      {availableTimeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Mobile: Button grid for better tap targets */}
                    <div className="md:hidden grid grid-cols-3 gap-2">
                      {availableTimeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, preferredTimeStart: option.value }))}
                          className={`py-3 px-2 text-sm font-medium rounded-lg border-2 transition-all ${
                            formData.preferredTimeStart === option.value
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : `bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-purple-400 ${hoverBgColors.purple}`
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Alternate Date/Time (Optional) */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Alternate Date & Time{' '}
              <span className={formInputColors.helper}>(optional but helpful)</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="alternateDate"
                  value={formData.alternateDate}
                  onChange={handleChange}
                  min={minDate}
                  max={maxDateStr}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                {!formData.alternateDate ? (
                  <p className={`text-sm ${formInputColors.helper} py-3`}>
                    Select a date first
                  </p>
                ) : availableAlternateTimeOptions.length === 0 ? (
                  <p className={`text-sm ${formValidationColors.error} py-3`}>
                    No times available for this date. Please select a later date.
                  </p>
                ) : (
                  <>
                    {/* Desktop: Dropdown select */}
                    <select
                      name="alternateTimeStart"
                      value={formData.alternateTimeStart}
                      onChange={handleChange}
                      className="hidden md:block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a time</option>
                      {availableAlternateTimeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Mobile: Button grid for better tap targets */}
                    <div className="md:hidden grid grid-cols-3 gap-2">
                      {availableAlternateTimeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, alternateTimeStart: option.value }))}
                          className={`py-3 px-2 text-sm font-medium rounded-lg border-2 transition-all ${
                            formData.alternateTimeStart === option.value
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : `bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-purple-400 ${hoverBgColors.purple}`
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Questions or Notes{' '}
              <span className={formInputColors.helper}>(optional)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any specific topics you'd like to discuss or questions you have..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>

          {/* Info note */}
          <div className={`mb-6 p-4 ${alertColors.info.bg} rounded-lg`}>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Appointments must be booked at least 24 hours in advance.
              Available Monday-Friday, 8:30 AM - 5:30 PM EST. We'll confirm your appointment after payment.
            </p>
          </div>

          {/* Actions */}
          <Button
            variant="purple"
            type="submit"
            disabled={isProcessing}
            className="w-full mb-3"
            size="lg"
          >
            {isProcessing ? 'Processing...' : 'Continue to Payment'}
          </Button>

          <Button
            variant="gray"
            onClick={onBack}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            Back to Information
          </Button>
        </form>
      </div>
    </Card>
  );
}
