'use client';

import { useState } from 'react';
import {
  AccentColor,
  titleColors,
  accentColors,
  formInputColors,
  mutedTextColors,
} from '@/lib/colors';
import { sanitizeHtml } from '@/lib/sanitize-html';

// ============================================================================
// LessonPlayer Component
// ============================================================================
// What: Displays lesson video and content for LMS courses
// Why: Core component for consuming course content
// How: Shows video player, content, navigation, and completion tracking
//
// Features:
// - Video player with placeholder for video URL
// - Lesson title and rich content display
// - Previous/Next navigation
// - Mark as complete functionality
// - Progress indicator (lesson X of Y)

export interface LessonPlayerProps {
  // Lesson details
  title: string;
  content: string;           // HTML or markdown content
  videoUrl?: string;         // Video URL (optional - can be content-only lesson)

  // Navigation
  currentLesson: number;     // 1-indexed
  totalLessons: number;
  onPrevious?: () => void;
  onNext?: () => void;

  // Completion
  isCompleted?: boolean;
  onMarkComplete?: () => void;

  // Styling
  color?: AccentColor;
}

export default function LessonPlayer({
  title,
  content,
  videoUrl,
  currentLesson,
  totalLessons,
  onPrevious,
  onNext,
  isCompleted = false,
  onMarkComplete,
  color = 'blue',
}: LessonPlayerProps) {
  const [completed, setCompleted] = useState(isCompleted);

  const isFirstLesson = currentLesson <= 1;
  const isLastLesson = currentLesson >= totalLessons;

  const handleMarkComplete = () => {
    setCompleted(true);
    onMarkComplete?.();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Video Player */}
      <div
        data-testid="video-player"
        className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6"
      >
        {videoUrl ? (
          <iframe
            src={videoUrl}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
              <p className="text-gray-500">Video content coming soon</p>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${mutedTextColors.light}`}>
            Lesson {currentLesson} of {totalLessons}
          </span>
          {completed && (
            <span className={`text-sm font-medium ${accentColors[color].text}`}>
              ✓ Completed
            </span>
          )}
        </div>
        <h1 className={`text-2xl font-bold ${titleColors[color]}`}>{title}</h1>
      </div>

      {/* Lesson Content */}
      <div
        className={`prose dark:ppurple-invert max-w-none mb-8 ${formInputColors.helper}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        {/* Navigation */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={isFirstLesson}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${isFirstLesson
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : `bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`
              }
            `}
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={isLastLesson}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${isLastLesson
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : `bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`
              }
            `}
          >
            Next →
          </button>
        </div>

        {/* Mark Complete */}
        {!completed && (
          <button
            type="button"
            onClick={handleMarkComplete}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors
              ${accentColors[color].bg} text-white
              hover:opacity-90
            `}
          >
            Mark as Complete
          </button>
        )}
        {completed && (
          <span className={`px-6 py-2 rounded-lg font-medium ${accentColors[color].bg} text-white opacity-75`}>
            ✓ Lesson Complete
          </span>
        )}
      </div>
    </div>
  );
}
