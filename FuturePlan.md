# needthisdone.com Future Plan

## What's Done

- All pages: Home, Services, Pricing, FAQ, How It Works, Contact
- Contact form with validation, loading states, success/error handling
- **Contact form backend** - stores submissions in Supabase `projects` table
- **File uploads** - users can attach up to 3 files (5MB each) to submissions
- Navigation with all links
- ServiceCard component
- UI styling and hover effects (light + dark mode)
- Authentication foundation (Supabase auth configured)
- Supabase foundation with demo patterns
- Docker deployment setup

---

## Next Steps: Client Dashboard

Allow users to log in and view their submitted projects with status updates.

### 1. Add user_id to Projects Table
```sql
ALTER TABLE projects ADD COLUMN user_id UUID REFERENCES auth.users(id);
CREATE INDEX projects_user_id_idx ON projects(user_id);
```

### 2. Create Login Page
- `/app/login/page.tsx` - email/password + Google OAuth

### 3. Create Client Dashboard
- `/app/dashboard/page.tsx` - shows user's projects with status
- Display attached files with download links

### 4. API Route for User's Projects
- `/app/api/projects/mine/route.ts` - GET projects by user_id

---

## Email Notifications

**Prerequisites:**
- Sign up for [Resend](https://resend.com) (free: 3,000 emails/month)
- Add `RESEND_API_KEY=re_...` to `.env.local`
- Run `cd app && npm install resend`

**Build:**
- Create `/app/lib/email.ts` (follow pattern from `redis.ts`)
- Admin alert: "New project submitted from {name}"
- Client confirmation: "Thanks! We'll respond within 2 business days"
- Add email sending to `/api/projects` POST handler

---

## Admin Dashboard

**Build:**
- Create `/app/app/admin/page.tsx` (protected route)
- List all projects with filters (status, date)
- Quick actions: view details, change status
- Search and sort

---

## Stripe Integration (Later)

**Manual workflow first:**
- Create payment links in Stripe dashboard
- Send links manually after quoting

**Automated (Phase 3):**
- Checkout session endpoint
- Payment link generation from admin panel
- Webhook integration for payment updates

---

## Implementation Order

| Priority | Feature | Status |
|----------|---------|--------|
| 1 | Database schema | Done |
| 2 | API route | Done |
| 3 | Wire contact form | Done |
| 4 | File uploads | Done |
| 5 | Client dashboard | **Next** |
| 6 | Email notifications | Pending |
| 7 | Admin dashboard | Pending |

---

## Database Schema Reference

```sql
projects (id, user_id, name, email, company, service, message, attachments[], status, created_at, updated_at)
messages (id, project_id, sender_id, content, created_at)
payments (id, project_id, amount, status, stripe_id, created_at)
```

---

## Notes

- Authentication is production-ready
- Infrastructure is solid (Docker, Nginx, Redis, Supabase)
- Every feature copies an existing pattern in the codebase
- Ship incrementally - each feature is independent
