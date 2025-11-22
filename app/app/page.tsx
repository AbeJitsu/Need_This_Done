// ============================================================================
// Home Page - Premium, Minimal, Desktop-Optimized
// ============================================================================
// This is what visitors see when they go to your root URL (/)
// Optimized for desktop viewing - everything fits without scrolling
// Includes dark mode support with manual toggle button
// Focused content: features, health status, minimal footer links

import HealthStatus from '@/components/HealthStatus';
import FeatureCard from '@/components/FeatureCard';
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
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Why Choose Us
          </h2>

          {/* Premium Principle: Most cards grayscale, ONE primary accent */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* First card features primary (blue) accent */}
            <FeatureCard
              icon="🚀"
              title="Lightning Fast"
              description="Deploy and scale with production-ready infrastructure. Experience zero-to-hero in minutes."
              variant="primary"
            />

            {/* Rest are default (grayscale) for professional balance */}
            <FeatureCard
              icon="🔒"
              title="Secure by Default"
              description="Enterprise-grade security, HTTPS, secure sessions, and production-ready headers built-in."
              variant="default"
            />

            <FeatureCard
              icon="📦"
              title="Complete Stack"
              description="Everything you need included: database, caching, auth, deployment. No surprises."
              variant="default"
            />

            <FeatureCard
              icon="🐳"
              title="Fully Dockerized"
              description="Runs identically on your laptop and in production. Consistency across all environments."
              variant="default"
            />
          </div>
        </div>

        {/* ===================================================================
        System Health Status - Real-time Service Monitoring
        =================================================================== */}
        <div className="mb-8">
          <HealthStatus />
        </div>

        {/* ===================================================================
        Footer Links - Professional, Minimal
        =================================================================== */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-wrap justify-center gap-4 text-sm mb-4">
            <a href="#docs" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
              Documentation
            </a>
            <a href="#api" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
              API Reference
            </a>
            <a href="#support" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
              Support
            </a>
            <a href={templateConfig.project.repositoryUrl} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
              GitHub
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            <p>
              Built with Next.js, Tailwind CSS, Redis, and Supabase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
