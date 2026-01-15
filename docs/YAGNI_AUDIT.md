# YAGNI Audit: What to Keep vs Remove

## Principle
**YAGNI** = "You Aren't Gonna Need It"

If a feature isn't actively used, tested, or generating value → remove it. Complexity has a carrying cost.

---

## Current Feature Inventory

### KEEP - Core Business Value

| Feature | Why Keep | Status |
|---------|----------|--------|
| Homepage | Primary conversion page | Working |
| Services page | Service explanation | Working |
| Pricing page | Price transparency | Working |
| Contact/Quote form | Lead generation | Working |
| About page | Trust building | Working |
| How It Works | Process clarity | Working |
| FAQ | Self-service answers | Working |
| Login/Auth | User accounts | Working |
| User Dashboard | Client project tracking | Working |
| Admin Dashboard | Project management | Working |
| Shop (consultations) | Revenue stream | Working |
| Cart/Checkout | E-commerce | Working |
| Inline content editing | Quick content updates | Working |

### REMOVE - Not Used / Not Tested

| Feature | Why Remove | Location |
|---------|------------|----------|
| **Page Builder (Puck)** | Not using it, adds complexity | `/admin/pages/*`, Puck integration |
| **Blog system** | "Coming Soon" placeholder, no content | `/blog`, `/admin/blog/*` |
| **Appointments booking** | Not tested/functional | `/admin/appointments` |
| **Analytics dashboard** | Not tested/functional | `/admin/analytics` |
| **Color management admin** | Over-engineered | `/admin/colors` |
| **Quote management** | Not tested/functional | `/admin/quotes` |
| **Dev Tools page** | Development only | `/admin/dev` |
| **Resume page** | Personal, not business | `/resume` |
| **Guide page** | Over-documented for current state | `/guide` |
| **Enrollments/Courses** | Not implemented | UserDashboard course section |

### SIMPLIFY - Keep But Reduce

| Feature | Current State | Simplification |
|---------|---------------|----------------|
| Admin sidebar | 8+ links | 3-4 essential links |
| Content editing | Inline + Admin panel | Just inline editing |
| Service categories | 3 generic buckets | 3 specific tiers |
| Consultation pricing | 3 time-based options | Single consultation product |

---

## Recommended Removal Plan

### Phase 1: Remove Unused Admin Features

**Delete these directories:**
```
app/app/admin/pages/          # Page builder
app/app/admin/blog/           # Blog management
app/app/admin/appointments/   # Booking system
app/app/admin/analytics/      # Analytics
app/app/admin/colors/         # Color management
app/app/admin/quotes/         # Quote management
app/app/admin/dev/            # Dev tools
```

**Update AdminDashboard.tsx:**
Remove quick links to deleted features.

### Phase 2: Remove Unused Public Pages

**Delete:**
```
app/app/blog/                 # Blog pages
app/app/resume/               # Resume page
app/app/guide/                # Platform guide
```

**Update navigation:**
Remove Blog and Guide from header nav.

### Phase 3: Remove Unused Code

**Components to audit:**
- Puck-related components in `app/components/`
- Course/enrollment features in UserDashboard
- Blog-related components

**Dependencies to audit:**
- Any Puck-related npm packages
- Unused UI libraries

---

## What Stays (Simplified Stack)

### Public Pages (7)
```
/                   # Homepage
/services           # Service tiers
/pricing            # Pricing
/how-it-works       # Process
/about              # Founder
/contact            # Quote form
/faq                # Questions
```

### User Pages (4)
```
/login              # Auth
/dashboard          # User projects
/shop               # Consultations
/checkout           # Payment
```

### Admin Pages (4)
```
/dashboard          # Admin view (same route, different component)
/admin/content      # Inline editing management
/admin/shop         # Product management
/admin/users        # User management
```

### Legal (2)
```
/privacy
/terms
```

**Total: 17 routes** (down from 30+)

---

## Code Cleanup Checklist

### Files to Delete
- [ ] `app/app/admin/pages/` (entire directory)
- [ ] `app/app/admin/blog/` (entire directory)
- [ ] `app/app/admin/appointments/` (entire directory)
- [ ] `app/app/admin/analytics/` (entire directory)
- [ ] `app/app/admin/colors/` (entire directory)
- [ ] `app/app/admin/quotes/` (entire directory)
- [ ] `app/app/admin/dev/` (entire directory)
- [ ] `app/app/blog/` (entire directory)
- [ ] `app/app/resume/` (entire directory)
- [ ] `app/app/guide/` (entire directory)

### Files to Update
- [ ] `app/components/AdminDashboard.tsx` - Remove dead links
- [ ] `app/components/UserDashboard.tsx` - Remove course section
- [ ] `app/lib/page-config.ts` - Remove blog, guide configs
- [ ] Header nav - Remove Blog, Guide links
- [ ] Footer - Remove Guide link

### Dependencies to Audit
- [ ] Check `package.json` for unused packages
- [ ] Remove Puck if installed
- [ ] Remove any blog-related packages

---

## Decision Framework

Before adding ANY new feature, ask:

1. **Is a client asking for this?** If no → don't build
2. **Will this generate revenue in 30 days?** If no → don't build
3. **Can I validate this with < 1 hour of work?** If no → don't build

Before keeping ANY existing feature, ask:

1. **Have I used this in the last 30 days?** If no → remove
2. **Does this directly serve clients?** If no → remove
3. **Would a client notice if this disappeared?** If no → remove

---

## Post-Cleanup Benefits

1. **Faster deploys** - Less code to build
2. **Easier maintenance** - Less surface area for bugs
3. **Clearer focus** - Every page has a purpose
4. **Lower cognitive load** - Admin panel actually makes sense
5. **Easier onboarding** - New contributors can understand the codebase

---

## Next Steps

1. **Backup first** - Git commit with clear message before deletions
2. **Remove in phases** - One category at a time, test between
3. **Update tests** - Remove tests for deleted features
4. **Update docs** - Remove references to deleted features
5. **Celebrate** - Less code = better code
