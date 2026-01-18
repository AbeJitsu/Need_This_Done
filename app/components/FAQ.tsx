'use client';

import { useState } from 'react';
import { neutralAccentBg, cardBgColors, cardBorderColors, headingColors, formInputColors } from '@/lib/colors';

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
      'Free tier: Perfect for testing and learning. You pay $0. Small project: ~$5-15/month. Popular project: $25-50/month. It scales with your actual usage, so you don\'t pay for capacity you don\'t use. For comparison, building this infrastructure from scratch typically requires months of specialized development work, which represents a significant investment. With this template, that foundation is already handled.',
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
    id: 'interception',
    question: 'Could someone intercept my users\' passwords?',
    answer:
      'No. When your users log in, their password travels in a locked tunnel (HTTPS) that only your server can open. Even if someone is on the same WiFi network (like at a coffee shop), they can\'t see the password. It\'s like sending a letter in a locked box instead of a postcard.',
  },
  {
    id: 'breach',
    question: 'What if someone hacks your servers?',
    answer:
      'Even then, your users\' passwords are safe. Passwords are scrambled one-way (called "hashing") so they can\'t be un-scrambled, even by us. A hacker would get gibberish, not passwords. So even if they stole the entire database, they couldn\'t log in or access accounts.',
  },
  {
    id: 'session',
    question: 'How do you keep users logged in securely?',
    answer:
      'Instead of sending the password with every request, users get a secure "proof of login" (session). It\'s like a ticket stub at an event - it proves you checked in. Sessions expire automatically, so if someone steals it, it becomes worthless after a while. Your users\' passwords never travel more than once.',
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
    <div className={`${cardBgColors.base} p-6 rounded-xl ${cardBorderColors.light} shadow-sm`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-xl font-semibold ${headingColors.primary} mb-2`}>
          Common Questions
        </h2>
        <p className={`text-sm ${formInputColors.helper}`}>
          Got concerns? We probably expected them. Here are honest answers.
        </p>
      </div>

      {/* FAQ Items */}
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className={`${cardBorderColors.light} rounded-lg overflow-hidden`}
          >
            {/* Question Button */}
            <button
              onClick={() => toggleOpen(faq.id)}
              {...{ 'aria-expanded': openId === faq.id }}
              aria-controls={`faq-answer-${faq.id}`}
              className={`
                w-full p-4
                ${neutralAccentBg.gray}
                hover:bg-gray-200 dark:hover:bg-gray-600
                text-left
                font-medium ${headingColors.primary}
                transition-colors
                flex items-center justify-between
              `}
            >
              <span>{faq.question}</span>
              <span
                className={`
                  text-lg text-gray-500 dark:text-gray-400
                  transition-transform duration-200
                  ${openId === faq.id ? 'rotate-180' : ''}
                `}
                aria-hidden="true"
              >
                ▼
              </span>
            </button>

            {/* Answer */}
            {openId === faq.id && (
              <div id={`faq-answer-${faq.id}`} className={`p-4 ${cardBgColors.base} border-t border-gray-400 dark:border-gray-700`}>
                <p className={`${formInputColors.helper} text-sm leading-relaxed`}>
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-400 dark:border-gray-700">
        <p className={`text-xs ${formInputColors.helper}`}>
          Still have questions? The best way to learn is to try it. Clone this template, explore the code,
          and build something. You'll understand how it all works faster than reading explanations.
        </p>
      </div>
    </div>
  );
}
