import FeatureCard from '@/components/FeatureCard';

export const metadata = {
  title: 'Features',
  description: 'Explore the features of this full-stack template',
};

export default function FeaturesPage() {
  const features = [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Redis caching ensures 10-20x faster responses',
      variant: 'primary' as const,
      metric: 'Up to 10x faster',
    },
    {
      icon: '🔒',
      title: 'Secure Authentication',
      description: 'Real authentication with Supabase and password hashing',
      variant: 'primary' as const,
      metric: 'Enterprise-grade',
    },
    {
      icon: '💾',
      title: 'Real Database',
      description: 'Persistent data storage with Supabase',
      variant: 'success' as const,
      metric: '100% Reliable',
    },
    {
      icon: '🌙',
      title: 'Dark Mode',
      description: 'Full dark mode support with smooth transitions',
      variant: 'success' as const,
      metric: 'User Friendly',
    },
    {
      icon: '♿',
      title: 'Accessible',
      description: 'WCAG AA compliant for all users',
      variant: 'success' as const,
      metric: 'Inclusive Design',
    },
    {
      icon: '📱',
      title: 'Responsive',
      description: 'Works perfectly on all devices and screen sizes',
      variant: 'success' as const,
      metric: 'Mobile First',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-12 text-center">
          Features
        </h1>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              variant={feature.variant}
              metric={feature.metric}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
