'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { getServices } from '@/config/site.config';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CTASection from '@/components/CTASection';
import { EditableSection } from '@/components/InlineEditor';
import { useEditableContent } from '@/hooks/useEditableContent';
import type { ContactPageContent } from '@/lib/page-content-types';
import { defaultContactContent } from '@/lib/default-page-content';
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
  iconCircleColors,
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
  // Register with edit context for inline editing
  const { content } = useEditableContent<ContactPageContent>(defaultContactContent);

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
      return `Oops! "${file.name}" isn't a file type we can accept. Try an image, PDF, or Word doc instead.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" is a bit too large (max 5MB). Could you try a smaller version?`;
    }
    return null;
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    setFileError(null);

    const newFiles = Array.from(selectedFiles);
    const totalFiles = files.length + newFiles.length;

    if (totalFiles > MAX_FILES) {
      setFileError(`Whoops! You can only attach up to ${MAX_FILES} files at a time.`);
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
        <EditableSection sectionKey="header" label="Page Header">
          <PageHeader
            title={content.header.title}
            description={content.header.description}
          />
        </EditableSection>

        {/* Quick links */}
        <EditableSection sectionKey="quickLink" label="Quick Link">
          <p className={`text-center mb-6 ${formInputColors.helper}`}>
            <Link href={content.quickLink.href} className={`font-medium hover:underline ${titleColors.purple}`}>
              {content.quickLink.text}
            </Link>
          </p>
        </EditableSection>

        {/* Contact Form */}
        <EditableSection sectionKey="form" label="Contact Form">
          <Card className="mb-10">
            {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${iconCircleColors.green.bg} flex items-center justify-center`}>
                <span className={`text-3xl ${successCheckmarkColors.icon}`} aria-hidden="true">✓</span>
              </div>
              <h2 className={`text-2xl font-bold ${headingColors.primary} mb-2`}>
                {content.success.title}
              </h2>
              <p className={`${formInputColors.helper} mb-4`}>
                {content.success.description}
              </p>

              {/* What happens next */}
              <div className={`${alertColors.info.bg} rounded-lg p-4 mb-6 text-left max-w-md mx-auto`}>
                <h3 className={`font-semibold ${headingColors.primary} mb-2`}>{content.success.nextStepsTitle}</h3>
                <ol className={`text-sm ${formInputColors.helper} space-y-2`}>
                  {content.success.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className={`font-semibold ${titleColors.blue}`}>{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <button
                type="button"
                onClick={() => setSubmitStatus('idle')}
                className={`${titleColors.blue} font-medium hover:underline`}
              >
                {content.success.sendAnotherLink}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                    {content.form.nameField.label}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formInputColors.base} ${formInputColors.focus} focus:border-transparent transition-all`}
                    placeholder={content.form.nameField.placeholder}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                    {content.form.emailField.label}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formInputColors.base} ${formInputColors.focus} focus:border-transparent transition-all`}
                    placeholder={content.form.emailField.placeholder}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Company */}
                <div>
                  <label htmlFor="company" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                    {content.form.companyField.label}{' '}
                    {content.form.companyField.optional && (
                      <span className={`${formInputColors.helper} font-normal`}>{content.form.companyField.optional}</span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formInputColors.base} ${formInputColors.focus} focus:border-transparent transition-all`}
                    placeholder={content.form.companyField.placeholder}
                  />
                </div>

                {/* Service Interest */}
                <div>
                  <label htmlFor="service" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                    {content.form.serviceField.label}
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formInputColors.base} ${formInputColors.focus} focus:border-transparent transition-all`}
                  >
                    <option value="">{content.form.serviceField.defaultOption}</option>
                    {services.map((service, index) => (
                      <option key={index} value={service.title}>
                        {service.title}
                      </option>
                    ))}
                    <option value="Other">{content.form.serviceField.otherOption}</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                  {content.form.messageField.label}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${formInputColors.base} ${formInputColors.focus} focus:border-transparent transition-all resize-none`}
                  placeholder={content.form.messageField.placeholder}
                />
              </div>

              {/* File Attachments */}
              <div>
                <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                  {content.form.fileUpload.label}{' '}
                  <span className={`${formInputColors.helper} font-normal`}>{content.form.fileUpload.optional}</span>
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
                      <span className="text-2xl block mb-2" aria-hidden="true">📎</span>
                      <span className="text-sm">{content.form.fileUpload.dropText}</span>
                      <p className={`text-xs mt-1 ${formInputColors.helper}`}>
                        {content.form.fileUpload.helpText}
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
                            {content.form.fileUpload.removeButton}
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
                    {content.error.message}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  variant="gold"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? content.form.submitButton.submitting : content.form.submitButton.default}
                </Button>
              </div>
            </form>
          )}
          </Card>
        </EditableSection>

        {/* Alternative Contact */}
        <EditableSection sectionKey="cta" label="Call to Action">
          <CTASection
            title={content.cta.title}
            description={content.cta.description}
            buttons={content.cta.buttons}
            hoverColor={content.cta.hoverColor || 'green'}
          />
        </EditableSection>
    </div>
  );
}
