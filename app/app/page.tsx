// ============================================================================
// Home Page - Premium, Minimal, Desktop-Optimized
// ============================================================================
// This is what visitors see when they go to your root URL (/)
// Optimized for desktop viewing - everything fits without scrolling
// Includes dark mode support with manual toggle button
// Focused content: features, health status, minimal footer links

// Force dynamic rendering because this page uses client-side authentication context
// Without this, Next.js would try to statically generate the page at build time,
// which fails because useAuth() can only work on the client or at request time
export const dynamic = 'force-dynamic';

import HealthStatus from '@/components/HealthStatus';
import FeatureCard from '@/components/FeatureCard';
import SpeedDemo from '@/components/SpeedDemo';
import AuthDemo from '@/components/AuthDemo';
import DatabaseDemo from '@/components/DatabaseDemo';
import WhatCanYouBuild from '@/components/WhatCanYouBuild';
import HowItWorks from '@/components/HowItWorks';
import FAQ from '@/components/FAQ';
import { templateConfig } from '@/config/template.config';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {/* ===================================================================
        Intro Section - Description & Purpose
        =================================================================== */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {templateConfig.project.description}
          </p>
        </div>

        {/* ===================================================================
        Feature Grid - 4 Cards, 2x2 Layout for Desktop Fit
        =================================================================== */}
        {/* Plain language features with metrics to build trust */}
        <div className="mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {templateConfig.features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                benefit={feature.benefit}
                metric={feature.metric}
                variant={index === 0 ? 'primary' : 'default'}
              />
            ))}
          </div>
        </div>

        {/* ===================================================================
        System Health Status - Real-time Service Monitoring
        =================================================================== */}
        <div className="mb-8">
          <HealthStatus />
        </div>

        {/* ===================================================================
        Interactive Demos - See Everything Working
        =================================================================== */}
        <div className="mb-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Watch It Work
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Everything below is working right now. Try it yourself—no account needed.
            </p>
          </div>

          {/* Speed Demo */}
          <div className="mb-8">
            <SpeedDemo />
          </div>

          {/* Authentication Demo */}
          <div className="mb-8">
            <AuthDemo />
          </div>

          {/* Database Demo */}
          <div className="mb-8">
            <DatabaseDemo />
          </div>
        </div>

        {/* ===================================================================
        What You Can Build - Project Examples
        =================================================================== */}
        <div className="mb-8">
          <WhatCanYouBuild />
        </div>

        {/* ===================================================================
        How It Works - Visual Architecture
        =================================================================== */}
        <div className="mb-8">
          <HowItWorks />
        </div>

        {/* ===================================================================
        FAQ - Common Questions Answered
        =================================================================== */}
        <div className="mb-8">
          <FAQ />
        </div>

        {/* ===================================================================
        Footer - Benefits Summary
        =================================================================== */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            <p className="mb-2">
              Instant pages • Secure storage • User accounts • Deploy anywhere
            </p>
            <p className="text-xs">
              Built with industry-standard tools: Next.js, Tailwind CSS, Redis, Supabase, and Docker
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
