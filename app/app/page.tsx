import HomePageClient from '@/components/home/HomePageClient';
const homeDescription = 'Explore Abe Reyes’s React interfaces, JavaScript APIs, and hands-on technical work through a live page check and selected projects.';

export const metadata = {
  title: 'Abe Reyes | Full-stack development and technical support',
  description: homeDescription,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Abe Reyes | Full-stack development and technical support',
    description: homeDescription,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Abe Reyes | Full-stack development and technical support',
    description: homeDescription,
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
