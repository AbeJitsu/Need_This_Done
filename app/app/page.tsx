// ============================================================================
// Home Page - Premium Full-Stack Template
// ============================================================================
// This is what visitors see when they go to your root URL (/)
// This is your starting point - replace this with your actual UI
//
// Think of it as the front dining area of your restaurant
// This is where people get their first impression

import HealthStatus from '@/components/HealthStatus';
import FeatureCard from '@/components/FeatureCard';
import Button from '@/components/Button';
import { templateConfig } from '@/config/template.config';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        {/* ===================================================================
        Hero Section - Brand Identity & CTA
        =================================================================== */}
        <div className="text-center mb-16">
          {/* Main Heading - Responsive typography, dark gray for authority */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            {templateConfig.project.name}
          </h1>

          {/* Subtitle - Secondary text color, readable size */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {templateConfig.project.description}
          </p>

          {/* CTA Buttons - Primary blue action, secondary gray alternative */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href="#get-started">
              Get Started
            </Button>
            <Button variant="secondary" size="lg" href="#learn-more">
              Learn More
            </Button>
          </div>
        </div>

        {/* ===================================================================
        Feature Grid - Professional card layout with subtle accents
        =================================================================== */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Why Choose Us
          </h2>

          {/* Premium Principle: Most cards grayscale, ONE primary accent */}
          <div className="grid md:grid-cols-3 gap-6">
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

            <FeatureCard
              icon="📊"
              title="Built-in Health Checks"
              description="Real-time service monitoring with automatic status reporting. Know your system's health instantly."
              variant="default"
            />

            <FeatureCard
              icon="⚡"
              title="Ready to Customize"
              description="Fork this template and customize it with simple environment variables. No code changes needed."
              variant="default"
            />
          </div>
        </div>

        {/* ===================================================================
        System Health Status - Real-time service monitoring
        =================================================================== */}
        <div className="mb-16">
          <HealthStatus />
        </div>

        {/* ===================================================================
        Secondary CTA Section - Premium card layout
        =================================================================== */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Build?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Start your next project with a fully-configured, production-ready full-stack template.
            Deploy in minutes, not days.
          </p>

          {/* Multiple button sizes: primary for main CTA, secondary/ghost for alternatives */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href={templateConfig.project.repositoryUrl}>
              View on GitHub
            </Button>
            <Button variant="ghost" size="lg" href="#docs">
              Read Documentation
            </Button>
          </div>
        </div>

        {/* ===================================================================
        Footer Links - Professional, minimal styling
        =================================================================== */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
            <a href="/api/health" className="text-gray-600 hover:text-blue-600 transition">
              Health Check API
            </a>
            <a href="#docs" className="text-gray-600 hover:text-blue-600 transition">
              Documentation
            </a>
            <a href="#api" className="text-gray-600 hover:text-blue-600 transition">
              API Reference
            </a>
            <a href="#support" className="text-gray-600 hover:text-blue-600 transition">
              Support
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs text-gray-500">
            <p>
              Built with Next.js, Tailwind CSS, Redis, and Supabase
              <span className="mx-2">•</span>
              {templateConfig.project.repositoryUrl && (
                <a
                  href={templateConfig.project.repositoryUrl}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Open Source
                </a>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
