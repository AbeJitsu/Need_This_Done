'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { formInputColors, formValidationColors } from '@/lib/colors';

// ============================================================================
// Appointment Request Form Component
// ============================================================================
// What: Form for customers to request appointment times after checkout
// Why: Consultation products need scheduling before fulfillment
// How: Collects preferred date/time, submits to API, shows confirmation

interface AppointmentRequestFormProps {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  durationMinutes: number;
  serviceName: string;
  onSuccess?: () => void;
}

interface FormData {
  preferredDate: string;
  preferredTimeStart: string;
  alternateDate: string;
  alternateTimeStart: string;
  notes: string;
}

export default function AppointmentRequestForm({
  orderId,
  customerEmail,
  customerName,
  durationMinutes,
  serviceName,
  onSuccess,
}: AppointmentRequestFormProps) {
  const [formData, setFormData] = useState<FormData>({
    preferredDate: '',
    preferredTimeStart: '',
    alternateDate: '',
    alternateTimeStart: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get maximum date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Business hours options (9 AM - 5 PM)
  const timeOptions = [
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
  ];

  // Filter out times that would end after 5 PM
  const availableTimeOptions = timeOptions.filter((option) => {
    const [hours, minutes] = option.value.split(':').map(Number);
    const endTimeMinutes = hours * 60 + minutes + durationMinutes;
    return endTimeMinutes <= 17 * 60; // 5 PM = 17:00
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.preferredDate || !formData.preferredTimeStart) {
      setError('Please select your preferred date and time');
      return;
    }

    // Validate it's a weekday
    const preferredDay = new Date(formData.preferredDate).getDay();
    if (preferredDay === 0 || preferredDay === 6) {
      setError('Please select a weekday (Monday-Friday)');
      return;
    }

    // Validate alternate date if provided
    if (formData.alternateDate) {
      const alternateDay = new Date(formData.alternateDate).getDay();
      if (alternateDay === 0 || alternateDay === 6) {
        setError('Alternate date must be a weekday (Monday-Friday)');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/appointments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          customer_email: customerEmail,
          customer_name: customerName,
          preferred_date: formData.preferredDate,
          preferred_time_start: formData.preferredTimeStart,
          alternate_date: formData.alternateDate || null,
          alternate_time_start: formData.alternateTimeStart || null,
          duration_minutes: durationMinutes,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit appointment request');
      }

      setIsSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <Card hoverEffect="none" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <div className="p-6 text-center">
          <div className="inline-block p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
            Appointment Request Submitted!
          </h3>
          <p className="text-green-700 dark:text-green-300">
            We'll review your request and confirm your appointment within 24 hours.
            You'll receive a confirmation email at <strong>{customerEmail}</strong>.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card hoverEffect="none" className="border-purple-200 dark:border-purple-800">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Schedule Your {serviceName}
            </h3>
            <p className={formInputColors.helper}>
              {durationMinutes} minute consultation
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className={`text-sm ${formValidationColors.error}`}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Preferred Date/Time */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Preferred Date & Time
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time *
                </label>
                <select
                  name="preferredTimeStart"
                  value={formData.preferredTimeStart}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a time</option>
                  {availableTimeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Alternate Date/Time (Optional) */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Alternate Date & Time{' '}
              <span className={formInputColors.helper}>(optional)</span>
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time
                </label>
                <select
                  name="alternateTimeStart"
                  value={formData.alternateTimeStart}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a time</option>
                  {availableTimeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Appointments are available Monday-Friday, 9 AM - 5 PM EST.
              We'll confirm your appointment within 24 hours.
            </p>
          </div>

          <Button
            variant="purple"
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Submitting...' : 'Request Appointment'}
          </Button>
        </form>
      </div>
    </Card>
  );
}
