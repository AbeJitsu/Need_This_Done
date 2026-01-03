'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { getPuckFullColors, puckAspectMap } from '@/lib/puck-utils';
import { cardBgColors } from '@/lib/colors';

// ============================================================================
// Video Embed Component - Rich Media Display
// ============================================================================
// What: Responsive YouTube/Vimeo embed with lazy loading and thumbnail preview
// Why: Video content increases engagement by 80% and time on page
// How: Parses video URLs to extract IDs, renders optimized iframe embeds
// DRY: Uses getPuckFullColors() from puck-utils for consistent color handling

interface VideoEmbedComponentProps {
  url: string;
  title?: string;
  caption?: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
  autoPlay: 'yes' | 'no';
  showControls: 'yes' | 'no';
  thumbnailMode: 'yes' | 'no';
  accentColor: string;
}

// ============================================================================
// URL Parsing Utilities
// ============================================================================

type VideoProvider = 'youtube' | 'vimeo' | 'unknown';

interface VideoInfo {
  provider: VideoProvider;
  id: string | null;
  thumbnail: string | null;
}

function parseVideoUrl(url: string): VideoInfo {
  if (!url) return { provider: 'unknown', id: null, thumbnail: null };

  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      const id = match[1];
      return {
        provider: 'youtube',
        id,
        thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      };
    }
  }

  // Vimeo patterns
  const vimeoPattern = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch) {
    return {
      provider: 'vimeo',
      id: vimeoMatch[1],
      thumbnail: null, // Vimeo requires API call for thumbnail
    };
  }

  return { provider: 'unknown', id: null, thumbnail: null };
}

function getEmbedUrl(info: VideoInfo, autoPlay: boolean, showControls: boolean): string {
  if (!info.id) return '';

  if (info.provider === 'youtube') {
    const params = new URLSearchParams({
      rel: '0', // Don't show related videos
      modestbranding: '1', // Minimal YouTube branding
      autoplay: autoPlay ? '1' : '0',
      controls: showControls ? '1' : '0',
    });
    return `https://www.youtube.com/embed/${info.id}?${params.toString()}`;
  }

  if (info.provider === 'vimeo') {
    const params = new URLSearchParams({
      autoplay: autoPlay ? '1' : '0',
      controls: showControls ? '1' : '0',
      title: '0',
      byline: '0',
      portrait: '0',
    });
    return `https://player.vimeo.com/video/${info.id}?${params.toString()}`;
  }

  return '';
}

// ============================================================================
// Main Component
// ============================================================================

export default function VideoEmbedComponent({
  url,
  title,
  caption,
  aspectRatio,
  autoPlay,
  showControls,
  thumbnailMode,
  accentColor,
}: VideoEmbedComponentProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay === 'yes');
  const showThumbnail = thumbnailMode === 'yes' && !isPlaying;

  const videoInfo = useMemo(() => parseVideoUrl(url), [url]);
  const embedUrl = useMemo(
    () => getEmbedUrl(videoInfo, isPlaying, showControls === 'yes'),
    [videoInfo, isPlaying, showControls]
  );

  // Get colors from centralized utility
  const colors = getPuckFullColors(accentColor);

  // Aspect ratio classes - extended version for video-specific ratios
  const aspectClasses: Record<string, string> = {
    '16:9': 'aspect-video',
    '4:3': puckAspectMap.landscape,
    '1:1': puckAspectMap.square,
    '9:16': 'aspect-[9/16] max-w-sm mx-auto',
  };

  // Empty/invalid state
  if (!url || videoInfo.provider === 'unknown') {
    return (
      <div className={`${aspectClasses[aspectRatio]} ${cardBgColors.elevated} rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600`}>
        <svg
          className="w-16 h-16 text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {url ? 'Invalid video URL' : 'Add a YouTube or Vimeo URL'}
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
          Supported: YouTube, Vimeo
        </p>
      </div>
    );
  }

  return (
    <figure className="w-full">
      {/* Video container */}
      <div className={`relative ${aspectClasses[aspectRatio]} rounded-xl overflow-hidden bg-black shadow-lg`}>
        {showThumbnail && videoInfo.thumbnail ? (
          // Thumbnail with play button
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 group cursor-pointer"
            aria-label={`Play ${title || 'video'}`}
          >
            <Image
              src={videoInfo.thumbnail}
              alt={title || 'Video thumbnail'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            {/* Play button - uses centralized button colors */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-20 h-20 rounded-full ${colors.buttonBg} flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110`}
              >
                <svg
                  className="w-8 h-8 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </button>
        ) : (
          // Video iframe
          <iframe
            src={embedUrl}
            title={title || 'Embedded video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            loading="lazy"
          />
        )}
      </div>

      {/* Caption */}
      {caption && (
        <figcaption className="mt-3 text-sm text-center text-gray-500 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
