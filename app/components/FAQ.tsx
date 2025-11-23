'use client';

import { useState } from 'react';

// ============================================================================
// FAQ Component - Common Questions Answered
// ============================================================================
// Addresses common concerns and questions from non-technical users.
// Builds confidence that the setup is complete and ready to use.

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: 'coding',
    question: 'Do I need to know how to code?',
    answer:
      'You need basic coding skills to customize this template for your specific idea. But the hard parts (authentication, database, security) are already done. You\'re building on a solid foundation, not starting from scratch. Think of it like: you need to know how to design a room, but someone already built the house.',
  },
  {
    id: 'cost',
    question: 'How much does it cost to run?',
    answer:
      'Free tier: Perfect for testing and learning. You pay $0. Small project: ~$5-15/month. Popular project: $25-50/month. It scales with your actual usage, so you don\'t pay for capacity you don\'t use. Compare that to a developer building this from scratch: $50K+ in salary.',
  },
  {
    id: 'users',
    question: 'Can this handle lots of users?',
    answer:
      'Yes. The caching system means you can handle thousands of simultaneous users. The database automatically scales. If you get popular and hit limits, you upgrade your plan, not rewrite your code. This is built with growth in mind.',
  },
  {
    id: 'time',
    question: 'How long until I can launch?',
    answer:
      'If your idea is simple (blog, portfolio): 2-4 hours. Medium complexity (store, community): 1-2 weeks. Complex: 3-4 weeks. Compare that to building from scratch: 2-6 months. You\'re saving weeks or months of infrastructure work.',
  },
  {
    id: 'data',
    question: 'Is my data actually safe?',
    answer:
      'Yes. Data is encrypted, backed up automatically, and protected with industry-standard security. No credit cards or passwords are stored by us - we use trusted, specialized services (Supabase) for that. Security is taken seriously.',
  },
  {
    id: 'unique',
    question: 'Will my project look like everyone else\'s?',
    answer:
      'No. This is just the foundation. Everything visible to your users (design, features, content) is yours to customize. The template just handles the boring backend stuff. It\'s like having a recipe - yours turns into a unique dish.',
  },
  {
    id: 'modify',
    question: 'Can I modify or remove parts of this?',
    answer:
      'Absolutely. Everything is open and yours to change. Don\'t need user accounts? Remove that code. Want different colors? Change them. Think of this as a starting point, not a prison.',
  },
  {
    id: 'support',
    question: 'What if something breaks?',
    answer:
      'Documentation is built into this template (you\'re reading it right now). The code is well-commented so you understand what\'s happening. If you get stuck, the components are standard - you can search for help online or hire a developer to help.',
  },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleOpen = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Common Questions
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Got concerns? We probably expected them. Here are honest answers.
        </p>
      </div>

      {/* FAQ Items */}
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {/* Question Button */}
            <button
              onClick={() => toggleOpen(faq.id)}
              className="
                w-full p-4
                bg-gray-50 dark:bg-gray-800
                hover:bg-gray-100 dark:hover:bg-gray-700
                text-left
                font-medium text-gray-900 dark:text-gray-100
                transition-colors
                flex items-center justify-between
              "
            >
              <span>{faq.question}</span>
              <span
                className={`
                  text-lg text-gray-500 dark:text-gray-400
                  transition-transform duration-200
                  ${openId === faq.id ? 'rotate-180' : ''}
                `}
              >
                ▼
              </span>
            </button>

            {/* Answer */}
            {openId === faq.id && (
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Still have questions? The best way to learn is to try it. Clone this template, explore the code,
          and build something. You'll understand how it all works faster than reading explanations.
        </p>
      </div>
    </div>
  );
}
