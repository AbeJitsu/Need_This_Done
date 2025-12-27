'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  BlogPostSummary,
  BlogPostStatus,
  BLOG_STATUS_LABELS,
  formatPublishedDate,
} from '@/lib/blog-types';
import { statusBadgeColors } from '@/lib/colors';

// ============================================================================
// Admin Blog Dashboard - /admin/blog
// ============================================================================
// Central hub for managing all blog posts. Supports:
// - Viewing all posts with status filtering
// - Quick publish/unpublish toggles
// - Navigation to edit and create new posts
// - Deletion with confirmation

export default function BlogManagement() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | 'all'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // Fetch posts
  useEffect(() => {
    if (!isAdmin) return;

    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog?admin=true');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load posts');
        }

        setPosts(data.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isAdmin]);

  const handleDelete = (slug: string) => {
    setPostToDelete(slug);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      setShowDeleteConfirm(false);
      const response = await fetch(`/api/blog/${postToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setPosts(posts.filter((p) => p.slug !== postToDelete));
      showToast('Post deleted successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete post', 'error');
    } finally {
      setPostToDelete(null);
    }
  };

  const handleToggleStatus = async (slug: string, currentStatus: BlogPostStatus) => {
    const newStatus: BlogPostStatus = currentStatus === 'published' ? 'draft' : 'published';

    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      setPosts(posts.map((p) => (p.slug === slug ? { ...p, status: newStatus } : p)));
      showToast(
        `Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
        'success'
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update post', 'error');
    }
  };

  // Filter posts by status
  const filteredPosts =
    statusFilter === 'all' ? posts : posts.filter((p) => p.status === statusFilter);

  // Count by status
  const statusCounts = {
    all: posts.length,
    draft: posts.filter((p) => p.status === 'draft').length,
    published: posts.filter((p) => p.status === 'published').length,
    archived: posts.filter((p) => p.status === 'archived').length,
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/dashboard"
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Admin
          </Link>
          <span className="text-gray-400 dark:text-gray-500">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">Blog</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Blog Posts</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create and manage your blog content
            </p>
          </div>
          <Button variant="blue" href="/admin/blog/new" size="lg">
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Post
            </span>
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'draft', 'published', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              {status === 'all' ? 'All' : BLOG_STATUS_LABELS[status]} ({statusCounts[status]})
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-5 py-4 rounded-xl mb-6">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Posts List */}
        <div className="grid gap-5">
          {filteredPosts.map((post) => {
            const statusStyle =
              post.status === 'published'
                ? statusBadgeColors.confirmed
                : post.status === 'archived'
                  ? statusBadgeColors.cancelled
                  : statusBadgeColors.pending;

            return (
              <Card key={post.id} hoverEffect="lift">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {post.title}
                        </h2>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {BLOG_STATUS_LABELS[post.status]}
                        </span>
                      </div>

                      {post.excerpt && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">/blog/{post.slug}</span>
                        {post.published_at && (
                          <span className="text-gray-400 dark:text-gray-500">
                            Published {formatPublishedDate(post.published_at)}
                          </span>
                        )}
                        {post.status === 'published' && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            View live
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
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

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            >
                              #{tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="blue" href={`/admin/blog/${post.slug}/edit`}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={post.status === 'published' ? 'orange' : 'green'}
                        onClick={() => handleToggleStatus(post.slug, post.status)}
                      >
                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button size="sm" variant="gray" onClick={() => handleDelete(post.slug)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 px-8 py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {statusFilter === 'all'
                  ? 'Start writing your first post'
                  : `No ${statusFilter} posts yet`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                {statusFilter === 'all'
                  ? 'Share your expertise, repurpose LinkedIn content, or tell your story. Getting started takes just a few minutes.'
                  : 'Posts will appear here once you have some.'}
              </p>
              <Button variant="blue" href="/admin/blog/new" size="lg">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Your First Post
                </span>
              </Button>

              {/* Quick tips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl mb-2">📱</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    From LinkedIn
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Paste your LinkedIn post and expand it
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">✍️</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Write Fresh
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Create original content from scratch
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🚀</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Publish Fast
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Draft now, publish when ready
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setPostToDelete(null);
          }}
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      </div>
    </div>
  );
}
