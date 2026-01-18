'use client';

import { useState, useRef, useEffect } from 'react';
import { getServices } from '@/config/site.config';
import { useEditableContent } from '@/hooks/useEditableContent';
import type { ContactPageContent } from '@/lib/page-content-types';
import { defaultContactContent } from '@/lib/default-page-content';
import {
  Clock,
  MessageSquare,
  Lightbulb,
  Calendar,
  Upload,
  X,
  Check,
  Send,
  ArrowRight,
  Sparkles,
  FileText,
  Users,
} from 'lucide-react';
import {
  titleColors,
  accentColors,
  iconCircleColors,
  coloredLinkText,
} from '@/lib/colors';
import { accentText } from '@/lib/contrast';

// ============================================================================
// Contact Page - Premium Consultation Booking
// ============================================================================
// Redesigned with luxury aesthetic that continues the dark premium card
// from the home page. Two-zone layout: dark hero → bright form.

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

// Consultation types with styling
const CONSULTATION_TYPES = [
  {
    id: 'quick',
    name: 'Quick Chat',
    duration: '15 min',
    description: 'Got a quick question? Let\'s sort it out.',
    icon: MessageSquare,
    color: 'emerald',
  },
  {
    id: 'strategy',
    name: 'Strategy Call',
    duration: '30 min',
    description: 'Map out your project needs together.',
    icon: Lightbulb,
    color: 'blue',
    popular: true,
  },
  {
    id: 'deep-dive',
    name: 'Deep Dive',
    duration: '45 min',
    description: 'Full consultation for complex projects.',
    icon: Sparkles,
    color: 'violet',
  },
];

export default function ContactPage() {
  const { content } = useEditableContent<ContactPageContent>(defaultContactContent);
  const services = getServices();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formSectionRef = useRef<HTMLElement>(null);
  const consultationPickerRef = useRef<HTMLDivElement>(null);

  const [selectedConsultation, setSelectedConsultation] = useState('strategy');
  const [contactPath, setContactPath] = useState<'none' | 'quote' | 'consultation'>('none');

  // Track if we should scroll to picker (from hash navigation)
  const [shouldScrollToPicker, setShouldScrollToPicker] = useState(false);

  // Auto-select consultation path when coming from #consultation link
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#consultation') {
      setContactPath('consultation');
      setShouldScrollToPicker(true);
    }
  }, []);

  // Scroll to consultation picker after it renders
  useEffect(() => {
    if (contactPath === 'consultation' && shouldScrollToPicker) {
      // Wait for the picker to render, then scroll
      const scrollToPicker = () => {
        if (consultationPickerRef.current) {
          consultationPickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setShouldScrollToPicker(false); // Reset after scrolling
        }
      };
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToPicker);
      });
    }
  }, [contactPath, shouldScrollToPicker]);

  // Handle path selection (Quote vs Consultation)
  const handlePathSelect = (path: 'quote' | 'consultation') => {
    setContactPath(path);
    if (path === 'quote') {
      // Scroll to form after selection
      setTimeout(() => {
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } else if (path === 'consultation') {
      // Trigger scroll to consultation picker
      setShouldScrollToPicker(true);
    }
  };

  // Handle consultation type selection with smooth scroll to form
  const handleConsultationSelect = (typeId: string) => {
    setSelectedConsultation(typeId);
    // Smooth scroll to form after a brief delay for visual feedback
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };
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

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `"${file.name}" isn't a supported file type. Try an image, PDF, or Word doc.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" is too large (max 5MB).`;
    }
    return null;
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    setFileError(null);

    const newFiles = Array.from(selectedFiles);
    const totalFiles = files.length + newFiles.length;

    if (totalFiles > MAX_FILES) {
      setFileError(`You can attach up to ${MAX_FILES} files.`);
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
      submitData.append('consultationType', selectedConsultation);

      files.forEach(file => {
        submitData.append('files', file);
      });

      const response = await fetch('/api/projects', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) throw new Error('Submission failed');

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

  // Success state
  if (submitStatus === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center animate-scale-in">
          {/* Success icon */}
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            {content.success.title}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {content.success.description}
          </p>

          {/* What happens next */}
          <div className="bg-slate-50 rounded-2xl p-6 text-left mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className={`w-5 h-5 ${iconCircleColors.blue.icon}`} />
              {content.success.nextStepsTitle}
            </h3>
            <ol className="space-y-3">
              {content.success.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-600">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full ${accentColors.blue.bg} ${accentColors.blue.text} text-sm font-semibold flex items-center justify-center`}>
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <button
            type="button"
            onClick={() => setSubmitStatus('idle')}
            className={`${coloredLinkText.blue} font-medium hover:text-blue-700 transition-colors inline-flex items-center gap-2`}
          >
            {content.success.sendAnotherLink}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ================================================================== */}
      {/* Hero Section - Premium Dark (continues home page aesthetic) */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Decorative blurs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 md:pt-24 pb-24 md:pb-32">
          {/* Eyebrow badge */}
          <div className="flex justify-center mb-8 animate-slide-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-blue-300 text-sm font-medium backdrop-blur-sm border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Free Quote • No Commitment
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center mb-6 tracking-tight animate-slide-up animate-delay-100">
            Let&apos;s Build Something
            <span className="block mt-2 pb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-purple-400 bg-clip-text text-transparent">
              Together
            </span>
          </h1>

          <p className="text-xl text-slate-300 text-center max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up animate-delay-200">
            Choose how you&apos;d like to get started. Both options are completely free.
          </p>

          {/* Two Path Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto animate-slide-up animate-delay-300">
            {/* Get a Free Quote */}
            <button
              type="button"
              onClick={() => handlePathSelect('quote')}
              className={`
                relative p-8 rounded-2xl text-left transition-all duration-300
                ${contactPath === 'quote'
                  ? 'bg-white text-slate-900 shadow-2xl shadow-white/20 scale-[1.02]'
                  : 'bg-white/5 text-white hover:bg-white/10 hover:scale-[1.02] border border-white/10 hover:border-green-400/40'}
              `}
            >
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center mb-5
                ${contactPath === 'quote' ? `${iconCircleColors.green.bg} ${iconCircleColors.green.icon}` : 'bg-white/10 text-green-400'}
              `}>
                <FileText className="w-7 h-7" />
              </div>

              <h3 className="font-bold text-2xl mb-2">Get a Free Quote</h3>
              <p className={`text-base mb-4 ${contactPath === 'quote' ? 'text-slate-600' : 'text-slate-400'}`}>
                Tell us what you need and we&apos;ll send you a detailed quote within 2 business days.
              </p>
              <ul className={`space-y-2 text-sm ${contactPath === 'quote' ? 'text-slate-500' : 'text-slate-400'}`}>
                <li className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${accentText.emerald}`} />
                  No commitment required
                </li>
                <li className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${accentText.emerald}`} />
                  Clear pricing upfront
                </li>
              </ul>

              {contactPath === 'quote' && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              )}
            </button>

            {/* Book a Consultation */}
            <button
              type="button"
              onClick={() => handlePathSelect('consultation')}
              className={`
                relative p-8 rounded-2xl text-left transition-all duration-300
                ${contactPath === 'consultation'
                  ? 'bg-white text-slate-900 shadow-2xl shadow-white/20 scale-[1.02]'
                  : 'bg-white/5 text-white hover:bg-white/10 hover:scale-[1.02] border border-white/10 hover:border-blue-400/40'}
              `}
            >
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center mb-5
                ${contactPath === 'consultation' ? `${iconCircleColors.blue.bg} ${iconCircleColors.blue.icon}` : 'bg-white/10 text-blue-400'}
              `}>
                <Users className="w-7 h-7" />
              </div>

              <h3 className="font-bold text-2xl mb-2">Book a Consultation</h3>
              <p className={`text-base mb-4 ${contactPath === 'consultation' ? 'text-slate-600' : 'text-slate-400'}`}>
                Talk through your project with an expert. We&apos;ll help you figure out the best approach.
              </p>
              <ul className={`space-y-2 text-sm ${contactPath === 'consultation' ? 'text-slate-500' : 'text-slate-400'}`}>
                <li className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${accentText.blue}`} />
                  15, 30, or 45 minute sessions
                </li>
                <li className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${accentText.blue}`} />
                  Personalized recommendations
                </li>
              </ul>

              {contactPath === 'consultation' && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          </div>

          {/* Consultation Type Cards - Only show when consultation path selected */}
          {contactPath === 'consultation' && (
            <div ref={consultationPickerRef} className="mt-10 animate-slide-up">
              <p className="text-center text-slate-300 mb-6">Pick a consultation length:</p>
              <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {CONSULTATION_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedConsultation === type.id;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleConsultationSelect(type.id)}
                      className={`
                        relative p-5 rounded-2xl text-left transition-all duration-300
                        ${isSelected
                          ? 'bg-white text-slate-900 shadow-xl shadow-white/20 scale-[1.02]'
                          : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}
                      `}
                    >
                      {type.popular && (
                        <span className={`
                          absolute -top-2 left-4 px-2 py-0.5 text-xs font-semibold rounded-full
                          ${isSelected ? 'bg-blue-500 text-white' : 'bg-blue-400/20 text-blue-300'}
                        `}>
                          Popular
                        </span>
                      )}

                      <div className={`
                        w-9 h-9 rounded-lg flex items-center justify-center mb-3
                        ${isSelected
                          ? type.color === 'emerald' ? `${iconCircleColors.green.bg} ${iconCircleColors.green.icon}`
                            : type.color === 'blue' ? `${iconCircleColors.blue.bg} ${iconCircleColors.blue.icon}`
                            : `${iconCircleColors.purple.bg} ${iconCircleColors.purple.icon}`
                          : 'bg-white/10 text-white'}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <h3 className="font-semibold mb-1">{type.name}</h3>
                      <p className={`text-xs mb-1 ${isSelected ? 'text-slate-500' : 'text-slate-400'}`}>
                        {type.description}
                      </p>
                      <p className={`text-sm font-medium ${isSelected ? titleColors.blue : 'text-blue-400'}`}>
                        {type.duration}
                      </p>

                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-slate-400 animate-slide-up animate-delay-400">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Response within 24 hours
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Get a clear next step
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              No pressure, ever
            </span>
          </div>
        </div>

        {/* Curved transition to form */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{
          clipPath: 'ellipse(70% 100% at 50% 100%)'
        }} />
      </section>

      {/* ================================================================== */}
      {/* Form Section - Clean, Bright */}
      {/* ================================================================== */}
      <section ref={formSectionRef} className="bg-white py-16 md:py-20 scroll-mt-4">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Form header */}
          <div className="text-center mb-10 animate-slide-up">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Tell us about your project
            </h2>
            <p className="text-gray-600">
              Share some details and we&apos;ll get back to you with ideas.
            </p>
          </div>

          {/* The Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up animate-delay-100">
            {/* Name & Email row */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-400 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-400 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            {/* Company & Service row */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Acme Inc"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-400 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  What interests you?
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-400 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.25rem',
                  }}
                >
                  <option value="">Select a service...</option>
                  {services.map((service, index) => (
                    <option key={index} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                  <option value="Other">Something else</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                What&apos;s on your mind?
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your project, goals, timeline, or any questions you have..."
                className="w-full px-4 py-3.5 rounded-xl border border-gray-400 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments <span className="text-gray-500 font-normal">(optional)</span>
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-gray-400 rounded-xl p-6 text-center cursor-pointer bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  aria-label="Upload files"
                />
                <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <p className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Images, PDFs, or docs up to 5MB each
                </p>
              </div>

              {/* Selected files */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg ${iconCircleColors.blue.bg} flex items-center justify-center flex-shrink-0`}>
                          <Calendar className={`w-4 h-4 ${iconCircleColors.blue.icon}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-700 truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {fileError && (
                <p className="mt-2 text-sm text-red-600">{fileError}</p>
              )}
            </div>

            {/* Error state */}
            {submitStatus === 'error' && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-sm text-red-600">
                  {content.error.message}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-4 px-6 rounded-2xl font-semibold text-lg
                transition-all duration-200
                flex items-center justify-center gap-3
                ${isSubmitting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 active:scale-[0.98]'}
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-500 rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>

            {/* Privacy note */}
            <p className="text-center text-sm text-gray-500">
              We&apos;ll never share your info. Read our{' '}
              <a href="/privacy" className={`${coloredLinkText.blue} underline-offset-2 hover:underline`}>
                privacy policy
              </a>
              .
            </p>
          </form>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Alternative Contact Section */}
      {/* ================================================================== */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Prefer a different way to connect?
          </h3>
          <p className="text-gray-600 mb-6">
            Check out our pricing or browse services to learn more.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-400 rounded-xl font-medium text-gray-700 hover:border-gray-400 hover:shadow-sm transition-all"
            >
              View Pricing
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-400 rounded-xl font-medium text-gray-700 hover:border-gray-400 hover:shadow-sm transition-all"
            >
              Browse Services
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
