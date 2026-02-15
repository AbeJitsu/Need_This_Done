import { Metadata } from 'next';
import ProductListingPage from '@/components/shop/ProductListingPage';

// ============================================================================
// Shop Page - Product Listing with Search & Filtering
// ============================================================================
// What: Displays all products with search and price filtering
// Why: Lets customers browse and discover products
// How: Server component with client-side search and filtering

export const metadata: Metadata = {
  title: 'Shop - NeedThisDone',
  description: 'Browse web development packages, add-ons, and professional services. Find the right solution for your project.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'Shop - NeedThisDone',
    description: 'Browse web development packages, add-ons, and professional services.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop - NeedThisDone',
    description: 'Browse web development packages, add-ons, and professional services.',
  },
};

export default function ShopPage() {
  return <ProductListingPage />;
}
