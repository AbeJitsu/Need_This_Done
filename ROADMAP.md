# Shopify Plus Competitor Strategy - Roadmap

## Status: In Progress

**Mission**: Build feature parity with Shopify Plus ($2,500/month), then market as a cost-effective alternative.

**Market positioning**: "Shopify Plus features at a fraction of the cost—save $30K-45K/year"

---

## Phase 1: Build Missing Shopify Plus Features

**Goal**: Achieve feature parity with Shopify Plus core capabilities before marketing comparison.

### 1A. Visual Automation Builder (Flow Competitor) ✅ **COMPLETE**

**Status**: Core system built (Feb 6, 2026). Dependencies installed, all components created, build passes.

**Architecture:**
- **Execution**: Async via BullMQ task queue (Redis-backed)
- **Event System**: Direct emitters — emit events in existing code, workflow system listens
- **Visual Builder**: React Flow library for drag-and-drop canvas
- **Database**: 3 Supabase tables (workflows, workflow_executions, workflow_logs)

**Core Components:**
- [x] `app/app/admin/automation/page.tsx` — Workflow list dashboard
- [x] `app/app/admin/automation/builder/page.tsx` — Visual workflow builder
- [x] `app/app/admin/automation/[id]/page.tsx` — Edit existing workflow
- [x] `app/components/WorkflowBuilder/Canvas.tsx` — Drag-and-drop canvas (React Flow)
- [x] `app/components/WorkflowBuilder/TriggerNode.tsx` — Trigger node (emerald)
- [x] `app/components/WorkflowBuilder/ConditionNode.tsx` — If/else logic node (blue)
- [x] `app/components/WorkflowBuilder/ActionNode.tsx` — Action node (purple)
- [x] `app/components/WorkflowBuilder/NodePalette.tsx` — Draggable node sidebar
- [x] `app/components/WorkflowBuilder/NodeConfigPanel.tsx` — Node configuration panel
- [x] `app/components/WorkflowBuilder/TestRunPanel.tsx` — Test execution preview

**Backend:**
- [x] `app/lib/workflow-engine.ts` — BullMQ-based workflow execution
- [x] `app/lib/workflow-events.ts` — Event emitter system
- [x] `app/lib/workflow-validator.ts` — Zod validation (12 triggers, 7 actions, 8 operators)
- [x] `app/api/workflows/route.ts` — CRUD endpoints
- [x] `app/api/workflows/[id]/route.ts` — Individual workflow CRUD
- [x] `app/api/workflows/[id]/execute/route.ts` — Manual execution trigger
- [x] `app/api/workflows/[id]/test-run/route.ts` — Preview execution with sample data

**Database:**
- [x] Migration: `054_workflow_automation.sql` (workflows, workflow_executions, workflow_logs)

**Trigger Types (12):**
- [x] Product events (created, updated, out of stock, back in stock)
- [x] Customer actions (signup, first purchase)
- [x] Order events (placed, fulfilled, cancelled, refunded)
- [x] Inventory changes (low stock)
- [x] Manual trigger

**Action Types (7):**
- [x] Send email (template-based)
- [x] Tag customer/product/order
- [x] Create notification
- [x] Webhook (call external API)
- [x] Update product status

**Remaining (Phase 1A follow-up):**
- [ ] Pre-built workflow templates (Abandoned Cart, VIP Tagging, etc.)
- [x] Public demo page at `/features/flow-automation` — components created, needs page route
- [ ] **⏳ IN PROGRESS: Demo Canvas Positioning** — Canvas panning enabled, debug overlay added (Feb 6). Need to: determine correct CANVAS_CENTER_Y values for each workflow, ensure condition nodes centered vertically, adjust trigger-condition connector length
- [ ] Time-based triggers (daily, weekly, monthly)

---

### 1B. B2B/Wholesale Portal

**WHAT**: Separate portal for wholesale buyers with custom pricing, bulk ordering, and payment terms

**WHY**:
- Major Shopify Plus differentiator ($2,500/month feature)
- Enterprise/B2B clients are high-value
- Case study: 12 hours/week saved in manual work, 63-day launch
- Opens new client segment (B2B brands)

**HOW**:

**Customer-Facing Pages:**
- [ ] `app/app/wholesale/page.tsx` — B2B storefront (separate from retail)
- [ ] `app/app/wholesale/register/page.tsx` — B2B account registration
- [ ] `app/app/wholesale/account/page.tsx` — Company account management
- [ ] `app/app/wholesale/quick-order/page.tsx` — Bulk order form (SKU + quantity)
- [ ] `app/app/wholesale/shopping-lists/page.tsx` — Saved shopping lists

**Admin Pages:**
- [ ] `app/app/admin/wholesale/page.tsx` — B2B dashboard
- [ ] `app/app/admin/wholesale/customers/page.tsx` — B2B customer list
- [ ] `app/app/admin/wholesale/approval-queue/page.tsx` — Approve new B2B accounts
- [ ] `app/app/admin/wholesale/price-lists/page.tsx` — Manage wholesale pricing

**Components:**
- [ ] `app/components/wholesale/BulkOrderForm.tsx` — Quick order interface
- [ ] `app/components/wholesale/PriceListManager.tsx` — Wholesale price CRUD
- [ ] `app/components/wholesale/PaymentTermsSelector.tsx` — Net 30/60/90 options
- [ ] `app/components/wholesale/QuickReorder.tsx` — Reorder from previous

**API Routes:**
- [ ] `app/api/wholesale/register/route.ts` — B2B registration
- [ ] `app/api/wholesale/approval/route.ts` — Approve/reject accounts
- [ ] `app/api/wholesale/pricing/route.ts` — Get wholesale prices
- [ ] `app/api/wholesale/orders/route.ts` — B2B order placement

**Database:**
- [ ] Migration: `b2b_customers` table (company_name, tax_id, credit_limit, payment_terms, status)
- [ ] Migration: `price_lists` table (name, customer_id, product_id, wholesale_price, min_qty)
- [ ] Migration: `b2b_users` table (user_id, b2b_customer_id, role)
- [ ] Migration: `shopping_lists` table (b2b_customer_id, name, items)

**Features:**
- [ ] Separate B2B registration with admin approval workflow
- [ ] Company profile (business name, tax ID, shipping addresses)
- [ ] Multiple users per company (role-based: buyer, approver, admin)
- [ ] Wholesale pricing (separate from retail, volume-based tiers)
- [ ] Minimum order quantities (MOQ)
- [ ] Payment terms (Net 30/60/90, invoice/credit)
- [ ] Bulk ordering (SKU + qty quick form, CSV upload)
- [ ] Shopping lists/favorites
- [ ] Purchase order numbers
- [ ] Credit limit tracking

**Verification:**
```bash
# Test B2B registration → approval workflow
# Test wholesale pricing display (different from retail)
# Test bulk order form (add 10 products at once)
# Test payment terms (invoice generation)
# Test MOQ enforcement (can't order less than minimum)
# Test CSV upload for bulk orders
```

---

### 1C. Multi-Currency Support

**WHAT**: Display prices in customer's local currency with automatic conversion

**WHY**:
- Shopify Plus supports 150+ countries
- International expansion feature
- Common client request for global brands

**HOW**:

**Implementation:**
- [ ] `app/lib/currency-converter.ts` — Currency conversion logic
- [ ] `app/lib/currency-data.ts` — Exchange rates (fetch from API)
- [ ] `app/components/CurrencySelector.tsx` — Currency dropdown
- [ ] `app/context/CurrencyContext.tsx` — Global currency state
- [ ] `app/api/currency/rates/route.ts` — Fetch exchange rates

**Features:**
- [ ] Automatic geolocation-based currency detection
- [ ] Manual currency selector (dropdown in header)
- [ ] Price conversion (150+ currencies)
- [ ] Price rounding rules per currency
- [ ] Exchange rate updates (daily cron job)
- [ ] Stripe multi-currency payment support

**Database:**
- [ ] Migration: `exchange_rates` table (from_currency, to_currency, rate, updated_at)

**Verification:**
```bash
# Test currency selector changes all prices
# Test geolocation detection (use VPN to test)
# Test Stripe accepts payment in selected currency
# Test price rounding (JPY vs USD formatting)
```

---

## Phase 2: Build Comparison Page

**Goal**: Show feature parity with Shopify Plus, emphasize cost savings

### 2A. Main Comparison Page

**WHAT**: `/compare/shopify-plus` page highlighting features + cost breakdown

**WHY**:
- SEO target: "Shopify Plus alternative" (1,600 searches/month)
- Lead generation: Contact form submissions
- Portfolio showcase: "I built this vs. $2,500/month platform"

**HOW**:

**Pages:**
- [ ] `app/app/compare/shopify-plus/page.tsx` — Main comparison page
- [ ] `app/app/compare/shopify-plus/layout.tsx` — Metadata, schema markup

**Components:**
- [ ] `app/components/compare/CostBreakdown.tsx` — Pricing calculator
- [ ] `app/components/compare/FeatureMatrix.tsx` — Feature comparison table
- [ ] `app/components/compare/FeatureRow.tsx` — Individual feature row
- [ ] `app/components/compare/CTASection.tsx` — "Get Started" CTA

**Data:**
- [ ] `app/lib/shopify-comparison-data.ts` — Centralized feature list

**Content Sections:**
1. **Hero**
   - Headline: "Shopify Plus Features at a Fraction of the Cost"
   - Subheadline: "Save $30K-45K/year with built-in features Shopify charges for"
   - CTA: "See Feature Comparison" + "Get Started"

2. **Cost Breakdown Table**
   ```
   | Feature          | Shopify Plus + Apps | NeedThisDone | Annual Savings |
   |------------------|---------------------|--------------|----------------|
   | Platform Fee     | $30,000/yr          | $X,XXX/yr    | $XX,XXX        |
   | Email Marketing  | $6,000/yr (Klaviyo) | Included     | $6,000         |
   | Loyalty Program  | $3,600/yr           | Included     | $3,600         |
   | Referrals        | $2,400/yr           | Included     | $2,400         |
   | Flow Automation  | Included            | Included     | $0             |
   | Product Analytics| $1,800/yr           | Included     | $1,800         |
   | Reviews          | $600/yr             | Included     | $600           |
   | Waitlist         | $600/yr             | Included     | $600           |
   | **TOTAL**        | ~$45,000/yr         | $X,XXX/yr    | **$XX,XXX**    |
   ```

3. **Feature Comparison Matrix**
   - Categorize by tier (Critical, Differentiation, Operational)
   - Checkmarks, X's, "Coming Soon" labels
   - Link each feature name to individual feature page

4. **SEO-Optimized FAQ**
   - "Is Shopify Plus worth $2,500/month?"
   - "What's the difference between Shopify and Shopify Plus?"
   - "What are the best Shopify Plus alternatives?"
   - "Do I need Shopify Plus for loyalty programs?"
   - "Can I automate workflows without Shopify Flow?"

5. **CTA Section**
   - "Ready to Build Your Store?"
   - Contact form / consultation booking

**SEO:**
- [ ] Schema.org ComparisonTable markup
- [ ] FAQ schema for rich snippets
- [ ] Meta description, OG tags
- [ ] Internal links to feature pages

**Verification:**
```bash
# Lighthouse SEO audit (90+ score)
# Google Rich Results Test (schema validation)
# Mobile responsiveness
# Load time < 2s
# Visual regression test (screenshots)
```

---

## Phase 3: Build Individual Feature Pages

**Goal**: Deep-dive pages for each major feature, ranked by SEO value

### 3A. Feature Page Template

**WHAT**: Dynamic route `/features/[slug]` with standardized structure

**HOW**:

**Pages:**
- [ ] `app/app/features/[slug]/page.tsx` — Dynamic feature page
- [ ] `app/app/features/[slug]/layout.tsx` — Metadata

**Data:**
- [ ] `app/lib/feature-content.ts` — Feature page content (structured data)

**Page Structure** (same for all features):
```
1. HERO
   - Feature name + tagline
   - "What [Feature] Costs on Shopify Plus" callout box
   - Screenshot/demo video

2. PROBLEM STATEMENT
   - "Why [Feature] Matters for E-Commerce"
   - Market stats, pain points

3. SHOPIFY PLUS APPROACH
   - How Shopify Plus handles this (or requires third-party apps)
   - Typical app costs ($X/month)
   - Limitations

4. OUR APPROACH
   - How we built it
   - Technical highlights
   - Screenshots/walkthrough

5. FEATURE COMPARISON TABLE
   | Capability | Shopify Plus | Third-Party Apps | NeedThisDone |
   |------------|--------------|------------------|--------------|
   | Feature 1  | ✅ / ❌       | ✅ ($X/mo)        | ✅ Included   |

6. DEMO VIDEO / INTERACTIVE PREVIEW
   - Embedded walkthrough
   - Live demo link

7. TECHNICAL DEEP-DIVE (collapsible)
   - Architecture diagram
   - Code samples
   - API documentation

8. USE CASES
   - "E-Commerce Brand: Increase Repeat Purchases by 35%"
   - "B2B Wholesaler: Cut Manual Work by 12 Hours/Week"

9. CTA
   - "Want This for Your Store?" → Contact form
   - "Explore All Features" → Back to comparison page
```

---

### 3B. Feature Pages (Priority Order)

**Build in this order:**

1. **Flow Automation** (`/features/flow-automation`) 🔥
   - Status: Build in Phase 1A
   - SEO: "Shopify Flow automation" (400 searches/mo)
   - Highlight: Visual workflow builder, test runs, execution logs
   - Video: "I Built Shopify Flow From Scratch"

2. **Email Marketing** (`/features/email-marketing`)
   - Status: ✅ Already built
   - SEO: "Klaviyo alternative Shopify" (150 searches/mo)
   - Highlight: Template builder, 5 segments, real-time tracking
   - Video: "Klaviyo costs $500/mo. I built this from scratch."

3. **Loyalty Programs** (`/features/loyalty-programs`)
   - Status: ✅ Already built
   - SEO: "Shopify loyalty program without app" (200 searches/mo)
   - Highlight: Earn/redeem, admin analytics, no monthly fees
   - Video: "LoyaltyLion charges $300/mo. Here's mine."

4. **B2B/Wholesale** (`/features/b2b-wholesale`)
   - Status: Build in Phase 1B
   - SEO: "Shopify B2B wholesale" (600 searches/mo)
   - Highlight: Wholesale pricing, bulk ordering, payment terms
   - Video: "Shopify Plus B2B features, but custom-built"

5. **Referral Programs** (`/features/referral-programs`)
   - Status: ✅ Already built
   - SEO: "Shopify referral program" (250 searches/mo)
   - Highlight: Unique codes, store credits, conversion tracking

6. **Product Analytics** (`/features/product-analytics`)
   - Status: ✅ Already built (advanced)
   - SEO: "Shopify product analytics" (300 searches/mo)
   - Highlight: Trending detection (24h vs previous), event tracking

7. **Waitlist/Back-in-Stock** (`/features/waitlist-notifications`)
   - Status: ✅ Already built (advanced)
   - SEO: "Shopify waitlist app" (150 searches/mo)
   - Highlight: Demand forecasting, conversion tracking

**Tasks per feature page:**
- [ ] Write copy (problem, Shopify approach, our approach)
- [ ] Create screenshots (3-5 per page)
- [ ] Record demo video (2-3 minutes)
- [ ] Write technical deep-dive section
- [ ] Add schema markup (Product, FAQ)
- [ ] Internal linking (comparison page → feature pages)

---

## Phase 4: Video & Marketing Content

**Goal**: Create viral portfolio content, drive traffic to comparison pages

### 4A. Video Series: "I Built Shopify Plus Features From Scratch"

**Episodes:**

1. **Flow Automation** (3-5 minutes) 🔥 **HIGHEST VIRAL POTENTIAL**
   - Hook: "Shopify Flow is a $2,500/month feature. I'm building it from scratch."
   - Demo: Drag-and-drop workflow → Test run → Activate → Show execution
   - Technical callout: "Visual builder, test runs, execution logs"
   - CTA: "Technical deep-dive at needthisdone.com/features/flow-automation"

2. **Email Marketing** (2-3 minutes)
   - Hook: "Klaviyo costs $500/month. I built this email system from scratch."
   - Demo: Create template → Segment customers → Send → Track analytics
   - CTA: "Full breakdown at needthisdone.com/features/email-marketing"

3. **Loyalty Programs** (2-3 minutes)
   - Hook: "LoyaltyLion charges $300/month for this feature."
   - Demo: Browse product → Earn points → Redeem at checkout → Admin analytics
   - CTA: "Feature page at needthisdone.com/features/loyalty-programs"

4. **B2B/Wholesale** (3-4 minutes)
   - Hook: "Shopify Plus B2B costs $2,500/month. Here's my version."
   - Demo: Bulk order form → Wholesale pricing → Payment terms → Approval workflow
   - CTA: "Deep-dive at needthisdone.com/features/b2b-wholesale"

**Video checklist per episode:**
- [ ] Script (hook, demo, technical callout, CTA)
- [ ] Screen recording (1080p or 4K)
- [ ] Voiceover or captions
- [ ] Thumbnail (attention-grabbing)
- [ ] Upload (YouTube, Twitter, LinkedIn)
- [ ] Embed on feature page

---

### 4B. Blog Posts (SEO + Backlinks)

**Posts:**
1. "Shopify Plus Review 2026: Is $2,500/Month Worth It?"
2. "7 Reasons to Skip Shopify Plus (And Build Custom Instead)"
3. "How I Built Shopify Flow From Scratch (Technical Breakdown)"
4. "Klaviyo vs. Custom Email Marketing: Cost Comparison"
5. "Case Study: $40K/Year Saved by Building Custom E-Commerce"

---

## Phase 5: SEO & Lead Generation (Ongoing)

**Target Keywords:**
- "Shopify Plus alternative" (1,600 searches/mo) → Comparison page
- "Shopify Plus competitors" (800 searches/mo) → Comparison page
- "Shopify Flow automation" (400 searches/mo) → Flow feature page
- "Shopify B2B wholesale" (600 searches/mo) → B2B feature page
- "Klaviyo alternative Shopify" (150 searches/mo) → Email feature page

**Success Metrics:**
- [ ] Rank top 10 for "Shopify Plus alternative" (within 3 months)
- [ ] 500+ organic visits/month to comparison pages (within 6 months)
- [ ] 10+ contact form submissions/month from comparison pages
- [ ] 5+ consultation bookings/month
- [ ] 50+ backlinks from eCommerce blogs/directories

---

## Verification Checklist

**After each phase:**
```bash
cd app && npm run dev          # Visual check
cd app && npm run build        # Zero warnings
cd app && npm run test:e2e     # E2E tests pass
cd app && npm run test:a11y    # Accessibility tests pass
npx lighthouse <url>           # SEO audit (90+ score)
```

**SEO validation:**
- [ ] Google Rich Results Test (schema markup)
- [ ] Mobile-friendly test
- [ ] PageSpeed Insights (90+ score)
- [ ] Internal linking structure
- [ ] Meta descriptions, OG tags

---

## Next Steps

**Priority 1 (Build Now):**
1. ✅ Update roadmap (this file)
2. ✅ Phase 1A: Visual automation builder — core system complete
3. ✅ Database migration for workflows
4. Phase 1A follow-up: Public demo page (`/features/flow-automation`)
5. Phase 1A follow-up: Pre-built workflow templates

**Priority 2 (Next Session):**
1. Phase 1B: Build B2B/wholesale portal
2. Phase 1C: Add multi-currency support

**Priority 3 (After Features):**
1. Phase 2: Build comparison page
2. Phase 3: Build individual feature pages (7 pages)

**Priority 4 (Marketing):**
1. Phase 4: Video series: "I Built Shopify Plus Features"
2. Blog post series
3. SEO optimization

---

## Resources

**Research Sources:**
- [Shopify Plus Features 2026](https://www.ontapgroup.com/blog/shopify-plus-features)
- [Shopify Flow Automation Updates 2025](https://www.shopify.com/blog/flow-automation-updates-2025)
- [Top Loyalty Apps for Shopify](https://www.charleagency.com/articles/top-loyalty-apps-shopify/)
- [Best Email Marketing Apps for Shopify](https://www.omnisend.com/blog/best-email-marketing-for-shopify/)
- [Shopify Plus Alternatives](https://www.g2.com/products/shopify-plus/competitors/alternatives)

**Technical References:**
- React Flow library (for workflow builder)
- Schema.org markup (comparison tables, FAQ)
- Shopify GraphQL API (for feature parity reference)
