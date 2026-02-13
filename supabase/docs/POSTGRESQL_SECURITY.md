# PostgreSQL Security Implementation

## Introduction

PostgreSQL security requires systematic thinking across multiple layers. This document explains the security patterns implemented in NeedThisDone's database and the reasoning behind them.

Security is not about implementing arbitrary rules—it's about understanding threat models and implementing defenses that prevent real exploitation. The patterns here address specific vulnerabilities found during the Supabase linter audit (168 errors), showing how to fix them correctly.

## Row-Level Security (RLS): The Foundation

Row-level security is PostgreSQL's built-in mechanism for enforcing access control at the row level. Without RLS, all authenticated users see all data (except the schema enforces nothing). With RLS, each user sees only rows they're authorized to access.

### What RLS Is (And What It Isn't)

**RLS is:**
- A database-level access control mechanism
- Transparent to the application (queries automatically filtered)
- Enforceable (even if the application code is buggy, RLS protects data)
- Performant (filters applied at scan time, not in application)

**RLS is NOT:**
- A replacement for application-level validation (use both)
- A magic solution to security (policies must be correctly written)
- A performance penalty if properly indexed (poorly written policies are slow)

### Three-Tier RLS Architecture

Every table in NeedThisDone follows a consistent pattern:

**Tier 1: User Ownership** - Users access their own data

```sql
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own addresses"
  ON public.saved_addresses
  FOR ALL
  USING (user_id = auth.uid());
```

This policy works by:
1. Checking if the row's `user_id` matches the authenticated user
2. If true, the row is included in the result set
3. If false, the row is hidden (even from SELECT *; filtered out before reaching application)

**Tier 2: Admin Access** - Admins can see all data

```sql
CREATE POLICY "Admins can access all addresses"
  ON public.saved_addresses
  FOR ALL
  USING (public.is_admin(auth.uid()));
```

This calls a server-side function to check if the user is an admin (more on this below).

**Tier 3: Service Role Bypass** - Backend APIs have full access

```typescript
// Backend API automatically bypasses RLS
const { data } = await supabaseAdmin
  .from('orders')
  .select('*');  // No RLS filtering
```

The service role is not bound by RLS policies (designed for backend applications). Use this only for trusted backend code.

### Common RLS Patterns

**Pattern: Public Read, Admin Write**

```sql
-- Allow anyone to read categories
CREATE POLICY "Anyone can read categories"
  ON public.product_categories
  FOR SELECT
  USING (true);  -- true = allow all

-- Only admins can modify
CREATE POLICY "Only admins modify categories"
  ON public.product_categories
  FOR INSERT, UPDATE, DELETE
  USING (public.is_admin(auth.uid()));
```

Use when: Content is public, but only admins can edit.

**Pattern: User Ownership with Admin Override**

```sql
CREATE POLICY "Users can manage own items"
  ON public.order_items
  FOR ALL
  USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );
```

Use when: Users own the data, but admins need full access for support.

**Pattern: Email-Based Access** (for unauthenticated users)

```sql
CREATE POLICY "Users access by email"
  ON public.product_waitlist
  FOR ALL
  USING (email = COALESCE(auth.jwt() ->> 'email', ''));
```

Use when: Users sign up via email (not creating an account), and you need to let them access their records by email.

**Pattern: No Public Access** (admin-only)

```sql
CREATE POLICY "Admins only"
  ON public.campaign_opens
  FOR ALL
  USING (public.is_admin(auth.uid()));
```

Use when: Data is sensitive (analytics, internal operations) and users shouldn't see it.

## The Admin Role System: Server-Side Authority

One of the most common PostgreSQL security mistakes is using JWT claims for authorization.

### The Antipattern: JWT Metadata

❌ **WRONG - Do NOT do this:**

```sql
-- VULNERABLE: JWT metadata is user-editable
CREATE POLICY "Admin access via JWT"
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
```

Why this fails:
1. The client can edit `user_metadata` by calling `supabase.auth.updateUser({ data: { role: 'admin' } })`
2. The policy checks this editable field, so the user can bypass it
3. You've moved security logic to the client (always wrong)

**Real exploit:**
```typescript
// User runs this in browser console
await supabase.auth.updateUser({
  data: { role: 'admin' }
});

// Now they pass the JWT role check, even though they're not an admin
const result = await supabase.from('blog_posts').select('*');  // Should be blocked!
```

### The Correct Pattern: user_roles Table

✅ **CORRECT - Always do this:**

```sql
-- 1. Create a server-side source of truth
CREATE TABLE public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS on the roles table itself
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- 3. Create a SECURITY DEFINER function to check admin status
CREATE FUNCTION public.is_admin(user_id UUID)
  RETURNS BOOLEAN
  LANGUAGE SQL
  SECURITY DEFINER
  STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1 AND user_roles.role = 'admin'
  );
$$;

-- 4. Use the function in all admin policies
CREATE POLICY "Admins can modify blog posts"
  ON public.blog_posts
  FOR INSERT, UPDATE, DELETE
  USING (public.is_admin(auth.uid()));
```

Why this works:
1. The database owns the truth (user_roles table)
2. Only the backend (service role) can modify user_roles
3. The client can't change JWT claims without re-authenticating
4. All admin checks go through `is_admin()` function (centralized)

**Grant admin role (backend only):**
```typescript
// Backend code only - NEVER expose this to client
await supabaseAdmin
  .from('user_roles')
  .upsert({ user_id, role: 'admin' });  // Idempotent
```

### Why SECURITY DEFINER for is_admin()?

The `is_admin()` function is marked `SECURITY DEFINER`. This means:
- The function runs with the privileges of the function creator (the admin)
- It can bypass RLS policies on the `user_roles` table
- This is safe because we control the function code

Without `SECURITY DEFINER`, the function would run as the authenticated user and be blocked by RLS when checking their own role. That's not what we want.

```sql
-- With SECURITY DEFINER: Can always read user_roles to check admin status
CREATE FUNCTION public.is_admin(user_id UUID)
  LANGUAGE SQL
  SECURITY DEFINER  -- Runs with admin privileges
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = 'admin'
  );
$$;

-- Without it: Would fail for non-admins checking other users' roles
CREATE FUNCTION public.is_admin_bad(user_id UUID)
  LANGUAGE SQL
  -- No SECURITY DEFINER = runs as caller
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = 'admin'
  );
$$;

-- When non-admin calls is_admin_bad(other_user_id):
-- 1. Function runs as non-admin user
-- 2. Tries to SELECT from user_roles (which is RLS-protected)
-- 3. Policy blocks it (not own user_id)
-- 4. Function returns false even if user IS admin
```

## OAuth Token Encryption: Protecting Credentials

OAuth access tokens are credentials. If stolen, an attacker can impersonate the user to Google, Stripe, or other OAuth providers. They must be encrypted.

### The Vulnerability: Plaintext Tokens

❌ **WRONG - Never store tokens as plaintext:**

```sql
CREATE TABLE public.google_calendar_tokens (
  id UUID PRIMARY KEY,
  user_id UUID,
  access_token TEXT,          -- Plaintext in database!
  refresh_token TEXT          -- Plaintext in database!
);
```

Risks:
- Database breach exposes all OAuth tokens
- Attacker can use tokens to sync calendars, read emails, access Google Drive
- No audit trail of who accessed the tokens

### The Correct Pattern: Symmetric Encryption

✅ **CORRECT - Encrypt credentials at rest:**

```sql
-- 1. Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Add encrypted columns
CREATE TABLE public.google_calendar_tokens (
  id UUID PRIMARY KEY,
  user_id UUID,
  access_token_encrypted BYTEA,   -- Encrypted binary
  refresh_token_encrypted BYTEA   -- Encrypted binary
);

-- 3. Encrypt on insert/update using a persistent key
UPDATE google_calendar_tokens SET
  access_token_encrypted = pgp_sym_encrypt(
    access_token,
    current_setting('app.encryption_key')  -- Key from environment
  )
WHERE access_token_encrypted IS NULL;

-- 4. Create secure getter function with access control
CREATE FUNCTION public.get_calendar_access_token(token_id UUID)
  RETURNS TEXT
  LANGUAGE SQL
  SECURITY DEFINER
  STABLE
AS $$
  SELECT CASE
    WHEN (SELECT user_id FROM google_calendar_tokens WHERE id = token_id)
      = auth.uid()
      OR public.is_admin(auth.uid())
    THEN pgp_sym_decrypt(
      (SELECT access_token_encrypted FROM google_calendar_tokens WHERE id = token_id),
      current_setting('app.encryption_key')
    )::text
    ELSE NULL  -- Return NULL if user doesn't own token
  END;
$$;

-- 5. Use only through the getter function, never raw SELECT
-- OLD (WRONG):
--   SELECT access_token FROM google_calendar_tokens WHERE id = $1;
-- NEW (CORRECT):
--   SELECT public.get_calendar_access_token($1);
```

### How Symmetric Encryption Works

```
plaintext_token → pgp_sym_encrypt(plaintext, key) → encrypted_bytes (stored in DB)

encrypted_bytes → pgp_sym_decrypt(encrypted_bytes, key) → plaintext_token (in memory only)
```

**Key characteristics:**
- **Encryption key**: Stored in environment variable (not in code)
- **At rest**: Tokens are unreadable without the key
- **In transit**: Always use HTTPS/TLS (encrypted over network)
- **In memory**: Plaintext token lives only briefly in PostgreSQL process memory
- **Access control**: Only the getter function can decrypt (users need authorization)

**Setting the encryption key:**

```bash
# In production, set as environment variable
export app.encryption_key='your-256-bit-random-key'

# In Supabase, set via config:
supabase secrets set APP_ENCRYPTION_KEY='your-256-bit-random-key'

# The function accesses it:
current_setting('app.encryption_key')
```

### Best Practices for Token Storage

1. **Never SELECT the encrypted column directly** - Always use the getter function
2. **Rotate keys regularly** - Re-encrypt all tokens with new key annually
3. **Audit access** - Log whenever tokens are decrypted (add trigger)
4. **Revoke tokens** - Delete when user disconnects OAuth
5. **Use short-lived tokens** - Refresh tokens regularly (Google: hourly)

## View Security: SECURITY INVOKER Pattern

PostgreSQL views can be created with two security models. Choosing the wrong one is a critical vulnerability.

### The Vulnerability: SECURITY DEFINER Views

❌ **WRONG - Avoid SECURITY DEFINER views:**

```sql
-- VULNERABLE: Runs with creator's permissions, bypasses RLS
CREATE VIEW public.popular_templates AS
SELECT
  t.id,
  t.title,
  u.email,  -- ← Can access auth.users table
  COUNT(*) AS downloads
FROM public.marketplace_templates t
JOIN auth.users u ON u.id = t.author_id  -- ← auth.users exposure!
GROUP BY t.id, t.title, u.email;
```

Problems:
1. **SECURITY DEFINER** runs with the creator's permissions (usually admin)
2. The view can join `auth.users` directly (normally blocked by RLS)
3. Anonymous users can query this view and get all user emails
4. The RLS policy on marketplace_templates is bypassed

**Real exploit:**
```typescript
// Anonymous user
const { data } = await supabase
  .from('popular_templates')
  .select('*');  // Gets all user emails due to SECURITY DEFINER!
```

### The Correct Pattern: SECURITY INVOKER

✅ **CORRECT - Always use SECURITY INVOKER:**

```sql
-- SAFE: Runs with caller's permissions, respects RLS
CREATE VIEW public.popular_templates WITH (security_invoker = true) AS
SELECT
  t.id,
  t.title,
  t.author_id,  -- Return ID only, not email
  COUNT(*) AS downloads
FROM public.marketplace_templates t
GROUP BY t.id, t.title, t.author_id;

-- Client can fetch author email separately if needed (with proper auth)
```

Why this works:
1. **SECURITY INVOKER** runs with caller's permissions (user's role)
2. The RLS policies on underlying tables are respected
3. Anonymous users only see rows they're authorized for
4. No auth.users exposure

**When you need author emails:**
```typescript
// Client fetches template
const { data: templates } = await supabase
  .from('popular_templates')
  .select('*');

// If authenticated, fetch author separately (respects RLS)
for (const template of templates) {
  const { data: author } = await supabase
    .from('profiles')  // Public view of user data, not auth.users
    .select('name, avatar_url')
    .eq('user_id', template.author_id)
    .single();
}
```

## View Security Checklist

For every view you create:

- [ ] Use `WITH (security_invoker = true)` explicitly
- [ ] Never join `auth.users` directly
- [ ] Reference `user_id` only (let client fetch names)
- [ ] Ensure underlying tables have RLS enabled
- [ ] Test as anonymous user (should get filtered results)
- [ ] Test as authenticated user (should see own data only)
- [ ] Test as admin (should see everything)

## Production Security Checklist

Before deploying to production:

### Row-Level Security
- [ ] All PostgREST-exposed tables have RLS enabled
- [ ] Every table has at least one policy (don't leave tables unprotected)
- [ ] Admin policies use `is_admin()` function (not JWT metadata)
- [ ] User policies correctly filter by `auth.uid()` or email
- [ ] RLS policies have indexes on filtered columns (performance)
- [ ] Verify with: `supabase db lint` (0 errors)

### Authorization
- [ ] `user_roles` table exists with server-side source of truth
- [ ] `is_admin()` function is SECURITY DEFINER
- [ ] No policies reference `auth.jwt() -> 'user_metadata'`
- [ ] Admin grant is backend-only (never expose to client)
- [ ] Test: Non-admin can't see admin-only tables

### Sensitive Data
- [ ] All OAuth tokens are encrypted (bytea columns)
- [ ] All getter functions check authorization before decrypting
- [ ] No plaintext passwords, API keys, secrets in database
- [ ] Encryption key stored in environment (not git)
- [ ] Test: Anon user can't decrypt tokens

### Views & Functions
- [ ] All views use `WITH (security_invoker = true)`
- [ ] No views join `auth.users` directly
- [ ] All SECURITY DEFINER functions carefully reviewed
- [ ] Database functions validate inputs (prevent injection)
- [ ] Test: Views respect RLS policies

### API Surface
- [ ] PostgREST table permissions are minimal (RLS defines access)
- [ ] No direct table exposure without RLS
- [ ] Rate limiting on auth endpoints
- [ ] CORS configured to trusted domains only
- [ ] API keys (anon vs service) have correct permissions

## Best Practices & Anti-Patterns

### Best Practices

**1. Use RLS Everywhere**
- Every table accessible via PostgREST must have RLS
- Better to over-protect than under-protect
- Policies compose (user OR admin = either can access)

**2. Centralize Authorization**
```sql
-- Good: Single source of truth
CREATE FUNCTION is_admin(uid UUID) RETURNS BOOLEAN ...

-- Bad: Repeated inline checks
CREATE POLICY "Policy 1" ... USING (exists(select ... from user_roles ...));
CREATE POLICY "Policy 2" ... USING (exists(select ... from user_roles ...));
```

**3. Index Policy Columns**
```sql
-- Bad: Policy check is slow
CREATE POLICY "Access own" USING (user_id = auth.uid());
-- Missing index on user_id

-- Good: Indexed for fast filtering
CREATE INDEX idx_table_user_id ON my_table(user_id);
CREATE POLICY "Access own" USING (user_id = auth.uid());
```

**4. Use SECURITY DEFINER Carefully**
- Only for functions that need elevated privileges
- Always validate inputs (never blindly trust client)
- Document why SECURITY DEFINER is needed

**5. Log Access to Sensitive Data**
```sql
-- Audit who accesses tokens
CREATE TRIGGER audit_token_access
AFTER SELECT ON google_calendar_tokens
FOR EACH ROW
EXECUTE FUNCTION log_sensitive_access();
```

### Anti-Patterns (Don't Do These)

❌ **Antipattern 1: No RLS on Sensitive Tables**
```sql
-- WRONG: No RLS = everyone sees everything
CREATE TABLE user_settings (user_id UUID, api_key TEXT);
-- Any authenticated user can read api_key for ANY user
```

❌ **Antipattern 2: RLS Policy with Subquery in USING Clause**
```sql
-- WRONG: Subquery runs for EVERY ROW
CREATE POLICY "Complex check"
  USING (user_id IN (
    SELECT user_id FROM user_roles WHERE role = 'allowed'
  ));
-- Slow! This executes the subquery for each row in the scan
```

❌ **Antipattern 3: Mixing Public and Admin Access in One Policy**
```sql
-- WRONG: Hard to understand
CREATE POLICY "Mixed access"
  USING (
    (user_id = auth.uid() AND status = 'public')
    OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')  -- JWT check!
  );
```

❌ **Antipattern 4: Relying on Row Count for Authorization**
```sql
-- WRONG: If row count = 0, nothing returned (unclear error)
CREATE POLICY "Strict"
  USING ((SELECT COUNT(*) FROM user_roles WHERE user_id = auth.uid()) > 0);
-- Better: Use EXISTS (clear semantics)
CREATE POLICY "Strict"
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid()));
```

❌ **Antipattern 5: Plaintext Credentials Anywhere**
```sql
-- WRONG: Stripe API key in environment variable without encryption
INSERT INTO stripe_config (api_key) VALUES (current_setting('stripe.key'));
-- WRONG: Google OAuth refresh token as TEXT column
CREATE TABLE integrations (refresh_token TEXT);
```

## Troubleshooting

### "Permission Denied" on SELECT

**Diagnosis:** User is getting RLS blocked:
```
Error: new row violates row-level security policy
```

**Checklist:**
1. Is RLS enabled on the table? `SELECT row_security FROM information_schema.tables`
2. Does a policy match this user? `SELECT * FROM pg_policies WHERE tablename = 'table_name'`
3. Does the policy condition evaluate true? Test it: `SELECT (user_id = '...'::uuid)`
4. Is there an index on the policy column? Check query plan: `EXPLAIN SELECT * FROM table WHERE user_id = ...`

### "Function Does Not Exist" on is_admin()

**Diagnosis:** Function wasn't created or is in wrong schema:
```
Error: function public.is_admin(uuid) does not exist
```

**Fix:**
```sql
-- Check if function exists
SELECT routine_schema, routine_name FROM information_schema.routines
WHERE routine_name = 'is_admin';

-- Recreate if missing
CREATE FUNCTION public.is_admin(user_id UUID) ...;
```

### Token Decryption Returns NULL

**Diagnosis:** Access control blocked the decryption:
```typescript
const token = await supabase.rpc('get_calendar_access_token', { token_id });
// Returns null even though user owns the token
```

**Checklist:**
1. Does the user own the token? `SELECT user_id FROM google_calendar_tokens WHERE id = ...`
2. Is encryption key set? `SELECT current_setting('app.encryption_key')`
3. Is is_admin() working? `SELECT is_admin(auth.uid())`

### SECURITY INVOKER View Returns Empty

**Diagnosis:** View respects RLS, so non-admins see filtered results:
```sql
-- View uses SECURITY INVOKER correctly
SELECT * FROM page_view_stats;
-- Anonymous user gets empty result (can't see admin-only stats)
```

This is correct behavior! If you need to expose stats to all users, explicitly allow it:

```sql
CREATE POLICY "Public can read stats"
  ON page_views
  FOR SELECT
  USING (true);

CREATE VIEW page_view_stats WITH (security_invoker = true) AS
SELECT ... FROM page_views
WHERE true;  -- Public read already allowed above
```

## References

- [Supabase Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL pgcrypto Extension](https://www.postgresql.org/docs/current/pgcrypto.html)
- [OWASP PostgreSQL Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html)
