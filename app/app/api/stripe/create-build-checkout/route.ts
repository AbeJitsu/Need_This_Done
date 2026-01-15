import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import { badRequest, handleApiError } from '@/lib/api-errors';

// ============================================================================
// Create Build Checkout API Route
// ============================================================================
// What: Creates a Stripe Checkout session for website packages and custom builds
// Why: Allows customers to pay 50% deposit to start their project
// How: Uses Stripe Checkout hosted page with metadata for tracking
//
// POST /api/stripe/create-build-checkout
// Body: { type: 'package' | 'custom', packageId?: string, features?: string[], total: number, email: string }
// Returns: { url: string } - Stripe Checkout URL to redirect to

const BuildCheckoutSchema = z.object({
  type: z.enum(['package', 'custom']),
  packageId: z.string().optional(),
  features: z.array(z.string()).optional(),
  total: z.number().min(100, 'Total must be at least $1'),
  email: z.string().email('Valid email is required'),
  name: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === 'package') return !!data.packageId;
    if (data.type === 'custom') return data.features && data.features.length > 0;
    return false;
  },
  { message: 'Package ID required for packages, features required for custom builds' }
);

// Package definitions
const PACKAGES: Record<string, { name: string; description: string; features: string[] }> = {
  'launch-site': {
    name: 'Launch Site',
    description: '3-5 page Next.js website with custom design, mobile responsive, contact form, basic SEO, and 30 days support',
    features: ['3-5 pages', 'Custom design', 'Mobile responsive', 'Contact form', 'Basic SEO', '30 days support'],
  },
  'growth-site': {
    name: 'Growth Site',
    description: '5-8 page website with blog, CMS, content editing, enhanced SEO, analytics, and 60 days support',
    features: ['5-8 pages', 'Blog with CMS', 'Content editing', 'Enhanced SEO', 'Analytics setup', '60 days support'],
  },
};

// Feature display names for custom builds
const FEATURE_NAMES: Record<string, string> = {
  'additional-page': 'Additional Page',
  'blog-setup': 'Blog Setup',
  'contact-form-files': 'File Upload Form',
  'calendar-booking': 'Calendar Booking',
  'payment-integration': 'Payment Integration',
  'cms-integration': 'CMS Integration',
};

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = BuildCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { type, packageId, features, total, email, name } = parsed.data;
    const stripe = getStripe();

    // Calculate 50% deposit (in cents)
    const depositAmount = Math.round((total * 100) / 2);
    const remainingAmount = (total * 100) - depositAmount;

    // Get base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Build product name and description based on type
    let productName: string;
    let productDescription: string;
    let metadataType: string;
    let metadataDetails: string;

    if (type === 'package' && packageId) {
      const pkg = PACKAGES[packageId];
      if (!pkg) {
        return badRequest('Invalid package ID');
      }
      productName = `${pkg.name} - 50% Deposit`;
      productDescription = pkg.description;
      metadataType = 'package';
      metadataDetails = packageId;
    } else {
      // Custom build
      const featureList = (features || [])
        .map((f) => FEATURE_NAMES[f] || f)
        .join(', ');
      productName = 'Custom Website Build - 50% Deposit';
      productDescription = `Features: ${featureList}`;
      metadataType = 'custom_build';
      metadataDetails = (features || []).join(',');
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDescription,
              metadata: {
                type: metadataType,
              },
            },
            unit_amount: depositAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: metadataType,
        package_id: type === 'package' ? packageId || '' : '',
        features: type === 'custom' ? metadataDetails : '',
        total_cents: String(total * 100),
        deposit_cents: String(depositAmount),
        remaining_cents: String(remainingAmount),
        customer_email: email,
        customer_name: name || '',
      },
      success_url: `${baseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      // Allow customer to modify their email at checkout
      customer_creation: 'always',
      // Collect billing address for invoicing
      billing_address_collection: 'required',
      // Add a custom message
      custom_text: {
        submit: {
          message: `This is a 50% deposit ($${(depositAmount / 100).toFixed(2)}). The remaining $${(remainingAmount / 100).toFixed(2)} is due upon project completion.`,
        },
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return handleApiError(error, 'Create Build Checkout');
  }
}
