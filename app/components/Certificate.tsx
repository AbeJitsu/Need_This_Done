import { AccentColor, titleColors, accentColors, mutedTextColors } from '@/lib/colors';

// ============================================================================
// Certificate Component
// ============================================================================
// What: Displays a course completion certificate
// Why: Provides tangible recognition of student achievement
// How: Printable certificate with course, student, and instructor details
//
// Features:
// - Professional certificate layout
// - Course and student information
// - Completion date and certificate ID
// - Print-friendly styling
// - Customizable accent color

export interface CertificateProps {
  // Course details
  courseName: string;
  courseDescription?: string;

  // Student details
  studentName: string;

  // Completion details
  completionDate: Date | string;
  certificateId: string;

  // Instructor
  instructorName: string;

  // Styling
  color?: AccentColor;
}

export default function Certificate({
  courseName,
  courseDescription,
  studentName,
  completionDate,
  certificateId,
  instructorName,
  color = 'blue',
}: CertificateProps) {
  // Format the date
  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      data-testid="certificate"
      className="bg-white dark:bg-gray-800 border-8 border-double border-gray-300 dark:border-gray-600 p-8 md:p-12 max-w-3xl mx-auto print:border-gray-400"
    >
      {/* Decorative top border */}
      <div className={`h-2 ${accentColors[color].bg} -mx-8 md:-mx-12 -mt-8 md:-mt-12 mb-8`} />

      {/* Certificate Header */}
      <div className="text-center mb-8">
        <p className={`text-sm uppercase tracking-widest ${mutedTextColors.light} mb-2`}>
          Certificate of Completion
        </p>
        <div className={`w-16 h-0.5 ${accentColors[color].bg} mx-auto`} />
      </div>

      {/* This certifies */}
      <div className="text-center mb-6">
        <p className={`${mutedTextColors.light} mb-4`}>
          This is to certify that
        </p>
        <h2 className={`text-3xl md:text-4xl font-serif font-bold ${titleColors[color]} mb-4`}>
          {studentName}
        </h2>
        <p className={mutedTextColors.light}>
          has successfully completed the course
        </p>
      </div>

      {/* Course Name */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {courseName}
        </h1>
        {courseDescription && (
          <p className={`text-sm ${mutedTextColors.light} max-w-md mx-auto`}>
            {courseDescription}
          </p>
        )}
      </div>

      {/* Date and Signature Row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        {/* Date */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {formattedDate}
          </p>
          <p className={`text-sm ${mutedTextColors.light}`}>Date Awarded</p>
        </div>

        {/* Seal/Logo placeholder */}
        <div className={`w-20 h-20 rounded-full border-4 ${accentColors[color].border} flex items-center justify-center`}>
          <svg
            className={`w-10 h-10 ${accentColors[color].text}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>

        {/* Instructor Signature */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 font-serif italic">
            {instructorName}
          </p>
          <p className={`text-sm ${mutedTextColors.light}`}>Instructor</p>
        </div>
      </div>

      {/* Certificate ID */}
      <div className="text-center mt-8 pt-4">
        <p className={`text-xs ${mutedTextColors.light}`}>
          Certificate ID: {certificateId}
        </p>
      </div>

      {/* Decorative bottom border */}
      <div className={`h-2 ${accentColors[color].bg} -mx-8 md:-mx-12 -mb-8 md:-mb-12 mt-8`} />
    </div>
  );
}
