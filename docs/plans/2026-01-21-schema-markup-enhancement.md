# Schema Markup Enhancement Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance JSON-LD structured data to improve Google's understanding of needthisdone.com and enable rich search results.

**Architecture:** Extend existing `JsonLd.tsx` component with ProfessionalService schema, dynamic Service schemas for each service offering, and add SearchAction to WebSite schema. All data sourced from centralized `seo-config.ts`.

**Tech Stack:** Next.js App Router, schema.org JSON-LD, TypeScript

---

## Current State

The site already has:
- ✅ `LocalBusinessJsonLd` in root layout
- ✅ `WebSiteJsonLd` in root layout
- ✅ Generic `ServiceJsonLd` (not service-specific)
- ✅ `FAQPage` schema (not exported as component)

## What We're Adding

1. **ProfessionalService schema** - More accurate than LocalBusiness for a services business
2. **SearchAction in WebSite schema** - Enables sitelinks search box in Google
3. **Dynamic Service schemas** - One per service (Website Builds, Automation Setup, Managed AI)
4. **Service schema on services page** - Aggregate all services

---

## Task 1: Add Services Data to SEO Config

**Files:**
- Modify: `app/lib/seo-config.ts`

**Step 1: Add services array to seoConfig**

Add this after the `keywords` array in `app/lib/seo-config.ts`:

```typescript
  // Services for structured data
  services: [
    {
      name: 'Website Builds',
      description: 'Professional website design and development. Custom sites built to convert visitors into customers, mobile-optimized and SEO-ready.',
      serviceType: 'Web Development',
      price: 'From $500',
    },
    {
      name: 'Automation Setup',
      description: 'Workflow automation and tool integration. Connect your apps and eliminate repetitive manual tasks.',
      serviceType: 'Business Process Automation',
      price: 'From $150',
    },
    {
      name: 'Managed AI Services',
      description: 'AI agent development and ongoing management. Custom AI solutions that run 24/7 while you focus on growth.',
      serviceType: 'AI Consulting',
      price: 'From $500/month',
    },
  ],
```

**Step 2: Commit**

```bash
git add app/lib/seo-config.ts
git commit -m "feat(seo): add services data to seo-config for structured data"
```

---

## Task 2: Enhance WebSite Schema with SearchAction

**Files:**
- Modify: `app/components/seo/JsonLd.tsx`

**Step 1: Update WebSite schema**

Replace the `WebSite` schema definition (around line 50-56) with:

```typescript
  WebSite: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: businessInfo.name,
    url: businessInfo.url,
    description: businessInfo.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${businessInfo.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
```

**Step 2: Commit**

```bash
git add app/components/seo/JsonLd.tsx
git commit -m "feat(seo): add SearchAction to WebSite schema for sitelinks search"
```

---

## Task 3: Add ProfessionalService Schema

**Files:**
- Modify: `app/components/seo/JsonLd.tsx`

**Step 1: Update JsonLdProps interface**

Change line 9-11 from:

```typescript
interface JsonLdProps {
  type: 'LocalBusiness' | 'WebSite' | 'Service' | 'FAQPage';
}
```

To:

```typescript
interface JsonLdProps {
  type: 'LocalBusiness' | 'WebSite' | 'Service' | 'FAQPage' | 'ProfessionalService';
}
```

**Step 2: Add ProfessionalService schema**

Add this after the `LocalBusiness` schema (after line 48):

```typescript
  ProfessionalService: {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': businessInfo.url,
    name: businessInfo.name,
    url: businessInfo.url,
    description: businessInfo.description,
    address: businessInfo.address,
    email: businessInfo.email,
    priceRange: businessInfo.priceRange,
    image: `${businessInfo.url}/og-image.png`,
    sameAs: seoConfig.business.socialLinks,
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: seoConfig.business.openingHours.days,
      opens: seoConfig.business.openingHours.opens,
      closes: seoConfig.business.openingHours.closes,
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Professional Services',
      itemListElement: seoConfig.services.map((service, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.name,
          description: service.description,
        },
      })),
    },
  },
```

**Step 3: Add export function**

Add after `ServiceJsonLd` function (around line 169):

```typescript
export function ProfessionalServiceJsonLd() {
  return <JsonLd type="ProfessionalService" />;
}
```

**Step 4: Commit**

```bash
git add app/components/seo/JsonLd.tsx
git commit -m "feat(seo): add ProfessionalService schema with service catalog"
```

---

## Task 4: Update Root Layout to Use ProfessionalService

**Files:**
- Modify: `app/app/layout.tsx`

**Step 1: Update import**

Change line 16 from:

```typescript
import { LocalBusinessJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';
```

To:

```typescript
import { ProfessionalServiceJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';
```

**Step 2: Replace LocalBusinessJsonLd with ProfessionalServiceJsonLd**

In the `<head>` section (around line 155), change:

```typescript
<LocalBusinessJsonLd />
```

To:

```typescript
<ProfessionalServiceJsonLd />
```

**Step 3: Commit**

```bash
git add app/app/layout.tsx
git commit -m "feat(seo): use ProfessionalService schema instead of LocalBusiness"
```

---

## Task 5: Add Individual Service Schemas

**Files:**
- Modify: `app/components/seo/JsonLd.tsx`

**Step 1: Create dynamic service schema generator**

Add this new component after the existing exports (around line 175):

```typescript
// Dynamic service schema for individual services
interface ServiceSchemaProps {
  serviceName: string;
  serviceDescription: string;
  serviceType: string;
  price?: string;
}

export function DynamicServiceJsonLd({ serviceName, serviceDescription, serviceType, price }: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: serviceDescription,
    serviceType: serviceType,
    provider: {
      '@type': 'ProfessionalService',
      name: seoConfig.siteName,
      url: seoConfig.baseUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.replace(/[^0-9]/g, ''),
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: price.replace(/[^0-9]/g, ''),
          priceCurrency: 'USD',
          description: price,
        },
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// All services schema for services page
export function AllServicesJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Professional Services',
    description: 'Web development, automation, and AI services for businesses',
    itemListElement: seoConfig.services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.name,
        description: service.description,
        serviceType: service.serviceType,
        provider: {
          '@type': 'ProfessionalService',
          name: seoConfig.siteName,
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Step 2: Commit**

```bash
git add app/components/seo/JsonLd.tsx
git commit -m "feat(seo): add dynamic Service schema components"
```

---

## Task 6: Add Service Schema to Services Page

**Files:**
- Modify: `app/app/services/page.tsx`

**Step 1: Import AllServicesJsonLd**

Add import at top of file:

```typescript
import { AllServicesJsonLd } from '@/components/seo/JsonLd';
```

**Step 2: Update the component to include schema**

Change the return statement from:

```typescript
export default function ServicesPage() {
  const content = getDefaultContent('services') as ServicesPageContent;

  return <ServicesPageClient content={content} />;
}
```

To:

```typescript
export default function ServicesPage() {
  const content = getDefaultContent('services') as ServicesPageContent;

  return (
    <>
      <AllServicesJsonLd />
      <ServicesPageClient content={content} />
    </>
  );
}
```

**Step 3: Commit**

```bash
git add app/app/services/page.tsx
git commit -m "feat(seo): add AllServicesJsonLd to services page"
```

---

## Task 7: Export FAQPageJsonLd Component

**Files:**
- Modify: `app/components/seo/JsonLd.tsx`

**Step 1: Add FAQPageJsonLd export**

Add after the other exports (the FAQPage schema already exists, just needs export):

```typescript
export function FAQPageJsonLd() {
  return <JsonLd type="FAQPage" />;
}
```

**Step 2: Commit**

```bash
git add app/components/seo/JsonLd.tsx
git commit -m "feat(seo): export FAQPageJsonLd component"
```

---

## Task 8: Add FAQ Schema to FAQ Page

**Files:**
- Modify: `app/app/faq/page.tsx`

**Step 1: Check current FAQ page structure**

Read the file to see current structure, then add:

```typescript
import { FAQPageJsonLd } from '@/components/seo/JsonLd';
```

**Step 2: Wrap content with schema**

Add `<FAQPageJsonLd />` at the start of the returned JSX.

**Step 3: Commit**

```bash
git add app/app/faq/page.tsx
git commit -m "feat(seo): add FAQPageJsonLd to FAQ page"
```

---

## Task 9: Test and Validate

**Step 1: Start dev server**

```bash
cd app && npm run dev
```

**Step 2: Check schema in browser**

1. Open http://localhost:3000
2. View page source (Cmd+U)
3. Search for `application/ld+json`
4. Verify ProfessionalService and WebSite schemas are present

**Step 3: Check services page**

1. Open http://localhost:3000/services
2. View page source
3. Verify ItemList schema with all 3 services

**Step 4: Validate with Google's tool**

Open: https://validator.schema.org/
Paste the JSON-LD and verify no errors

**Step 5: Final commit and deploy**

```bash
git add -A
git commit -m "feat(seo): complete schema markup implementation"
git checkout production && git merge main --no-edit && git push && git checkout main
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `lib/seo-config.ts` | Add services array with name, description, serviceType, price |
| `components/seo/JsonLd.tsx` | Add ProfessionalService, SearchAction, DynamicServiceJsonLd, AllServicesJsonLd, FAQPageJsonLd |
| `app/layout.tsx` | Replace LocalBusinessJsonLd with ProfessionalServiceJsonLd |
| `app/services/page.tsx` | Add AllServicesJsonLd |
| `app/faq/page.tsx` | Add FAQPageJsonLd |

## Expected Rich Results

After Google re-indexes:
- **Sitelinks search box** - Users can search your site from Google
- **Business knowledge panel** - Professional service info displayed
- **Service listings** - Individual services may appear as rich results
- **FAQ rich results** - FAQ questions may appear directly in search
