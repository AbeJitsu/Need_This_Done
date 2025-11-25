# needthisdone.com Future Plan

## What's Done

- All pages: Home, Services, Pricing, FAQ, How It Works, Contact
- Contact form with validation, loading states, success/error handling
- Navigation with all links
- ServiceCard component
- UI styling and hover effects (light + dark mode)
- Authentication (Google OAuth + email/password)
- Supabase foundation with demo patterns
- Docker deployment setup

---

## Next Steps: Make Contact Form Functional

The contact form looks great but doesn't store data yet. These steps connect it to your database.

### 1. Database Schema (30 min)
**Copy from:** `/supabase/migrations/001_create_demo_items_table.sql`

Create `/supabase/migrations/002_create_projects_table.sql`:
- Fields: `id`, `user_id`, `name`, `email`, `company`, `service`, `message`, `status`, `created_at`, `updated_at`
- Status enum: `'submitted'`, `'in_review'`, `'scheduled'`, `'in_progress'`, `'completed'`
- Copy RLS policies from demo_items migration
- Add indexes on `user_id` and `status`

### 2. API Route (1 hour)
**Copy from:** `/app/app/api/demo/items/route.ts`

Create `/app/app/api/projects/route.ts`:
- POST handler to validate and insert into projects table
- Match fields to contact form: name, email, company, service, message

### 3. Wire Contact Form (30 min)
**Modify:** `/app/app/contact/page.tsx`

Update `handleSubmit` to POST to `/api/projects` instead of simulating success.

**Result:** Contact form submissions are stored in database.

---

## Email Notifications (3 hours)

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

## File Uploads (4 hours)

**Prerequisites:**
- Enable Storage in Supabase dashboard
- Create "project-uploads" bucket with RLS policies

**Build:**
- Create `uploads` table (migration 003)
- Create `/app/app/api/projects/upload/route.ts`
- Add file input to contact form
- Validate: PDF, JPG, PNG, DOCX (< 5MB)

---

## Client Dashboard (4 hours)

**Copy from:** DatabaseDemo list rendering + AuthContext

**Build:**
- Create `/app/app/dashboard/page.tsx`
- Create `/app/app/api/projects/mine/route.ts` (GET by user_id)
- Display user's projects with status badges

---

## Admin Dashboard (4 hours)

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

| Priority | Feature | Time | Dependencies |
|----------|---------|------|--------------|
| 1 | Database schema | 30 min | None |
| 2 | API route | 1 hour | Schema |
| 3 | Wire contact form | 30 min | API route |
| 4 | Email notifications | 3 hours | Resend |
| 5 | File uploads | 4 hours | Supabase Storage |
| 6 | Client dashboard | 4 hours | API routes |
| 7 | Admin dashboard | 4 hours | API routes |

**MVP (items 1-4):** ~5 hours for fully functional submissions with email alerts

---

## Database Schema Reference

```sql
projects (id, user_id, name, email, company, service, message, status, created_at, updated_at)
uploads (id, project_id, file_url, file_name, file_type, file_size, uploaded_at)
messages (id, project_id, sender_id, content, created_at)
payments (id, project_id, amount, status, stripe_id, created_at)
```

---

## Notes

- Authentication is production-ready
- Infrastructure is solid (Docker, Nginx, Redis, Supabase)
- Every feature copies an existing pattern in the codebase
- Ship incrementally - each feature is independent
