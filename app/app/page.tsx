// ============================================================================
// Home Page - The Landing Page
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-20 text-center">
        {/* Main Heading - Responsive typography */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
          {templateConfig.project.name}
        </h1>

        {/* Subtitle - Responsive typography */}
        <p className="text-base sm:text-lg md:text-xl text-gray-900 mb-6 sm:mb-8 px-2">
          {templateConfig.project.description}
        </p>

        {/* Feature Grid - Responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 my-8 sm:my-12">
          {templateConfig.features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        {/* System Status */}
        <div className="my-8 sm:my-12">
          <HealthStatus />
        </div>

        {/* Call to Action - Responsive spacing and button */}
        <div className="mt-8 sm:mt-12">
          <p className="text-base sm:text-lg text-gray-900 mb-4 sm:mb-6 px-2">
            Ready to build something amazing? Check out the README for setup instructions.
          </p>
          <Button href={templateConfig.project.repositoryUrl}>
            View on GitHub
          </Button>
        </div>

        {/* Quick Links - Responsive layout */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-300">
          <p className="text-sm sm:text-base text-gray-900 mb-3 sm:mb-4">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm sm:text-base">
            <a href="/api/health" className="text-blue-600 hover:text-blue-700 hover:underline">
              Health Check
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
              Documentation
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
              API Reference
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
