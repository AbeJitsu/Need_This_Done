'use client';

import { useState } from 'react';
import {
  AccentColor,
  titleColors,
  accentColors,
  formInputColors,
  mutedTextColors,
  alertColors,
  selectedStateColors,
} from '@/lib/colors';

// ============================================================================
// QuizBlock Component
// ============================================================================
// What: Interactive quiz component for LMS courses
// Why: Enables knowledge testing and engagement in courses
// How: Multiple choice questions with immediate feedback and scoring
//
// Features:
// - Multiple choice questions with A/B/C/D options
// - Immediate feedback on answer submission
// - Progress indicator (question X of Y)
// - Final score display at completion
// - Retry functionality

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation?: string;
}

export interface QuizBlockProps {
  title: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
  color?: AccentColor;
}

type QuizState = 'answering' | 'submitted' | 'completed';

export default function QuizBlock({
  title,
  questions,
  onComplete,
  color = 'blue',
}: QuizBlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<QuizState>('answering');
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  const optionLabels = ['A', 'B', 'C', 'D'];

  const handleSelectAnswer = (index: number) => {
    if (quizState !== 'answering') return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedAnswer;
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setQuizState('submitted');
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setQuizState('completed');
      onComplete?.(score + (isCorrect ? 1 : 0), questions.length);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setQuizState('answering');
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setQuizState('answering');
    setScore(0);
    setAnswers(new Array(questions.length).fill(null));
  };

  // Completed state - show final score
  if (quizState === 'completed') {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className={`text-xl font-bold mb-6 ${titleColors[color]}`}>{title}</h2>

        <div className="text-center py-8">
          <div
            className={`text-6xl font-bold mb-4 ${
              passed ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
            }`}
          >
            {percentage}%
          </div>
          <p className={`text-lg mb-2 ${formInputColors.helper}`}>
            You got {finalScore} out of {questions.length} correct
          </p>
          <p
            className={`text-lg font-medium ${
              passed ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
            }`}
          >
            {passed ? '🎉 Great job!' : 'Keep practicing!'}
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={handleRetry}
            className={`px-6 py-2 rounded-lg font-medium ${accentColors[color].bg} text-white hover:opacity-90 transition-colors`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${titleColors[color]}`}>{title}</h2>
        <span className={`text-sm ${mutedTextColors.light}`}>
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {currentQuestion.question}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === currentQuestion.correctAnswer;
            const showCorrect = quizState === 'submitted' && isCorrectAnswer;
            const showIncorrect = quizState === 'submitted' && isSelected && !isCorrectAnswer;

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectAnswer(index)}
                disabled={quizState === 'submitted'}
                aria-pressed={isSelected}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${quizState === 'submitted' ? 'cursor-default' : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'}
                  ${isSelected && quizState === 'answering'
                    ? `${selectedStateColors[color].border} ${selectedStateColors[color].bg}`
                    : 'border-gray-200 dark:border-gray-700'
                  }
                  ${showCorrect ? `${alertColors.success.border} ${alertColors.success.bg}` : ''}
                  ${showIncorrect ? `${alertColors.error.border} ${alertColors.error.bg}` : ''}
                `}
              >
                <span className="font-medium mr-2">{optionLabels[index]}.</span>
                {option}
                {showCorrect && <span className="ml-2">✓</span>}
                {showIncorrect && <span className="ml-2">✗</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {quizState === 'submitted' && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            isCorrect ? alertColors.success.bg : alertColors.error.bg
          }`}
        >
          <p
            className={`font-medium ${
              isCorrect ? alertColors.success.text : alertColors.error.text
            }`}
          >
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          {currentQuestion.explanation && (
            <p className={`mt-2 text-sm ${mutedTextColors.light}`}>
              {currentQuestion.explanation}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {quizState === 'answering' && selectedAnswer !== null && (
          <button
            type="button"
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-lg font-medium ${accentColors[color].bg} text-white hover:opacity-90 transition-colors`}
          >
            Submit Answer
          </button>
        )}
        {quizState === 'submitted' && (
          <button
            type="button"
            onClick={handleNext}
            className={`px-6 py-2 rounded-lg font-medium ${accentColors[color].bg} text-white hover:opacity-90 transition-colors`}
          >
            {isLastQuestion ? 'See Results' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
}
