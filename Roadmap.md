# NeedThisDone.com - Roadmap

## Design Philosophy

- Conservative, professional design with warmth and polish
- WCAG AA accessibility (5:1 contrast minimum)
- Light and dark mode support
- Motion-safe animations (respects prefers-reduced-motion)
- DRY architecture with reusable components
- Single source of truth for colors in `app/lib/colors.ts`

---

## Completed

### Frontend (Phases 1-7)
- Homepage enhancements (typography, spacing, hover effects)
- Foundation components: PageHeader, Card, CTASection
- Page enhancements: Services, Pricing, How It Works, FAQ, Contact
- Component library: Button, ServiceCard, PricingCard, StepCard, CircleBadge
- Centralized color system with Tailwind safelist

### Backend (Phase 9a-b)
- Admin dashboard with user management
- Client dashboard with role-based routing

---

## Pending

### Email Notifications

**Prerequisites:**
- Sign up for [Resend](https://resend.com) (free: 3,000 emails/month)
- Add `RESEND_API_KEY` to `.env.local`
- Install: `npm install resend`

**Build:**
- Create `app/lib/email.ts` utility
- Admin alert on new project submission
- Client confirmation email (2 business day response)
- Hook into `/api/projects` POST handler

### Stripe Integration

**Current (Manual):**
- Create payment links in Stripe dashboard
- Send links manually after quoting

**Future (Automated):**
- Checkout session endpoint
- Payment link generation from admin panel
- Webhook integration for payment updates

---

## Next Steps

*Add your next features here*

---

*Last Updated: December 2024*
