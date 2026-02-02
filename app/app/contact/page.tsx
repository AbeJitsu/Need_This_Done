'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getServices } from '@/config/site.config';
import { useEditableContent } from '@/hooks/useEditableContent';
import type { ContactPageContent } from '@/lib/page-content-types';
import { defaultContactContent } from '@/lib/default-page-content';
import { scrollIntoViewWithMotionPreference } from '@/lib/scroll-utils';
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
  iconCircleColors,
  coloredLinkText,
} from '@/lib/colors';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion';

// ============================================================================
// Contact Page - Bold Editorial Treatment
// ============================================================================
// Two-zone layout: dark editorial hero → bright form.
// Matches pricing page aesthetic with accent lines, font-black headings,
// uppercase labels, and dark glass cards.

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

  // Scroll to consultation picker after it renders (respects prefers-reduced-motion)
  useEffect(() => {
    if (contactPath === 'consultation' && shouldScrollToPicker) {
      const scrollToPicker = () => {
        if (consultationPickerRef.current) {
          scrollIntoViewWithMotionPreference(consultationPickerRef.current, { block: 'center' });
          setShouldScrollToPicker(false);
        }
      };
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToPicker);
      });
    }
  }, [contactPath, shouldScrollToPicker]);

  // Handle path selection (Quote vs Consultation) - respects prefers-reduced-motion
  const handlePathSelect = (path: 'quote' | 'consultation') => {
    setContactPath(path);
    if (path === 'quote') {
      setTimeout(() => {
        scrollIntoViewWithMotionPreference(formSectionRef.current, { block: 'start' });
      }, 150);
    } else if (path === 'consultation') {
      setShouldScrollToPicker(true);
    }
  };

  // Handle consultation type selection with scroll to form (respects prefers-reduced-motion)
  const handleConsultationSelect = (typeId: string) => {
    setSelectedConsultation(typeId);
    // Scroll to form after a brief delay for visual feedback
    setTimeout(() => {
      scrollIntoViewWithMotionPreference(formSectionRef.current, { block: 'start' });
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

  // ========================================================================
  // Success State - Dark card treatment
  // ========================================================================
  if (submitStatus === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Decorative blurs */}
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative max-w-lg w-full"
        >
          <div className="relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm p-10">
            {/* Success icon with glow */}
            <div className="relative mx-auto w-24 h-24 mb-8">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
              <div className="absolute inset-[-8px] bg-green-500/10 rounded-full blur-xl" />
              <div className="relative w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
            </div>

            <h1 className="text-4xl font-black text-white mb-4 tracking-tight text-center">
              {content.success.title}
            </h1>
            <p className="text-xl text-slate-400 mb-8 text-center">
              {content.success.description}
            </p>

            {/* What happens next - dark card */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-left mb-8">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                {content.success.nextStepsTitle}
              </h3>
              <ol className="space-y-3">
                {content.success.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-sm font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setSubmitStatus('idle')}
                className="text-blue-400 font-medium hover:text-blue-300 transition-colors inline-flex items-center gap-2"
              >
                {content.success.sendAnotherLink}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ================================================================== */}
      {/* Hero Section - Bold Editorial Dark */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Decorative blurs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 md:pt-24 pb-20 md:pb-28">
          {/* Two-column layout: editorial header left, path cards right */}
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 md:gap-16 items-start">
            {/* Left column — editorial header */}
            <FadeIn direction="up" triggerOnScroll={false}>
              <div>
                {/* Accent line + uppercase label (matches pricing pattern) */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
                  <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Get Started</span>
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[0.95] mb-5">
                  Tell us what<br />
                  <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">you need done.</span>
                </h1>

                <p className="text-xl text-slate-400 max-w-md leading-relaxed mb-8">
                  Free quote or live consultation — pick what works for you. No pressure, no commitment.
                </p>

                {/* Trust indicators */}
                <div className="flex flex-col gap-3 text-sm text-slate-400">
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
            </FadeIn>

            {/* Right column — path selection cards */}
            <StaggerContainer delayStart={0.2} className="flex flex-col gap-4">
              {/* Get a Free Quote */}
              <StaggerItem>
                <button
                  type="button"
                  onClick={() => handlePathSelect('quote')}
                  className={`
                    relative w-full p-6 rounded-2xl text-left transition-all duration-300
                    ${contactPath === 'quote'
                      ? 'bg-white/10 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/10'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/30'}
                  `}
                >
                  <div className={`
                    w-11 h-11 rounded-xl flex items-center justify-center mb-4
                    ${contactPath === 'quote' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-emerald-400'}
                  `}>
                    <FileText className="w-5 h-5" />
                  </div>

                  <h3 className="font-black text-xl text-white mb-1.5 tracking-tight">Get a Free Quote</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    Tell us what you need — detailed quote within 2 business days.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      No commitment required
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Clear pricing upfront
                    </li>
                  </ul>

                  {contactPath === 'quote' && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              </StaggerItem>

              {/* Book a Consultation */}
              <StaggerItem>
                <button
                  type="button"
                  onClick={() => handlePathSelect('consultation')}
                  className={`
                    relative w-full p-6 rounded-2xl text-left transition-all duration-300
                    ${contactPath === 'consultation'
                      ? 'bg-white/10 ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/10'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/30'}
                  `}
                >
                  <div className={`
                    w-11 h-11 rounded-xl flex items-center justify-center mb-4
                    ${contactPath === 'consultation' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-blue-400'}
                  `}>
                    <Users className="w-5 h-5" />
                  </div>

                  <h3 className="font-black text-xl text-white mb-1.5 tracking-tight">Book a Consultation</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    Talk through your project with an expert. We&apos;ll help you plan the best approach.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                      15, 30, or 45 minute sessions
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                      Personalized recommendations
                    </li>
                  </ul>

                  {contactPath === 'consultation' && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              </StaggerItem>
            </StaggerContainer>
          </div>

          {/* Consultation Type Cards - Dark glass style */}
          <AnimatePresence>
          {contactPath === 'consultation' && (
            <motion.div
              ref={consultationPickerRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-12"
            >
              <p className="text-slate-400 mb-6 text-sm font-semibold tracking-widest uppercase">Pick a session length</p>
              <div className="grid md:grid-cols-3 gap-4 max-w-3xl">
                {CONSULTATION_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedConsultation === type.id;

                  const ringColor = type.color === 'emerald'
                    ? 'ring-emerald-400/50 shadow-emerald-500/10'
                    : type.color === 'blue'
                      ? 'ring-blue-400/50 shadow-blue-500/10'
                      : 'ring-purple-400/50 shadow-purple-500/10';

                  const iconColor = type.color === 'emerald'
                    ? 'text-emerald-400'
                    : type.color === 'blue'
                      ? 'text-blue-400'
                      : 'text-purple-400';

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleConsultationSelect(type.id)}
                      className={`
                        relative p-5 rounded-2xl text-left transition-all duration-300
                        ${isSelected
                          ? `bg-white/10 ring-2 ${ringColor} shadow-lg`
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'}
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
                          ? `bg-white/10 ${iconColor}`
                          : 'bg-white/10 text-white/60'}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <h3 className="font-semibold text-white mb-1">{type.name}</h3>
                      <p className="text-xs text-slate-400 mb-1">
                        {type.description}
                      </p>
                      <p className={`text-sm font-medium ${isSelected ? iconColor : 'text-slate-400'}`}>
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
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Form Section - Clean, Bright with Editorial Header */}
      {/* ================================================================== */}
      <section ref={formSectionRef} className="bg-white py-16 md:py-20 scroll-mt-4">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          {/* Editorial left-aligned header */}
          <FadeIn direction="up">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" />
                <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">Your Project</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-3">
                Tell us the details.
              </h2>
              <p className="text-gray-500">
                Share some details and we&apos;ll get back to you with ideas.
              </p>
            </div>
          </FadeIn>

          {/* The Form */}
          <FadeIn direction="up" delay={0.1}><form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-400 bg-gray-50/50 text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
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
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-400 bg-gray-50/50 text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
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
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-400 bg-gray-50/50 text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
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
                className="w-full px-4 py-3.5 rounded-xl border border-gray-400 bg-gray-50/50 text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments <span className="text-gray-500 font-normal">(optional)</span>
              </label>

              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                className="border border-gray-400 rounded-xl p-6 text-center cursor-pointer bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all group"
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

            {/* Submit button - emerald primary CTA */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={isSubmitting ? undefined : { scale: 1.02 }}
              whileTap={isSubmitting ? undefined : { scale: 0.98 }}
              className={`
                w-full py-4 px-6 rounded-2xl font-semibold text-lg
                transition-all duration-200
                flex items-center justify-center gap-3
                ${isSubmitting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30'}
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
            </motion.button>

            {/* Privacy note */}
            <p className="text-center text-sm text-gray-500">
              We&apos;ll never share your info. Read our{' '}
              <a href="/privacy" className={`${coloredLinkText.blue} underline-offset-2 hover:underline`}>
                privacy policy
              </a>
              .
            </p>
          </form></FadeIn>
        </div>
      </section>
    </div>
  );
}
