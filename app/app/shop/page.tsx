import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import Button from '@/components/Button';
import { medusaClient, type Product } from '@/lib/medusa-client';
import {
  headingColors,
  formInputColors,
  accentColors,
  cardBgColors,
  cardBorderColors,
} from '@/lib/colors';

// ============================================================================
// Shop Page - Clean Product Catalog
// ============================================================================
// Redesigned with editorial aesthetic:
// - Two sections: Packages and Add-ons
// - Bulleted list format (no image cards)
// - Clear pricing hierarchy
// - Links to /build configurator

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing - NeedThisDone',
  description: 'Website packages starting at $500. Choose a package or build your own with add-ons.',
};

// ============================================================================
// Data Fetching
// ============================================================================

async function getProducts(): Promise<Product[]> {
  const maxRetries = 3;
  const baseDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await medusaClient.products.list();
      const products: Product[] = Array.isArray(result) ? result : result.products;

      if (products.length > 0) {
        return products.sort((a, b) => {
          const priceA = a.variants?.[0]?.calculated_price?.calculated_amount ?? a.variants?.[0]?.prices?.[0]?.amount ?? 0;
          const priceB = b.variants?.[0]?.calculated_price?.calculated_amount ?? b.variants?.[0]?.prices?.[0]?.amount ?? 0;
          return priceA - priceB;
        });
      }

      if (attempt === maxRetries) return [];
      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt - 1)));
    } catch {
      if (attempt === maxRetries) return [];
      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt - 1)));
    }
  }
  return [];
}

// ============================================================================
// Helper to categorize products
// ============================================================================

function categorizeProducts(products: Product[]) {
  const packages: Product[] = [];
  const addons: Product[] = [];

  for (const product of products) {
    const handle = product.handle?.toLowerCase() || '';
    if (handle.includes('launch') || handle.includes('growth')) {
      packages.push(product);
    } else {
      addons.push(product);
    }
  }

  // Sort packages by price (Launch first, then Growth)
  packages.sort((a, b) => {
    const priceA = a.variants?.[0]?.calculated_price?.calculated_amount ?? a.variants?.[0]?.prices?.[0]?.amount ?? 0;
    const priceB = b.variants?.[0]?.calculated_price?.calculated_amount ?? b.variants?.[0]?.prices?.[0]?.amount ?? 0;
    return priceA - priceB;
  });

  return { packages, addons };
}

// ============================================================================
// Price formatter
// ============================================================================

function formatPrice(product: Product): string {
  const variant = product.variants?.[0];
  const price = variant?.calculated_price?.calculated_amount ?? variant?.prices?.[0]?.amount ?? 0;
  return `$${(price / 100).toLocaleString()}`;
}

// ============================================================================
// Package features (hardcoded for now, could come from metadata)
// ============================================================================

const packageFeatures: Record<string, string[]> = {
  'launch-site': [
    '3-5 pages',
    'Custom design',
    'Mobile responsive',
    'Contact form',
    'Basic SEO',
    '30 days support',
  ],
  'growth-site': [
    '5-8 pages',
    'Everything in Launch',
    'Blog with CMS',
    'Content editing',
    'Enhanced SEO',
    '60 days support',
  ],
};

// ============================================================================
// Page Component
// ============================================================================

export default async function ShopPage() {
  const products = await getProducts();
  const { packages, addons } = categorizeProducts(products);

  return (
    <div className="min-h-screen">
      {/* ================================================================
          Hero Section - Centered gradient like homepage
          ================================================================ */}
      <section className="py-16 md:py-20">
        {/* Gradient container: full-width on mobile, centered on desktop */}
        <div className="relative overflow-hidden py-8 md:max-w-4xl md:mx-auto">
          {/* Gradient orbs - left color → white middle → right color */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-purple-100 to-violet-100 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-100 to-cyan-100 blur-2xl" />

          {/* Content - always has padding */}
          <div className="relative z-10 px-4 sm:px-6 md:px-8">
            {/* Header */}
            <div className="text-center mb-0 animate-slide-up">
              <h1 className={`text-4xl md:text-5xl font-bold italic ${headingColors.primary} mb-4`}>
                Simple Pricing
              </h1>
              <p className={`text-xl ${formInputColors.helper} max-w-2xl mx-auto`}>
                Pick a package or build exactly what you need. No hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Main Content Section - White background
          ================================================================ */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Packages Section */}
          <div className="mb-16 animate-slide-up animate-delay-100">
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${formInputColors.helper} mb-6`}>
              Packages
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {packages.map((pkg, index) => {
                const features = packageFeatures[pkg.handle] || [];
                const isGrowth = pkg.handle?.includes('growth');
                const color = isGrowth ? 'blue' : 'green';

                return (
                  <div
                    key={pkg.id}
                    className={`
                      relative ${cardBgColors.base} rounded-2xl border ${cardBorderColors.subtle}
                      p-8 transition-all hover:shadow-lg
                      ${isGrowth ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
                      animate-slide-up animate-delay-${(index + 1) * 100}
                    `}
                  >
                    {isGrowth && (
                      <div className="absolute -top-3 left-6">
                        <span className={`${accentColors.blue.bg} ${accentColors.blue.text} text-xs font-medium px-3 py-1 rounded-full`}>
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className={`text-2xl font-bold ${accentColors[color].titleText} mb-1`}>
                        {pkg.title}
                      </h3>
                      <div className={`text-3xl font-bold ${headingColors.primary}`}>
                        {formatPrice(pkg)}
                        <span className={`text-base font-normal ${formInputColors.helper} ml-2`}>
                          one-time
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <Check size={18} className={accentColors[color].text} strokeWidth={2.5} />
                          <span className={formInputColors.helper}>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button variant={color} href="/build" className="w-full">
                      Get Started
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add-ons Section */}
          <div className="mb-16 animate-slide-up animate-delay-300">
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${formInputColors.helper} mb-6`}>
              Add-ons
            </h2>

            <div className={`${cardBgColors.base} rounded-2xl border ${cardBorderColors.subtle} divide-y ${cardBorderColors.subtle}`}>
              {addons.map((addon, index) => (
                <div
                  key={addon.id}
                  className={`
                    flex items-center justify-between p-5
                    hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                    ${index === 0 ? 'rounded-t-2xl' : ''}
                    ${index === addons.length - 1 ? 'rounded-b-2xl' : ''}
                  `}
                >
                  <div>
                    <h3 className={`font-semibold ${headingColors.primary}`}>
                      {addon.title}
                    </h3>
                    {addon.description && (
                      <p className={`text-sm ${formInputColors.helper} mt-0.5`}>
                        {addon.description}
                      </p>
                    )}
                  </div>
                  <div className={`text-xl font-bold ${accentColors.purple.text} whitespace-nowrap ml-4`}>
                    {formatPrice(addon)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Build Your Own CTA */}
          <div className="animate-slide-up animate-delay-400">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border border-gray-200 dark:border-gray-700 p-8 md:p-12 text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-100/50 to-transparent dark:from-purple-900/20 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative">
                <h2 className={`text-2xl md:text-3xl font-bold ${headingColors.primary} mb-3`}>
                  Want something custom?
                </h2>
                <p className={`text-lg ${formInputColors.helper} mb-8 max-w-xl mx-auto`}>
                  Use our configurator to pick exactly what you need and see your total instantly.
                </p>

                <Link
                  href="/build"
                  className={`
                    inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold
                    ${accentColors.purple.bg} ${accentColors.purple.text} border ${accentColors.purple.border}
                    hover:scale-105 transition-transform
                  `}
                >
                  Build Your Own
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>

          {/* Free Consultation Note */}
          <p className={`text-center mt-12 ${formInputColors.helper}`}>
            Not sure what you need?{' '}
            <Link href="/contact" className={`${accentColors.blue.text} hover:underline font-medium`}>
              Book a free consultation
            </Link>
            {' '}— no commitment required.
          </p>
        </div>
      </section>
    </div>
  );
}
