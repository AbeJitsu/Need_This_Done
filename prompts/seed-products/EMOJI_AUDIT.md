# Emoji Audit Report

**Generated:** February 3, 2026
**Purpose:** Identify all emoji usage across the site for potential replacement with custom Gemini images

---

## Executive Summary

| Category | Files with Emojis | Total Emoji Instances |
|----------|-------------------|----------------------|
| Public Pages | 2 | 8 |
| Shop & Account Pages | 5 | 23 |
| Admin Pages | 12 | ~40 |
| UI Components | 10 | 63 |
| Content Editor | 3 | 5 |
| Inline Editor | 3 | 5 |
| Email Templates | 15+ | 40+ |
| **TOTAL** | **~50 files** | **~180+ instances** |

---

## Detailed Findings by Section

### 1. Public-Facing Pages

#### `/app/about/page.tsx` (8 emojis)

| Line | Emoji | Context | Purpose | Custom Image Candidate |
|------|-------|---------|---------|------------------------|
| 93 | 🎖️ | Timeline badge | U.S. Army section icon | Military medal/badge |
| 112 | 🚗 | Timeline badge | Toyota Finance section icon | Car/automotive |
| 131 | 💻 | Timeline badge | Full-Stack Dev section icon | Laptop/coding |
| 170 | 🥋 | Belt badge center | BJJ purple belt display | Martial arts gi/belt |
| 225 | 💬 | Value card icon | "Clear Communication" | Speech bubble |
| 239 | ✅ | Value card icon | "Reliable Follow-through" | Checkmark/completion |
| 253 | 🧘 | Value card icon | "Calm Under Pressure" | Meditation pose |
| 269 | ⚡ | Philosophy card | "On AI" section | Lightning/energy |

#### Pages with NO emojis
- `/app/page.tsx` (homepage)
- `/app/pricing/page.tsx`
- `/app/faq/page.tsx`
- `/app/contact/page.tsx`
- `/app/blog/page.tsx`
- `/app/blog/[slug]/page.tsx`
- `/app/resume/page.tsx`
- `/app/guide/page.tsx`
- `/app/privacy/page.tsx`
- `/app/terms/page.tsx`
- `/app/build/page.tsx`
- `/app/build/success/page.tsx`
- `/app/pricing/success/page.tsx`
- `/app/login/page.tsx`

---

### 2. Shop & Account Pages

#### `/app/cart/page.tsx` (7 emojis)

| Line | Emoji | Context | Purpose | Custom Image Candidate |
|------|-------|---------|---------|------------------------|
| 191 | 🌐 | `getTypeIcon()` | Package product type | Globe/website |
| 192 | ✨ | `getTypeIcon()` | Addon product type | Sparkles/enhancement |
| 193 | ⚙️ | `getTypeIcon()` | Service product type | Gear/automation |
| 194 | 🔄 | `getTypeIcon()` | Subscription type | Refresh/recurring |
| 195 | 📦 | `getTypeIcon()` | Default fallback | Package/box |
| 289 | 🛒 | Hero watermark | Decorative background | Shopping cart |
| 574 | 💡 | Info box | "What happens next?" | Lightbulb/tip |

#### `/app/checkout/page.tsx` (9 emojis)

| Line | Emoji | Context | Purpose | Custom Image Candidate |
|------|-------|---------|---------|------------------------|
| 557 | ⚠️ | Alert | Appointment failure | Warning triangle |
| 636 | 📅 | Hero watermark | Appointment step | Calendar |
| 698 | 💡 | Info box | "What happens next?" | Lightbulb |
| 733 | 💳 | Hero watermark | Payment step | Credit card |
| 775 | 💰 | Info box | Deposit payment info | Money bag |
| 840 | ⚠️ | Validation | Consent checkbox | Warning |
| 886 | 🔒 | Info box | Security info | Lock/secure |
| 920 | ✨ | Hero watermark | Contact info step | Sparkles |
| 1244 | 💡 | Info box | "What happens next?" | Lightbulb |

#### `/app/orders/page.tsx` (3 emojis)

| Line | Emoji | Context | Purpose | Custom Image Candidate |
|------|-------|---------|---------|------------------------|
| 311 | 📥 | Button | Export CSV | Download/inbox |
| 380 | ⏳ | Loading state | Quick reorder loading | Hourglass |
| 380 | 🔄 | Button | Quick reorder label | Refresh/reorder |

#### `/app/wishlist/page.tsx` (1 emoji)

| Line | Emoji | Context | Purpose | Custom Image Candidate |
|------|-------|---------|---------|------------------------|
| 73 | 🤍 | Empty state | Large decorative heart | White heart |

#### `/app/recently-viewed/page.tsx` (1 emoji)

| Line | Emoji | Context | Purpose | Custom Image Candidate |
|------|-------|---------|---------|------------------------|
| 120 | 👀 | Empty state | Large decorative eyes | Eyes/looking |

#### Pages with NO emojis
- `/app/shop/page.tsx`
- `/app/shop/[productId]/page.tsx`
- `/app/account/page.tsx`
- `/app/dashboard/page.tsx`
- `/app/orders/[orderId]/page.tsx`
- `/app/quotes/[ref]/page.tsx`

---

### 3. Admin Pages

#### `/app/admin/appointments/page.tsx` (2 emojis)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 146 | ⚠️ | Error message | Calendar warning |
| 150 | ⚠️ | Error message | Email warning |

#### `/app/admin/blog/page.tsx` (3 emojis)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 385 | 📱 | Tip card | "From LinkedIn" icon |
| 394 | ✍️ | Tip card | "Write Fresh" icon |
| 403 | 🚀 | Tip card | "Publish Fast" icon |

#### `/app/admin/blog/new/page.tsx` (1 emoji)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 199 | 💡 | Info banner | "Quick Tip" heading |

#### `/app/admin/dev/page.tsx` (4 emojis)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 92 | 👥 | Card icon | "Manage Users" |
| 98 | 📄 | Card icon | "Manage Pages" |
| 104 | 🛒 | Card icon | "Shop Admin" |
| 110 | 📊 | Card icon | "Dashboard" |

#### `/app/admin/enrollments/page.tsx` (6 emojis)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 189 | 📚 | Metric card | Total Enrollments |
| 190 | 🎓 | Metric card | Free Enrollments |
| 191 | 💳 | Metric card | Paid Enrollments |
| 192 | ✅ | Metric card | Completed |
| 193 | 💰 | Metric card | Total Revenue |
| 194 | 📊 | Metric card | Avg Progress |

#### `/app/admin/product-analytics/page.tsx` (6 emojis)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 205 | 📊 | Metric card | Total Interactions |
| 211 | 👁️ | Metric card | Product Views |
| 217 | 🛒 | Metric card | Cart Additions |
| 223 | 💳 | Metric card | Purchases |
| 511-513 | 👁️🛒💳 | Tooltip | Trend chart indicators |

#### `/app/admin/products/page.tsx` (2 emojis)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 380 | 📦 | Empty state | No products placeholder |
| 427 | 📦 | Fallback | Missing thumbnail |

#### `/app/admin/reviews/page.tsx` (2 Unicode symbols)

| Line | Symbol | Context | Purpose |
|------|--------|---------|---------|
| 315 | ★ | Rating display | Star rating |
| 321 | ✓ | Badge | Verified purchase |

#### `/app/admin/users/page.tsx` (Unicode arrows only)

| Line | Symbol | Context | Purpose |
|------|--------|---------|---------|
| 463+ | ↑ ↓ | Sort buttons | Ascending/descending indicators |

#### Admin pages with NO emojis
- `/app/admin/analytics/page.tsx`
- `/app/admin/colors/page.tsx`
- `/app/admin/communication/page.tsx`
- `/app/admin/content/page.tsx`
- `/app/admin/loyalty/page.tsx`
- `/app/admin/orders/page.tsx`
- `/app/admin/quotes/page.tsx`
- `/app/admin/referrals/page.tsx`
- `/app/admin/settings/page.tsx`
- `/app/admin/shop/*.tsx` (all shop admin pages)
- `/app/admin/waitlist-*.tsx` (all waitlist pages)

---

### 4. UI Components (Highest Density)

#### `/components/HowItWorks.tsx` (13 emojis) - HIGH PRIORITY

| Line | Emoji | Context | Purpose | Custom Image Candidate |
|------|-------|---------|---------|------------------------|
| 34 | 👤 | Flow diagram | Visitor step | User silhouette |
| 46 | 🎯 | Flow diagram | App step | Target/bullseye |
| 58 | ⚡ | Flow diagram | Cache step | Lightning/speed |
| 70 | 💾 | Flow diagram | Storage step | Database/disk |
| 88-96 | 👤⬇️⚡💾⬆️ | Mobile flow | Flow direction | Arrows and icons |
| 140 | 💡 | Key concept | Tip indicator | Lightbulb |
| 152-168 | 🔒🔐🚫🎫 | Security section | Security concepts | Lock variants |
| 283 | ☁️ | Infrastructure | Cloud note | Cloud |

#### `/components/WhatCanYouBuild.tsx` (10 emojis)

| Line | Emoji | Context | Purpose | Custom Image Candidate |
|------|-------|---------|---------|------------------------|
| 26 | 👥 | Project icon | Social Network | People group |
| 42 | 🛒 | Project icon | Online Store | Shopping cart |
| 58 | 📝 | Project icon | Blog Platform | Document/writing |
| 74 | 📊 | Project icon | Admin Dashboard | Chart/analytics |
| 187 | ⏱️ | Setup section | Setup Time | Timer/clock |
| 213 | 💡 | Explanation | "This Example" | Lightbulb |
| 244-248 | ✓🏗️ | Build sections | We Built/You Build | Check, construction |

#### `/components/CurrencySelector.tsx` (10 flag emojis)

| Line | Emoji | Context | Purpose | Custom Image Candidate |
|------|-------|---------|---------|------------------------|
| 27-37 | 🇺🇸🇪🇺🇬🇧🇨🇦🇦🇺🇯🇵🇨🇳🇮🇳🇲🇽🇧🇷 | Currency list | Country flags | Flag images |

#### `/components/AdminDashboard.tsx` (8 emojis)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 77 | 📰 | Quick link | Blog |
| 87 | 📝 | Quick link | Edit Content |
| 97 | 🛒 | Quick link | Shop |
| 107 | 📅 | Quick link | Appointments |
| 117 | 👥 | Quick link | Users |
| 127 | 📊 | Quick link | Analytics |
| 137 | ⚙️ | Quick link | Dev Tools |
| 202 | 📋 | Empty state | No matches |

#### `/components/AuthDemo.tsx` (4 emojis)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 240 | 💡 | Note | Real auth tip |
| 306 | ⚠️ | Scenario | Security threat |
| 308 | ⚠️ | Scenario | Data breach |
| 320 | ✓ | Summary | Verified check |

#### `/components/SpeedDemo.tsx` (2 emojis)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 175 | ⚡ | Badge | Cache result |
| 204 | 💡 | Tip | Performance tip |

#### `/components/FeatureCard.tsx` (2 emojis)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 59 | 💡 | Benefit section | Tip indicator |
| 66 | ✓ | Metric section | Verification check |

#### `/components/ServiceCardWithModal.tsx` (2 emojis)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 129 | 🔗 | Menu option | Edit Link |
| 134 | 📝 | Menu option | Edit Modal |

#### `/components/DatabaseDemo.tsx` (1 emoji)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 158 | 📦 | Placeholder | Product fallback |

#### `/components/ProductRecommendations.tsx` (1 emoji)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 158 | 📦 | Placeholder | Product image fallback |

#### Components with NO emojis
- `CircleBadge.tsx`
- `HealthStatus.tsx`
- `SystemOverview.tsx`
- `DarkModeToggle.tsx`
- `PageContainer.tsx`
- `ProjectDetailModal.tsx`
- All blog components
- All chatbot components (except minor ones noted below)

---

### 5. Content Editor Components

#### `/components/content-editor/forms/HomepageForm.tsx` (2 arrows)

| Line | Symbol | Context | Purpose |
|------|--------|---------|---------|
| 81 | → | Placeholder | "Compare them all →" |
| 147 | → | Placeholder | "See the full process →" |

#### `/components/content-editor/previews/ServicesPreview.tsx` (2 symbols)

| Line | Symbol | Context | Purpose |
|------|--------|---------|---------|
| 56 | ✓ | List marker | "What to Expect" checkmark |
| 61 | → | Hover effect | Clickable item indicator |

#### `/components/content-editor/previews/HomepagePreview.tsx` (1 arrow)

| Line | Symbol | Context | Purpose |
|------|--------|---------|---------|
| 44 | → | Hover effect | Clickable section indicator |

---

### 6. Inline Editor Components

#### `/components/InlineEditor/EditModeBar.tsx` (1 symbol)

| Line | Symbol | Context | Purpose |
|------|--------|---------|---------|
| 85 | ✕ | Button | Exit edit mode |

#### `/components/InlineEditor/EditModeTutorial.tsx` (3 emojis)

| Line | Emoji | Context | Purpose | Custom Image Candidate |
|------|-------|---------|---------|------------------------|
| 58 | 👆 | Tutorial step | "Click to Edit" | Pointing finger |
| 71 | ⠿ | Tutorial step | "Drag to Reorder" | Drag handle |
| 84 | 💾 | Tutorial step | "Save Your Work" | Save/floppy disk |

#### `/components/InlineEditor/SectionListView.tsx` (1 emoji)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 27 | 💡 | Tip box | Helpful information |

---

### 7. Project Modal Components

#### `/components/project-modal/ProjectModalDetails.tsx` (1 emoji)

| Line | Emoji | Context | Purpose |
|------|-------|---------|---------|
| 82 | 📎 | Attachment list | File attachment indicator |

#### `/components/project-modal/ProjectModalHeader.tsx` (1 symbol)

| Line | Symbol | Context | Purpose |
|------|--------|---------|---------|
| 38 | ✕ | Button | Close modal |

---

## Priority Ranking for Custom Image Replacement

### Tier 1: High Impact (Public-Facing, High Visibility)

| File | Count | Why Priority |
|------|-------|--------------|
| `/app/about/page.tsx` | 8 | Brand identity page, showcases personality |
| `/components/HowItWorks.tsx` | 13 | Educational diagram, high visibility |
| `/components/WhatCanYouBuild.tsx` | 10 | Showcase section, persuasive |
| `/app/cart/page.tsx` | 7 | Checkout flow, customer touchpoint |
| `/app/checkout/page.tsx` | 9 | Critical conversion page |

### Tier 2: Medium Impact (Functional UI)

| File | Count | Why Priority |
|------|-------|--------------|
| `/components/CurrencySelector.tsx` | 10 | Country flags, unique opportunity |
| `/components/AdminDashboard.tsx` | 8 | Admin navigation, frequent use |
| `/app/admin/enrollments/page.tsx` | 6 | Metrics display |
| `/app/admin/product-analytics/page.tsx` | 6 | Analytics icons |

### Tier 3: Lower Impact (Admin/Internal)

| File | Count | Why |
|------|-------|-----|
| `/app/admin/dev/page.tsx` | 4 | Internal dev page |
| `/app/admin/blog/page.tsx` | 3 | Admin tip cards |
| Various admin pages | ~10 | Status indicators |

---

## Emoji Categories for Custom Image Design

### Status Indicators (Most Common)
- ✅ ✓ - Completion/success
- ⚠️ - Warning/alert
- ⏳ - Loading/waiting
- 🔒 🔐 - Security/locked
- ❌ ✕ - Close/error

### Informational Icons
- 💡 - Tips/insights (appears 10+ times)
- 💬 - Communication
- 📊 - Analytics/data
- 📅 - Calendar/scheduling

### Product Type Icons
- 🌐 - Website/package
- ✨ - Addon/enhancement
- ⚙️ - Service/automation
- 🔄 - Subscription/recurring
- 📦 - Product/package

### Navigation/Action Icons
- 🛒 - Shopping/cart
- 📥 - Download/export
- 🔗 - Links
- 📝 - Edit/content

### Brand/Identity Icons (About page)
- 🎖️ - Military service
- 🚗 - Automotive
- 💻 - Development
- 🥋 - BJJ/martial arts
- 🧘 - Calm/mindfulness

### Decorative/Watermarks
- Large background emojis in hero sections
- Empty state illustrations

---

## Accessibility Notes

### Issues Found
- `SpeedDemo.tsx`: ⚡ and 📡 lack aria-labels
- `HowItWorks.tsx`: Directional emojis (⬇️⬆️) need text alternatives
- Some standalone emojis missing screen reader context

### Good Practices Found
- `WhatCanYouBuild.tsx`: Proper aria-label on ✓
- `FeatureCard.tsx`: aria-label="Verified"
- `admin/dev/page.tsx`: Uses aria-hidden="true" correctly

---

## Recommendations

### For Gemini Image Generation

1. **Create a consistent icon set** - Design 25-30 custom images covering the main categories above
2. **Match brand colors** - Use the BJJ belt color progression (emerald → blue → purple → gold)
3. **Maintain accessibility** - Ensure custom images have proper alt text and aria-labels
4. **Consider file size** - SVG or optimized PNG for fast loading
5. **Create variants** - Light/dark mode versions if needed

### Suggested Custom Image List

| Category | Icons Needed |
|----------|--------------|
| Status | success, warning, error, loading, locked, unlocked |
| Info | lightbulb, tip, info-circle |
| Products | website, addon, service, subscription, package |
| Actions | cart, download, edit, link, save, close |
| Navigation | arrow-right, arrow-down, arrow-up, drag-handle |
| Brand | medal, car, laptop, gi-belt, meditation, lightning |
| Analytics | chart, eye, purchases, users |
| Flags | 10 country flags (or use existing flag libraries) |

## Gemini image generation prompts

Below are ready-to-paste Gemini prompts and a short template you can reuse to create clean, modern icons and small illustrative images. They target vector-first output (SVG), include light/dark variants, and add concise accessibility guidance (alt text suggestions).

### Prompt template (single-line)

Use this template when generating a single icon. Replace the <PLACEHOLDERS> accordingly.

"Create a clean, modern, minimal flat icon of <SUBJECT> suitable for UI use — simple geometric shapes, 2-color palette (primary: #0f172a / dark slate, accent: #06b6d4 / teal), 24x24 grid, crisp 2px strokes, balanced negative space, export as optimized SVG and 2 PNG sizes (32x32, 128x128), light and dark background variants, provide an accessible alt text suggestion: '<ALT_TEXT>' — style: contemporary product-design icon, no gradients, no heavy textures."

### Output parameters (recommended)

- Format: SVG (primary), PNG 32x32 and 128x128 (fallbacks)
- Style: flat, geometric, minimal, 2-color, 2px strokes
- Color palette: primary #0f172a (dark slate), accent #06b6d4 (teal), neutral #f8fafc (light), optional brand color variants
- Variants: light background (use dark slate stroke), dark background (use light stroke + accent fills)
- Accessibility: return a one-line alt text and suggested aria-label for each icon

### Example Gemini prompts (copy/paste)

- Success / Checkmark

"Create a clean, modern, minimal flat icon of a checkmark inside a rounded square to represent success/completion — 24x24 grid, 2-color palette (primary #0f172a, accent #06b6d4), 2px stroke, optimized SVG + PNG 32x32 and 128x128, light and dark variants, accessible alt text: 'success — completed'."

- Warning / Alert

"Create a minimal warning triangle icon with rounded corners and an exclamation mark — 24x24 grid, warm accent #f59e0b (amber) with dark slate strokes, 2px stroke, SVG + PNG sizes, light/dark variants, alt text: 'warning — attention required'."

- Loading / Hourglass or Spinner

"Create a simple, smooth circular spinner icon for loading states — 24x24 grid, single-color accent #06b6d4, optimized for animation (SVG path segments), provide static PNG fallbacks, alt text: 'loading'."

- Locked / Security

"Create a minimal padlock icon with a closed shackle to represent secure/locked — 24x24 grid, primary dark stroke with accent fill, 2px stroke, SVG + PNG, alt text: 'locked — secure'."

- Lightbulb / Tip

"Create a modern lightbulb icon (tip/insight) — 24x24 grid, accent #06b6d4 for filament, dark stroke, minimal base, SVG + PNG, alt text: 'tip — idea'."

- Website / Globe (Product type)

"Create a minimal globe icon representing website/product — 24x24, circular grid, dark strokes with accent highlights, simple lat/long lines, SVG + PNG, alt text: 'website'."

- Addon / Sparkles

"Create a small sparkle/starburst icon to represent addons/enhancements — 24x24 grid, accent #06b6d4, SVG + PNG, alt text: 'addon — enhancement'."

- Subscription / Recurring

"Create a circular arrow icon representing recurring/subscription — 24x24 grid, 2px stroke, dark + accent, SVG + PNG, alt text: 'recurring — subscription'."

- Package / Box

"Create a minimal box/package icon — 24x24 grid, simple top-fold lines, dark stroke with accent shading, SVG + PNG, alt text: 'package'."

- Cart / Shopping

"Create a minimal shopping cart icon — 24x24 grid, geometric wheels, dark stroke, accent handle, SVG + PNG, alt text: 'cart — shopping'."

- Download / Export

"Create a clean download arrow into a tray icon — 24x24 grid, 2-color, optimized SVG + PNG, alt text: 'download / export'."

- Edit / Pencil

"Create a simple pencil/edit icon — 24x24 grid, diagonal pencil with erased tip, dark stroke + accent, SVG + PNG, alt text: 'edit'."

- Save / Floppy or Cloud

"Create a modern save icon (floppy or cloud) — 24x24 grid, minimal, accent for highlight, SVG + PNG, alt text: 'save'."

- Arrow Right / Navigation

"Create a minimal arrow-right icon for navigation — 24x24 grid, geometric, single stroke, SVG + PNG, alt text: 'go — next'."

- Medal / Military (About page)

"Create a modern medal icon — circular medal with ribbon, minimal geometry, 24x24 grid, accent gold #f59e0b, SVG + PNG, alt text: 'medal — military service'."

- Car / Automotive

"Create a minimal car icon viewed from the side — 24x24 grid, clean silhouette, dark stroke with accent details, SVG + PNG, alt text: 'car — automotive'."

- Laptop / Development

"Create a simple laptop icon with an open screen — 24x24 grid, thin strokes, accent screen fill, SVG + PNG, alt text: 'laptop — development'."

- Gi-belt / Martial Arts

"Create a clean martial-arts belt icon (belt with knot) — 24x24 grid, minimal, support color variants for belt colors (white/blue/purple/brown/black), SVG + PNG, alt text: 'martial arts belt'."

- Meditation / Calm

"Create a minimal meditation pose icon (simple seated figure) — 24x24 grid, soft rounded shapes, accent calming color #60a5fa (light blue), SVG + PNG, alt text: 'meditation — calm'."

- Lightning / Energy

"Create a modern lightning bolt icon — 24x24 grid, sharp geometry, accent yellow #facc15, SVG + PNG, alt text: 'energy — lightning'."

- Chart / Analytics

"Create a minimal bar/line chart icon — 24x24 grid, simple bars and axis, dark stroke with accent bar, SVG + PNG, alt text: 'analytics — chart'."

- Eye / Views

"Create a minimal eye icon for views/visibility — 24x24 grid, dark stroke with accent pupil, SVG + PNG, alt text: 'views — eye'."

- Users / People

"Create a simple user/group icon (two silhouettes) — 24x24 grid, geometric shapes, dark stroke + accent, SVG + PNG, alt text: 'users'."

### Notes and guidance

- For flags, prefer a dedicated flags asset library or request PNG exports with exact country-color fidelity; flag design prompts should be explicit about correct colors and proportions.
- Ask Gemini to return a short metadata JSON with: filename, format, size, hex colors used, and suggested aria-label.
- When generating many icons, use the same prompt template and request a symbol set export (consistent stroke, grid, and padding) to ensure visual harmony.

## Files Reference

---

## Files Reference

Quick list of all files that need modification:

```
# High Priority (Public)
app/app/about/page.tsx
app/app/cart/page.tsx
app/app/checkout/page.tsx
app/app/orders/page.tsx
app/app/wishlist/page.tsx
app/app/recently-viewed/page.tsx

# Components
app/components/HowItWorks.tsx
app/components/WhatCanYouBuild.tsx
app/components/CurrencySelector.tsx
app/components/AdminDashboard.tsx
app/components/SpeedDemo.tsx
app/components/AuthDemo.tsx
app/components/FeatureCard.tsx
app/components/ServiceCardWithModal.tsx
app/components/DatabaseDemo.tsx
app/components/ProductRecommendations.tsx

# Content Editor
app/components/content-editor/forms/HomepageForm.tsx
app/components/content-editor/previews/ServicesPreview.tsx
app/components/content-editor/previews/HomepagePreview.tsx

# Inline Editor
app/components/InlineEditor/EditModeBar.tsx
app/components/InlineEditor/EditModeTutorial.tsx
app/components/InlineEditor/SectionListView.tsx

# Project Modal
app/components/project-modal/ProjectModalDetails.tsx
app/components/project-modal/ProjectModalHeader.tsx

# Admin Pages
app/app/admin/appointments/page.tsx
app/app/admin/blog/page.tsx
app/app/admin/blog/new/page.tsx
app/app/admin/dev/page.tsx
app/app/admin/enrollments/page.tsx
app/app/admin/product-analytics/page.tsx
app/app/admin/products/page.tsx
app/app/admin/products/categories/page.tsx
app/app/admin/reviews/page.tsx
app/app/admin/users/page.tsx
```
