// ============================================
// WIZARD STEP & SCENARIO DEFINITIONS
// All wizard content and feature-to-product mappings live here.
// The recommendation engine (wizard-engine.ts) uses FEATURE_MAP
// to resolve selected scenarios into Medusa product handles.
// ============================================

export type SelectionType = 'single' | 'multi';

export interface WizardScenario {
  id: string;
  icon: string;
  title: string;
  description: string;
  features: FeatureKey[];
}

export interface WizardStepDef {
  id: StepId;
  title: string;
  subtitle: string;
  selectionType: SelectionType;
  scenarios: WizardScenario[];
  condition?: (responses: WizardResponses) => boolean;
}

export type StepId =
  | 'business_stage'
  | 'interaction'
  | 'growth'
  | 'automation'
  | 'results';

export interface WizardResponses {
  business_stage?: string;
  interaction?: string[];
  growth?: string[];
  automation?: string[];
}

export type FeatureKey =
  | 'calendar_booking'
  | 'payments'
  | 'seo_advanced'
  | 'ai_chatbot'
  | 'reviews'
  | 'blog'
  | 'online_store'
  | 'email_campaigns'
  | 'customer_accounts'
  | 'cms'
  | 'automation'
  | 'managed_ai';

export type TierHandle = 'starter-site' | 'growth-site' | 'pro-site';

export interface FeatureMapping {
  includedInTiers: TierHandle[];
  addonHandle: string | null;
  isService?: boolean;
}

export const FEATURE_MAP: Record<FeatureKey, FeatureMapping> = {
  calendar_booking: { includedInTiers: ['growth-site', 'pro-site'], addonHandle: 'calendar-booking' },
  payments:         { includedInTiers: ['pro-site'], addonHandle: 'payment-integration' },
  seo_advanced:     { includedInTiers: ['growth-site', 'pro-site'], addonHandle: null },
  ai_chatbot:       { includedInTiers: ['pro-site'], addonHandle: 'ai-chatbot' },
  reviews:          { includedInTiers: ['pro-site'], addonHandle: null },
  blog:             { includedInTiers: ['pro-site'], addonHandle: 'blog-setup' },
  online_store:     { includedInTiers: [], addonHandle: 'online-store' },
  email_campaigns:  { includedInTiers: ['pro-site'], addonHandle: null },
  customer_accounts:{ includedInTiers: ['pro-site'], addonHandle: 'customer-accounts' },
  cms:              { includedInTiers: ['pro-site'], addonHandle: 'cms-integration' },
  automation:       { includedInTiers: [], addonHandle: 'automation-setup', isService: true },
  managed_ai:       { includedInTiers: [], addonHandle: 'managed-ai', isService: true },
};

export const TIER_ORDER: TierHandle[] = ['starter-site', 'growth-site', 'pro-site'];

export const WIZARD_STEPS: WizardStepDef[] = [
  {
    id: 'business_stage',
    title: 'Where are you in your journey?',
    subtitle: 'This helps us understand what you need most right now.',
    selectionType: 'single',
    scenarios: [
      { id: 'starting_fresh', icon: '🌱', title: 'Starting from scratch', description: "I don't have a website yet and need one built.", features: [] },
      { id: 'rebuild', icon: '🔄', title: "My site isn't working for me", description: 'I have a site but it needs a serious upgrade.', features: [] },
      { id: 'add_capabilities', icon: '🧩', title: 'Add capabilities', description: 'My site is decent — I want to add specific features.', features: [] },
      { id: 'automate_scale', icon: '⚡', title: 'Automate and scale', description: 'I need to automate repetitive work and grow.', features: [] },
    ],
  },
  {
    id: 'interaction',
    title: 'Which of these sound familiar?',
    subtitle: "Select all that apply — we'll find the right solution.",
    selectionType: 'multi',
    scenarios: [
      { id: 'no_booking', icon: '📅', title: "Can't book appointments online", description: 'Customers have to call or email to schedule.', features: ['calendar_booking'] },
      { id: 'no_payments', icon: '💳', title: "Can't take payments online", description: "I'm missing sales because there's no way to pay on my site.", features: ['payments'] },
      { id: 'no_seo', icon: '🔍', title: "People can't find me on Google", description: 'My site barely shows up in search results.', features: ['seo_advanced'] },
      { id: 'same_questions', icon: '🤖', title: 'Answering the same questions all day', description: 'I spend hours responding to basic customer inquiries.', features: ['ai_chatbot'] },
      { id: 'no_reviews', icon: '⭐', title: 'No way for customers to leave reviews', description: 'Happy customers have nowhere to share their experience.', features: ['reviews'] },
    ],
  },
  {
    id: 'growth',
    title: 'What about growing your business?',
    subtitle: 'Select any that would help you grow.',
    selectionType: 'multi',
    scenarios: [
      { id: 'want_blog', icon: '📝', title: 'Share updates and articles', description: 'I want to publish content and build an audience.', features: ['blog'] },
      { id: 'want_store', icon: '🛒', title: 'Sell products online', description: 'I need a full shop with cart, checkout, and inventory.', features: ['online_store'] },
      { id: 'want_email', icon: '📧', title: 'Send emails to my customers', description: 'I want to run email campaigns and newsletters.', features: ['email_campaigns'] },
      { id: 'want_accounts', icon: '👤', title: 'Customer accounts', description: 'Customers need to sign in and track their orders.', features: ['customer_accounts'] },
      { id: 'want_cms', icon: '✏️', title: 'Edit my own website content', description: "I want to change text and images without calling anyone.", features: ['cms'] },
    ],
  },
  {
    id: 'automation',
    title: 'What kind of automation would help?',
    subtitle: "Let's figure out how to save you time.",
    selectionType: 'multi',
    condition: (responses) => responses.business_stage === 'automate_scale',
    scenarios: [
      { id: 'follow_up', icon: '📬', title: 'Automatic follow-ups', description: 'Send emails after purchases, bookings, or signups.', features: ['automation'] },
      { id: 'inventory_alerts', icon: '📦', title: 'Inventory & stock alerts', description: 'Get notified when products run low.', features: ['automation'] },
      { id: 'ai_management', icon: '🧠', title: 'Ongoing AI management', description: 'AI agents handling support, data entry, and ops 24/7.', features: ['managed_ai'] },
    ],
  },
];

export function getActiveSteps(responses: WizardResponses): WizardStepDef[] {
  return WIZARD_STEPS.filter((step) => !step.condition || step.condition(responses));
}

export function collectFeatures(responses: WizardResponses): FeatureKey[] {
  const features = new Set<FeatureKey>();
  for (const step of WIZARD_STEPS) {
    const vals =
      step.selectionType === 'single'
        ? [responses[step.id as keyof WizardResponses]].filter(Boolean)
        : (responses[step.id as keyof WizardResponses] as string[]) ?? [];
    for (const id of vals) {
      const scenario = step.scenarios.find((s) => s.id === id);
      if (scenario) scenario.features.forEach((f) => features.add(f));
    }
  }
  return Array.from(features);
}
