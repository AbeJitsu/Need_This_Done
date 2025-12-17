'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { getServices } from '@/config/site.config';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CTASection from '@/components/CTASection';
import {
  formInputColors,
  formValidationColors,
  titleColors,
  successCheckmarkColors,
  dangerColors,
  mutedTextColors,
  headingColors,
  alertColors,
  cardBgColors,
  fileUploadColors,
} from '@/lib/colors';

// ============================================================================
// Contact Page - Inquiry / Booking Form
// ============================================================================
// Allows visitors to submit project inquiries or book consultations.
// Supports optional file attachments (max 3 files, 5MB each).

const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export default function ContactPage() {
  const services = getServices();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    message: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // ============================================================================
  // Form Field Handlers
  // ============================================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ============================================================================
  // File Upload Handlers
  // ============================================================================

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: File type not allowed. Use images, PDFs, or documents.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File too large. Maximum size is 5MB.`;
    }
    return null;
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    setFileError(null);

    const newFiles = Array.from(selectedFiles);
    const totalFiles = files.length + newFiles.length;

    if (totalFiles > MAX_FILES) {
      setFileError(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }

    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        return;
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFileError(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ============================================================================
  // Form Submission
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('company', formData.company);
      submitData.append('service', formData.service);
      submitData.append('message', formData.message);

      files.forEach(file => {
        submitData.append('files', file);
      });

      const response = await fetch('/api/projects', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', company: '', service: '', message: '' });
      setFiles([]);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <PageHeader
          title="Request a Free Quote"
          description="Tell us what you need help with and we'll send you a personalized quote within 2 business days. No commitment, no spam. Just a friendly estimate so you know exactly what to expect."
        />

        {/* Quick links */}
        <p className={`text-center mb-6 ${formInputColors.helper}`}>
          <Link href="/shop" className={`font-medium hover:underline ${titleColors.purple}`}>
            Need help now? Book a quick consultation →
          </Link>
        </p>

        {/* Contact Form */}
        <Card className="mb-10">
          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className={`text-3xl ${successCheckmarkColors.icon}`}>✓</span>
              </div>
              <h2 className={`text-2xl font-bold ${headingColors.primary} mb-2`}>
                We got your message!
              </h2>
              <p className={`${formInputColors.helper} mb-4`}>
                Thanks for reaching out. We&apos;re excited to learn more about what you need.
              </p>

              {/* What happens next */}
              <div className={`${alertColors.info.bg} rounded-lg p-4 mb-6 text-left max-w-md mx-auto`}>
                <h3 className={`font-semibold ${headingColors.primary} mb-2`}>What happens next:</h3>
                <ol className={`text-sm ${formInputColors.helper} space-y-2`}>
                  <li className="flex items-start gap-2">
                    <span className={`font-semibold ${titleColors.blue}`}>1.</span>
                    We&apos;ll review your request within 2 business days
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={`font-semibold ${titleColors.blue}`}>2.</span>
                    You&apos;ll receive a personalized quote via email
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={`font-semibold ${titleColors.blue}`}>3.</span>
                    Love it?{' '}
                    <Link href="/get-started" className={`${titleColors.blue} font-medium hover:underline`}>
                      Pay 50% to start
                    </Link>
                    , 50% on delivery
                  </li>
                </ol>
              </div>

              <button
                onClick={() => setSubmitStatus('idle')}
                className={`${titleColors.blue} font-medium hover:underline`}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formInputColors.base} ${formInputColors.focus} focus:border-transparent transition-all`}
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                    Where can we reach you?
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formInputColors.base} ${formInputColors.focus} focus:border-transparent transition-all`}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Company */}
                <div>
                  <label htmlFor="company" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                    Company <span className={`${formInputColors.helper} font-normal`}>(if applicable)</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formInputColors.base} ${formInputColors.focus} focus:border-transparent transition-all`}
                    placeholder="Where you work"
                  />
                </div>

                {/* Service Interest */}
                <div>
                  <label htmlFor="service" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                    What kind of help do you need?
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formInputColors.base} ${formInputColors.focus} focus:border-transparent transition-all`}
                  >
                    <option value="">Pick one (or skip this)</option>
                    {services.map((service, index) => (
                      <option key={index} value={service.title}>
                        {service.title}
                      </option>
                    ))}
                    <option value="Other">Other / Not Sure</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                  Tell us what&apos;s on your mind
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${formInputColors.base} ${formInputColors.focus} focus:border-transparent transition-all resize-none`}
                  placeholder="What's the task? Any details that would help us understand what you're looking for?"
                />
              </div>

              {/* File Attachments */}
              <div>
                <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                  Have files to share? <span className={`${formInputColors.helper} font-normal`}>(totally optional)</span>
                </label>
                <div className="space-y-3">
                  {/* File Input Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`rounded-lg p-6 text-center cursor-pointer transition-colors ${fileUploadColors.border} ${fileUploadColors.hoverBorder}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                      title="Upload files"
                      aria-label="Upload files"
                    />
                    <div className={formInputColors.helper}>
                      <span className="text-2xl block mb-2">📎</span>
                      <span className="text-sm">Drop files here or click to browse</span>
                      <p className={`text-xs mt-1 ${formInputColors.helper}`}>
                        Images, PDFs, or docs. Up to 3 files, 5MB each
                      </p>
                    </div>
                  </div>

                  {/* Selected Files List */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between px-3 py-2 ${cardBgColors.elevated} rounded-lg`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-sm ${formInputColors.helper} truncate`}>
                              {file.name}
                            </span>
                            <span className={`text-xs ${mutedTextColors.normal} flex-shrink-0`}>
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className={`${dangerColors.text} ${dangerColors.hoverStrong} ml-2 flex-shrink-0`}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* File Error */}
                  {fileError && (
                    <p className={`text-sm ${formValidationColors.error}`}>{fileError}</p>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className={`p-4 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}>
                  <p className={`${formValidationColors.error} text-sm`}>
                    Something went wrong. Please try again, or reach out to us another way - we're here to help.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  variant="orange"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Start the Conversation'}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Alternative Contact */}
        <CTASection
          title="Want to learn more first?"
          buttons={[
            { text: 'View Our Services', variant: 'green', href: '/services' },
            { text: 'How It Works', variant: 'blue', href: '/how-it-works' },
            { text: 'Read the FAQ', variant: 'purple', href: '/faq' }
          ]}
          hoverColor="green"
        />
    </div>
  );
}
