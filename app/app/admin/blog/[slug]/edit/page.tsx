'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import {
  BlogPost,
  UpdateBlogPostInput,
  BlogCategory,
  BlogSource,
  BLOG_CATEGORIES,
  BLOG_SOURCES,
  generateSlug,
  generateExcerpt,
} from '@/lib/blog-types';
import { formInputColors, headingColors, accentColors } from '@/lib/colors';
import RichTextEditor from '@/components/editor/RichTextEditor';

// ============================================================================
// Edit Blog Post - /admin/blog/[slug]/edit
// ============================================================================
// Full editing capabilities for existing blog posts.
// Reuses the same form structure as the new post creator for consistency.

interface PageProps {
  params: { slug: string };
}

export default function EditBlogPost({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  // Form state
  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [category, setCategory] = useState<BlogCategory | ''>('');
  const [tags, setTags] = useState('');
  const [source, setSource] = useState<BlogSource>('original');
  const [sourceUrl, setSourceUrl] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useRawMarkdown, setUseRawMarkdown] = useState(true); // Default to raw for markdown content
  const [error, setError] = useState('');

  // Fetch post data
  useEffect(() => {
    if (!isAdmin) return;

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/${slug}?admin=true`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load post');
        }

        const fetchedPost = data.post as BlogPost;
        setPost(fetchedPost);

        // Populate form
        setTitle(fetchedPost.title);
        setContent(fetchedPost.content);
        setExcerpt(fetchedPost.excerpt || '');
        setPostSlug(fetchedPost.slug);
        setCategory((fetchedPost.category as BlogCategory) || '');
        setTags(fetchedPost.tags?.join(', ') || '');
        setSource((fetchedPost.source as BlogSource) || 'original');
        setSourceUrl(fetchedPost.source_url || '');
        setFeaturedImage(fetchedPost.featured_image || '');
        setStatus(fetchedPost.status === 'published' ? 'published' : 'draft');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [isAdmin, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const updateData: UpdateBlogPostInput = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || generateExcerpt(content, 160),
        slug: postSlug.trim() || generateSlug(title),
        category: category || undefined,
        tags: tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        source,
        source_url: sourceUrl.trim() || undefined,
        featured_image: featuredImage.trim() || undefined,
        status,
      };

      const response = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update post');
      }

      showToast('Post updated successfully!', 'success');

      // If slug changed, navigate to new URL
      if (postSlug !== slug) {
        router.push(`/admin/blog/${postSlug}/edit`);
      } else {
        router.push('/admin/blog');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button variant="blue" href="/admin/blog">
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="container mx-auto px-6 pb-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4">
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
          <span className="text-gray-900 dark:text-gray-100 font-medium">Edit</span>
        </nav>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${headingColors.primary}`}>Edit Post</h1>
            <p className={`${formInputColors.helper} mt-1`}>
              Update your blog post content and settings
            </p>
          </div>
          {post?.status === 'published' && (
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-sm"
            >
              View live
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>
          )}
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
                  onChange={(e) => setTitle(e.target.value)}
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
                <div className="flex justify-between items-center mb-2">
                  <label
                    className={`block text-sm font-medium ${formInputColors.label}`}
                  >
                    Content *
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseRawMarkdown(!useRawMarkdown)}
                    className={`text-sm px-3 py-1 rounded ${
                      useRawMarkdown
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {useRawMarkdown ? 'Markdown Mode' : 'Rich Text Mode'}
                  </button>
                </div>
                {useRawMarkdown ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={25}
                    className={`
                      w-full px-4 py-3 rounded-lg font-mono text-sm
                      ${formInputColors.base}
                      ${formInputColors.placeholder}
                      ${formInputColors.focus}
                      border transition-colors resize-y
                    `}
                    placeholder="Write your blog post in Markdown..."
                  />
                ) : (
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Write your blog post content..."
                  />
                )}
                <p className={`text-sm ${formInputColors.helper} mt-1`}>
                  {content.length} characters • ~{Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)} min read
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label
                  htmlFor="excerpt"
                  className={`block text-sm font-medium ${formInputColors.label} mb-2`}
                >
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
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

              {/* Category & Tags */}
              <div className="grid sm:grid-cols-2 gap-4">
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

                <div>
                  <label
                    htmlFor="tags"
                    className={`block text-sm font-medium ${formInputColors.label} mb-2`}
                  >
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
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

              {/* Source */}
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
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {source !== 'original' && (
                <div>
                  <label
                    htmlFor="sourceUrl"
                    className={`block text-sm font-medium ${formInputColors.label} mb-2`}
                  >
                    Original Post URL
                  </label>
                  <input
                    type="url"
                    id="sourceUrl"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
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

              {/* Advanced Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`
                    flex items-center gap-2 text-sm font-medium
                    ${formInputColors.helper} hover:text-gray-900 dark:hover:text-gray-100
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

              {showAdvanced && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Slug */}
                  <div>
                    <label
                      htmlFor="slug"
                      className={`block text-sm font-medium ${formInputColors.label} mb-2`}
                    >
                      URL Slug
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={formInputColors.helper}>/blog/</span>
                      <input
                        type="text"
                        id="slug"
                        value={postSlug}
                        onChange={(e) =>
                          setPostSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                        }
                        className={`
                          flex-1 px-4 py-3 rounded-lg
                          ${formInputColors.base}
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
            {/* Status Toggle */}
            <div className="flex items-center gap-4">
              <span className={`text-sm ${formInputColors.label}`}>Status:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      status === 'draft'
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }
                  `}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('published')}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      status === 'published'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }
                  `}
                >
                  Published
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button type="button" variant="gray" href="/admin/blog" disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="blue" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
