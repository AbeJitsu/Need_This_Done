// ============================================================================
// FeatureCard Component
// ============================================================================
// Reusable component for displaying feature information in a card layout
// Shows emoji icon, title, and description with responsive styling
// Includes hover effects for better interactivity

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition">
      <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
        {icon} {title}
      </h2>
      <p className="text-sm sm:text-base text-gray-800">{description}</p>
    </div>
  );
}
