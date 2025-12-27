'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import {
  CreateBlogPostInput,
  BlogCategory,
  BlogSource,
  BLOG_CATEGORIES,
  BLOG_SOURCES,
  generateSlug,
  generateExcerpt,
} from '@/lib/blog-types';
import { formInputColors, headingColors, accentColors } from '@/lib/colors';

// ============================================================================
// New Blog Post Creator - /admin/blog/new
// ============================================================================
// Quick post creation with multiple pathways:
// 1. Paste LinkedIn content → auto-generates title, excerpt, slug
// 2. Write from scratch with full control
// 3. Future: AI expansion of short content
//
// Designed for speed: minimal required fields, smart defaults

export default function NewBlogPost() {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<BlogCategory | ''>('');
  const [tags, setTags] = useState('');
  const [source, setSource] = useState<BlogSource>('original');
  const [sourceUrl, setSourceUrl] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(false);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-generate slug when title changes
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  // Auto-generate excerpt when content changes (if excerpt is empty)
  const handleContentChange = (value: string) => {
    setContent(value);
    if (!excerpt) {
      setExcerpt(generateExcerpt(value, 160));
    }
  };

  // Smart paste detection for LinkedIn
  const handleContentPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');

    // If pasting into empty form, try to auto-detect LinkedIn content
    if (!content && !title && pastedText.length > 50) {
      // First line often works as title for LinkedIn posts
      const lines = pastedText.split('\n').filter((l) => l.trim());
      if (lines.length > 0) {
        const potentialTitle = lines[0].slice(0, 80);
        if (potentialTitle.length < 80) {
          setTitle(potentialTitle);
          setSlug(generateSlug(potentialTitle));
        }
      }

      // Auto-set source to LinkedIn if it looks like LinkedIn content
      if (
        pastedText.includes('#') ||
        pastedText.length < 3000 // LinkedIn posts are typically short
      ) {
        setSource('linkedin');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const postData: CreateBlogPostInput = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || generateExcerpt(content, 160),
        slug: slug.trim() || generateSlug(title),
        category: category || undefined,
        tags: tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        source,
        source_url: sourceUrl.trim() || undefined,
        featured_image: featuredImage.trim() || undefined,
        status: publishImmediately ? 'published' : 'draft',
      };

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post');
      }

      showToast(
        publishImmediately ? 'Post published successfully!' : 'Draft saved successfully!',
        'success'
      );
      router.push('/admin/blog');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/dashboard"
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Admin
          </Link>
          <span className="text-gray-400 dark:text-gray-500">/</span>
          <Link
            href="/admin/blog"
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Blog
          </Link>
          <span className="text-gray-400 dark:text-gray-500">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">New Post</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${headingColors.primary}`}>Create New Post</h1>
          <p className={`${formInputColors.helper} mt-1`}>
            Paste your LinkedIn content, write from scratch, or expand a quick idea
          </p>
        </div>

        {/* Quick Tips */}
        <div
          className={`
            mb-8 p-4 rounded-xl
            bg-blue-50 dark:bg-blue-900/20
            border border-blue-200 dark:border-blue-800
          `}
        >
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 Quick Tip: Paste LinkedIn Content
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Paste your LinkedIn post into the content field. The first line will become your title,
            and we'll auto-generate the rest. You can then expand it or publish as-is.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className={`block text-sm font-medium ${formInputColors.label} mb-2`}
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="What's this post about?"
                  className={`
                    w-full px-4 py-3 rounded-lg
                    ${formInputColors.base}
                    ${formInputColors.placeholder}
                    ${formInputColors.focus}
                    border transition-colors
                  `}
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label
                  htmlFor="content"
                  className={`block text-sm font-medium ${formInputColors.label} mb-2`}
                >
                  Content *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onPaste={handleContentPaste}
                  placeholder="Paste your LinkedIn post here, or write something new..."
                  rows={12}
                  className={`
                    w-full px-4 py-3 rounded-lg
                    ${formInputColors.base}
                    ${formInputColors.placeholder}
                    ${formInputColors.focus}
                    border transition-colors resize-y
                  `}
                  required
                />
                <p className={`text-sm ${formInputColors.helper} mt-1`}>
                  {content.length} characters • ~{Math.ceil(content.split(/\s+/).length / 200)} min
                  read
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label
                  htmlFor="excerpt"
                  className={`block text-sm font-medium ${formInputColors.label} mb-2`}
                >
                  Excerpt
                  <span className={`font-normal ${formInputColors.helper} ml-2`}>
                    (auto-generated if blank)
                  </span>
                </label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short summary for listings and social shares..."
                  rows={2}
                  maxLength={200}
                  className={`
                    w-full px-4 py-3 rounded-lg
                    ${formInputColors.base}
                    ${formInputColors.placeholder}
                    ${formInputColors.focus}
                    border transition-colors resize-none
                  `}
                />
                <p className={`text-sm ${formInputColors.helper} mt-1`}>{excerpt.length}/200</p>
              </div>

              {/* Category & Tags Row */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className={`block text-sm font-medium ${formInputColors.label} mb-2`}
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BlogCategory)}
                    className={`
                      w-full px-4 py-3 rounded-lg
                      ${formInputColors.base}
                      ${formInputColors.focus}
                      border transition-colors
                    `}
                  >
                    <option value="">Select a category...</option>
                    {Object.entries(BLOG_CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label
                    htmlFor="tags"
                    className={`block text-sm font-medium ${formInputColors.label} mb-2`}
                  >
                    Tags
                    <span className={`font-normal ${formInputColors.helper} ml-2`}>
                      (comma-separated)
                    </span>
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="productivity, tips, business"
                    className={`
                      w-full px-4 py-3 rounded-lg
                      ${formInputColors.base}
                      ${formInputColors.placeholder}
                      ${formInputColors.focus}
                      border transition-colors
                    `}
                  />
                </div>
              </div>

              {/* Source Selection */}
              <div>
                <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                  Content Source
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(BLOG_SOURCES).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSource(key as BlogSource)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${
                          source === key
                            ? `${accentColors.blue.bg} ${accentColors.blue.text}`
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source URL (shown if source is not original) */}
              {source !== 'original' && (
                <div>
                  <label
                    htmlFor="sourceUrl"
                    className={`block text-sm font-medium ${formInputColors.label} mb-2`}
                  >
                    Original Post URL
                    <span className={`font-normal ${formInputColors.helper} ml-2`}>(optional)</span>
                  </label>
                  <input
                    type="url"
                    id="sourceUrl"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://linkedin.com/posts/..."
                    className={`
                      w-full px-4 py-3 rounded-lg
                      ${formInputColors.base}
                      ${formInputColors.placeholder}
                      ${formInputColors.focus}
                      border transition-colors
                    `}
                  />
                </div>
              )}

              {/* Advanced Options Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`
                    flex items-center gap-2 text-sm font-medium
                    ${formInputColors.helper} hover:text-gray-900 dark:hover:text-gray-100
                    transition-colors
                  `}
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Advanced Options
                </button>
              </div>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Slug */}
                  <div>
                    <label
                      htmlFor="slug"
                      className={`block text-sm font-medium ${formInputColors.label} mb-2`}
                    >
                      URL Slug
                      <span className={`font-normal ${formInputColors.helper} ml-2`}>
                        (auto-generated from title)
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={formInputColors.helper}>/blog/</span>
                      <input
                        type="text"
                        id="slug"
                        value={slug}
                        onChange={(e) =>
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                        }
                        placeholder="my-blog-post"
                        className={`
                          flex-1 px-4 py-3 rounded-lg
                          ${formInputColors.base}
                          ${formInputColors.placeholder}
                          ${formInputColors.focus}
                          border transition-colors
                        `}
                      />
                    </div>
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label
                      htmlFor="featuredImage"
                      className={`block text-sm font-medium ${formInputColors.label} mb-2`}
                    >
                      Featured Image URL
                    </label>
                    <input
                      type="url"
                      id="featuredImage"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="https://..."
                      className={`
                        w-full px-4 py-3 rounded-lg
                        ${formInputColors.base}
                        ${formInputColors.placeholder}
                        ${formInputColors.focus}
                        border transition-colors
                      `}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Publish Toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={formInputColors.label}>Publish immediately</span>
            </label>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <Button type="button" variant="gray" href="/admin/blog" disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant={publishImmediately ? 'green' : 'blue'} disabled={submitting}>
                {submitting
                  ? 'Saving...'
                  : publishImmediately
                    ? 'Publish Post'
                    : 'Save as Draft'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
