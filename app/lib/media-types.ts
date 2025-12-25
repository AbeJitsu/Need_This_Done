// ============================================================================
// Media Library Types
// ============================================================================
// Type definitions for the media library system

export interface MediaItem {
  id: string;
  storage_path: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  tags: string[];
  folder: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  // Computed field (not in DB)
  url?: string;
}

export interface MediaUploadResult {
  success: boolean;
  media?: MediaItem;
  error?: string;
}

export interface MediaListResponse {
  media: MediaItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface MediaFilters {
  folder?: string;
  tags?: string[];
  mimeType?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// Media Validation
// ============================================================================

export const MEDIA_VALIDATION = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],
} as const;

export function isValidMediaType(mimeType: string): boolean {
  return MEDIA_VALIDATION.ALLOWED_TYPES.includes(mimeType as typeof MEDIA_VALIDATION.ALLOWED_TYPES[number]);
}

export function isValidMediaSize(sizeBytes: number): boolean {
  return sizeBytes <= MEDIA_VALIDATION.MAX_SIZE;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ============================================================================
// Media URL Helpers
// ============================================================================

export function getMediaUrl(storagePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return '';
  return `${supabaseUrl}/storage/v1/object/public/media-library/${storagePath}`;
}

export function getMediaThumbnailUrl(storagePath: string, width = 200): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return '';
  // Supabase image transformation
  return `${supabaseUrl}/storage/v1/render/image/public/media-library/${storagePath}?width=${width}&resize=contain`;
}

// ============================================================================
// Folder Presets
// ============================================================================

export const MEDIA_FOLDERS = [
  { value: 'general', label: 'General' },
  { value: 'pages', label: 'Page Builder' },
  { value: 'products', label: 'Products' },
  { value: 'heroes', label: 'Hero Images' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'blog', label: 'Blog' },
] as const;

export type MediaFolder = typeof MEDIA_FOLDERS[number]['value'];
