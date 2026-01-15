# Claude Code Task List: NeedThisDone Site Transformation

## Purpose
Transform needthisdone.com from a generic task service to an AI-forward agency with three service tiers:
1. **Website Builds** (Entry) - The hook
2. **Automation Setup** (Core) - The value
3. **Managed AI Services** (Ongoing) - The retention

## How to Use This Document
Work through tasks in order. Each task has:
- Clear success criteria
- Specific file locations
- Before/after examples where helpful

Mark each task complete before moving to the next.

---

## PHASE 1: Remove Page Builder (Cleanup)

The Puck page builder is unused complexity. Remove it entirely.

### Task 1.1: Delete Page Builder Admin Routes
**Files to delete:**
```
app/app/admin/pages/
├── page.tsx
├── new/page.tsx
└── [slug]/
    ├── edit/page.tsx
    └── blocks/page.tsx
```

**Success criteria:**
- [ ] Directory `app/app/admin/pages/` no longer exists
- [ ] No build errors after deletion

---

### Task 1.2: Remove Page Builder from Admin Dashboard
**File:** `app/components/AdminDashboard.tsx`

**Find and remove this Link block:**
```tsx
<Link
  href="/admin/pages"
  className={`${cardBgColors.base} rounded-xl p-4 ...`}
>
  <div className="text-2xl mb-2">🎨</div>
  <h3 className="font-semibold ...">
    Page Builder
  </h3>
  <p className="text-sm ...">Drag & drop pages</p>
</Link>
```

**Success criteria:**
- [ ] "Page Builder" card no longer appears on admin dashboard
- [ ] No dead links in admin navigation

---

### Task 1.3: Remove Page Builder from Admin Sidebar
**File:** Find the admin layout/sidebar component (likely in `app/components/layout/` or `app/app/admin/layout.tsx`)

**Find and remove navigation item for "Pages" that links to `/admin/pages`**

**Success criteria:**
- [ ] "Pages" link no longer appears in admin sidebar
- [ ] No 404s when navigating admin

---

### Task 1.4: Remove Puck-Related Components (if any)
**Search for:** Files containing "puck" or "Puck" in `app/components/`

**Action:** If found, assess whether they're used elsewhere. If only for page builder, delete them.

**Success criteria:**
- [ ] No orphaned Puck components remain
- [ ] Build succeeds

---

### Task 1.5: Clean Up Puck Dependencies
**File:** `app/package.json`

**Search for:** Any packages with "puck" in the name

**Action:** If found, remove from dependencies and run `npm install`

**Success criteria:**
- [ ] No puck-related packages in package.json
- [ ] `npm install` completes without errors

---

## PHASE 2: Content Transformation - Global Elements

### Task 2.1: Update Footer Tagline
**File:** `app/lib/page-config.ts`

**Find:** `DEFAULT_LAYOUT_CONTENT.footer.tagline`

**Current:**
```typescript
tagline: 'Real people helping busy professionals get things done.',
```

**Change to:**
```typescript
tagline: 'Technology that works as hard as you do.',
```

**Success criteria:**
- [ ] Footer displays new tagline on all pages
- [ ] No "real people" or "not bots" language in footer

---

### Task 2.2: Update Navigation Links
**File:** `app/lib/page-config.ts`

**Find:** `DEFAULT_LAYOUT_CONTENT.header.navLinks`

**Current:**
```typescript
navLinks: [
  { href: '/services', label: 'Services' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/guide', label: 'Guide' },
  { href: '/pricing', label: 'Pricing' },
],
```

**Change to:**
```typescript
navLinks: [
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
],
```

**Rationale:** Remove Guide (low value), add How It Works and About (trust builders), keep Blog (content marketing)

**Success criteria:**
- [ ] Navigation shows: Services, Pricing, How It Works, About, Blog
- [ ] All nav links resolve correctly

---

## PHASE 3: Homepage Transformation

### Task 3.1: Update Homepage Hero
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.home.defaults.hero`

**Current:**
```typescript
hero: {
  title: 'Get your tasks done right',
  description: 'Real people helping busy professionals get things done. Book a quick consultation or tell us about your project. We handle the rest.',
  buttons: [
    { text: 'Book a Consultation', variant: 'gold', href: '/shop' },
    { text: 'View Services', variant: 'blue', href: '/services' },
  ],
},
```

**Change to:**
```typescript
hero: {
  title: 'Websites. Automation. AI.',
  description: 'From your first website to fully automated operations. We build the technology that lets you focus on what matters.',
  buttons: [
    { text: 'See Services', variant: 'blue', href: '/services' },
    { text: 'Get a Quote', variant: 'gold', href: '/contact' },
  ],
},
```

**Success criteria:**
- [ ] Homepage hero shows new title and description
- [ ] No "real people" or task-focused language
- [ ] Buttons link correctly

---

### Task 3.2: Update Homepage Service Cards
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.home.defaults.services.cards`

**Replace entire cards array with:**
```typescript
cards: [
  {
    title: 'Website Builds',
    tagline: 'Your digital foundation',
    description: 'Professional websites that work. From landing pages to full e-commerce, built to convert visitors into customers.',
    details: 'Custom Design, Mobile-First, SEO-Ready, Easy to Update',
    color: 'blue',
    linkText: 'Learn more →',
    modal: {
      headline: 'A website that actually works for your business.',
      hook: 'No templates. No DIY headaches. Just a professional site that makes you look as good as you are.',
      bulletHeader: 'What you get:',
      bulletPoints: [
        'Custom design that matches your brand',
        'Mobile-responsive and fast-loading',
        'SEO foundations built in',
        'Content management you can actually use',
        '30 days of support included',
      ],
      ctas: {
        primary: { text: 'Get a Website Quote', href: '/contact?service=website' },
        secondary: { text: 'See Pricing', href: '/pricing' },
      },
    },
  },
  {
    title: 'Automation Setup',
    tagline: 'Stop doing repetitive work',
    description: 'Connect your tools, automate your workflows, and reclaim hours every week. We set it up, you reap the benefits.',
    details: 'Workflow Design, Tool Integration, Testing, Training',
    color: 'purple',
    linkText: 'Learn more →',
    modal: {
      headline: 'Automate the work you keep putting off.',
      hook: 'That thing you do manually every day? Let\'s make it happen automatically.',
      bulletHeader: 'What we automate:',
      bulletPoints: [
        'Lead capture to CRM workflows',
        'Email sequences and follow-ups',
        'Data sync between platforms',
        'Report generation and delivery',
        'Custom workflows for your specific needs',
      ],
      ctas: {
        primary: { text: 'Explore Automation', href: '/contact?service=automation' },
        secondary: { text: 'See Pricing', href: '/pricing' },
      },
    },
  },
  {
    title: 'Managed AI Services',
    tagline: 'AI that runs while you sleep',
    description: 'We build, deploy, and maintain AI agents that handle your operations. You get the results without the complexity.',
    details: 'Custom AI Agents, Monitoring, Optimization, Support',
    color: 'green',
    linkText: 'Learn more →',
    modal: {
      headline: 'AI that actually does the work.',
      hook: 'Not chatbots. Not gimmicks. Real AI agents that handle real business tasks.',
      bulletHeader: 'What AI can do for you:',
      bulletPoints: [
        'Customer inquiry handling and routing',
        'Document processing and data extraction',
        'Content generation and scheduling',
        'Research and competitive analysis',
        'Custom agents for your specific workflows',
      ],
      ctas: {
        primary: { text: 'Learn About Managed AI', href: '/contact?service=managed-ai' },
        secondary: { text: 'See Pricing', href: '/pricing' },
      },
    },
  },
],
```

**Success criteria:**
- [ ] Homepage shows three service cards: Website Builds, Automation Setup, Managed AI Services
- [ ] Each card modal opens with correct content
- [ ] Colors are blue, purple, green respectively

---

### Task 3.3: Update Homepage Services Section Title
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.home.defaults.services.title` and related

**Change:**
```typescript
services: {
  title: 'What We Build',
  linkText: 'Compare all services →',
  linkHref: '/services',
  cards: [...] // from Task 3.2
},
```

**Success criteria:**
- [ ] Services section title is "What We Build"
- [ ] Link text updated

---

### Task 3.4: Update Homepage Consultations Section
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.home.defaults.consultations`

**Change:**
```typescript
consultations: {
  title: 'Not Sure Where to Start?',
  description: 'Book a quick call. We\'ll figure out the best approach for your situation.',
  options: [
    { name: 'Quick Chat', duration: '15 min', price: '$20', description: 'Got a quick question?', color: 'blue' },
    { name: 'Strategy Call', duration: '30 min', price: '$35', description: 'Let\'s map out your needs', color: 'purple' },
    { name: 'Deep Dive', duration: '55 min', price: '$50', description: 'Full project consultation', color: 'green' },
  ],
  linkText: 'Book a consultation →',
  linkHref: '/shop',
},
```

**Success criteria:**
- [ ] Consultation section has new title and description
- [ ] Options updated with clearer value props

---

### Task 3.5: Update Homepage Process Preview
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.home.defaults.processPreview`

**Change:**
```typescript
processPreview: {
  title: 'How It Works',
  steps: [
    { number: 1, title: 'Tell Us', description: 'What do you need built?', color: 'blue' },
    { number: 2, title: 'We Scope', description: 'Clear quote, no surprises', color: 'purple' },
    { number: 3, title: 'We Build', description: 'You stay in the loop', color: 'green' },
    { number: 4, title: 'You Launch', description: 'Go live with confidence', color: 'gold' },
  ],
  linkText: 'See the full process →',
},
```

**Success criteria:**
- [ ] Process steps reflect building/launching framing
- [ ] Not task-completion framing

---

### Task 3.6: Update Homepage CTA Section
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.home.defaults.cta`

**Change:**
```typescript
cta: {
  title: 'Ready to Build?',
  description: 'Tell us what you need. We\'ll get back to you within 2 business days with a clear quote.',
  buttons: [
    { text: 'Get a Quote', variant: 'gold', href: '/contact' },
    { text: 'View Pricing', variant: 'blue', href: '/pricing' },
  ],
  footer: 'Questions first?',
  footerLinkText: 'Check the FAQ',
  footerLinkHref: '/faq',
  chatbotNote: '',
  hoverColor: 'gold',
},
```

**Success criteria:**
- [ ] CTA uses "build" language
- [ ] Chatbot note removed (empty string)

---

## PHASE 4: Services Page Transformation

### Task 4.1: Update Services Page Header
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.services.defaults.header`

**Change:**
```typescript
header: {
  title: 'Three Ways to Grow',
  description: 'Start with a website, add automation as you scale, or go all-in with managed AI. Each tier builds on the last.',
},
```

**Success criteria:**
- [ ] Services page header reflects tier progression

---

### Task 4.2: Update Services Scenario Matcher
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.services.defaults.scenarioMatcher`

**Change:**
```typescript
scenarioMatcher: {
  title: 'Which sounds like you?',
  description: 'Click the scenario that fits.',
  scenarios: [
    {
      quotes: [
        'I need a professional website but don\'t want to DIY it',
        'My current site looks outdated and isn\'t converting',
        'I want to sell online but the tech is overwhelming',
      ],
      serviceKey: 'website-services',
      serviceTitle: 'Website Builds',
      color: 'blue',
    },
    {
      quotes: [
        'I\'m doing the same manual tasks every single day',
        'My tools don\'t talk to each other',
        'I know I should automate but don\'t know where to start',
      ],
      serviceKey: 'data-documents',
      serviceTitle: 'Automation Setup',
      color: 'purple',
    },
    {
      quotes: [
        'I want AI working for my business, not just chatbots',
        'I need ongoing AI support, not a one-time setup',
        'I want to leverage AI but don\'t have time to manage it',
      ],
      serviceKey: 'virtual-assistant',
      serviceTitle: 'Managed AI Services',
      color: 'green',
    },
  ],
},
```

**Success criteria:**
- [ ] Scenarios match three-tier model
- [ ] Quotes resonate with target clients

---

### Task 4.3: Update Services Comparison Table
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.services.defaults.comparison`

**Change:**
```typescript
comparison: {
  title: 'Compare Services',
  description: 'Each tier can stand alone or build on the others.',
  columns: ['Website Builds', 'Automation Setup', 'Managed AI'],
  rows: [
    { label: 'Best for', values: ['Getting online professionally', 'Eliminating repetitive work', 'Hands-off AI operations'] },
    { label: 'What you get', values: ['Custom website, mobile-ready, SEO-optimized', 'Connected tools, automated workflows', 'AI agents that work 24/7'] },
    { label: 'Timeline', values: ['1-4 weeks', '1-2 weeks per workflow', 'Ongoing'] },
    { label: 'Starting at', values: ['$500 one-time', '$150 per workflow', '$500/month'] },
    { label: 'Support included', values: ['30 days', 'Training session', 'Continuous'] },
  ],
},
```

**Success criteria:**
- [ ] Table columns match three tiers
- [ ] Rows highlight key differentiators

---

### Task 4.4: Update Services Choose Your Path
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.services.defaults.chooseYourPath`

**Change:**
```typescript
chooseYourPath: {
  title: 'Ready to Start?',
  description: 'Pick your path forward.',
  paths: [
    {
      badge: 'Free',
      title: 'Get a Quote',
      description: 'Tell us what you need built',
      bullets: ['No obligation', 'Response in 2 business days', 'Clear pricing upfront'],
      button: { text: 'Get a Quote', variant: 'gold', href: '/contact', size: 'lg' },
      hoverColor: 'gold',
    },
    {
      badge: 'Paid',
      title: 'Book a Strategy Call',
      description: 'Let\'s plan your approach together',
      bullets: ['30-minute focused session', 'Personalized recommendations', 'Recording included'],
      button: { text: 'Book a Call', variant: 'purple', href: '/shop', size: 'lg' },
      hoverColor: 'purple',
    },
  ],
},
```

**Success criteria:**
- [ ] Two clear paths: free quote vs paid strategy call
- [ ] No confusion about next steps

---

### Task 4.5: Update Services Expectations
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.services.defaults.expectations`

**Change:**
```typescript
expectationsTitle: 'What to Expect',
expectations: [
  { title: 'Clear Communication', description: 'You\'ll always know where things stand. No ghosting, no jargon.' },
  { title: 'Quality Work', description: 'Built right the first time. We don\'t cut corners.' },
  { title: 'Fair Pricing', description: 'You\'ll know the cost before we start. No surprises.', link: { href: '/pricing' } },
  { title: 'Ongoing Support', description: 'We don\'t disappear after delivery. Questions welcome.' },
],
```

**Success criteria:**
- [ ] Expectations focus on professionalism and reliability
- [ ] No task-service language

---

## PHASE 5: Pricing Page Transformation

### Task 5.1: Update Pricing Page Header
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.pricing.defaults.header`

**Change:**
```typescript
header: {
  title: 'Clear Pricing',
  description: 'No hidden fees. No hourly billing surprises. You\'ll know exactly what you\'re paying before we start.',
},
```

**Success criteria:**
- [ ] Header emphasizes transparency

---

### Task 5.2: Update Pricing Tiers
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.pricing.defaults.tiers`

**Change:**
```typescript
tiers: [
  {
    name: 'Website Build',
    price: 'From $500',
    period: 'one-time',
    description: 'Your professional website, built to convert.',
    features: [
      'Custom design to match your brand',
      'Mobile-responsive and fast',
      'SEO foundations included',
      'Content management training',
      '30 days of support',
    ],
    color: 'blue',
    cta: 'Get a Website Quote',
    href: '/contact?service=website',
  },
  {
    name: 'Automation Setup',
    price: 'From $150',
    period: 'per workflow',
    description: 'Connect your tools. Stop doing repetitive work.',
    features: [
      'Workflow design consultation',
      'Platform integration (Zapier, Make, etc.)',
      'Testing and documentation',
      'Training session included',
      'Email support for questions',
    ],
    color: 'purple',
    popular: true,
    cta: 'Explore Automation',
    href: '/contact?service=automation',
  },
  {
    name: 'Managed AI',
    price: 'From $500',
    period: 'per month',
    description: 'AI agents that work while you sleep.',
    features: [
      'Custom AI agent development',
      'Ongoing monitoring and optimization',
      'Monthly performance reports',
      'Priority support',
      'Continuous improvements',
    ],
    color: 'green',
    cta: 'Learn About Managed AI',
    href: '/contact?service=managed-ai',
  },
],
```

**Success criteria:**
- [ ] Three tiers match service structure
- [ ] Automation marked as popular
- [ ] CTAs link with service parameter

---

### Task 5.3: Update Pricing CTA Section
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.pricing.defaults.ctaSection` and `ctaPaths`

**Change:**
```typescript
ctaSection: {
  title: 'Ready to Move Forward?',
  description: 'Pick your starting point.',
},
ctaPaths: [
  {
    badge: 'Free',
    title: 'Get a Quote',
    description: 'Tell us what you need',
    features: ['No obligation', 'Response in 2 days', 'Clear pricing'],
    button: { text: 'Get a Quote', href: '/contact', variant: 'gold' },
    hoverColor: 'gold',
  },
  {
    badge: 'Paid',
    title: 'Strategy Call',
    description: 'Plan your approach',
    features: ['30-minute session', 'Personalized advice', 'Recording included'],
    button: { text: 'Book a Call', href: '/shop', variant: 'purple' },
    hoverColor: 'purple',
  },
],
```

**Success criteria:**
- [ ] Two paths consistent with services page

---

### Task 5.4: Update Pricing Custom Section
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.pricing.defaults.customSection`

**Change:**
```typescript
customSection: {
  title: 'Need Something Custom?',
  description: 'Every business is different. If you don\'t see exactly what you need, let\'s talk. We\'ll figure out the right approach together.',
  buttons: [
    { text: 'Contact Us', variant: 'blue', href: '/contact' },
    { text: 'Read the FAQ', variant: 'purple', href: '/faq' },
  ],
  hoverColor: 'blue',
},
```

**Success criteria:**
- [ ] Custom section invites conversation
- [ ] Not defensive or limiting

---

## PHASE 6: How It Works Page Transformation

### Task 6.1: Update How It Works Header
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS['how-it-works'].defaults.header`

**Change:**
```typescript
header: {
  title: 'How We Work Together',
  description: 'A simple process designed to get you from idea to launch without the headaches.',
},
```

**Success criteria:**
- [ ] Header focuses on partnership and outcome

---

### Task 6.2: Remove Anti-AI Trust Badges
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS['how-it-works'].defaults.trustBadges`

**Current (problematic):**
```typescript
trustBadges: [
  { text: 'Personal attention', description: 'Real people, not bots' }, // REMOVE
  ...
]
```

**Change to:**
```typescript
trustBadges: [
  { text: 'Human + AI', description: 'Best of both worlds' },
  { text: 'Clear Updates', description: 'At every step' },
  { text: 'No Surprises', description: 'Transparent pricing' },
],
```

**Success criteria:**
- [ ] No "real people, not bots" language anywhere
- [ ] AI positioned positively

---

### Task 6.3: Update How It Works Steps
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS['how-it-works'].defaults.steps`

**Change:**
```typescript
steps: [
  {
    number: 1,
    title: 'Tell Us What You Need',
    description: 'Fill out our simple form. No tech jargon required - just tell us what you\'re trying to accomplish.',
    details: [
      'Describe your project in plain English',
      'Attach any relevant files or examples',
      'Let us know your timeline if you have one',
    ],
    color: 'blue',
    href: '/contact',
    buttonText: 'Start Here',
  },
  {
    number: 2,
    title: 'Get a Clear Quote',
    description: 'Within 2 business days, you\'ll have a detailed quote. No hidden fees, no hourly surprises.',
    details: [
      'We assess what needs to be built',
      'We ask questions if needed',
      'You get a fixed price quote',
    ],
    color: 'purple',
  },
  {
    number: 3,
    title: 'We Build It',
    description: '50% deposit to start. We keep you updated throughout so you\'re never wondering what\'s happening.',
    details: [
      'Regular progress updates',
      'Review checkpoints along the way',
      'Revisions until you\'re happy',
    ],
    color: 'green',
  },
  {
    number: 4,
    title: 'You Launch',
    description: 'Final 50% on approval. We help you go live and stick around to make sure everything works.',
    details: [
      'Final review and approval',
      'Launch support included',
      'Post-launch questions welcome',
    ],
    color: 'gold',
  },
],
```

**Success criteria:**
- [ ] Steps focus on building/launching
- [ ] Clear payment structure explained

---

### Task 6.4: Update How It Works CTA
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS['how-it-works'].defaults.cta`

**Change:**
```typescript
cta: {
  title: 'Ready to Start?',
  description: 'Tell us what you need built. We\'ll take it from there.',
  buttons: [
    { text: 'Get a Quote', variant: 'gold', href: '/contact' },
    { text: 'View Services', variant: 'blue', href: '/services' },
    { text: 'See Pricing', variant: 'purple', href: '/pricing' },
  ],
  hoverColor: 'gold',
},
```

**Success criteria:**
- [ ] CTA consistent with rest of site

---

## PHASE 7: About Page Transformation

### Task 7.1: Add AI Philosophy Section to About Page
**File:** `app/app/about/page.tsx`

**Find:** The "How I Work" section (around line 78-105)

**After the closing `</section>` of "How I Work", add:**
```tsx
{/* AI Philosophy */}
<section className="mb-10">
  <h2 className={`text-xl font-bold ${titleColors.blue} mb-4`}>
    How I Use AI
  </h2>
  <div className={`space-y-4 ${headingColors.secondary}`}>
    <p>
      I use AI tools to deliver better work faster. But AI doesn&apos;t replace
      expertise—it amplifies it. The strategy, quality control, and client
      relationships are 100% human.
    </p>
    <p>
      When you work with me, you get cutting-edge technology guided by real
      experience. That&apos;s the combination that actually gets results.
    </p>
  </div>
</section>
```

**Success criteria:**
- [ ] New section appears between "How I Work" and "Want to Know More?"
- [ ] AI positioned as tool, not replacement
- [ ] Consistent styling with rest of page

---

### Task 7.2: Update About Page CTA
**File:** `app/app/about/page.tsx`

**Find:** The final CTA section (around line 107-123)

**Change the buttons to:**
```tsx
<div className="flex flex-wrap justify-center gap-4">
  <Button variant="blue" href="/services" size="lg">
    See What I Build
  </Button>
  <Button variant="gold" href="/contact" size="lg">
    Start a Project
  </Button>
</div>
```

**Success criteria:**
- [ ] CTA focuses on building/starting
- [ ] Links to services and contact

---

## PHASE 8: FAQ Page Transformation

### Task 8.1: Update FAQ Items
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.faq.defaults.items`

**Replace with:**
```typescript
items: [
  {
    question: 'What do you build?',
    answer: 'Three main things: professional websites, automation workflows, and managed AI services. Most clients start with a website and add automation as they grow. Some go straight to managed AI. We\'ll help you figure out what makes sense for your situation.',
    links: [{ text: 'See all services', href: '/services' }],
  },
  {
    question: 'How much does it cost?',
    answer: 'Website builds start at $500. Automation setup starts at $150 per workflow. Managed AI services start at $500/month. Every project gets a clear quote upfront—no hourly billing surprises.',
    links: [{ text: 'View pricing', href: '/pricing' }],
  },
  {
    question: 'How long does it take?',
    answer: 'Websites typically take 1-4 weeks depending on complexity. Automation workflows take 1-2 weeks each. Managed AI is ongoing. We\'ll give you a realistic timeline before we start.',
    links: [{ text: 'How it works', href: '/how-it-works' }],
  },
  {
    question: 'Do I need to be technical?',
    answer: 'Not at all. Just describe what you want to accomplish in plain English. We handle the technical side and explain things without jargon.',
  },
  {
    question: 'What if I need changes after delivery?',
    answer: 'Website builds include 30 days of support and reasonable revisions. Automation setups include a training session and email support. Managed AI includes continuous optimization as part of the monthly fee.',
  },
  {
    question: 'How does payment work?',
    answer: 'For project work: 50% deposit to start, 50% on approval. For managed AI: monthly billing. We accept all major credit cards. No surprises.',
    links: [{ text: 'Ready to start?', href: '/contact' }],
  },
  {
    question: 'What\'s the difference between automation and managed AI?',
    answer: 'Automation setup is a one-time project—we build workflows that run automatically (like connecting your CRM to your email). Managed AI is ongoing—we build, monitor, and improve AI agents that handle complex tasks continuously.',
  },
  {
    question: 'Can I start with one service and add others later?',
    answer: 'Absolutely. Many clients start with a website, then add automation as they see what\'s possible. The services are designed to build on each other.',
  },
],
```

**Success criteria:**
- [ ] FAQs answer real questions about three-tier model
- [ ] No task-service or VA language
- [ ] Links go to appropriate pages

---

### Task 8.2: Update FAQ CTA
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.faq.defaults.cta`

**Change:**
```typescript
cta: {
  title: 'Still Have Questions?',
  description: 'Book a quick call and we\'ll figure it out together.',
  buttons: [{ text: 'Book a Call', variant: 'purple', href: '/shop' }],
  hoverColor: 'purple',
},
```

**Success criteria:**
- [ ] CTA invites conversation
- [ ] Links to consultation booking

---

## PHASE 9: Contact Page Transformation

### Task 9.1: Update Contact Page Header
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.contact.defaults.header`

**Change:**
```typescript
header: {
  title: 'Get a Quote',
  description: 'Tell us what you need built. We\'ll get back to you within 2 business days with a clear quote. No obligation.',
},
```

**Success criteria:**
- [ ] Header focuses on building, not tasks

---

### Task 9.2: Update Contact Form Service Options
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.contact.defaults.form.serviceField`

**Note:** The actual service options dropdown is likely populated elsewhere. Search for where service options are defined (may be in the component or a constants file).

**The options should be:**
- Website Build
- Automation Setup
- Managed AI Services
- Not Sure Yet

**Success criteria:**
- [ ] Service dropdown matches three-tier model
- [ ] "Not Sure Yet" option for undecided visitors

---

### Task 9.3: Update Contact Success Message
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.contact.defaults.success`

**Change:**
```typescript
success: {
  title: 'Message Received!',
  description: 'Thanks for reaching out. We\'re excited to learn about your project.',
  nextStepsTitle: 'What happens next:',
  nextSteps: [
    'We\'ll review your request within 2 business days',
    'You\'ll receive a clear quote via email',
    'If you\'re ready to proceed: 50% to start, 50% on delivery',
  ],
  sendAnotherLink: 'Send another message',
},
```

**Success criteria:**
- [ ] Success message sets clear expectations
- [ ] Payment structure mentioned upfront

---

## PHASE 10: Get Started Page Transformation

### Task 10.1: Update Get Started Header
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS['get-started'].defaults.header`

**Change:**
```typescript
header: {
  title: 'Let\'s Build Something',
  description: 'Two ways to get started. Pick what works for you.',
},
```

**Success criteria:**
- [ ] Header uses build language

---

### Task 10.2: Update Get Started Paths
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS['get-started'].defaults.paths`

**Change:**
```typescript
paths: [
  {
    badge: 'Free',
    title: 'Get a Quote',
    description: 'Tell us what you need built. No obligation.',
    features: ['Response in 2 business days', 'Clear pricing upfront', 'No commitment required'],
    button: { text: 'Request a Quote', variant: 'gold', href: '/contact', size: 'lg' },
    hoverColor: 'gold',
  },
  {
    badge: 'Paid',
    title: 'Strategy Call',
    description: 'Talk through your needs with an expert.',
    features: ['30-minute focused session', 'Personalized recommendations', 'Recording included'],
    button: { text: 'Book a Call', variant: 'purple', href: '/shop', size: 'lg' },
    hoverColor: 'purple',
  },
],
```

**Success criteria:**
- [ ] Two clear paths
- [ ] Consistent with other pages

---

## PHASE 11: Blog Page Setup

### Task 11.1: Update Blog Header
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.blog.defaults.header`

**Change:**
```typescript
header: {
  title: 'Blog',
  description: 'Insights on websites, automation, and AI for growing businesses.',
},
```

**Success criteria:**
- [ ] Description matches three-tier focus

---

### Task 11.2: Update Blog Empty State
**File:** `app/lib/page-config.ts`

**Find:** `PAGE_CONFIGS.blog.defaults.emptyState`

**Change:**
```typescript
emptyState: {
  emoji: '📝',
  title: 'Coming Soon',
  description: 'We\'re working on guides and insights about websites, automation, and AI. Check back soon.',
},
```

**Success criteria:**
- [ ] Empty state mentions all three tiers

---

## PHASE 12: Final Cleanup and Verification

### Task 12.1: Search for Remaining "Real People" Language
**Search entire codebase for:**
- "real people"
- "not bots"
- "human, not"

**Action:** Replace any found instances with AI-positive alternatives.

**Success criteria:**
- [ ] Zero instances of anti-AI language remain

---

### Task 12.2: Search for Remaining "Task" Language
**Search entire codebase for:**
- "task service"
- "get your tasks"
- "handle tasks"
- "virtual assistant" (in marketing context)

**Action:** Replace with build/automation/AI language.

**Success criteria:**
- [ ] Marketing language consistently reflects three-tier model

---

### Task 12.3: Verify All Internal Links Work
**Test these navigation paths:**
- [ ] Homepage → Services → Contact
- [ ] Homepage → Pricing → Contact
- [ ] Services → Pricing
- [ ] How It Works → Contact
- [ ] FAQ → Services/Pricing/Contact
- [ ] All nav links
- [ ] All footer links

**Success criteria:**
- [ ] No 404 errors
- [ ] No dead links

---

### Task 12.4: Verify Service Parameter Handling
**Test contact form with URL parameters:**
- `/contact?service=website`
- `/contact?service=automation`
- `/contact?service=managed-ai`

**Success criteria:**
- [ ] Service dropdown pre-selects correct option (if implemented)
- [ ] Or: parameters logged for future implementation

---

### Task 12.5: Build and Test
**Run:**
```bash
npm run build
npm run start
```

**Success criteria:**
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] Site runs locally without issues

---

## Summary: Success Criteria Checklist

### Page Builder Removal
- [ ] `/admin/pages/` directory deleted
- [ ] Admin dashboard Page Builder link removed
- [ ] Admin sidebar Pages link removed
- [ ] No orphaned Puck components
- [ ] No Puck dependencies in package.json

### Content Transformation
- [ ] Footer tagline updated
- [ ] Navigation links updated
- [ ] Homepage reflects three-tier model
- [ ] Services page reflects three-tier model
- [ ] Pricing page reflects three-tier model
- [ ] How It Works page has no anti-AI language
- [ ] About page includes AI philosophy section
- [ ] FAQ answers questions about three tiers
- [ ] Contact page focuses on building
- [ ] Get Started page has two clear paths
- [ ] Blog description mentions three tiers

### Language Cleanup
- [ ] No "real people, not bots" anywhere
- [ ] No "virtual assistant" in marketing
- [ ] No "task service" language
- [ ] Consistent "build/automate/AI" framing

### Technical Verification
- [ ] All links work
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] Site runs without issues

---

## Notes for Claude Code

1. **Make one change at a time** - Don't batch too many edits together
2. **Verify after each phase** - Run build, check for errors
3. **Preserve existing functionality** - Only change content, not behavior
4. **Keep TypeScript happy** - If type errors occur, update interfaces accordingly
5. **Test in browser** - Visual verification matters

The goal is a working site that clearly communicates: "We build websites, set up automation, and manage AI services."
