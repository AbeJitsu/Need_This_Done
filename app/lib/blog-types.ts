// ============================================================================
// Blog Types - TypeScript Interfaces for Blog Content System
// ============================================================================
// Defines the structure of blog posts, their metadata, and related utilities.
// Designed for DRY code - types are reused across API, components, and pages.

// ============================================================================
// Core Blog Post Type
// ============================================================================

/** Blog post status options */
export type BlogPostStatus = 'draft' | 'published' | 'archived';

/** Where the content originated */
export type BlogSource = 'linkedin' | 'original' | 'newsletter' | 'other';

/** Blog post categories */
export type BlogCategory =
  | 'tips'
  | 'case-study'
  | 'news'
  | 'behind-the-scenes'
  | 'tutorial'
  | 'announcement'
  | 'other';

/** Full blog post as stored in database */
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  puck_content?: Record<string, unknown> | null;
  featured_image: string | null;
  tags: string[];
  category: BlogCategory | string | null;
  status: BlogPostStatus;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  source: BlogSource | string | null;
  source_url: string | null;
  author_id: string | null;
  author_name: string | null;
  created_at: string;
  updated_at: string;
}

/** Blog post for listing pages (subset of fields for performance) */
export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  tags: string[];
  category: BlogCategory | string | null;
  status: BlogPostStatus;
  published_at: string | null;
  author_name: string | null;
}

// ============================================================================
// Form/Input Types
// ============================================================================

/** Input for creating a new blog post */
export interface CreateBlogPostInput {
  title: string;
  content: string;
  slug?: string; // Auto-generated from title if not provided
  excerpt?: string;
  featured_image?: string;
  tags?: string[];
  category?: BlogCategory | string;
  status?: BlogPostStatus;
  source?: BlogSource | string;
  source_url?: string;
  meta_title?: string;
  meta_description?: string;
}

/** Input for updating an existing blog post */
export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
  // All fields optional for partial updates
}

// ============================================================================
// API Response Types
// ============================================================================

/** Response from listing blog posts */
export interface BlogListResponse {
  posts: BlogPostSummary[];
  count: number;
  cached: boolean;
  source: 'cache' | 'database';
}

/** Response from getting a single blog post */
export interface BlogPostResponse {
  post: BlogPost;
  cached: boolean;
  source: 'cache' | 'database';
}

// ============================================================================
// Filter Types
// ============================================================================

/** Filters for listing blog posts */
export interface BlogFilters {
  status?: BlogPostStatus;
  category?: string;
  tag?: string;
  search?: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Available blog categories with display labels */
export const BLOG_CATEGORIES: Record<BlogCategory, string> = {
  'tips': 'Tips & Tricks',
  'case-study': 'Case Study',
  'news': 'News',
  'behind-the-scenes': 'Behind the Scenes',
  'tutorial': 'Tutorial',
  'announcement': 'Announcement',
  'other': 'Other',
};

/** Blog post status display labels */
export const BLOG_STATUS_LABELS: Record<BlogPostStatus, string> = {
  'draft': 'Draft',
  'published': 'Published',
  'archived': 'Archived',
};

/** Content sources with display labels */
export const BLOG_SOURCES: Record<BlogSource, string> = {
  'linkedin': 'LinkedIn',
  'original': 'Original',
  'newsletter': 'Newsletter',
  'other': 'Other',
};

// ============================================================================
// Utility Functions
// ============================================================================

/** Generate a URL-safe slug from a title */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .substring(0, 60); // Limit length
}

/** Extract excerpt from content if not provided */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Strip any markdown-like formatting
  const plainText = content
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (plainText.length <= maxLength) return plainText;

  // Cut at last complete word
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

/** Format published date for display */
export function formatPublishedDate(dateString: string | null): string {
  if (!dateString) return 'Not published';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Calculate estimated reading time */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
