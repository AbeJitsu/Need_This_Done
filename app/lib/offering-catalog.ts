export type OfferingKind = 'package' | 'add_on' | 'service' | 'subscription';

export interface Offering {
  slug: string;
  name: string;
  kind: OfferingKind;
  description: string;
  priceCents: number;
  billingPeriod: 'monthly' | null;
  included: readonly string[];
  /** A configured Stripe Payment Link may replace this contact fallback later. */
  paymentLinkEnv: string | null;
  customWorkFallback: '/contact';
}

const contactFallback = '/contact' as const;

export const OFFERING_CATALOG: readonly Offering[] = [
  {
    slug: 'starter-site', name: 'Starter Site', kind: 'package',
    description: 'A professional 3–5 page website for a new business or personal brand.',
    priceCents: 50_000, billingPeriod: null,
    included: ['3–5 custom pages', 'Custom mobile-friendly design', 'Contact form', 'Basic search optimization', '30 days support'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_STARTER_SITE', customWorkFallback: contactFallback,
  },
  {
    slug: 'growth-site', name: 'Growth Site', kind: 'package',
    description: 'A business website with saved enquiries and appointment booking.',
    priceCents: 150_000, billingPeriod: null,
    included: ['5–8 custom pages', 'Saved form submissions', 'Appointment booking', 'Improved search visibility', '60 days support'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_GROWTH_SITE', customWorkFallback: contactFallback,
  },
  {
    slug: 'pro-site', name: 'Pro Site', kind: 'package',
    description: 'A full business website with customer accounts, payments, and administration.',
    priceCents: 500_000, billingPeriod: null,
    included: ['10+ custom pages', 'Customer accounts', 'Payments and deposits', 'Blog and content editing', 'Admin dashboard', '90 days support'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_PRO_SITE', customWorkFallback: contactFallback,
  },
  {
    slug: 'additional-page', name: 'Extra Page', kind: 'add_on', description: 'One additional custom page.',
    priceCents: 10_000, billingPeriod: null, included: ['Custom page design', 'Mobile-friendly layout', 'Search optimization'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_ADDITIONAL_PAGE', customWorkFallback: contactFallback,
  },
  {
    slug: 'blog-setup', name: 'Blog', kind: 'add_on', description: 'Publishing tools for articles on your site.',
    priceCents: 30_000, billingPeriod: null, included: ['Article publishing', 'Formatting', 'Search optimization', 'RSS feed'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_BLOG_SETUP', customWorkFallback: contactFallback,
  },
  {
    slug: 'cms-integration', name: 'Edit Your Own Site', kind: 'add_on', description: 'Visual editing for site text and images.',
    priceCents: 50_000, billingPeriod: null, included: ['Visual editor', 'Text and image edits', 'No-code changes', 'Version history'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_CMS_INTEGRATION', customWorkFallback: contactFallback,
  },
  {
    slug: 'calendar-booking', name: 'Calendar Booking', kind: 'add_on', description: 'Online appointment booking for your site.',
    priceCents: 20_000, billingPeriod: null, included: ['Calendar integration', 'Booking widget', 'Email confirmations'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_CALENDAR_BOOKING', customWorkFallback: contactFallback,
  },
  {
    slug: 'contact-form-files', name: 'File Uploads', kind: 'add_on', description: 'File attachments on your contact forms.',
    priceCents: 15_000, billingPeriod: null, included: ['File attachments', 'Up to three files', '5 MB per file', 'Email notifications'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_CONTACT_FORM_FILES', customWorkFallback: contactFallback,
  },
  {
    slug: 'payment-integration', name: 'Accept Payments', kind: 'add_on', description: 'Payments, subscriptions, or deposits for your customers.',
    priceCents: 40_000, billingPeriod: null, included: ['Secure payment processing', 'One-time payments', 'Subscriptions', 'Deposits'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_PAYMENT_INTEGRATION', customWorkFallback: contactFallback,
  },
  {
    slug: 'customer-accounts', name: 'Customer Accounts', kind: 'add_on', description: 'Sign-in and saved information for your customers.',
    priceCents: 40_000, billingPeriod: null, included: ['Sign up and login', 'Saved personal information', 'Order history', 'Account dashboard'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_CUSTOMER_ACCOUNTS', customWorkFallback: contactFallback,
  },
  {
    slug: 'ai-chatbot', name: 'AI Chatbot', kind: 'add_on', description: 'A site-trained assistant that answers customer questions.',
    priceCents: 60_000, billingPeriod: null, included: ['Content-trained assistant', '24/7 answers', 'Natural conversation', 'Lead capture'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_AI_CHATBOT', customWorkFallback: contactFallback,
  },
  {
    slug: 'online-store', name: 'Online Store', kind: 'add_on', description: 'A complete product catalog and checkout experience.',
    priceCents: 200_000, billingPeriod: null, included: ['Product catalog', 'Shopping cart', 'Secure checkout', 'Inventory tracking', 'Order management'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_ONLINE_STORE', customWorkFallback: contactFallback,
  },
  {
    slug: 'automation-setup', name: 'Automation Setup', kind: 'service', description: 'A custom workflow that connects your tools and saves time.',
    priceCents: 15_000, billingPeriod: null, included: ['Tool integration', 'Workflow automation', 'Custom triggers', 'Time-saving setup'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_AUTOMATION_SETUP', customWorkFallback: contactFallback,
  },
  {
    slug: 'managed-ai', name: 'Managed AI', kind: 'subscription', description: 'Ongoing AI support for customer service and operations.',
    priceCents: 50_000, billingPeriod: 'monthly', included: ['AI agents', 'Customer support', 'Data-entry automation', '24/7 operations'],
    paymentLinkEnv: 'STRIPE_PAYMENT_LINK_MANAGED_AI', customWorkFallback: contactFallback,
  },
];

export function publicOfferings() {
  return OFFERING_CATALOG.map(({ paymentLinkEnv, ...offering }) => ({
    ...offering,
    paymentLink: paymentLinkEnv ? process.env[paymentLinkEnv] || null : null,
  }));
}
