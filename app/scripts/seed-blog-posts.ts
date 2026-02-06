/**
 * Seed Blog Posts Script
 *
 * Seeds 13 professional blog posts into the blog_posts table (5 original + 8 SEO-targeted).
 * Run with: npx tsx scripts/seed-blog-posts.ts
 *
 * Requires in .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Uses Supabase admin client to bypass RLS.
 * Idempotent — skips posts that already exist (by slug).
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ============================================================================
// Blog Post Definitions
// ============================================================================

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  category: string;
  status: 'published';
  source: 'original';
  author_name: string;
  meta_title: string;
  meta_description: string;
}

const posts: BlogPost[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Post 1: Circuit Breaker Pattern
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'building-circuit-breaker-pattern-nodejs',
    title: 'Building a Circuit Breaker Pattern in Node.js',
    excerpt:
      'When your Redis connection dies at 2 AM, do you want every request to hang for 30 seconds? Or do you want your app to fail fast and recover gracefully? Here\'s how I built a circuit breaker for production.',
    category: 'tutorial',
    tags: ['reliability', 'nodejs', 'backend', 'production', 'redis'],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: 'Building a Circuit Breaker Pattern in Node.js | Need This Done',
    meta_description:
      'Learn how to implement a circuit breaker pattern in Node.js to handle Redis failures gracefully. Real production code with state machine logic.',
    content: `# Building a Circuit Breaker Pattern in Node.js

When your Redis connection fails, what happens to your application? If you're not careful, every single request starts waiting for a connection timeout. Your response times jump from 200ms to 30 seconds. Users see loading spinners. Your monitoring lights up. And you're scrambling at 2 AM wondering why the whole system is down when it's just one dependency.

This is the exact problem the circuit breaker pattern solves. And it's one of the first reliability patterns I implemented in [NeedThisDone.com](/work).

## The Problem: Cascading Failures

Here's what happens without a circuit breaker:

1. Redis goes down (network blip, memory pressure, whatever)
2. Every request tries to connect to Redis
3. Every connection attempt waits for the timeout (usually 5-30 seconds)
4. Your request queue backs up
5. Your entire application becomes unresponsive
6. Users leave. Revenue drops. You get paged.

The failure of one dependency takes down everything.

## The Solution: Three States

A circuit breaker has three states, just like an electrical circuit breaker:

- **Closed** (normal): Requests flow through normally. The breaker monitors for failures.
- **Open** (tripped): After too many failures, the breaker "trips." All requests fail immediately — no waiting for timeouts.
- **Half-Open** (testing): After a cooldown period, the breaker lets one request through to test if the dependency recovered.

## The Implementation

Here's the actual pattern from my production code. The state machine tracks connection failures:

\`\`\`typescript
// State tracking
let connectionAttempts = 0;
let lastConnectionError: Date | null = null;

const MAX_CONNECTION_FAILURES = 3;
const FAILURE_WINDOW_MS = 60_000; // 1 minute
\`\`\`

The key function checks whether we should even try connecting:

\`\`\`typescript
function isCircuitBreakerOpen(): boolean {
  // No recent errors — circuit is closed, proceed normally
  if (!lastConnectionError) return false;

  const timeSinceLastError =
    Date.now() - lastConnectionError.getTime();

  // 3+ failures within the last 60 seconds — circuit is OPEN
  if (
    connectionAttempts >= MAX_CONNECTION_FAILURES &&
    timeSinceLastError < FAILURE_WINDOW_MS
  ) {
    return true;
  }

  // Outside the failure window — auto-reset
  return false;
}
\`\`\`

Before every Redis operation, we check the breaker:

\`\`\`typescript
async function ensureConnected(): Promise<void> {
  if (isCircuitBreakerOpen()) {
    throw new Error(
      \`Redis circuit breaker open: \${connectionAttempts} failures in last 60s\`
    );
  }

  // Reset counters if we're outside the failure window
  if (
    lastConnectionError &&
    Date.now() - lastConnectionError.getTime() >= FAILURE_WINDOW_MS
  ) {
    connectionAttempts = 0;
    lastConnectionError = null;
  }

  if (!redis.isOpen) {
    try {
      await redis.connect();
      // Success — reset everything
      connectionAttempts = 0;
      lastConnectionError = null;
    } catch (error) {
      connectionAttempts++;
      lastConnectionError = new Date();
      throw error;
    }
  }
}
\`\`\`

## Why This Works

The magic is in the timing:

- **First failure**: We retry immediately. Network blips happen.
- **Second failure**: We retry again. Maybe the server is restarting.
- **Third failure**: The circuit opens. Something is actually wrong.
- **For the next 60 seconds**: Every request fails instantly instead of waiting for a timeout.
- **After 60 seconds**: The window resets. We try one more connection.

This means your application goes from "30-second hangs on every request" to "instant error responses while Redis recovers." Users see an error message instead of an infinite loading spinner. Your other features (the ones that don't need Redis) keep working.

## Graceful Degradation

The circuit breaker is only half the story. The other half is what your application does when the breaker is open.

For my caching layer, the answer is simple: skip the cache and hit the database directly.

\`\`\`typescript
async function getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  } catch {
    // Circuit breaker tripped or Redis unavailable
    // Fall through to the database
  }

  // Always have a fallback
  return fetcher();
}
\`\`\`

The application is slower without the cache, but it's still working. That's the difference between a 5-minute incident and a 5-hour outage.

## Lessons Learned

After running this in production:

1. **60 seconds is the sweet spot** for the failure window. Short enough to recover quickly, long enough to avoid hammering a struggling server.
2. **3 failures before tripping** catches real outages while ignoring single-request blips.
3. **Log when the breaker trips.** That log line is your early warning system.
4. **Always have a fallback.** A circuit breaker without graceful degradation just fails faster — which is better than hanging, but not as good as actually working.

The circuit breaker pattern isn't glamorous. It doesn't make your app faster or add features. But when Redis goes down at 2 AM, it's the difference between sleeping through the recovery and getting paged.

Build your reliability patterns before you need them. By the time you're in an incident, it's too late to add them.

If you're building something that needs this level of reliability, [let's connect](/contact).`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Post 2: Self-Taught to Full-Stack
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'self-taught-to-full-stack',
    title: 'Self-Taught to Full-Stack: What Building in Public Taught Me',
    excerpt:
      'No CS degree. No bootcamp. No network in tech. Just a finance manager who taught himself to code and shipped a production platform. Here\'s what actually worked.',
    category: 'behind-the-scenes',
    tags: ['career', 'learning', 'self-taught', 'personal'],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: 'Self-Taught to Full-Stack: What Building in Public Taught Me',
    meta_description:
      'From Army veteran and Toyota finance manager to full-stack developer. An honest look at the self-taught path, what worked, and what I wish I\'d done differently.',
    content: `# Self-Taught to Full-Stack: What 2 Years of Building Taught Me

Not long ago I was a finance manager at a Toyota dealership. I'd been tinkering with code since the early 2000s, but it was always a side thing. Something I did for fun. Not something I thought I could do professionally.

Then I decided to build NeedThisDone.com from scratch, and everything changed. You can see [what I've built](/work) for the full picture.

## The Background Nobody Expects

[My resume](/about) doesn't look like a typical developer's. Five years as an Army combat medic. Seven years selling cars and structuring finance deals at Toyota. A few years at Full Sail University helping military students navigate the GI Bill.

When I tell people in tech my background, I get one of two reactions: either "that's so cool" or a look that says "why would anyone hire you?"

Both reactions miss the point. The military taught me to stay calm under pressure, follow protocols, and take responsibility. Toyota taught me to explain complicated things to non-technical people and follow through on commitments. Those skills turned out to be exactly what software development needs.

## What Actually Worked

### Building Something Real

Tutorials are fine for learning syntax. But I didn't really start learning until I decided to build a production application.

NeedThisDone.com wasn't a toy project. It had real requirements: user authentication, payment processing, an admin dashboard, email notifications, a chatbot. Every feature forced me to learn something I didn't know yet.

The key insight: **I learned React by building a checkout flow, not by building a counter app.** I learned database design by modeling real customer data, not by following a schema tutorial.

### Writing Tests From Day One

This one surprised me. I expected testing to slow me down. Instead, it did the opposite.

Writing tests first forced me to think about what my code should actually do before writing it. It caught bugs before they reached production. And it gave me the confidence to refactor code when I realized my first approach was wrong.

I'm not going to pretend I loved writing tests from the start. But after the third time a test caught a bug that would have broken production, I was convinced.

### Reading Production Code

Tutorials show you the happy path. Production code shows you what happens when things go wrong.

I learned more about error handling from reading how Supabase and Next.js handle edge cases than from any tutorial. I learned about rate limiting by looking at how real APIs protect themselves.

### Getting One Real Client

The Acadio engagement changed everything. Going from "I built a project" to "a company hired me to solve their problems" is a completely different signal.

I started as a contractor doing API work. Then I built a PDF-to-HTML conversion pipeline. Then they started coming to me with questions that weren't in my job description. Within a few months I went from contractor to Technical Operations Specialist.

That progression proved something tutorials and side projects never could: I can solve real business problems under real constraints.

## What I Wish I'd Done Differently

### Started with TypeScript

I learned JavaScript first and added TypeScript later. This was backwards. TypeScript would have caught half the bugs I spent hours debugging. If you're starting out, just start with TypeScript.

### Focused on Fewer Technologies

Early on, I was bouncing between React, Vue, Python, Go, and whatever else looked interesting. I would have progressed faster if I'd picked one stack (Next.js + TypeScript + PostgreSQL) and gone deep instead of wide.

### Built in Public Earlier

I spent time building in private because I was embarrassed about my code. When I finally started sharing what I was building, I got feedback that made my work better and connections that led to opportunities.

Nobody cares if your code is perfect. They care if you're building real things and learning visibly.

If you're a veteran considering tech: your experience is an asset. [Connect with me](/contact) — I'm always happy to talk.

## The Hard Parts Nobody Talks About

### Zero Traction for Months

I launched NeedThisDone.com and... nothing happened. No customers. No traffic. No inquiries.

This is normal, and nobody tells you that. Building the product is maybe 30% of the work. The other 70% is getting people to find it and trust you enough to pay for it.

### Imposter Syndrome is Real

Every time I talked to someone with a CS degree, I felt like a fraud. Every time I looked at a senior developer's code, I thought "I'll never be that good."

Two things helped: First, I stopped comparing my beginning to someone else's middle. Second, I started measuring progress against my past self instead of against other people.

### The Income Gap

Going from a stable finance manager salary to freelance developer income was terrifying. I'm not going to romanticize the lean months.

My advice: don't quit your job until you have either savings to cover 6 months of expenses or a client willing to pay you. Ideally both.

## Where I Am Now

A few months and 1,300+ commits later, I have a production platform that handles real payments, a client track record, and a skill set that keeps growing.

I'm not where I want to be yet. But I'm so far from where I started that the gap is hard to believe.

The self-taught path isn't easy. It's lonely, it's slow, and there's no curriculum telling you what to learn next. But if you have the discipline to build real things and the patience to keep going when nobody's watching, it works.

It just takes longer than you think it should.

If you're on a similar path and want to talk, [reach out](/contact) — I'm happy to share what I've learned.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Post 3: Why I Built My Own E-Commerce
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'why-i-built-my-own-ecommerce-platform',
    title: 'Why I Built My Own E-Commerce Platform Instead of Using Shopify',
    excerpt:
      'Everyone told me to use Shopify. It would have been faster, cheaper, and easier. Here\'s why I built from scratch anyway — and whether I\'d do it again.',
    category: 'case-study',
    tags: ['architecture', 'nextjs', 'medusa', 'ecommerce', 'decisions'],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: 'Why I Built My Own E-Commerce Platform Instead of Using Shopify',
    meta_description:
      'The architectural decisions behind building a custom e-commerce platform with Next.js, Medusa, and Supabase instead of using Shopify.',
    content: `# Why I Built My Own E-Commerce Platform Instead of Using Shopify

"Just use Shopify."

I heard this from everyone. Friends. Fellow developers. That voice in my head at 11 PM when I was debugging a cart synchronization bug for the third time.

They weren't wrong. Shopify is excellent. If I'd used it, I would have had a working store in a weekend instead of months. But I wasn't just building a store — I was building a consulting platform, a portfolio piece, and a learning accelerator all at once.

Here's the honest breakdown of what I gained, what I lost, and whether I'd make the same choice again.

## The Architecture

[NeedThisDone.com](/work) runs on four main services:

- **Next.js 14** for the frontend and API routes
- **Medusa** for product management, cart, and order processing
- **Supabase** (PostgreSQL) for user data, content management, and vector embeddings
- **Stripe** for payment processing

Plus Redis for caching, OpenAI for the chatbot, and Vercel for deployment.

That's a lot of moving parts compared to a single Shopify instance. So why do it this way?

## What You Gain: Control

### Custom Checkout Flow

My checkout isn't a standard e-commerce flow. Customers can book appointments, select consultation tiers, add notes, and schedule follow-ups — all in the same checkout process.

With Shopify, I'd be fighting the platform to add appointment booking into checkout. With my own system, I just built it.

### Unified CMS + Commerce

The entire site is editable through an inline CMS. Admins click on any text and edit it directly. This same system manages blog posts, page content, and product descriptions.

In Shopify, the store and the marketing site are separate worlds. In my system, they share the same data layer and editing experience.

### AI Integration

The chatbot uses pgvector embeddings to search the entire site's content and answer customer questions. It indexes every page, every product description, every FAQ answer.

Integrating this into Shopify would mean building an external service that scrapes Shopify's storefront, stores the data somewhere else, and hopes the sync stays current. In my system, the chatbot reads directly from the same database that serves the pages.

### Reliability Patterns

Circuit breakers, request deduplication, rate limiting, connection pooling — all built into the application layer. These patterns protect the system when external services (Redis, payment processors) have issues.

With Shopify, you're trusting their reliability. Which is excellent — they have a much bigger infrastructure team than I do. But you can't add custom resilience patterns for your specific use cases.

## What You Lose: Time

Let me be honest about the costs:

### Development Time

A Shopify store takes a weekend. My platform took months of full-time development. That's not an exaggeration. The cart alone — adding items, syncing state, handling edge cases like expired sessions and out-of-stock products — took weeks.

### Solved Problems

Shopify has already solved thousands of edge cases I haven't encountered yet. Inventory management for high-traffic sales. Tax calculation across jurisdictions. Fraud detection. Abandoned cart recovery.

I'm solving these problems one at a time as they come up. Shopify solved them years ago.

### Plugin Ecosystem

Need email marketing? Shopify has 200 integrations. Need reviews? There are 50 apps for that. Need loyalty points? Click install.

I built the loyalty points system myself. It took a week. The Shopify app would have taken 10 minutes.

## The Real Reason

Here's what I don't say in polite company: the platform is my resume.

When a potential client or employer looks at NeedThisDone.com, they don't see a Shopify theme. They see 74 API routes, 160+ React components, 71 test files, and 53 database migrations. They see that I can architect a system from scratch, connect multiple services, handle payments, build admin dashboards, and ship to production.

A Shopify store, no matter how customized, says "I can configure platforms." A custom platform says "I can build them."

For someone transitioning into tech without a CS degree, that distinction matters.

## Would I Do It Again?

Yes, but with caveats.

If I were building a store to sell products and make money as quickly as possible, I'd use Shopify. Full stop. The platform is phenomenal at what it does.

But I wasn't optimizing for speed to market. I was optimizing for learning, for building a portfolio, and for creating something that demonstrates what I'm capable of.

The custom platform taught me more about software engineering in a few months than any course or tutorial could have. And it gave me something concrete to point to when someone asks "what can you build?"

That said, I made some decisions I'd change:

- I'd use **Medusa from day one** instead of building custom product management first and migrating later.
- I'd add **TypeScript strict mode** from the start instead of gradually tightening it.
- I'd build the **test infrastructure** before the first feature, not alongside the tenth.

The architecture itself — Next.js, Medusa, Supabase, Stripe — I'd keep exactly as is. Each service handles what it's best at, and the boundaries between them are clean.

## The Bottom Line

There's no universal right answer. Shopify is the smart choice for most businesses. Custom builds are the smart choice for developers who need to prove they can build.

Just go in with your eyes open about what each path costs. And if you choose the custom route, commit to it fully. Half-custom, half-platform is the worst of both worlds.

Need help deciding which approach is right for your project? Check out [our services](/services) or [let's talk](/contact).`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Post 4: Request Deduplication
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'request-deduplication-preventing-double-submissions',
    title: 'Request Deduplication: Preventing Double Form Submissions',
    excerpt:
      'Users double-click submit buttons. Networks retry failed requests. Browsers resend on refresh. Here\'s how SHA-256 fingerprinting and Redis protect your data.',
    category: 'tutorial',
    tags: ['reliability', 'backend', 'redis', 'production', 'security'],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: 'Request Deduplication: Preventing Double Form Submissions in Production',
    meta_description:
      'Learn how to prevent duplicate form submissions using SHA-256 fingerprinting and Redis atomic operations. Production-tested patterns for Node.js applications.',
    content: `# Request Deduplication: Preventing Double Form Submissions

Here's a scenario every web developer has encountered: a user fills out a contact form, clicks "Submit," nothing seems to happen for a second, so they click again. Now you have two identical messages in your inbox and the user gets two confirmation emails.

Or worse: they're placing an order. Double-click on "Pay Now." Two charges on their credit card.

Disabling the submit button after the first click helps, but it's a frontend-only solution. It doesn't protect against network retries, browser refresh-resends, or API clients that retry on timeout.

You need server-side deduplication. Here's how I built it.

## The Approach: Fingerprint and Check

The idea is simple:

1. For every incoming request, create a unique fingerprint of its content
2. Check if we've seen that fingerprint recently
3. If yes, reject as duplicate. If no, process normally

The implementation has three parts: fingerprinting, storage, and the check itself.

## Step 1: SHA-256 Fingerprinting

Every request gets reduced to a 32-character hash:

\`\`\`typescript
import { createHash } from 'crypto';

function createRequestFingerprint(
  data: Record<string, unknown>,
  userId?: string
): string {
  // Sort keys for deterministic serialization
  const keys = Object.keys(data).sort();

  // Build a stable string representation
  const serialized = keys
    .map(key => \`\${key}:\${String(data[key])}\`)
    .join('|');

  // Scope to user if authenticated
  const content = userId
    ? \`user:\${userId}|\${serialized}\`
    : serialized;

  // Hash and truncate
  return createHash('sha256')
    .update(content)
    .digest('hex')
    .substring(0, 32);
}
\`\`\`

A few design decisions here:

**Sorted keys** ensure that \`{name: "Abe", email: "abe@test.com"}\` and \`{email: "abe@test.com", name: "Abe"}\` produce the same fingerprint. Order shouldn't matter.

**User scoping** means two different users submitting the same form content won't collide. User A's "Contact me" and User B's "Contact me" are treated as separate requests.

**Truncation to 32 chars** keeps storage small while maintaining collision resistance. With SHA-256, 32 hex characters give us 128 bits of entropy — more than enough.

## Step 2: Atomic Check with Redis

This is the critical part. We need a test-and-set operation that's atomic — meaning no two requests can both think they're "first":

\`\`\`typescript
async function checkAndMarkRequest(
  fingerprint: string,
  operation: string
): Promise<boolean> {
  const key = \`dedup:\${operation}:\${fingerprint}\`;

  // SET with NX + EX: atomic test-and-set with auto-expiry
  const result = await redis.set(key, new Date().toISOString(), {
    NX: true,  // Only set if key doesn't exist
    EX: 60,    // Auto-expire after 60 seconds
  });

  // 'OK' means we set the key (first request)
  // null means key already existed (duplicate)
  return result === 'OK';
}
\`\`\`

**NX (Not eXists)** is the key. Redis guarantees that if two requests race to set the same key, only one succeeds. This is atomic at the Redis level — no race conditions.

**EX (Expiry)** auto-cleans the key after 60 seconds. This means the same form can be submitted again after a minute, which handles legitimate re-submissions.

## Step 3: The Middleware

Putting it all together in an API route:

\`\`\`typescript
async function handleFormSubmission(request: Request) {
  const body = await request.json();

  // Create fingerprint from the form data
  const fingerprint = createRequestFingerprint(body, userId);

  // Check for duplicate
  const isNew = await checkAndMarkRequest(fingerprint, 'contact-form');

  if (!isNew) {
    return new Response(
      JSON.stringify({
        success: true,  // Don't expose dedup to the user
        message: 'Your message has been received',
      }),
      { status: 200 }
    );
  }

  // Process the actual submission
  await saveToDatabase(body);
  await sendConfirmationEmail(body.email);

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200 }
  );
}
\`\`\`

Notice the duplicate response returns **200 with a success message**, not a 409 Conflict. From the user's perspective, their form was submitted successfully. They don't need to know (or care) that their second click was silently ignored.

## Graceful Degradation

What happens when Redis is down? If your deduplication blocks all requests when Redis is unavailable, you've traded one problem (duplicates) for a worse one (total outage).

The solution: fail open.

\`\`\`typescript
async function checkAndMarkRequest(
  fingerprint: string,
  operation: string
): Promise<boolean> {
  try {
    const key = \`dedup:\${operation}:\${fingerprint}\`;
    const result = await redis.set(key, new Date().toISOString(), {
      NX: true,
      EX: 60,
    });
    return result === 'OK';
  } catch {
    // Redis unavailable — allow the request
    // A potential duplicate is better than a total outage
    return true;
  }
}
\`\`\`

This pairs with the circuit breaker pattern. When Redis fails enough times, the circuit breaker trips and the dedup layer stops even attempting Redis calls. Requests flow through without dedup until Redis recovers.

## Real-World Results

Since deploying this pattern on [NeedThisDone.com](/work):

- **Zero duplicate form submissions** from double-clicks
- **Zero duplicate payment attempts** at checkout
- **No user-facing impact** when Redis has brief outages (the system degrades gracefully)
- **60-second TTL** handles all legitimate use cases without manual cleanup

The whole implementation is about 50 lines of code. But those 50 lines prevent a class of bugs that would otherwise require manual intervention to fix.

## When to Use This

Not every endpoint needs deduplication. Here's my rule of thumb:

| Endpoint Type | Dedup? | Why |
|---|---|---|
| Form submissions (contact, quote) | Yes | Users double-click |
| Payment processing | Yes | Must prevent double charges |
| Order creation | Yes | Network retries |
| Data reads (GET requests) | No | Reads are idempotent |
| Search queries | No | Duplicates are harmless |
| Webhook handlers | Maybe | Depends on the webhook provider |

If processing a duplicate would cause harm (financial, data corruption, spam), add deduplication. If duplicates are harmless, don't add complexity.

Want reliability patterns like this in your application? [Get in touch](/contact).`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Post 5: Combat Medic to Code
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'combat-medic-to-code-military-discipline-development',
    title: 'From Combat Medic to Code: How Military Discipline Shapes My Development',
    excerpt:
      'After five years as an Army combat medic, I thought I\'d left that world behind. Turns out, the military taught me exactly how to write reliable software.',
    category: 'behind-the-scenes',
    tags: ['career', 'veteran', 'leadership', 'personal', 'military'],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: 'From Combat Medic to Code: How Military Discipline Shapes My Development',
    meta_description:
      'A veteran developer on how Army combat medic training translates to software engineering. Protocols, checklists, and staying calm under pressure.',
    content: `# From Combat Medic to Code: How Military Discipline Shapes My Development

I spent five years as a combat medic in the U.S. Army, stationed at Fort Hood and Fort Bragg. I led a team of three medics and two combat lifesavers. I delivered emergency care in situations where hesitation cost lives and mistakes weren't optional.

Twenty-five years later, I write code for a living. And I use what the Army taught me every single day.

## Protocols Are Tests

In the Army, we had protocols for everything. TCCC (Tactical Combat Casualty Care) told you exactly what to do when someone was bleeding: massive hemorrhage control, airway, respiration, circulation, hypothermia prevention. In that order. Every time.

You didn't improvise. You didn't skip steps because you thought you knew better. You followed the protocol because the protocol was designed by people who'd seen every way things could go wrong.

In software, automated tests serve the same purpose. They're protocols that verify your code does what it should, in the order it should, every time.

When I write a test before I write a feature, I'm doing the same thing we did in medical training: defining what "right" looks like before the pressure is on. Then when I'm deep in implementation and things get complicated, the tests keep me on track.

I run the full test suite before every deployment. Not because I think something is broken, but because the Army taught me that confidence comes from verification, not assumption.

## Equipment Checks Are CI/CD

Every morning in the Army, you check your equipment. Medical kit: packed, organized, nothing expired. Weapon: clean, functional, properly zeroed. Vehicle: fuel, oil, tires, comms.

You don't check your equipment when you need it. By then it's too late. You check it every day so that when you need it, you know it works.

CI/CD pipelines are the same concept. Every commit triggers a build, runs the tests, and verifies the deployment configuration. I don't wait until a customer reports a bug to find out the checkout is broken. The pipeline catches it before the code reaches production.

My CI pipeline runs:
- TypeScript compilation (catches type errors)
- ESLint (catches code quality issues)
- Playwright E2E tests (catches broken user flows)
- Accessibility tests (catches WCAG violations)

If any of those fail, the deployment stops. Just like in the Army: you don't roll out with a broken radio.

## Staying Calm Is Debugging

The first time you see real trauma, your brain wants to panic. Your heart rate spikes. Your hands shake. Everything in your body screams "run."

Medic training doesn't eliminate that response. It teaches you to work through it. Acknowledge the stress, set it aside, and focus on the next step. Massive hemorrhage: apply tourniquet. Airway: check. Move to the next thing.

Debugging a production incident at midnight feels like a smaller version of the same thing. The site is down. Customers are affected. Slack is blowing up. Your brain wants to panic.

The military response: assess the situation, identify the most critical issue, fix that first, then move to the next one.

I once spent four hours debugging a checkout failure that was costing real revenue. At hour three, I wanted to start randomly changing things to see if something worked. That's the developer equivalent of panic — throwing solutions at a wall instead of diagnosing the problem.

Instead, I did what medic training taught me: slow down, check the basics (logs, database state, API responses), isolate the failure point, and fix it methodically. The bug was a race condition in the cart synchronization. Random changes would have never found it.

## After Action Reviews Are Retros

After every significant event in the military, you do an After Action Review (AAR). What happened? What was supposed to happen? What went right? What went wrong? What do we do differently next time?

No blame. No defensiveness. Just honest analysis.

I do the same thing after every significant bug or incident. When the request deduplication system failed to catch a duplicate payment, I didn't just fix the bug. I asked: Why did the test suite miss this? What monitoring would have caught it earlier? How do I prevent this category of bug in the future?

The fix was 10 lines of code. The lessons from the AAR changed how I write tests for every feature since.

## Team Leadership Is Code Reviews

In the Army, I was responsible for my team's performance. When a new medic joined, I didn't hand them the manual and say "figure it out." I showed them how we did things, explained why, and checked their work until I was confident they could work independently.

Code reviews work the same way. When I review code (my own or someone else's), I'm looking for the same things a team leader checks:
- Does this follow our established protocols (coding standards)?
- Will this work under stress (edge cases, error handling)?
- Is this maintainable when the author isn't around?
- Could a new team member understand this?

I write code with the assumption that someone else will maintain it. Just like I organized medical kits with the assumption that someone else might need to find a tourniquet in the dark.

## The Uncomfortable Truth

I'll be honest about something: transitioning from the military to civilian work was hard. The structure, the clear chain of command, the unambiguous mission — none of that exists in the civilian world.

Software development can feel chaotic. Requirements change. Priorities shift. Nobody tells you exactly what to build or how to build it.

But the core skills transfer: discipline to do the boring work (tests, documentation, maintenance), calmness when things break, attention to detail when it matters, and the understanding that preparation — not talent — is what separates reliable performance from luck.

I didn't plan to become a developer when I left the Army. But the Army gave me the foundation that makes me the developer I am today. You can read more on [my resume](/resume) or learn [more about me](/about).

If you're a veteran considering tech: your experience is an asset, not a gap. The discipline you learned under real pressure is exactly what software teams need. Don't let anyone tell you otherwise.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // New Post 1: How to Build RAG with Supabase pgvector and Next.j
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "rag-supabase-pgvector-nextjs-tutorial",
    title: "How to Build RAG with Supabase pgvector and Next.js",
    excerpt:
      "Build production-ready RAG using Supabase pgvector, OpenAI embeddings, and Next.js. A practical guide from someone who's shipped it to production.",
    category: "tutorial",
    tags: ["RAG", "Supabase", "pgvector", "Next.js", "AI", "embeddings", "vector-search"],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: "How to Build RAG with Supabase pgvector and Next.js | Complete Tutorial",
    meta_description:
      "Build production-ready RAG (Retrieval Augmented Generation) using Supabase pgvector, OpenAI embeddings, and Next.js. Complete code examples included.",
    content: `# How to Build RAG with Supabase pgvector and Next.js

When I first heard about Retrieval-Augmented Generation (RAG), it sounded like magic—give AI access to your own data, and it suddenly becomes an expert on your specific domain. No hallucinations about outdated information, no generic answers. Just accurate, contextual responses pulled from your knowledge base.

The reality? It's less magic, more plumbing. Good plumbing, but plumbing nonetheless. Here's how I've built RAG systems for clients using Supabase pgvector and Next.js—and how you can too.

## What is RAG and Why Supabase?

RAG works by breaking your knowledge base into chunks, converting those chunks into numerical vectors (embeddings), and then finding the most relevant chunks when a user asks a question. You feed those relevant chunks to an LLM as context, and it answers using *your* data instead of its training set.

Traditional vector databases (Pinecone, Weaviate) work great but add deployment complexity and cost. Supabase gives you Postgres with pgvector—meaning your vector search lives right next to your user data, no separate service needed. One database, one connection string, one bill.

For the [custom automation work](/services) I do, this simplicity matters. Clients don't want to manage five different services when one does the job.

## Architecture Overview

Here's the data flow for a typical RAG chatbot:

\`\`\`
User types question
  ↓
Next.js API route generates embedding (OpenAI)
  ↓
Supabase pgvector finds similar chunks (cosine similarity)
  ↓
Next.js sends chunks + question to OpenAI
  ↓
Stream response back to user
\`\`\`

The user sees a chat interface. Behind the scenes, you're orchestrating embeddings, similarity search, and LLM calls. Let's build it.

## Step 1: Setting Up Supabase pgvector

First, enable the pgvector extension in your Supabase project. Run this SQL migration in the Supabase SQL Editor:

\`\`\`sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for knowledge base chunks
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 uses 1536 dimensions
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast similarity search
CREATE INDEX knowledge_base_embedding_idx 
ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
\`\`\`

The \`vector(1536)\` type stores OpenAI's embedding format. The \`ivfflat\` index speeds up similarity searches—without it, queries scan every row. For small datasets (<10k rows), you can skip the index, but production systems need it.

## Step 2: Generating Embeddings in Next.js

When you ingest documents (PDFs, markdown, web pages), you chunk them into ~500-word sections and generate embeddings. Here's a Next.js API route that does this:

\`\`\`typescript
// app/api/ingest/route.ts
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key for write access
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { content, metadata } = await req.json();

  // Chunk content (simple split for demo—production uses smarter chunking)
  const chunks = content.match(/.{1,2000}/g) || [];

  for (const chunk of chunks) {
    // Generate embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: chunk,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Store in Supabase
    await supabase.from('knowledge_base').insert({
      content: chunk,
      embedding,
      metadata,
    });
  }

  return Response.json({ success: true, chunks: chunks.length });
}
\`\`\`

For production systems I build (like the ones you see on my [work](/work) page), I add retry logic, batch processing, and smarter chunking that respects sentence boundaries. But this gets you started.

## Step 3: Similarity Search Implementation

When a user asks a question, you generate an embedding for their query and search for similar chunks. Here's the Next.js API route:

\`\`\`typescript
// app/api/search/route.ts
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { query } = await req.json();

  // Generate embedding for user's question
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });

  const queryEmbedding = embeddingResponse.data[0].embedding;

  // Find similar chunks (cosine similarity)
  const { data: matches } = await supabase.rpc('match_knowledge_base', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7, // Minimum similarity score (0-1)
    match_count: 5, // Top 5 results
  });

  return Response.json({ matches });
}
\`\`\`

You'll need this SQL function for the similarity search:

\`\`\`sql
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_base.id,
    knowledge_base.content,
    1 - (knowledge_base.embedding <=> query_embedding) AS similarity
  FROM knowledge_base
  WHERE 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
\`\`\`

The \`<=>\` operator calculates cosine distance (inverse of similarity). This query returns the top 5 chunks with similarity above 0.7.

## Step 4: Building the Chat Interface

Now tie it together with a chat UI that streams responses using Vercel's AI SDK:

\`\`\`typescript
// app/api/chat/route.ts
import { createClient } from '@supabase/supabase-js';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1].content;

  // Get embedding for user's question
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: lastMessage,
  });

  const queryEmbedding = embeddingResponse.data[0].embedding;

  // Find relevant chunks
  const { data: matches } = await supabase.rpc('match_knowledge_base', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 5,
  });

  // Build context from matches
  const context = matches
    ?.map((match: any) => match.content)
    .join('\\n\\n') || '';

  // Call OpenAI with context
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    stream: true,
    messages: [
      {
        role: 'system',
        content: \`You are a helpful assistant. Use the following context to answer questions. If the answer isn't in the context, say so.

Context:
\${context}\`,
      },
      ...messages,
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
\`\`\`

On the frontend, use Vercel's \`useChat\` hook:

\`\`\`typescript
// app/components/ChatInterface.tsx
'use client';

import { useChat } from 'ai/react';

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={\`p-4 rounded-lg \${
              msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
            }\`}
          >
            <p className="font-semibold">{msg.role === 'user' ? 'You' : 'AI'}</p>
            <p className="mt-1">{msg.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          disabled={isLoading}
          className="flex-1 p-3 border rounded-lg"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
\`\`\`

That's it. User asks question → embeddings → similarity search → LLM with context → streamed response.

## Production Considerations

**Cost**: OpenAI embeddings cost $0.0001 per 1k tokens. For a 100k-word knowledge base (~140k tokens), initial ingestion costs ~$0.014. Ongoing queries cost pennies. The real cost is GPT-4 API calls—budget accordingly.

**Monitoring**: Track failed embeddings, slow queries, and low-similarity matches. I add [circuit breaker patterns](/blog/circuit-breaker-pattern-supabase-redis) to handle OpenAI rate limits gracefully.

**Chunking strategy**: The simple regex split above breaks mid-sentence. Production systems use libraries like LangChain's \`RecursiveCharacterTextSplitter\` to respect semantic boundaries.

**Metadata filtering**: Add filters to the similarity search (e.g., only search docs tagged "technical" or "published after 2024"). Store metadata in the \`metadata\` JSONB column and add WHERE clauses to the RPC function.

**Hybrid search**: Combine vector similarity with full-text search (Postgres \`ts_vector\`) for best results. If exact keyword matches exist, surface those first.

## Next Steps

This setup handles most RAG use cases—customer support bots, internal documentation search, content recommendation systems. I've built variations of this for clients who need AI that knows their specific products, policies, or processes.

If you're building something more complex (multi-tenant RAG, real-time updates, custom chunking strategies), the patterns are the same but the details multiply. That's where [custom development](/services) comes in—I handle the production edge cases so you ship faster.

Want help building RAG into your product? [Let's talk](/contact). I'll walk you through what's possible and what's worth building.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // New Post 2: Next.js + Medusa Headless Commerce Setup Guide
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "nextjs-medusa-headless-commerce-setup-guide",
    title: "Next.js + Medusa Headless Commerce Setup Guide",
    excerpt:
      "Build a production-ready headless e-commerce store with Next.js 15 and Medusa. Includes cart, checkout, and Stripe integration with full source code.",
    category: "tutorial",
    tags: ["Next.js", "Medusa", "headless-commerce", "e-commerce", "React", "TypeScript", "Stripe"],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: "Next.js + Medusa Headless Commerce Setup (2026) | Step-by-Step Guide",
    meta_description:
      "Build a production-ready headless e-commerce store with Next.js 15 and Medusa. Includes cart, checkout, and Stripe integration with full source code.",
    content: `# Next.js + Medusa Headless Commerce Setup Guide

Building an ecommerce store in 2026 means choosing between rigid platforms (Shopify, BigCommerce) that limit customization or flexible solutions (Medusa, custom builds) that require more upfront work. I went the flexible route for NeedThisDone.com's [shop](/pricing), and here's why and how.

## Why Headless Commerce in 2026?

Traditional platforms bundle everything together—storefront, admin, checkout, backend. That's great until you want custom logic:

- "We need bulk pricing for B2B customers"
- "Can we add service appointments to the same cart as products?"
- "We want subscriptions plus one-time purchases in one checkout"

With Shopify, you're fighting the platform. With Medusa (an open-source Shopify alternative), you own the code. The storefront is just a Next.js app hitting REST/GraphQL APIs. Need custom pricing logic? Write it. Need to integrate with existing systems? You control the backend.

The tradeoff: more setup work upfront. But for the [projects I build](/work), that control is worth it.

## Project Overview

**Tech stack:**
- **Backend**: Medusa (Node.js ecommerce engine)
- **Frontend**: Next.js 14 (App Router)
- **Database**: Postgres (managed by Railway or Supabase)
- **Payments**: Stripe
- **Hosting**: Railway (backend), Vercel (frontend)

**What we'll build:**
- Product catalog with variants (size, color, etc.)
- Shopping cart (persisted across sessions)
- Stripe checkout with confirmation emails
- Admin dashboard (Medusa's built-in UI)

This is the exact setup powering the [NeedThisDone.com shop](/pricing). Real-world tested, not a toy example.

## Part 1: Medusa Backend Setup

**1. Install Medusa CLI and create project:**

\`\`\`bash
npm install -g @medusajs/medusa-cli
medusa new my-store
cd my-store
\`\`\`

**2. Configure database (Railway example):**

Create a Postgres database on Railway, then update \`medusa-config.js\`:

\`\`\`javascript
module.exports = {
  projectConfig: {
    redis_url: process.env.REDIS_URL, // Optional but recommended for production
    database_url: process.env.DATABASE_URL, // Railway Postgres URL
    database_type: 'postgres',
    store_cors: process.env.STORE_CORS, // Your Next.js frontend URL
    admin_cors: process.env.ADMIN_CORS,
  },
  plugins: [
    {
      resolve: '@medusajs/file-local',
      options: {
        upload_dir: 'uploads',
      },
    },
    {
      resolve: '@medusajs/stripe',
      options: {
        api_key: process.env.STRIPE_SECRET_KEY,
        webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
      },
    },
  ],
};
\`\`\`

**3. Seed the database:**

\`\`\`bash
npm run seed
medusa migrations run
\`\`\`

This creates sample products. For production, you'll delete these and add real inventory through the admin UI or a custom seed script.

**4. Deploy to Railway:**

Connect your GitHub repo to Railway. Set environment variables:

\`\`\`
DATABASE_URL=postgresql://...
REDIS_URL=redis://... (optional)
STORE_CORS=https://yourdomain.com
ADMIN_CORS=https://yourdomain.com/admin
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=some-random-string
COOKIE_SECRET=some-random-string
\`\`\`

Railway auto-deploys on every git push. Your Medusa backend is now live at \`https://your-project.railway.app\`.

## Part 2: Next.js Storefront

**1. Create Next.js app:**

\`\`\`bash
npx create-next-app@latest my-storefront
cd my-storefront
npm install @medusajs/medusa-js
\`\`\`

**2. Configure Medusa client:**

Create \`lib/medusa-client.ts\`:

\`\`\`typescript
import Medusa from '@medusajs/medusa-js';

const medusaClient = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_URL || 'http://localhost:9000',
  maxRetries: 3,
});

export default medusaClient;
\`\`\`

**3. Fetch products (App Router example):**

\`\`\`typescript
// app/shop/page.tsx
import medusaClient from '@/lib/medusa-client';
import ProductCard from '@/components/ProductCard';

export default async function ShopPage() {
  const { products } = await medusaClient.products.list();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Shop</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
\`\`\`

**4. Product detail page:**

\`\`\`typescript
// app/shop/[productId]/page.tsx
import medusaClient from '@/lib/medusa-client';
import AddToCartButton from '@/components/AddToCartButton';

export default async function ProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const { product } = await medusaClient.products.retrieve(params.productId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.thumbnail || '/placeholder.png'}
            alt={product.title}
            className="w-full rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <p className="text-2xl font-semibold mb-6">
            \${(product.variants[0].prices[0].amount / 100).toFixed(2)}
          </p>
          <AddToCartButton variantId={product.variants[0].id} />
        </div>
      </div>
    </div>
  );
}
\`\`\`

## Part 3: Cart Implementation

Medusa provides cart APIs. You manage cart state in React Context or a state library. Here's a simple Context pattern:

\`\`\`typescript
// context/CartContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import medusaClient from '@/lib/medusa-client';

interface CartContextType {
  cartId: string | null;
  itemCount: number;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  getCart: () => Promise<any>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Load cart ID from localStorage
    const savedCartId = localStorage.getItem('medusa_cart_id');
    if (savedCartId) setCartId(savedCartId);
  }, []);

  const addItem = async (variantId: string, quantity: number) => {
    let currentCartId = cartId;

    // Create cart if it doesn't exist
    if (!currentCartId) {
      const { cart } = await medusaClient.carts.create();
      currentCartId = cart.id;
      setCartId(cart.id);
      localStorage.setItem('medusa_cart_id', cart.id);
    }

    // Add item to cart
    const { cart } = await medusaClient.carts.lineItems.create(currentCartId, {
      variant_id: variantId,
      quantity,
    });

    setItemCount(cart.items.length);
  };

  const getCart = async () => {
    if (!cartId) return null;
    const { cart } = await medusaClient.carts.retrieve(cartId);
    return cart;
  };

  return (
    <CartContext.Provider value={{ cartId, itemCount, addItem, getCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
\`\`\`

**Add to cart button:**

\`\`\`typescript
// components/AddToCartButton.tsx
'use client';

import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function AddToCartButton({ variantId }: { variantId: string }) {
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await addItem(variantId, 1);
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
    >
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
\`\`\`

## Part 4: Stripe Checkout Flow

**1. Create checkout session:**

\`\`\`typescript
// app/api/checkout/session/route.ts
import { NextResponse } from 'next/server';
import medusaClient from '@/lib/medusa-client';

export async function POST(req: Request) {
  const { cartId } = await req.json();

  // Complete cart (locks it and prepares for payment)
  const { cart } = await medusaClient.carts.complete(cartId);

  // Medusa's Stripe plugin automatically creates payment session
  // Return the payment session URL
  const paymentSession = cart.payment_sessions.find(
    (ps: any) => ps.provider_id === 'stripe'
  );

  return NextResponse.json({
    url: paymentSession.data.url, // Stripe Checkout URL
  });
}
\`\`\`

**2. Redirect to Stripe:**

\`\`\`typescript
// components/CheckoutButton.tsx
'use client';

import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function CheckoutButton() {
  const { cartId } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!cartId) return;

    setIsLoading(true);

    const response = await fetch('/api/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId }),
    });

    const { url } = await response.json();
    window.location.href = url; // Redirect to Stripe Checkout
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {isLoading ? 'Redirecting...' : 'Proceed to Checkout'}
    </button>
  );
}
\`\`\`

**3. Handle webhook for confirmation emails:**

Stripe sends webhooks after successful payment. Configure webhook endpoint in Stripe dashboard to point to \`https://your-medusa-backend.railway.app/hooks/stripe\`.

Medusa's Stripe plugin automatically handles order creation. For custom email logic, add an event subscriber:

\`\`\`typescript
// medusa/src/subscribers/order-placed.ts
import { EventBusService } from '@medusajs/medusa';

class OrderPlacedSubscriber {
  constructor({ eventBusService }: { eventBusService: EventBusService }) {
    eventBusService.subscribe('order.placed', async (data) => {
      const order = data;
      // Send confirmation email (use SendGrid, Resend, etc.)
      console.log(\`Order placed: \${order.id}\`);
    });
  }
}

export default OrderPlacedSubscriber;
\`\`\`

## Deployment Checklist

**Backend (Railway):**
- [x] Environment variables set (DATABASE_URL, STRIPE keys, CORS)
- [x] Migrations run (\`medusa migrations run\`)
- [x] Products seeded or added via admin
- [x] Stripe webhook endpoint configured

**Frontend (Vercel):**
- [x] \`NEXT_PUBLIC_MEDUSA_URL\` points to Railway backend
- [x] Cart context wrapped around app layout
- [x] Checkout redirects to Stripe
- [x] Success/cancel pages handle post-payment flow

**Testing:**
- [x] Add product to cart
- [x] Complete checkout with Stripe test card (\`4242 4242 4242 4242\`)
- [x] Verify order appears in Medusa admin
- [x] Confirm email sends (if configured)

## When to Hire a Developer

This guide gets you 80% of the way to a functional store. The last 20%—custom pricing logic, subscription management, multi-currency support, inventory sync with existing systems—is where complexity explodes.

If you're building:
- A simple store with standard products → this guide is enough
- Custom checkout flows or B2B pricing → budget for [custom development](/services)
- Integration with ERP/CRM systems → definitely hire a developer

I built the NeedThisDone.com shop using this exact stack because I needed flexibility for future features (appointments, subscriptions, service bundling). For straightforward product sales, Shopify is faster to launch. For everything else, Medusa gives you control without fighting the platform.

## Wrapping Up

Headless commerce isn't for every project, but when you need custom logic or deep integration with existing systems, it's the right tool. Medusa + Next.js gives you:

- Full control over storefront UX
- Customizable backend logic
- No monthly platform fees (just hosting)
- Open-source flexibility

The setup takes longer than clicking "Start Free Trial" on Shopify, but you're building on your own foundation. That's worth it when your business outgrows templates.

Need help building or customizing a Medusa store? [Let's talk](/contact). I've been through the edge cases so you don't have to. Check out the [work I've done](/work) for other clients, and let's see if I can help you ship faster.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // New Post 3: Building Custom Stripe Checkout Flows in Next.js
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "custom-stripe-checkout-nextjs-server-actions",
    title: "Building Custom Stripe Checkout Flows in Next.js",
    excerpt:
      "Build custom Stripe checkout flows with Next.js Server Actions. Handles subscriptions, one-time payments, and complex product combinations.",
    category: "tutorial",
    tags: ["Stripe", "Next.js", "payment-processing", "checkout", "server-actions", "e-commerce", "TypeScript"],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: "Custom Stripe Checkout in Next.js 15 | Beyond the Official Docs",
    meta_description:
      "Build custom Stripe checkout flows with Next.js Server Actions. Handles subscriptions, one-time payments, and complex product combinations with full error handling.",
    content: `# Building Custom Stripe Checkout Flows in Next.js

So you've tried following Stripe's docs for Next.js, copied their examples, and... it doesn't quite fit your use case. Maybe you need split payments. Maybe you're mixing one-time purchases with subscriptions. Maybe you just need more control than their pre-built Checkout page gives you.

I've built custom Stripe flows for everything from equipment stores to consulting packages to subscription platforms. Here's what I learned building production checkouts that actually work.

## Why Stripe's Examples Fall Short

Stripe's documentation is solid for the happy path: one product, one payment, done. But real businesses need more:

- **Split payments** - Charge a deposit now, balance later
- **Mixed carts** - Combine products and subscriptions in one checkout
- **Custom validation** - Verify inventory, check business rules before charging
- **Branded experience** - Keep users on your site, not Stripe's hosted page

The official examples show you the mechanics, but not the architecture decisions that matter in production.

## Architecture: Server Actions vs API Routes

Next.js 13+ gives you two ways to handle checkout logic:

**Server Actions** (the new way):
\`\`\`typescript
'use server'

import { stripe } from '@/lib/stripe';

export async function createCheckoutSession(cartId: string) {
  const cart = await getCart(cartId);
  
  const session = await stripe.checkout.sessions.create({
    line_items: cart.items.map(item => ({
      price: item.priceId,
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: \`\${process.env.NEXT_PUBLIC_URL}/success\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/cart\`,
  });
  
  return { sessionId: session.id };
}
\`\`\`

**API Routes** (the traditional way):
\`\`\`typescript
// app/api/checkout/session/route.ts
import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const { cartId } = await req.json();
  const cart = await getCart(cartId);
  
  const session = await stripe.checkout.sessions.create({
    // Same as above
  });
  
  return Response.json({ sessionId: session.id });
}
\`\`\`

**Trade-offs:**

| Approach | Pros | Cons |
|----------|------|------|
| Server Actions | No API route needed, type-safe by default, simpler imports | Harder to call from non-React code, less control over caching |
| API Routes | Standard REST endpoints, easier to test, works with any client | More boilerplate, need to handle auth separately |

I use **API routes** for checkout because webhooks are already API routes, and keeping payment logic in one paradigm makes debugging easier.

## Scenario 1: Deposit + Balance Payment

Common in consulting and custom work: charge 50% upfront, 50% on delivery.

**The naive approach** (don't do this):
\`\`\`typescript
// WRONG - creates two separate charges with no connection
await stripe.charges.create({ amount: depositAmount });
// Later...
await stripe.charges.create({ amount: balanceAmount });
\`\`\`

**The right way** - Use PaymentIntents with metadata tracking:

\`\`\`typescript
export async function POST(req: NextRequest) {
  const { orderId, depositPercent } = await req.json();
  const order = await db.orders.findUnique({ where: { id: orderId } });
  
  const depositAmount = Math.round(order.total * (depositPercent / 100));
  
  // Create deposit payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: depositAmount,
    currency: 'usd',
    metadata: {
      orderId: order.id,
      paymentType: 'deposit',
      totalAmount: order.total.toString(),
      depositPercent: depositPercent.toString(),
    },
  });
  
  // Store payment intent ID for balance payment later
  await db.orders.update({
    where: { id: orderId },
    data: {
      depositPaymentIntentId: paymentIntent.id,
      depositAmount,
      balanceAmount: order.total - depositAmount,
    },
  });
  
  return Response.json({ clientSecret: paymentIntent.client_secret });
}
\`\`\`

Then, when work is complete:

\`\`\`typescript
export async function POST(req: NextRequest) {
  const { orderId } = await req.json();
  const order = await db.orders.findUnique({ where: { id: orderId } });
  
  if (!order.depositPaymentIntentId) {
    throw new Error('Deposit not paid');
  }
  
  // Create balance payment
  const paymentIntent = await stripe.paymentIntents.create({
    amount: order.balanceAmount,
    currency: 'usd',
    metadata: {
      orderId: order.id,
      paymentType: 'balance',
      depositPaymentIntentId: order.depositPaymentIntentId,
    },
  });
  
  return Response.json({ clientSecret: paymentIntent.client_secret });
}
\`\`\`

**Key insight**: PaymentIntents let you track related charges through metadata. Your webhooks can then update order status based on \`paymentType\`.

## Scenario 2: Mixed Cart - Products + Subscriptions

You can't mix \`mode: 'payment'\` and \`mode: 'subscription'\` in one Checkout Session. Here's how to handle it:

\`\`\`typescript
export async function POST(req: NextRequest) {
  const { cartId } = await req.json();
  const cart = await getCart(cartId);
  
  // Separate products from subscriptions
  const oneTimeItems = cart.items.filter(item => item.type === 'product');
  const subscriptionItems = cart.items.filter(item => item.type === 'subscription');
  
  if (subscriptionItems.length > 0 && oneTimeItems.length > 0) {
    // Create checkout session with subscription mode
    // Add one-time items as setup_future_usage for the subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        ...subscriptionItems.map(item => ({
          price: item.stripePriceId,
          quantity: item.quantity,
        })),
        ...oneTimeItems.map(item => ({
          price: item.stripePriceId,
          quantity: item.quantity,
        })),
      ],
      success_url: \`\${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}\`,
      cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/cart\`,
    });
    
    return Response.json({ sessionId: session.id });
  } else if (subscriptionItems.length > 0) {
    // Subscription only
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: subscriptionItems.map(item => ({
        price: item.stripePriceId,
        quantity: item.quantity,
      })),
      success_url: \`\${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}\`,
      cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/cart\`,
    });
    
    return Response.json({ sessionId: session.id });
  } else {
    // One-time payment only
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: oneTimeItems.map(item => ({
        price: item.stripePriceId,
        quantity: item.quantity,
      })),
      success_url: \`\${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}\`,
      cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/cart\`,
    });
    
    return Response.json({ sessionId: session.id });
  }
}
\`\`\`

**Important**: When mixing items, Stripe will charge the one-time items immediately and start the subscription billing cycle. Make sure your webhook handlers account for this in your order fulfillment logic.

## Scenario 3: Custom Payment Forms with Stripe Elements

Sometimes you need full control over the checkout UI. Stripe Elements gives you embedded form components:

\`\`\`typescript
// app/checkout/page.tsx
'use client';

import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState, useEffect } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: \`\${window.location.origin}/success\`,
      },
    });
    
    if (error) {
      console.error(error.message);
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('');
  
  useEffect(() => {
    // Fetch PaymentIntent client secret from your API
    fetch('/api/checkout/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount: 5000 }), // $50.00
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, []);
  
  if (!clientSecret) return <div>Loading...</div>;
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
}
\`\`\`

**API endpoint** to create the PaymentIntent:

\`\`\`typescript
// app/api/checkout/create-payment-intent/route.ts
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const { amount } = await req.json();
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
  });
  
  return Response.json({ clientSecret: paymentIntent.client_secret });
}
\`\`\`

This pattern gives you complete control over styling, validation, and user experience while Stripe handles the sensitive card data.

## Webhook Handling: Production-Grade

Webhooks are where payments actually complete. Here's how to handle them safely:

\`\`\`typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  
  let event;
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Webhook Error', { status: 400 });
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;
      
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutComplete(session);
      break;
      
    case 'invoice.payment_failed':
      const invoice = event.data.object;
      await handlePaymentFailure(invoice);
      break;
      
    default:
      console.log(\`Unhandled event type: \${event.type}\`);
  }
  
  return Response.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: any) {
  const orderId = paymentIntent.metadata.orderId;
  const paymentType = paymentIntent.metadata.paymentType;
  
  // Use idempotency check (see blog post on deduplication)
  const existingUpdate = await db.orderUpdates.findUnique({
    where: { paymentIntentId: paymentIntent.id },
  });
  
  if (existingUpdate) {
    console.log('Already processed this payment');
    return;
  }
  
  // Update order based on payment type
  if (paymentType === 'deposit') {
    await db.orders.update({
      where: { id: orderId },
      data: { depositPaid: true, status: 'in_progress' },
    });
  } else if (paymentType === 'balance') {
    await db.orders.update({
      where: { id: orderId },
      data: { balancePaid: true, status: 'completed' },
    });
  }
  
  // Record that we processed this
  await db.orderUpdates.create({
    data: { paymentIntentId: paymentIntent.id, processedAt: new Date() },
  });
}
\`\`\`

**Critical webhook rules:**

1. **Always verify signatures** - Prevents fake webhook attacks
2. **Idempotency checks** - Webhooks can fire multiple times (see my post on [request deduplication](/blog/request-deduplication-preventing-double-submissions))
3. **Return 200 fast** - Process async if needed, don't make Stripe wait
4. **Log everything** - You'll need it when debugging failed payments

## Testing Strategy

**Local testing with Stripe CLI:**

\`\`\`bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger checkout.session.completed
\`\`\`

**Test mode checklist:**

- Use test API keys (starts with \`pk_test_\` and \`sk_test_\`)
- Test card: \`4242 4242 4242 4242\` (any future expiry, any CVC)
- Test 3D Secure: \`4000 0027 6000 3184\`
- Test declined: \`4000 0000 0000 0002\`

**Integration tests** (using Stripe's test mode):

\`\`\`typescript
// __tests__/checkout.test.ts
import { stripe } from '@/lib/stripe';

describe('Checkout flow', () => {
  it('creates split payment for deposits', async () => {
    const order = await createTestOrder({ total: 10000 }); // $100
    
    const response = await fetch('/api/checkout/deposit', {
      method: 'POST',
      body: JSON.stringify({ orderId: order.id, depositPercent: 50 }),
    });
    
    const { clientSecret } = await response.json();
    
    // Confirm payment with test card
    const paymentIntent = await stripe.paymentIntents.confirm(
      clientSecret.split('_secret_')[0],
      { payment_method: 'pm_card_visa' }
    );
    
    expect(paymentIntent.status).toBe('succeeded');
    expect(paymentIntent.amount).toBe(5000); // $50 deposit
  });
});
\`\`\`

## Get Help with Complex Checkouts

Custom Stripe flows touch multiple systems: payment processing, inventory, order management, email notifications, webhook handling. The concepts I covered here on [circuit breakers](/blog/building-circuit-breaker-pattern-nodejs) and [request deduplication](/blog/request-deduplication-preventing-double-submissions) apply directly to production payment systems.

If you're building a custom checkout flow and want production-grade reliability without reinventing every pattern, [check out my services](/services). I've built these systems multiple times and can help you avoid the gotchas.

Otherwise, test thoroughly in Stripe's test mode, verify your webhooks with the CLI, and ship incrementally. Payments are critical infrastructure, so take the time to get them right.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // New Post 4: Production-Ready Circuit Breakers with Redis (Part
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "circuit-breaker-redis-nodejs-production",
    title: "Production-Ready Circuit Breakers with Redis (Part 2)",
    excerpt:
      "Scale circuit breakers across multiple servers using Redis. Includes distributed state, monitoring, and graceful degradation patterns for production systems.",
    category: "tutorial",
    tags: ["Node.js", "circuit-breaker", "Redis", "reliability", "production", "backend", "resilience"],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: "Production Circuit Breakers with Redis and Node.js | Advanced Tutorial",
    meta_description:
      "Scale circuit breakers across multiple servers using Redis. Includes distributed state, monitoring, and graceful degradation patterns for production systems.",
    content: `# Production-Ready Circuit Breakers with Redis (Part 2)

In [Part 1](/blog/building-circuit-breaker-pattern-nodejs), I showed you how to build an in-memory circuit breaker for protecting external API calls. That works great for single-server deployments, but what happens when you scale to multiple servers?

**The problem:** Each server tracks circuit state independently. Server A trips the breaker, but Server B keeps hammering the failing service. You need distributed state.

This is the sequel. Here's how to build Redis-backed circuit breakers that work across your entire cluster.

## When In-Memory Circuit Breakers Aren't Enough

The in-memory pattern from [Part 1](/blog/building-circuit-breaker-pattern-nodejs) breaks down in these scenarios:

**Multi-server deployments:**
- Server A detects failures, opens circuit
- Server B has no idea, keeps sending requests
- Failing service gets hit from all servers until each trips individually

**Serverless environments:**
- Each Lambda/Edge function is isolated
- Circuit state resets on every cold start
- No shared memory between invocations

**Microservices:**
- Service A calls failing external API
- Service B calls the same API
- Both need to know about the circuit state

**The solution:** Move circuit state to Redis. Now all servers share the same breaker.

## Distributed Circuit Breaker Architecture

Here's the flow with Redis:

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│  REQUEST FLOW (Multi-Server)                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Server A: Request → Check Redis → Circuit OPEN? → Reject immediately   │
│                           ↓                                             │
│                      Circuit CLOSED?                                    │
│                           ↓                                             │
│                      Try request                                        │
│                           ↓                                             │
│                      Failed?                                            │
│                           ↓                                             │
│                      Increment failure count in Redis (atomic)          │
│                           ↓                                             │
│                      Threshold exceeded?                                │
│                           ↓                                             │
│                      Set circuit OPEN in Redis                          │
│                                                                         │
│  Server B: Request → Check Redis → Circuit OPEN (from Server A's trip)  │
│                           ↓                                             │
│                      Reject immediately (no API call)                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

**Key insight:** Redis stores circuit state with TTL. When a circuit opens, ALL servers see it immediately.

## Implementation: Redis-Backed Circuit Breaker

Here's a production implementation using Lua scripts for atomic operations:

\`\`\`typescript
// lib/redis-circuit-breaker.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number; // milliseconds
  monitoringWindow: number; // milliseconds
}

export class RedisCircuitBreaker {
  private serviceName: string;
  private config: CircuitBreakerConfig;
  
  constructor(serviceName: string, config: CircuitBreakerConfig) {
    this.serviceName = serviceName;
    this.config = config;
  }
  
  private getKeys() {
    return {
      state: \`circuit:\${this.serviceName}:state\`,
      failures: \`circuit:\${this.serviceName}:failures\`,
      lastFailure: \`circuit:\${this.serviceName}:last_failure\`,
    };
  }
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const keys = this.getKeys();
    
    // Check circuit state
    const state = await redis.get(keys.state);
    
    if (state === 'OPEN') {
      // Check if reset timeout has passed
      const lastFailure = await redis.get(keys.lastFailure);
      const timeSinceLastFailure = Date.now() - parseInt(lastFailure || '0');
      
      if (timeSinceLastFailure > this.config.resetTimeout) {
        // Move to HALF_OPEN, allow one test request
        await redis.set(keys.state, 'HALF_OPEN');
      } else {
        throw new Error(\`Circuit breaker OPEN for \${this.serviceName}\`);
      }
    }
    
    try {
      const result = await fn();
      
      // Success - reset circuit if HALF_OPEN
      if (state === 'HALF_OPEN') {
        await this.reset();
      }
      
      return result;
    } catch (error) {
      await this.recordFailure();
      throw error;
    }
  }
  
  private async recordFailure(): Promise<void> {
    const keys = this.getKeys();
    
    // Use Lua script for atomic increment + threshold check
    const luaScript = \`
      local failures_key = KEYS[1]
      local state_key = KEYS[2]
      local last_failure_key = KEYS[3]
      local threshold = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      
      -- Increment failure count
      local failures = redis.call('INCR', failures_key)
      redis.call('PEXPIRE', failures_key, window)
      
      -- Record timestamp
      redis.call('SET', last_failure_key, now)
      
      -- Check threshold
      if failures >= threshold then
        redis.call('SET', state_key, 'OPEN')
        return 1
      end
      
      return 0
    \`;
    
    const tripped = await redis.eval(
      luaScript,
      3,
      keys.failures,
      keys.state,
      keys.lastFailure,
      this.config.failureThreshold,
      this.config.monitoringWindow,
      Date.now()
    );
    
    if (tripped === 1) {
      console.error(\`Circuit breaker OPENED for \${this.serviceName}\`);
    }
  }
  
  private async reset(): Promise<void> {
    const keys = this.getKeys();
    
    await redis.del(keys.state, keys.failures, keys.lastFailure);
    console.log(\`Circuit breaker RESET for \${this.serviceName}\`);
  }
  
  async getState(): Promise<'OPEN' | 'HALF_OPEN' | 'CLOSED'> {
    const state = await redis.get(this.getKeys().state);
    return (state as any) || 'CLOSED';
  }
}
\`\`\`

**Why Lua scripts?** Redis executes them atomically. Without Lua, there's a race condition between incrementing the failure count and checking the threshold. Two servers could both trip the circuit, or worse, one could reset it while another is checking.

**Usage:**

\`\`\`typescript
// lib/external-api-client.ts
import { RedisCircuitBreaker } from './redis-circuit-breaker';

const breaker = new RedisCircuitBreaker('external-api', {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  monitoringWindow: 60000, // 1 minute
});

export async function callExternalAPI(data: unknown) {
  return breaker.execute(async () => {
    const response = await fetch('https://external-api.com/endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    
    if (!response.ok) {
      throw new Error(\`API error: \${response.status}\`);
    }
    
    return response.json();
  });
}
\`\`\`

Now all your servers share circuit state. When Server A trips the breaker, Server B immediately stops making requests.

## Monitoring and Alerting

You need visibility into circuit breaker activity. Here's what to track:

\`\`\`typescript
// lib/circuit-metrics.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export async function recordCircuitMetric(
  serviceName: string,
  event: 'trip' | 'reset' | 'rejected_request'
) {
  const timestamp = Date.now();
  const key = \`metrics:circuit:\${serviceName}:\${event}\`;
  
  // Use sorted set for time-series data
  await redis.zadd(key, timestamp, \`\${timestamp}:\${event}\`);
  await redis.expire(key, 86400); // Keep 24 hours
  
  // Alert if circuit trips frequently
  if (event === 'trip') {
    const recentTrips = await redis.zcount(
      key,
      Date.now() - 300000, // Last 5 minutes
      Date.now()
    );
    
    if (recentTrips > 3) {
      await sendAlert(\`Circuit breaker for \${serviceName} tripping frequently\`);
    }
  }
}
\`\`\`

**Metrics to track:**

| Metric | What it tells you |
|--------|------------------|
| Trip count | How often the circuit opens |
| Rejected requests | How many requests fail-fast |
| Reset count | How often the circuit recovers |
| Failure rate | Percentage of requests failing |
| Time in OPEN state | How long services are degraded |

**Integration with your circuit breaker:**

\`\`\`typescript
private async recordFailure(): Promise<void> {
  // ... existing Lua script ...
  
  if (tripped === 1) {
    console.error(\`Circuit breaker OPENED for \${this.serviceName}\`);
    await recordCircuitMetric(this.serviceName, 'trip');
  }
}
\`\`\`

## Graceful Degradation Strategies

When a circuit opens, you have options beyond just throwing an error:

**1. Return cached data:**

\`\`\`typescript
async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
  const state = await redis.get(this.getKeys().state);
  
  if (state === 'OPEN') {
    if (fallback) {
      console.log(\`Circuit OPEN, using fallback for \${this.serviceName}\`);
      return fallback();
    }
    throw new Error(\`Circuit breaker OPEN for \${this.serviceName}\`);
  }
  
  // ... rest of execute logic
}

// Usage
const data = await breaker.execute(
  () => fetchFromAPI(),
  () => fetchFromCache() // Fallback to stale cache
);
\`\`\`

**2. Degrade gracefully:**

\`\`\`typescript
// Instead of showing nothing, show limited data
try {
  const recommendations = await recommendationService.execute(() =>
    fetchPersonalizedRecommendations(userId)
  );
} catch (error) {
  // Circuit open - show generic recommendations instead
  const recommendations = await fetchPopularItems();
}
\`\`\`

**3. Queue for retry:**

\`\`\`typescript
try {
  await emailService.execute(() => sendEmail(recipient, content));
} catch (error) {
  if (error.message.includes('Circuit breaker OPEN')) {
    // Queue for retry when circuit closes
    await redis.lpush('email:retry_queue', JSON.stringify({ recipient, content }));
  }
}
\`\`\`

This pattern is similar to the [request deduplication](/blog/request-deduplication-preventing-double-submissions) strategy - queue failures for later processing instead of losing data.

## Production Checklist

Before deploying Redis-backed circuit breakers:

- [ ] **Redis failover configured** - If Redis goes down, circuit breaker should fail open (allow requests) not closed (block everything)
- [ ] **Monitoring in place** - Track trip frequency, rejected requests, time in OPEN state
- [ ] **Alerts configured** - Get notified when circuits trip frequently
- [ ] **Fallback strategies** - Don't just fail, degrade gracefully
- [ ] **Different thresholds per service** - Critical services might need different settings than nice-to-have features
- [ ] **Testing** - Simulate failures in staging, verify all servers respect circuit state
- [ ] **Documentation** - Team needs to know what each circuit protects and what happens when it opens

**Redis failover pattern:**

\`\`\`typescript
async execute<T>(fn: () => Promise<T>): Promise<T> {
  let state: string | null;
  
  try {
    state = await redis.get(this.getKeys().state);
  } catch (redisError) {
    console.error('Redis unavailable, failing open:', redisError);
    // If Redis is down, allow requests through
    return fn();
  }
  
  // ... rest of circuit logic
}
\`\`\`

This ensures your application stays available even if Redis has issues.

## Need Backend Reliability Help?

Distributed circuit breakers are just one piece of production reliability. You also need [request deduplication](/blog/request-deduplication-preventing-double-submissions), proper timeout handling, retry logic, and monitoring.

I've built these patterns for high-traffic production systems. If you're scaling up and need help implementing reliability patterns without reinventing everything from scratch, [check out my services](/services).

For more production reliability patterns, see my [work](/work) or [get in touch](/contact).

Otherwise, start with in-memory circuit breakers from [Part 1](/blog/building-circuit-breaker-pattern-nodejs), then migrate to Redis when you scale beyond one server. Test thoroughly in staging, monitor in production, and remember: the goal is graceful degradation, not total failure.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // New Post 5: Supabase Connection Pooling in Next.js Production
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "supabase-connection-pooling-production-nextjs",
    title: "Supabase Connection Pooling in Next.js Production",
    excerpt:
      "Fix Supabase connection errors in production. Learn connection pooling, singleton patterns, and serverless best practices for Next.js apps.",
    category: "tutorial",
    tags: ["Supabase", "PostgreSQL", "connection-pooling", "Next.js", "backend", "production", "serverless"],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: "Supabase Connection Pooling in Next.js | Avoid 'Too Many Connections' Errors",
    meta_description:
      "Fix Supabase connection errors in production. Learn connection pooling, singleton patterns, and serverless best practices for Next.js apps.",
    content: `# Supabase Connection Pooling in Next.js Production: How to Handle 100+ Concurrent Users

You're running a Next.js app on Vercel. Traffic's picking up. Everything seems fine until you check your Supabase logs and see this:

\`\`\`
Error: remaining connection slots reserved for non-replication superuser connections
\`\`\`

Your app just ran out of database connections. Users are seeing errors. Your carefully built product is down.

I've been there. Here's how to fix it.

## The "Too Many Connections" Problem

Supabase's free tier gives you 60 concurrent connections. Paid plans go up to 200. Sounds like plenty, right?

Not when you're running serverless functions.

**The Serverless Connection Leak**

Every time a Next.js API route runs on Vercel:

1. A new Lambda function instance spins up (cold start)
2. Your code creates a new Supabase client
3. That client opens a database connection
4. The function finishes and goes idle
5. The connection stays open

Now multiply that by 100 users hitting your app simultaneously. Each request creates a new connection. Within seconds, you've exhausted your connection pool.

**What Makes This Worse**

- **Cold starts**: New function instances don't share connections
- **Connection leaks**: Unclosed connections pile up
- **No cleanup**: Functions stay warm for ~15 minutes, holding connections
- **Spiky traffic**: A sudden burst can exhaust the pool in seconds

Your database can only handle so many connections at once. Once you hit the limit, new requests fail.

## Solution 1: Singleton Supabase Client

The first fix is simple: create one Supabase client per function instance, not per request.

**Bad Pattern (New Client Per Request)**

\`\`\`typescript
// app/api/products/route.ts
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  // Creates a new client (and connection) on every request
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase.from('products').select('*');
  return Response.json(data);
}
\`\`\`

Every request opens a new connection. If 100 users hit this endpoint simultaneously, that's 100 connections.

**Good Pattern (Singleton Client)**

\`\`\`typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        db: {
          schema: 'public',
        },
        auth: {
          persistSession: false, // Important for server-side
        },
      }
    );
  }
  return supabaseInstance;
}
\`\`\`

\`\`\`typescript
// app/api/products/route.ts
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseClient(); // Reuses same client

  const { data } = await supabase.from('products').select('*');
  return Response.json(data);
}
\`\`\`

Now all requests within the same function instance share one connection. 100 requests might only use 5-10 connections (depending on how many Lambda instances are running).

**Key Configuration**

\`\`\`typescript
auth: {
  persistSession: false, // Don't store auth state server-side
}
\`\`\`

Server-side clients shouldn't persist sessions. That's for client-side auth flows.

## Solution 2: Supabase Connection Pooler

Even with a singleton client, you can still run out of connections if you have enough concurrent Lambda instances. This is where Supabase's built-in connection pooler comes in.

**Two Pooler Modes**

Supabase provides two connection strings:

1. **Transaction Mode** (port 6543): \`[project-id].pooler.supabase.com:6543\`
2. **Session Mode** (port 5432): \`[project-id].pooler.supabase.com:5432\`

**Transaction Mode (Recommended for Serverless)**

\`\`\`typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use pooler URL for serverless environments
const connectionString = process.env.VERCEL
  ? \`postgresql://postgres.[project-id].pooler.supabase.com:6543/postgres\`
  : supabaseUrl;

export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseKey, {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false,
    },
  });
}
\`\`\`

**Transaction mode**:
- Each query gets a connection from the pool
- Connection is returned immediately after the query completes
- Perfect for short-lived serverless functions
- Supports most read/write operations

**Session mode**:
- Holds a connection for the entire session
- Required for: prepared statements, \`LISTEN/NOTIFY\`, advisory locks
- Use sparingly in serverless environments

**When to Use Which**

| Use Case | Pooler Mode |
|----------|-------------|
| API routes (GET/POST) | Transaction (6543) |
| Background jobs | Transaction (6543) |
| Real-time subscriptions | Session (5432) |
| Prepared statements | Session (5432) |
| Long-running operations | Session (5432) |

## Solution 3: Serverless-Specific Patterns

Beyond connection pooling, here are patterns that keep your connection usage low.

**1. Connection Lifecycle in Vercel Functions**

\`\`\`typescript
// app/api/orders/route.ts
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  const supabase = getSupabaseClient();
  const body = await request.json();

  // Do all DB operations with the same client
  const { data: order } = await supabase
    .from('orders')
    .insert(body)
    .select()
    .single();

  const { data: items } = await supabase
    .from('order_items')
    .insert(body.items);

  // Function ends, connection returns to pool (Transaction mode)
  // OR stays open for ~15 min (Session mode, singleton pattern)
  
  return Response.json({ order, items });
}
\`\`\`

**2. Avoid Opening Multiple Clients**

\`\`\`typescript
// ❌ BAD - Opens 3 connections
const supabase1 = createClient(url, key);
const supabase2 = createClient(url, key);
const supabase3 = createClient(url, key);

// ✅ GOOD - Reuses 1 connection
const supabase = getSupabaseClient();
await supabase.from('users').select('*');
await supabase.from('orders').select('*');
await supabase.from('products').select('*');
\`\`\`

**3. Combine Pattern with Circuit Breaker**

I wrote about [circuit breakers for API reliability](/blog/circuit-breaker-pattern-production-api-reliability) before. They work great with connection pooling:

\`\`\`typescript
// lib/supabase-with-breaker.ts
import { getSupabaseClient } from './supabase';
import { executeWithCircuitBreaker } from './circuit-breaker';

export async function queryWithBreaker<T>(
  queryFn: (supabase: any) => Promise<T>
): Promise<T> {
  return executeWithCircuitBreaker(async () => {
    const supabase = getSupabaseClient();
    return queryFn(supabase);
  });
}
\`\`\`

\`\`\`typescript
// Usage
const products = await queryWithBreaker(
  (supabase) => supabase.from('products').select('*')
);
\`\`\`

Now if connections are exhausted, the circuit opens and fails fast instead of piling up more connection attempts.

## Monitoring Connection Usage

Check your current connection usage with this query (run in Supabase SQL Editor):

\`\`\`sql
SELECT 
  count(*) as total_connections,
  max_conn,
  max_conn - count(*) as available_connections
FROM pg_stat_activity, 
  (SELECT setting::int AS max_conn FROM pg_settings WHERE name='max_connections') max
WHERE datname = current_database();
\`\`\`

**What to Watch For**

- **Total connections near max**: Time to enable pooler or upgrade tier
- **Idle connections piling up**: Check for connection leaks
- **Spiky connection usage**: Normal for serverless, pooler helps smooth this out

**Set Up Alerts**

In Supabase dashboard (Database → Health):
- Set alert at 70% connection usage
- Monitor connection errors in logs
- Watch for slow queries (might hold connections longer)

## Production Deployment Guide

**1. Environment Variables**

\`\`\`bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Override with pooler URL for production
SUPABASE_POOLER_URL=postgresql://postgres.[project-id].pooler.supabase.com:6543/postgres
\`\`\`

**2. Pool Sizing**

Transaction mode (6543) handles this automatically, but if you're using session mode:

| Tier | Max Connections | Recommended Pool Size |
|------|----------------|----------------------|
| Free | 60 | 40 (leave headroom) |
| Pro | 200 | 150 |
| Enterprise | 500+ | 400+ |

**3. Singleton Pattern + Pooler**

Use both for maximum efficiency:

\`\`\`typescript
// lib/supabase.ts
let supabaseInstance: any = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    supabaseInstance = createClient(url, key, {
      db: { schema: 'public' },
      auth: { persistSession: false },
    });
  }
  return supabaseInstance;
}
\`\`\`

Point \`NEXT_PUBLIC_SUPABASE_URL\` to the pooler URL in production. Each function instance reuses one client, and that client uses the pooler.

**4. Vercel-Specific Config**

\`\`\`json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
\`\`\`

Shorter \`maxDuration\` means functions don't stay warm as long, releasing connections faster.

## Real-World Results

After implementing these patterns on NeedThisDone.com:

- **Before**: 60 connections exhausted with ~30 concurrent users
- **After**: 15-20 connections used with 100+ concurrent users
- **Downtime**: Went from 2-3 connection errors per week to zero

The singleton pattern alone cut connection usage by 60%. Adding the pooler brought it down another 30%.

## Need Help Scaling Your Supabase App?

Connection pooling is just one piece of production-ready architecture. There's also:

- Error handling and retries
- Rate limiting
- Request deduplication
- Real-time scaling with [RAG-powered features](/blog/rag-chatbot-supabase-pgvector-next-js)

I've built all of this for NeedThisDone.com and clients like Acadio. If you're running into Supabase scaling issues, I can help.

[See how I can help →](/services)

Or [get in touch](/contact) and we'll talk through your specific setup.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // New Post 6: Combat Medic to Developer: Skills That Transfer
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "combat-medic-to-developer-skills-transfer",
    title: "Combat Medic to Developer: Skills That Transfer",
    excerpt:
      "How Army combat medic training prepared me for software development. Lessons on triage, learning under pressure, and documentation.",
    category: "behind-the-scenes",
    tags: ["veteran", "career-transition", "military", "full-stack", "self-taught", "soft-skills"],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: "Combat Medic to Developer: Military Skills That Transfer to Tech",
    meta_description:
      "How Army combat medic training prepared me for software development. Lessons on problem-solving, resilience, and learning under pressure.",
    content: `# Combat Medic to Developer: Skills That Transfer Better Than You Think

I spent four years as a combat medic. Two years at Fort Hood, two at Fort Bragg. Led a team of three medics and two combat lifesavers. My job was to keep people alive under the worst possible conditions.

Now I build software for a living.

People ask me all the time: "How did you go from the Army to coding?" Like it's some massive leap that requires superhuman reinvention.

But honestly? The skills transfer better than you'd think.

## Why This Story Matters

Veterans make up less than 1% of software engineers. That's wild considering how many of us leave the military every year looking for new careers.

I think part of the problem is perception. We tell ourselves: "I don't have a CS degree. I'm not a 'math person.' I'm too old to start over."

I had all those thoughts. I was 27 when I got out. No tech background. No degree. Just a GI Bill and a willingness to figure it out.

Three years later, I'm a full-stack developer running my own consulting practice. I've built production apps handling thousands of users. I've worked with startups, enterprises, and everything in between.

If you're a veteran considering tech, this post is for you. Here are the skills you already have that translate directly to software development.

## Skill #1: Triage and Prioritization

**In the field:** You show up to a mass casualty event. Eight wounded. One medic (you). What do you do?

You triage.

- Who's bleeding out right now? (Immediate)
- Who can wait 10 minutes? (Delayed)
- Who's stable enough to self-care? (Minimal)
- Who's beyond saving with available resources? (Expectant)

You make decisions with incomplete information under extreme pressure. You prioritize ruthlessly because lives depend on it.

**In software:** You wake up Monday morning. Production is down. Users are complaining about slow load times. Your CEO wants three new features shipped this week. A security vulnerability just got published in a library you use.

What do you do?

You triage.

- What's actively breaking right now? (Fix first)
- What can ship this week with existing resources? (Scope it)
- What can wait until next sprint? (Backlog it)
- What's a nice-to-have that won't happen? (Cut it)

The mental model is identical. You assess the situation, prioritize based on impact and urgency, and execute methodically.

**Debugging is triage.** You don't fix every error at once. You identify the critical path, stabilize the system, then work through lower-priority issues systematically.

I see junior devs (without military backgrounds) panic when multiple things break at once. They try to fix everything simultaneously and end up fixing nothing.

Combat medics don't panic. We triage.

## Skill #2: Learning Under Pressure

**In the military:** You learned your job at a pace that would break most people.

Basic training: 10 weeks. Combat medic school: 16 weeks. You went from civilian to certified emergency medical professional in under seven months.

You didn't learn by casually reading textbooks. You learned by doing, under pressure, with immediate feedback. Screw up an IV in training? Your instructor is in your face. Screw up in combat? Someone dies.

High stakes. Fast iteration. Continuous improvement.

**In software:** I taught myself to code the same way the Army taught me to be a medic: repetition, pressure, feedback.

I didn't spend two years watching tutorials. I built projects. I broke things. I fixed them. I read error messages, googled solutions, and tried again.

Here's what self-taught coding looks like:

- **Week 1-4:** Built a basic HTML/CSS portfolio. Looked terrible. Didn't care.
- **Week 5-8:** Added JavaScript. Broke everything. Learned debugging.
- **Week 9-12:** Built a to-do app with React. Finally understood state management.
- **Month 4-6:** Built a full-stack app with Next.js, Supabase, Stripe. Shipped it.

I treated coding like military training: show up every day, push through discomfort, learn from mistakes, repeat.

Veterans already know how to do this. You've done it before. The domain is different, but the learning process is identical.

## Skill #3: Documentation and Checklists

**In the military:** SOPs (Standard Operating Procedures) keep people alive.

Before every mission, we ran through checklists:

- Medical supplies? Check.
- Comms working? Check.
- Evac plan confirmed? Check.
- Fallback positions identified? Check.

You don't wing it when lives are on the line. You document everything, follow procedures, and brief the team so everyone knows the plan.

**In software:** Good developers document everything too.

When I deploy a new feature, I follow a checklist:

- Tests passing? Check.
- Environment variables set? Check.
- Database migrations applied? Check.
- Rollback plan ready? Check.
- Monitoring alerts configured? Check.

I learned this from the Army. Don't rely on memory. Write it down. Make it repeatable.

**Runbooks are SOPs.** When production breaks at 2 AM, you don't want to think. You want a step-by-step guide:

\`\`\`
1. Check logs: \`vercel logs --prod\`
2. Verify DB connection: run health check query
3. Check third-party APIs: Stripe status, Supabase status
4. Roll back if needed: \`git revert <commit> && git push\`
5. Notify users via status page
\`\`\`

I write runbooks for every critical system. Same discipline as writing SOPs for medical emergencies.

Veterans already think this way. You know that "winging it" in high-stakes situations gets people hurt. Software is the same. Document, checklist, execute.

## Skill #4: Teamwork in High-Stakes Environments

**In the military:** Your team is everything.

I trusted my medics with my life. They trusted me with theirs. We communicated clearly, supported each other under pressure, and executed as a unit.

When things went sideways, we didn't point fingers. We fixed the problem, debriefed, and got better.

**In software:** Great engineering teams operate the same way.

You're not coding alone in a basement. You're working with designers, product managers, other engineers. You're shipping features that affect real users.

Trust matters. Communication matters. Accountability matters.

Here's what military teamwork looks like in tech:

- **Clear communication**: Don't assume people know what you're thinking. Over-communicate. "I'm deploying in 10 minutes, heads up."
- **Support under pressure**: Production down? Everyone jumps in to help. No "not my problem" attitudes.
- **Debrief and improve**: Post-mortems after incidents. What went wrong? How do we prevent it next time?
- **Trust and accountability**: If you say you'll ship something by Friday, you ship it. Or you communicate early if you can't.

I see this in the best engineering teams I've worked with. It's the same culture the military drilled into me.

## Advice for Transitioning Veterans

If you're reading this and thinking "Maybe I could do this," here's what I wish someone had told me:

**1. Use Your Benefits**

- **GI Bill**: Covers coding bootcamps (I used mine for a 12-week program)
- **VET TEC**: Free tech training for veterans, no GI Bill required
- **SkillBridge**: Internships with tech companies during your last 180 days of service

Don't leave money on the table. These programs exist because companies want to hire veterans. Use them.

**2. Start Before You're Ready**

You don't need to feel "ready" to start learning. You'll never feel ready.

Pick a tutorial, build something, ship it. Repeat.

I wrote about my journey from medic to developer [here](/blog/combat-medic-to-code-military-discipline-development). Spoiler: I had no idea what I was doing for the first six months. I just kept showing up.

**3. Build Projects, Not Just Tutorials**

Tutorials teach syntax. Projects teach problem-solving.

Build things that solve real problems:

- A workout tracker for your gym
- A budgeting app for your family
- A scheduling tool for your side hustle

Put them on GitHub. Deploy them. Show employers you can ship.

**4. Network with Veteran Developers**

You're not the first veteran to make this transition. Find others:

- **#VetsWhoCode**: Community of veteran developers
- **Operation Code**: Non-profit supporting veterans learning to code
- **LinkedIn**: Search "veteran software engineer" and connect

Ask questions. Get mentorship. Pay it forward when you make it.

**5. Don't Downplay Your Military Experience**

Your resume might not have "senior engineer" on it, but it has leadership, high-stakes decision-making, and adaptability under pressure.

Those skills matter.

I put my medic experience on my resume. I talked about it in interviews. Employers respected it.

You're not starting from zero. You're bringing a skillset that most developers don't have.

## Hire a Veteran Developer

If you're an employer reading this: hire veterans.

We bring:

- Discipline and accountability
- Ability to learn under pressure
- Teamwork and clear communication
- Resilience and adaptability

We're not looking for handouts. We're looking for opportunities to prove ourselves.

I'm one example. There are thousands more like me transitioning out every year.

If you need a developer who can triage production incidents like a mass casualty event, I'm your guy.

[Check out my work](/resume) or [reach out](/contact). Let's talk.

And if you're a veteran considering this path: you've got this. The skills transfer. The discipline carries over. You just need to start.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // New Post 7: Next.js E-commerce Architecture: Building NeedThis
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "nextjs-typescript-ecommerce-system-design",
    title: "Next.js E-commerce Architecture: Building NeedThisDone.com",
    excerpt:
      "Deep dive into production e-commerce architecture: Next.js, Medusa, Supabase, Stripe. Includes diagrams, trade-offs, and lessons learned.",
    category: "case-study",
    tags: ["Next.js", "TypeScript", "system-design", "e-commerce", "architecture", "case-study", "Medusa"],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: "Next.js E-commerce Architecture | Case Study: NeedThisDone.com",
    meta_description:
      "Deep dive into production e-commerce architecture: Next.js, Medusa, Supabase, Stripe. Includes diagrams, trade-offs, and lessons learned.",
    content: `# Next.js E-commerce Architecture: Building NeedThisDone.com

When I started building NeedThisDone.com in November 2025, I knew I didn't want just another consulting website. I needed a platform that could handle service bookings, e-commerce products, content management, and an AI-powered chatbot. Two and a half months and 1,300+ commits later, here's the architecture that powers it all.

## Project Requirements

The platform needed to support:

- **Consulting services** - appointment booking, customer dashboard, order management
- **E-commerce** - website packages, add-ons, and subscriptions with unified checkout
- **Content management** - blog posts, case studies, inline editing for marketing pages
- **AI chatbot** - contextual help using pgvector for semantic search
- **Admin dashboards** - analytics, customer management, email campaigns

Traditional monolithic CMSs like WordPress or Shopify wouldn't cut it. I needed composable architecture with headless services that could scale independently.

## High-Level Architecture

Here's how the pieces fit together:

\`\`\`
┌─────────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE NETWORK                         │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    Next.js 14 App Router                       │ │
│  │                                                                │ │
│  │  • 74 API Routes (server actions, webhooks)                   │ │
│  │  • 160+ React Components (Server + Client)                    │ │
│  │  • ISR for product/blog pages                                 │ │
│  └─────┬─────────────────┬─────────────────┬──────────────────────┘ │
│        │                 │                 │                        │
└────────┼─────────────────┼─────────────────┼────────────────────────┘
         │                 │                 │
         ▼                 ▼                 ▼
    ┌────────┐       ┌──────────┐     ┌──────────┐
    │ Medusa │◄─────►│ Supabase │◄───►│  Stripe  │
    │Railway │       │PostgreSQL│     │ Payments │
    └────┬───┘       └────┬─────┘     └─────┬────┘
         │                │                  │
         │           ┌────▼─────┐            │
         │           │ pgvector │            │
         │           │AI Context│            │
         │           └──────────┘            │
         │                                   │
         └───────────────┬───────────────────┘
                         ▼
                    ┌─────────┐
                    │  Redis  │
                    │ Upstash │
                    └─────────┘
\`\`\`

**Request Flow Example (Add to Cart):**
1. User clicks "Add to Cart" on product page
2. Next.js Server Component fetches product from Medusa API
3. Client-side CartContext calls \`/api/cart\` endpoint
4. API route updates Medusa cart + Supabase analytics
5. Redis circuit breaker prevents duplicate requests
6. Response returns to client with updated cart state

## Data Model Design: What Lives Where

One of the biggest decisions was choosing where each piece of data should live. Here's what I landed on:

| Data Type | Storage | Why |
|-----------|---------|-----|
| Products, Orders, Cart | Medusa (PostgreSQL on Railway) | Headless commerce engine handles inventory, pricing, tax calculation |
| Users, Profiles, Analytics | Supabase PostgreSQL | Auth, customer data, order history, spending trends |
| Payments, Subscriptions | Stripe | PCI compliance, recurring billing, webhook orchestration |
| Blog Posts, FAQs, Reviews | Supabase | CMS content with full-text search and filtering |
| AI Chat Context | Supabase pgvector | Semantic search using OpenAI embeddings |
| Request Deduplication | Redis (Upstash) | Sub-50ms lookups for duplicate prevention |

**Key Principle:** Each service owns its domain. Medusa doesn't know about blog posts. Supabase doesn't manage cart state. Stripe is the source of truth for payment status.

### TypeScript Types Across Boundaries

To keep this type-safe, I defined shared interfaces:

\`\`\`typescript
// app/lib/types/product.ts
export interface Product {
  id: string;
  title: string;
  description: string;
  variants: ProductVariant[];
  metadata: {
    type: 'package' | 'addon' | 'service' | 'subscription';
    features: string[];
    deposit_percent?: number;
  };
}

// app/lib/types/order.ts
export interface Order {
  id: string;
  customer_id: string;
  medusa_order_id: string; // Links to Medusa
  stripe_payment_intent?: string; // Links to Stripe
  status: 'pending' | 'completed' | 'cancelled';
  total: number;
  created_at: string;
}
\`\`\`

These types act as contracts between services. When Medusa returns product data, I validate it against \`Product\`. When Stripe webhooks fire, I map payment data to \`Order\`.

## Key Design Decisions

### Server vs Client Components

Next.js 14's App Router defaults to Server Components. I use this aggressively:

\`\`\`typescript
// app/shop/page.tsx - Server Component (default)
import { medusaClient } from '@/lib/medusa-client';

export default async function ShopPage() {
  // Fetch products server-side - no loading spinner needed
  const { products } = await medusaClient.products.list();

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
\`\`\`

**Client Components only when needed:**
- Cart state management (CartContext)
- Interactive forms (checkout, contact)
- Animations and client-side routing

This keeps the initial JavaScript bundle under 150KB gzipped.

### Unified Cart for All Product Types

Early on, I had separate cart systems for services vs products. Big mistake. Now everything flows through Medusa:

\`\`\`typescript
// app/context/CartContext.tsx
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);

  const addItem = async (variantId: string, quantity: number) => {
    if (!cartId) {
      // Create cart on first item
      const newCart = await medusaClient.carts.create();
      setCartId(newCart.id);
      localStorage.setItem('medusa_cart_id', newCart.id);
    }

    // Add item (works for packages, addons, services, subscriptions)
    await medusaClient.carts.lineItems.create(cartId, {
      variant_id: variantId,
      quantity,
    });
  };

  // ... remove, update quantity, etc.
}
\`\`\`

Whether it's a website package, a subscription, or an add-on, the flow is identical. Medusa handles the complexity of tax calculation, shipping, and deposit splitting.

### Checkout Flow: Handling Subscriptions

Subscriptions were tricky. Medusa creates orders, but Stripe manages recurring billing. The webhook choreography looks like this:

\`\`\`
User clicks "Checkout" with subscription item
      ↓
Next.js creates Medusa order
      ↓
Medusa webhook → Next.js /api/webhooks/medusa
      ↓
Next.js creates Stripe subscription (not one-time payment)
      ↓
Stripe webhook → Next.js /api/webhooks/stripe
      ↓
Update Supabase: subscription_id, next_billing_date
\`\`\`

The key insight: Medusa creates the initial order record, Stripe owns the recurring schedule. Supabase tracks which customer has which subscription.

## Reliability Patterns

With 74 API routes and external dependencies on Medusa, Stripe, and Supabase, failures are inevitable. Here's how I handle them:

### Circuit Breaker Pattern

Redis circuit breaker prevents cascading failures when Supabase goes down:

\`\`\`typescript
// app/lib/redis.ts
export async function circuitBreakerGet<T>(
  key: string,
  fallback: T
): Promise<T> {
  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : fallback;
  } catch (error) {
    console.error('Redis circuit breaker tripped:', error);
    return fallback; // Graceful degradation
  }
}
\`\`\`

I cover this in depth in [Building a Circuit Breaker Pattern in Node.js](/blog/building-circuit-breaker-pattern-nodejs).

### Request Deduplication

SHA-256 fingerprinting prevents double-submit bugs:

\`\`\`typescript
// app/lib/request-dedup.ts
const generateFingerprint = (body: unknown): string => {
  const normalized = JSON.stringify(body, Object.keys(body).sort());
  return createHash('sha256').update(normalized).digest('hex');
};
\`\`\`

See [Request Deduplication: Preventing Double Submissions](/blog/request-deduplication-preventing-double-submissions) for implementation details.

### Connection Pooling

Singleton Supabase client handles 100+ concurrent requests without connection pool exhaustion:

\`\`\`typescript
// app/lib/supabase-client.ts
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseInstance;
}
\`\`\`

## Performance Optimizations

### Incremental Static Regeneration (ISR)

Product and blog pages use ISR with 60-second revalidation:

\`\`\`typescript
// app/shop/[productId]/page.tsx
export const revalidate = 60; // Regenerate every 60 seconds

export default async function ProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = await medusaClient.products.retrieve(params.productId);
  return <ProductDetail product={product} />;
}
\`\`\`

This gives me near-static performance with dynamic data.

### Lazy Loading Heavy Components

Admin dashboards use dynamic imports to avoid bloating the main bundle:

\`\`\`typescript
// app/admin/page.tsx
import dynamic from 'next/dynamic';

const AnalyticsDashboard = dynamic(
  () => import('@/components/admin/AnalyticsDashboard'),
  { ssr: false }
);

export default function AdminPage() {
  return <AnalyticsDashboard />;
}
\`\`\`

## Lessons Learned

**What Worked:**
- **Headless architecture** - swapping Medusa for Shopify would take a day, not weeks
- **Type safety** - TypeScript caught 200+ bugs before production
- **Server Components** - massive performance win, initial load under 2 seconds
- **Unified cart** - one checkout flow for all product types

**What I'd Change:**
- **Start with monorepo** - managing Medusa separately on Railway adds deployment friction
- **More aggressive caching** - Redis could cache more Medusa API calls
- **Earlier investment in E2E tests** - I have 71 test files now, wish I started with that discipline

## Want This for Your Business?

This architecture supports a consulting platform with e-commerce, CMS, and AI chat. The same patterns work for SaaS products, marketplaces, and membership sites.

If you need a custom platform that scales, I can help. I build production-grade apps with Next.js, headless commerce, and modern DevOps practices.

**[View My Services](/services)** • **[See Pricing](/pricing)** • **[Get in Touch](/contact)**

Let's build something that grows with your business.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // New Post 8: My AI Development Workflow with Claude Code
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "claude-code-ai-development-workflow",
    title: "My AI Development Workflow with Claude Code",
    excerpt:
      "How I use Claude Code to build production apps faster. Real examples, prompts, and workflow optimizations for full-stack development.",
    category: "behind-the-scenes",
    tags: ["Claude-Code", "AI", "development-workflow", "productivity", "full-stack", "automation"],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: "My AI Development Workflow with Claude Code | Full-Stack Productivity",
    meta_description:
      "How I use Claude Code to build production apps faster. Real examples, prompts, and workflow optimizations for full-stack development.",
    content: `# My AI Development Workflow with Claude Code

I built NeedThisDone.com in two and a half months. 1,300+ commits. 74 API routes. 160+ React components. 71 test files. All while running a consulting practice and learning new tech stacks.

That pace isn't sustainable through caffeine and late nights. It's sustainable because I treat AI as a force multiplier, not a replacement. Here's the workflow that makes it work.

## Why AI-Assisted Development Matters in 2026

Let's get one thing straight: AI doesn't replace developers. It replaces the tedious parts of development.

**What AI handles:**
- Writing boilerplate (API routes, type definitions, database migrations)
- Generating test scaffolding (E2E tests, accessibility tests)
- Refactoring repetitive patterns into reusable utilities
- Drafting documentation and commit messages

**What I still do:**
- Architecture decisions (which database for what data?)
- UX design (how should this flow feel?)
- Business logic (what rules govern subscriptions?)
- Security review (are these auth checks sufficient?)

The productivity gain isn't "AI writes the code for me." It's "AI handles the boring stuff so I can focus on the hard problems."

## My Claude Code Workflow

I use Claude Code, not ChatGPT or GitHub Copilot. Here's why: Claude Code operates at the project level with full codebase context, not just the current file. It reads my coding standards, design system, and project memory before suggesting changes.

### Step 1: Project Instructions (CLAUDE.md)

Every project starts with a \`CLAUDE.md\` file in the root directory. This is my rulebook for AI:

\`\`\`markdown
# IFCSI Framework
When writing anything—cover letters, proposals, marketing copy, even commit messages—move through these five tones in order:
1. Inviting — Start with something that makes them want to keep reading
2. Focused — Get to the point
3. Considerate — Show you understand their situation
4. Supportive — Back it up with examples
5. Influential — Land the plane with next steps

# Quick Reference
| Task | Command |
|------|---------|
| Start dev server | cd app && npm run dev |
| Run tests | cd app && npm run test:e2e |
| Draft commit | Run /dac |
\`\`\`

This file also includes design system rules (BJJ belt color progression for NeedThisDone), testing patterns (TDD-first), and deployment guidelines. Claude reads this every time.

### Step 2: TDD Cycle with AI

I follow strict test-driven development, even with AI assistance:

**RED → GREEN → REFACTOR**

1. **RED**: I describe the failing test I want
   - "Write an E2E test that verifies typing in the FAQ answer field updates the content"
   - Claude generates the Playwright test, I run it, it fails

2. **GREEN**: Claude suggests the minimal fix
   - Updates \`InlineEditContext.tsx\` to sync \`selectedItem.content\` with \`pageContent\`
   - I review, test passes

3. **REFACTOR**: I ask Claude to clean up
   - "Extract this state synchronization logic into a helper function"
   - Claude refactors, tests still pass

The key: **I run the tests myself.** Claude suggests code, I verify it works. This catches hallucinations immediately.

### Step 3: Code Review Loop

Claude isn't perfect. Every suggestion goes through this filter:

1. **Does this follow project conventions?** (Check against CLAUDE.md rules)
2. **Does this introduce security risks?** (Review auth checks, input validation)
3. **Does this break existing functionality?** (Run E2E tests)
4. **Is this the simplest solution?** (Avoid over-engineering)

If the answer to any is "no," I reject the suggestion and prompt Claude to try again with constraints:

"This approach introduces a new dependency. Refactor using only existing utilities in \`app/lib/\`."

## Effective Prompting Strategies

Good prompts get good results. Here's what works:

### Be Specific with Context

**Bad prompt:**
"Fix the cart bug"

**Good prompt:**
"The CartContext is not updating when I add a subscription product. The addItem function should create a Medusa cart if one doesn't exist, then add the variant. Check \`app/context/CartContext.tsx\` and ensure the flow matches the pattern in \`lib/medusa-client.ts\`."

### Provide Examples from the Codebase

**Bad prompt:**
"Create a new API route for product search"

**Good prompt:**
"Create a new API route at \`/api/shop/search\` that queries Medusa products by title. Follow the pattern in \`/api/pricing/products/route.ts\` for error handling and response formatting."

### Iterate on Failures

If Claude's first attempt doesn't work, I give it the error message:

"This failed with \`TypeError: Cannot read property 'id' of undefined\`. The issue is that \`selectedItem\` is null when the user first clicks an item. Add a null check before accessing \`selectedItem.content\`."

## What Claude Code Excels At

After 1,300+ commits using Claude Code, here's where it shines:

### Boilerplate Generation

Creating a new API route with validation, error handling, and TypeScript types used to take 20 minutes. Now it takes 2.

**Prompt:** "Create an API route at \`/api/admin/campaigns\` with GET (list campaigns) and POST (create campaign). Use Zod validation for the request body. Follow the pattern in \`/api/admin/reviews\`."

**Result:** Fully typed route with error handling, CORS headers, admin auth checks.

### Test Scaffolding

I write the test assertions, Claude generates the setup:

**Prompt:** "Write a Playwright test that navigates to \`/shop\`, adds a product to cart, and verifies the cart count updates. Use the existing \`CartFixture\` from \`e2e/fixtures/cart-fixture.ts\`."

**Result:** E2E test with proper page object patterns, ready to run.

### Refactoring Repetitive Patterns

When I notice I'm copying the same 20 lines across 5 components, Claude extracts it into a reusable hook:

**Prompt:** "I'm using this \`mergeWithDefaults\` logic in 5 page components. Create a \`useEditableContent\` hook in \`app/lib/hooks/\` that handles this pattern."

**Result:** Hook with memoization, TypeScript generics, and usage examples.

### Documentation

I hate writing docs. Claude loves it.

**Prompt:** "Generate JSDoc comments for all functions in \`app/lib/medusa-client.ts\`."

**Result:** Fully documented API client with parameter descriptions and return types.

## What Still Needs Human Expertise

AI can't replace judgment. Here's where I still do all the thinking:

### Architecture Decisions

"Should user data live in Supabase or Medusa?" — This requires understanding the full system, data access patterns, and future scaling needs. Claude can explain tradeoffs, but I make the call.

### UX Design

"How should the checkout flow feel?" — AI can suggest patterns, but designing delightful experiences requires empathy and iteration. I prototype, test with users, and refine.

### Business Logic

"What happens when a subscription fails to renew?" — This involves business rules, customer communication, and edge cases. Claude can write the code once I define the logic.

### Security Review

"Are these admin auth checks sufficient?" — AI might suggest \`if (user.role === 'admin')\`, but I verify it's checking against server-side session data, not client-side cookies.

## Productivity Metrics: Real Examples

Here's the speed difference on actual NeedThisDone.com features:

| Task | Without AI | With Claude Code |
|------|------------|------------------|
| Create loyalty points system (API + UI + tests) | 8 hours | 2 hours |
| Refactor 20 components to use centralized color system | 4 hours | 45 minutes |
| Write E2E tests for checkout flow | 3 hours | 1 hour |
| Generate blog post markdown templates | 2 hours | 10 minutes |
| Draft 10 commit messages with context | 30 minutes | 5 minutes |

**Estimated time saved over 2.5 months: 120+ hours.**

That's three full work weeks. Instead of typing boilerplate, I spent that time on architecture, UX polish, and writing [blog posts about what I learned](/blog/self-taught-to-full-stack).

## The Honest Limitations

AI-assisted development isn't magic. Here's what still frustrates me:

**Hallucinations**: Claude sometimes invents APIs that don't exist. I catch this by running tests immediately.

**Context limits**: On large refactors, Claude loses track of changes across 10+ files. I break these into smaller prompts.

**Over-engineering**: Claude loves abstractions. I have to push back with "keep it simple, we only have 2 use cases."

**Outdated knowledge**: Claude's training data cuts off in early 2025. New Next.js 15 features require me to provide docs.

## Get AI-Powered Development

This workflow works because I treat Claude Code as a senior pair programmer, not a junior dev I don't review. The productivity gains are real, but only if you maintain quality standards.

If you want a custom app built with this methodology—fast iteration, production quality, modern tech stacks—I can help.

**[View My Services](/services)** • **[Get in Touch](/contact)**

Let's ship something great.`,
  },



  // ─────────────────────────────────────────────────────────────────────────
  // Post 6: How to Build RAG with Supabase pgvector and Next.js
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'rag-supabase-pgvector-nextjs-tutorial',
    title: 'How to Build RAG with Supabase pgvector and Next.js',
    excerpt:
      'Build production-ready RAG using Supabase pgvector, OpenAI embeddings, and Next.js. Complete code examples for vector search, streaming chat, and context injection.',
    category: 'tutorial',
    tags: ['RAG', 'Supabase', 'pgvector', 'Next.js', 'AI', 'embeddings', 'vector-search'],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: 'How to Build RAG with Supabase pgvector and Next.js | Complete Tutorial',
    meta_description:
      'Build production-ready RAG (Retrieval Augmented Generation) using Supabase pgvector, OpenAI embeddings, and Next.js. Complete code examples included.',
    content: `# How to Build RAG with Supabase pgvector and Next.js

Retrieval-Augmented Generation (RAG) is transforming how we build AI applications. Instead of relying solely on an LLM's training data, RAG systems retrieve relevant information from your own data sources and inject it into the prompt. This gives you accurate, up-to-date answers without the hallucinations that plague pure LLMs.

In this guide, I'll show you how to build a production-ready RAG system using Supabase pgvector and Next.js. We'll cover everything from database setup to streaming chat interfaces, with real code you can ship today.

## What is RAG and Why Use Supabase?

RAG stands for Retrieval-Augmented Generation. Here's the simplified flow:

1. User asks a question
2. Your app converts the question into a vector embedding
3. You search your database for similar content using vector similarity
4. You inject the relevant content into the LLM's context
5. The LLM generates an answer based on your actual data

Traditional approaches use specialized vector databases like Pinecone or Weaviate. But for most projects, Supabase pgvector is a better choice:

- **One database for everything**: Store vectors alongside your relational data
- **Lower costs**: No separate vector database subscription
- **Familiar SQL**: Write queries you already understand
- **Real-time subscriptions**: Built-in WebSocket support
- **Row-level security**: Protect user data at the database level

I've used this pattern for client documentation search, customer support chatbots, and internal knowledge bases. For projects under 1 million vectors, Supabase pgvector performs beautifully.

## Architecture Overview

Here's what we're building:

\`\`\`
User → Next.js API Route → Supabase pgvector → OpenAI
         ↓                    ↓                  ↓
    Embed query      Find similar docs    Generate answer
\`\`\`

Component breakdown:

- **Embedding table**: Stores document chunks with their vector embeddings
- **API routes**: Handle embedding generation and similarity search
- **Chat interface**: Streams responses to the user
- **Background jobs**: Process and embed new content

The beauty of this architecture is that each piece is independently testable and replaceable. Need a different LLM? Swap OpenAI for Anthropic. Want semantic caching? Add Redis. The core pattern stays the same.

## Step 1: Setting Up Supabase pgvector

First, enable the pgvector extension in your Supabase project:

\`\`\`sql
-- Run in Supabase SQL Editor
create extension if not exists vector;

-- Create embeddings table
create table embeddings (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536), -- OpenAI ada-002 dimension
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Create index for similarity search
create index on embeddings using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Enable Row Level Security
alter table embeddings enable row level security;

-- Policy: Everyone can read embeddings
create policy "Public embeddings are viewable by everyone"
  on embeddings for select
  using (true);
\`\`\`

The \`ivfflat\` index is crucial for performance. It uses approximate nearest neighbor search, which is 10-100x faster than exact search for large datasets. The \`lists\` parameter controls the trade-off between speed and accuracy. Start with 100 and increase if you have millions of vectors.

Save this as a Supabase migration in \`supabase/migrations/\`.

## Step 2: Generating Embeddings in Next.js

Create an API route to process documents and generate embeddings:

\`\`\`typescript
// app/api/embeddings/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Split text into chunks (simple implementation)
function chunkText(text: string, maxLength: number = 1000): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split('\\n\\n');
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxLength) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += '\\n\\n' + paragraph;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

export async function POST(req: NextRequest) {
  const { content, metadata } = await req.json();

  // Split content into chunks
  const chunks = chunkText(content);

  // Generate embeddings for all chunks
  const embeddingsData = await Promise.all(
    chunks.map(async (chunk) => {
      const response = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: chunk,
      });

      return {
        content: chunk,
        embedding: response.data.data[0].embedding,
        metadata,
      };
    })
  );

  // Insert into Supabase
  const { error } = await supabase
    .from('embeddings')
    .insert(embeddingsData);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    chunksProcessed: chunks.length,
  });
}
\`\`\`

Pro tip: OpenAI's API has rate limits. For large document sets, implement a queue system like BullMQ or use background jobs with Vercel Cron. I cover resilient API patterns in my post on [building a circuit breaker pattern](/blog/building-circuit-breaker-pattern-nodejs).

## Step 3: Similarity Search Implementation

Now create the search endpoint:

\`\`\`typescript
// app/api/embeddings/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  const { query, matchCount = 5, threshold = 0.5 } = await req.json();

  // Generate embedding for user query
  const embeddingResponse = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input: query,
  });

  const queryEmbedding = embeddingResponse.data.data[0].embedding;

  // Similarity search using pgvector
  const { data: matches, error } = await supabase.rpc('match_embeddings', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    match_threshold: threshold,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ matches });
}
\`\`\`

Create the matching function in Supabase:

\`\`\`sql
-- Run in Supabase SQL Editor
create or replace function match_embeddings(
  query_embedding vector(1536),
  match_count int default 5,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as \$\$
  select
    embeddings.id,
    embeddings.content,
    embeddings.metadata,
    1 - (embeddings.embedding <=> query_embedding) as similarity
  from embeddings
  where 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  order by embeddings.embedding <=> query_embedding
  limit match_count;
\$\$;
\`\`\`

The \`<=>\` operator performs cosine distance calculation. We subtract from 1 to get similarity scores (higher is better).

Performance tips:

- Cache embeddings for common queries using Redis
- Adjust \`match_threshold\` to balance relevance vs. retrieval count
- Monitor query times and increase index lists if searches slow down
- Consider hybrid search (keyword + vector) for better results

## Step 4: Building the Chat Interface

Now tie it together with a streaming chat interface using Vercel AI SDK:

\`\`\`typescript
// app/api/chat/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai';

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1].content;

  // Get relevant context from embeddings
  const searchResponse = await fetch(
    \`\${process.env.NEXT_PUBLIC_APP_URL}/api/embeddings/search\`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: lastMessage }),
    }
  );

  const { matches } = await searchResponse.json();

  // Build context from matches
  const context = matches
    .map((match: any) => match.content)
    .join('\\n\\n---\\n\\n');

  // Inject context into system message
  const systemMessage = {
    role: 'system',
    content: \`You are a helpful assistant. Use the following context to answer the user's question. If the answer isn't in the context, say so.

Context:
\${context}\`,
  };

  // Generate streaming response
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [systemMessage, ...messages],
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
\`\`\`

Frontend component:

\`\`\`typescript
// app/components/ChatInterface.tsx
'use client';

import { useChat } from 'ai/react';

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat',
    });

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={\`p-4 rounded-lg \${
              message.role === 'user'
                ? 'bg-blue-100 ml-auto max-w-md'
                : 'bg-gray-100 mr-auto max-w-2xl'
            }\`}
          >
            <p className="text-gray-800">{message.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          disabled={isLoading}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
\`\`\`

The Vercel AI SDK handles streaming, loading states, and message history automatically. You get a ChatGPT-like experience with minimal code.

## Production Considerations

Before launching your RAG system, consider these factors:

**Cost estimation**:
- OpenAI embeddings: \$0.0001 per 1K tokens
- Storage: ~6KB per embedding (1536 dimensions × 4 bytes)
- For 100K documents at 500 tokens each: ~\$5 embedding cost, ~600MB storage

**Monitoring**:
- Track search latency (target: <200ms)
- Monitor relevance scores (avg similarity >0.7 indicates good matches)
- Log failed embeddings for reprocessing
- Set up alerts for API rate limits

**Optimization**:
- Cache common queries in Redis (10x faster)
- Pre-compute embeddings for frequently accessed content
- Use batching for bulk uploads (100-200 documents per batch)
- Implement request deduplication to prevent duplicate embeddings

**Scaling**:
- At 1M+ vectors, consider dedicated vector databases
- Use read replicas for high-traffic search endpoints
- Implement semantic caching to reduce OpenAI costs
- Consider fine-tuning embeddings for domain-specific content

Need help building a production RAG system? I specialize in AI-powered applications with Next.js and Supabase. Check out my [services](/services) or [view my portfolio](/work) to see similar projects I've shipped.

## Next Steps

Once you have basic RAG working, here are advanced patterns to explore:

**Hybrid search**: Combine vector similarity with full-text search for better results. Use Supabase's built-in FTS alongside pgvector.

**Multi-tenant RAG**: Add tenant isolation using Row Level Security policies. Each customer's embeddings stay private.

**Reranking**: Use a reranking model like Cohere to improve result quality after initial retrieval.

**Metadata filtering**: Add WHERE clauses to your similarity queries to filter by document type, date, or user permissions.

**Streaming updates**: Use Supabase real-time subscriptions to update embeddings when content changes.

RAG is one of the most practical AI patterns you can implement today. It gives you the power of LLMs without the hallucination risks, and Supabase makes it surprisingly simple to build.

If you're building a RAG system and want expert guidance, [get in touch](/contact). I help teams ship AI features that actually work in production.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Post 7: Next.js + Medusa: The Complete Headless Commerce Setup Guide
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'nextjs-medusa-headless-commerce-setup-guide',
    title: 'Next.js + Medusa: The Complete Headless Commerce Setup Guide',
    excerpt:
      'Build a production-ready headless e-commerce store with Next.js 15 and Medusa. Includes cart, checkout, and Stripe integration with full source code.',
    category: 'tutorial',
    tags: ['Next.js', 'Medusa', 'headless-commerce', 'e-commerce', 'React', 'TypeScript', 'Stripe'],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: 'Next.js + Medusa Headless Commerce Setup (2026) | Step-by-Step Guide',
    meta_description:
      'Build a production-ready headless e-commerce store with Next.js 15 and Medusa. Includes cart, checkout, and Stripe integration with full source code.',
    content: `# Next.js + Medusa: The Complete Headless Commerce Setup Guide

Headless commerce is no longer a buzzword reserved for enterprise brands. With tools like Next.js and Medusa, you can build a custom e-commerce platform that rivals Shopify, but with complete control over the frontend, backend, and customer experience.

I built this exact stack for NeedThisDone.com, and I've helped clients migrate from rigid platforms like Shopify Plus to flexible headless architectures. In this guide, I'll show you exactly how to set up Next.js with Medusa, from local development to production deployment.

## Why Headless Commerce in 2026?

Traditional e-commerce platforms bundle everything together: the storefront, admin panel, checkout flow, and backend. This tight coupling creates limitations:

- **Locked-in design**: You're stuck with themes and templates
- **Performance costs**: Heavy JavaScript bundles and waterfall requests
- **Limited customization**: Want a unique checkout? Too bad
- **Vendor lock-in**: Migrating data is painful
- **Scaling challenges**: One bottleneck affects everything

Headless commerce separates concerns:

- **Frontend**: Next.js handles the storefront (or multiple storefronts)
- **Backend**: Medusa manages products, orders, inventory
- **Admin**: Medusa's dashboard for catalog management
- **Checkout**: Custom flows with Stripe or any payment provider

This separation gives you:

- **Flexibility**: Build any frontend experience you want
- **Performance**: Server-side rendering, edge caching, optimized bundles
- **Portability**: Switch frontends without touching your catalog
- **Scalability**: Scale frontend and backend independently
- **Cost savings**: No platform fees eating your margins

The upfront complexity is higher than Shopify's "click to launch" model, but the long-term benefits are substantial. For businesses doing \$50K+ monthly revenue, the investment pays off.

## Project Overview

Here's what we're building:

**Tech stack**:
- **Next.js 15**: App Router, Server Components, Server Actions
- **Medusa**: Headless commerce backend with admin dashboard
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Stripe**: Payment processing and checkout sessions
- **Railway**: Medusa backend hosting with auto-scaling
- **Vercel**: Next.js storefront hosting with edge functions

**What you'll learn**:
- Deploying Medusa to Railway
- Connecting Next.js to Medusa's API
- Implementing cart state with React Context
- Building Stripe checkout flows
- Handling webhooks for order confirmation
- Deployment best practices

Let's get started.

## Part 1: Medusa Backend Setup

First, create a new Medusa project locally:

\`\`\`bash
npx create-medusa-app@latest

# Choose:
# - Project name: my-store-backend
# - Medusa version: Latest
# - Starter: medusa-starter-default
# - Database: PostgreSQL (we'll use Supabase)
\`\`\`

Configure your database connection. Create a new Supabase project, then update your \`.env\` file:

\`\`\`bash
# medusa/.env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT_ID].supabase.co:5432/postgres
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
COOKIE_SECRET=your-cookie-secret
\`\`\`

Start Medusa locally:

\`\`\`bash
cd medusa
npm run dev
\`\`\`

Access the admin dashboard at \`http://localhost:7001/app\`. Create your admin user:

\`\`\`bash
npx medusa user -e admin@mystore.com -p password123
\`\`\`

**Railway deployment**:

1. Push your Medusa code to GitHub
2. Create a Railway project
3. Connect your GitHub repo
4. Add environment variables (same as \`.env\`)
5. Railway auto-deploys on every push

Your Medusa backend is now live. The admin dashboard URL will be \`https://your-project.railway.app/app\`.

## Part 2: Next.js Storefront

Create a new Next.js project:

\`\`\`bash
npx create-next-app@latest my-store-frontend

# Choose:
# - TypeScript: Yes
# - Tailwind CSS: Yes
# - App Router: Yes
\`\`\`

Install Medusa's JavaScript client:

\`\`\`bash
cd my-store-frontend
npm install @medusajs/medusa-js
\`\`\`

Create a Medusa client wrapper:

\`\`\`typescript
// lib/medusa-client.ts
import Medusa from '@medusajs/medusa-js';

export const medusaClient = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_URL || 'http://localhost:9000',
  maxRetries: 3,
});
\`\`\`

Fetch products with Server Components:

\`\`\`typescript
// app/shop/page.tsx
import { medusaClient } from '@/lib/medusa-client';
import Link from 'next/link';
import Image from 'next/image';

export default async function ShopPage() {
  const { products } = await medusaClient.products.list();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Shop</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => {
          const thumbnail = product.thumbnail || '/placeholder.png';
          const price = product.variants[0]?.prices[0]?.amount || 0;

          return (
            <Link
              key={product.id}
              href={\`/shop/\${product.id}\`}
              className="group"
            >
              <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={thumbnail}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                {product.title}
              </h3>

              <p className="text-gray-600 mt-1">
                \${(price / 100).toFixed(2)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
\`\`\`

Product detail page:

\`\`\`typescript
// app/shop/[productId]/page.tsx
import { medusaClient } from '@/lib/medusa-client';
import AddToCartButton from '@/components/AddToCartButton';
import { notFound } from 'next/navigation';

export default async function ProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const { product } = await medusaClient.products.retrieve(params.productId);

  if (!product) {
    notFound();
  }

  const variant = product.variants[0];
  const price = variant.prices[0]?.amount || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 rounded-lg" />

        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {product.title}
          </h1>

          <p className="text-2xl text-emerald-600 mb-6">
            \${(price / 100).toFixed(2)}
          </p>

          <p className="text-gray-700 mb-8">{product.description}</p>

          <AddToCartButton variantId={variant.id} />
        </div>
      </div>
    </div>
  );
}
\`\`\`

Server Components fetch data at request time. No loading spinners, no client-side waterfalls. Just fast, SEO-friendly pages.

## Part 3: Cart Implementation

Create a CartContext to manage cart state:

\`\`\`typescript
// context/CartContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { medusaClient } from '@/lib/medusa-client';

interface CartContextType {
  cartId: string | null;
  itemCount: number;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(0);

  // Load cart ID from localStorage on mount
  useEffect(() => {
    const storedCartId = localStorage.getItem('medusa_cart_id');
    if (storedCartId) {
      setCartId(storedCartId);
      refreshItemCount(storedCartId);
    }
  }, []);

  const refreshItemCount = async (id: string) => {
    const { cart } = await medusaClient.carts.retrieve(id);
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    setItemCount(count);
  };

  const addItem = async (variantId: string, quantity: number) => {
    let id = cartId;

    // Create cart if it doesn't exist
    if (!id) {
      const { cart } = await medusaClient.carts.create();
      id = cart.id;
      setCartId(id);
      localStorage.setItem('medusa_cart_id', id);
    }

    // Add item to cart
    await medusaClient.carts.lineItems.create(id, {
      variant_id: variantId,
      quantity,
    });

    await refreshItemCount(id);
  };

  const removeItem = async (lineId: string) => {
    if (!cartId) return;

    await medusaClient.carts.lineItems.delete(cartId, lineId);
    await refreshItemCount(cartId);
  };

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cartId) return;

    await medusaClient.carts.lineItems.update(cartId, lineId, { quantity });
    await refreshItemCount(cartId);
  };

  return (
    <CartContext.Provider
      value={{ cartId, itemCount, addItem, removeItem, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
\`\`\`

Add to cart button:

\`\`\`typescript
// components/AddToCartButton.tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function AddToCartButton({ variantId }: { variantId: string }) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleClick = async () => {
    setIsAdding(true);
    try {
      await addItem(variantId, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isAdding}
      className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
    >
      {isAdding ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
\`\`\`

This pattern keeps cart state synchronized across all components. Add an item on the product page, and the cart icon in the header updates instantly.

## Part 4: Stripe Checkout Flow

Create a checkout session API route:

\`\`\`typescript
// app/api/checkout/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa-client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  const { cartId } = await req.json();

  // Get cart from Medusa
  const { cart } = await medusaClient.carts.retrieve(cartId);

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: cart.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          description: item.description,
        },
        unit_amount: item.unit_price,
      },
      quantity: item.quantity,
    })),
    success_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/cart\`,
    metadata: {
      cart_id: cartId,
    },
  });

  return NextResponse.json({ url: session.url });
}
\`\`\`

Handle webhooks to complete orders:

\`\`\`typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa-client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const cartId = session.metadata?.cart_id;

    if (cartId) {
      // Complete cart in Medusa (creates order)
      await medusaClient.carts.complete(cartId);
    }
  }

  return NextResponse.json({ received: true });
}
\`\`\`

This flow ensures orders are only created after successful payment. Stripe webhooks handle async payment confirmation, preventing race conditions.

I cover similar reliability patterns in my post on [request deduplication](/blog/request-deduplication-preventing-double-submissions).

## Deployment Checklist

Before going live, verify these configurations:

**Environment variables** (Vercel):
- \`NEXT_PUBLIC_MEDUSA_URL\`: Your Railway Medusa URL
- \`NEXT_PUBLIC_APP_URL\`: Your Vercel domain
- \`STRIPE_SECRET_KEY\`: Stripe secret key
- \`STRIPE_WEBHOOK_SECRET\`: Webhook signing secret

**Vercel configuration** (\`vercel.json\`):
\`\`\`json
{
  "buildCommand": "cd app && npm run build",
  "installCommand": "cd app && npm install",
  "outputDirectory": "app/.next",
  "framework": "nextjs"
}
\`\`\`

**Common pitfalls**:
- Forgot to run Medusa migrations: \`npx medusa migrations run\`
- CORS errors: Add your Vercel domain to Medusa's \`STORE_CORS\` env var
- Webhook failures: Test locally with Stripe CLI before deploying
- Missing API keys: Double-check all environment variables

**Testing**:
- Complete a test purchase with Stripe test cards
- Verify order appears in Medusa admin
- Check email notifications are sent
- Test cart persistence across sessions

I've deployed dozens of headless commerce sites. The architecture I laid out here is battle-tested and production-ready. For more deployment insights, check out my post on [building my own e-commerce platform](/blog/why-i-built-my-own-ecommerce-platform).

## When to Hire a Developer

Headless commerce gives you power, but it requires technical expertise. Consider hiring a developer if you're experiencing:

**Complexity signals**:
- Custom checkout flows (subscriptions, multi-currency, payment plans)
- Multi-storefront setups (B2B and B2C from one catalog)
- Complex inventory logic (bundles, made-to-order, dropshipping)
- Integration requirements (ERP, CRM, fulfillment centers)
- Performance issues (slow pages, high bounce rates)

**Business signals**:
- Outgrowing Shopify's capabilities
- Platform fees eating into margins
- Need custom features competitors don't have
- Scaling beyond 1000 SKUs or 10K monthly orders

Building e-commerce platforms is one of my core services. I specialize in Next.js + Medusa architectures that scale from MVP to enterprise. Check out my [pricing](/pricing) for project packages or [view my portfolio](/work) to see similar builds.

If you're ready to break free from platform limitations, [get in touch](/contact). I'll help you build a commerce experience that's uniquely yours.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Post 8: Building Custom Stripe Checkout Flows in Next.js
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'custom-stripe-checkout-nextjs-server-actions',
    title: 'Building Custom Stripe Checkout Flows in Next.js',
    excerpt:
      'Build custom Stripe checkout flows with Next.js Server Actions. Handles subscriptions, one-time payments, and complex product combinations with full error handling.',
    category: 'tutorial',
    tags: ['Stripe', 'Next.js', 'payment-processing', 'checkout', 'server-actions', 'e-commerce', 'TypeScript'],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: 'Custom Stripe Checkout in Next.js 15 | Beyond the Official Docs',
    meta_description:
      'Build custom Stripe checkout flows with Next.js Server Actions. Handles subscriptions, one-time payments, and complex product combinations with full error handling.',
    content: `# Building Custom Stripe Checkout Flows in Next.js

Stripe's documentation is excellent for getting started. Their examples show you how to create a basic checkout session, redirect to Stripe's hosted page, and handle the webhook. For a simple "buy one product" flow, this works perfectly.

But real-world applications need more. What happens when you need to collect a 50% deposit upfront and charge the balance later? What if your cart contains both one-time products and recurring subscriptions? What if you need a completely custom UI that doesn't look like Stripe's hosted checkout?

I've built these flows for NeedThisDone.com and client projects. Here's what actually works in production.

## Why Stripe's Examples Fall Short

Stripe's documentation optimizes for the happy path: one product, one payment, done. That's fine for selling digital downloads or simple SaaS subscriptions. But most businesses need more complexity:

**Mixed cart scenarios**: A customer wants a website package (one-time payment), a managed AI subscription (recurring), and a few add-ons (one-time). Stripe's hosted checkout doesn't handle mixed line items well out of the box.

**Split payment flows**: Many service businesses collect deposits upfront and balance payments later. Stripe's examples don't show how to track which payment is which, how to associate both with the same order, or how to handle the case where the deposit succeeds but the customer never comes back to pay the balance.

**Custom payment forms**: Sometimes you need full control over the UI. Maybe you're building a native mobile app. Maybe your checkout needs to match a strict brand design system. Stripe Elements gives you this control, but integrating them with Next.js app router patterns requires understanding both Stripe's client-side SDK and Next.js server components.

The gap between Stripe's examples and production requirements is where most developers get stuck. Let's bridge that gap.

## Architecture: Server Actions vs API Routes

Next.js gives you two ways to handle server-side logic: API routes and server actions. For Stripe integration, the choice matters.

**API routes** (\`app/api/checkout/route.ts\`) work well for webhooks and any logic that needs to be called from external services. They're also easier to test with tools like Postman or curl.

**Server actions** (functions marked with \`'use server'\`) are perfect for form submissions and client-triggered server logic. They reduce boilerplate and give you better TypeScript integration with client components.

Here's when I use each:

\`\`\`typescript
// API Route - Good for webhooks, external calls
// app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  // Handle event
}

// Server Action - Good for form submissions
// app/actions/checkout.ts
'use server';
export async function createCheckoutSession(formData: FormData) {
  const items = JSON.parse(formData.get('items') as string);
  const session = await stripe.checkout.sessions.create({
    line_items: items,
    mode: 'payment',
    success_url: \`\${process.env.NEXT_PUBLIC_URL}/success\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/cancel\`,
  });
  return { url: session.url };
}
\`\`\`

For this guide, I'll use API routes since they're easier to test and more explicit about what's happening. The patterns translate directly to server actions if you prefer that approach.

## Scenario 1: Deposit + Balance Payment

Many service businesses operate on deposits: 50% upfront, 50% on delivery. Here's how to implement this with Stripe checkout sessions.

**The strategy**: Create two separate checkout sessions, but link them with metadata. The first session collects the deposit. When that succeeds, store the payment intent ID. Later, when you're ready to collect the balance, create a second session that references the original order.

\`\`\`typescript
// Create deposit payment session
const depositSession = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: { name: 'Deposit - Website Package' },
        unit_amount: 25000, // \$250.00 deposit
      },
      quantity: 1,
    },
  ],
  metadata: {
    order_id: orderId,
    payment_type: 'deposit',
    deposit_percent: '50',
    total_amount: '50000', // Track full amount for balance calculation
  },
  success_url: \`\${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}\`,
  cancel_url: \`\${baseUrl}/checkout/cancel\`,
});

// Later, create balance payment session
const balanceSession = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: { name: 'Balance Payment - Website Package' },
        unit_amount: 25000, // \$250.00 balance
      },
      quantity: 1,
    },
  ],
  metadata: {
    order_id: orderId,
    payment_type: 'balance',
    deposit_session_id: depositSession.id,
  },
  success_url: \`\${baseUrl}/checkout/balance-success?session_id={CHECKOUT_SESSION_ID}\`,
  cancel_url: \`\${baseUrl}/checkout\`,
});
\`\`\`

**Key insight**: The metadata field is your friend. Use it to track order IDs, payment types, and any other context you need in the webhook handler. Stripe preserves this metadata through the entire payment lifecycle.

In your webhook handler, check the payment type and update your order accordingly:

\`\`\`typescript
if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  const { order_id, payment_type } = session.metadata;

  if (payment_type === 'deposit') {
    await updateOrder(order_id, { deposit_paid: true, deposit_session_id: session.id });
  } else if (payment_type === 'balance') {
    await updateOrder(order_id, { balance_paid: true, status: 'paid_in_full' });
  }
}
\`\`\`

This pattern scales to any split payment scenario: thirds, custom percentages, milestone-based payments. The metadata approach keeps everything trackable.

## Scenario 2: Mixed Cart (Products + Subscriptions)

Here's a problem Stripe's examples don't address: what if your cart contains both one-time products and recurring subscriptions?

Stripe checkout sessions have a \`mode\` parameter that's either \`'payment'\` (one-time) or \`'subscription'\` (recurring). You can't mix them in a single session.

**The workaround**: Create two separate checkout sessions and handle them sequentially or give the customer a choice.

**Option A - Sequential checkouts**: Charge the one-time products first, then redirect to a subscription setup session. This works but requires careful state management to avoid charging twice if something fails.

**Option B - Subscription with setup fee**: Convert your one-time products into a subscription setup fee. This only works if the recurring subscription is the primary product.

\`\`\`typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [
    {
      price: 'price_recurring_managed_ai', // Recurring subscription
      quantity: 1,
    },
  ],
  subscription_data: {
    metadata: {
      order_id: orderId,
    },
    // Add setup fee for one-time products
    trial_settings: {
      end_behavior: {
        missing_payment_method: 'pause',
      },
    },
  },
  invoice_data: {
    // One-time charge alongside subscription
    custom_fields: [
      { name: 'Setup Fee', value: '\$500.00' },
    ],
  },
  metadata: {
    order_id: orderId,
    has_one_time_items: 'true',
    one_time_total: '50000',
  },
  success_url: \`\${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}\`,
  cancel_url: \`\${baseUrl}/checkout\`,
});
\`\`\`

**Option C - Separate buttons**: Show the customer two checkout buttons: "Buy Products (\$500)" and "Subscribe (\$99/mo)". This is the most transparent approach but requires explaining why they need two transactions.

I've found Option C works best for user experience. Customers understand "pay for the product, then subscribe" better than hidden setup fees or sequential charges.

## Scenario 3: Custom Payment Forms with Stripe Elements

Sometimes you need full UI control. Maybe Stripe's hosted checkout doesn't match your design system. Maybe you need to embed the payment form in a multi-step wizard. Stripe Elements is the answer.

Elements are React components that securely collect card details without PCI compliance headaches. They render Stripe-hosted iframes that look native to your app.

Here's the setup:

\`\`\`typescript
// Install dependencies
// npm install @stripe/stripe-js @stripe/react-stripe-js

// components/CheckoutForm.tsx
'use client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    // Confirm payment with Stripe
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: \`\${window.location.origin}/checkout/success\`,
      },
    });

    if (error) {
      console.error(error.message);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || isLoading}>
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function CheckoutPage({ clientSecret }: { clientSecret: string }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
}
\`\`\`

The key is the \`clientSecret\`: you generate this server-side with a payment intent, then pass it to the Elements provider. Elements uses it to securely submit payment details to Stripe.

**Server-side setup**:

\`\`\`typescript
// app/api/payment-intent/route.ts
export async function POST(request: Request) {
  const { amount, orderId } = await request.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: { order_id: orderId },
  });

  return Response.json({ clientSecret: paymentIntent.client_secret });
}
\`\`\`

Custom forms give you total control but require more code. Use them when Stripe's hosted checkout UI can't meet your requirements.

## Webhook Handling Done Right

Webhooks are where most Stripe integrations break in production. Stripe retries failed webhooks for three days, so you need idempotency and proper error handling.

**Production-grade webhook handler**:

\`\`\`typescript
// app/api/webhooks/stripe/route.ts
import { supabaseRetry } from '@/lib/supabase-retry';
import { headers } from 'next/headers';

const relevantEvents = new Set([
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Ignore irrelevant events
  if (!relevantEvents.has(event.type)) {
    return Response.json({ received: true });
  }

  // Idempotency check - have we processed this event already?
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('event_id', event.id)
    .single();

  if (existing) {
    console.log(\`Event \${event.id} already processed\`);
    return Response.json({ received: true });
  }

  // Process the event with retry logic
  try {
    await supabaseRetry(async () => {
      // Store event first for idempotency
      await supabase.from('webhook_events').insert({
        event_id: event.id,
        type: event.type,
        processed_at: new Date().toISOString(),
      });

      // Handle specific event types
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object);
          break;
        case 'payment_intent.succeeded':
          await handlePaymentSucceeded(event.data.object);
          break;
        // ... other cases
      }
    });

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    // Return 500 so Stripe retries
    return new Response('Webhook processing failed', { status: 500 });
  }
}
\`\`\`

**Key patterns**:

1. **Verify signatures**: Always verify the webhook signature. This prevents attackers from sending fake events to your endpoint.
2. **Idempotency tracking**: Store processed event IDs in your database. If Stripe retries, you won't double-process.
3. **Retry logic**: Use exponential backoff for database operations. I use a \`supabaseRetry\` utility (see [Building Circuit Breaker Pattern in Node.js](/blog/building-circuit-breaker-pattern-nodejs) for the implementation).
4. **Return 200 quickly**: Process the event, then return success. Don't do slow operations in the webhook handler itself—queue them for background processing.

## Testing Strategy

Test Stripe integration thoroughly before going live. Here's my process:

**1. Use test mode religiously**: Stripe's test mode gives you fake card numbers that simulate success, failure, 3D Secure, and other scenarios. Never test with real cards.

**2. Stripe CLI for webhooks**: Install the Stripe CLI and forward webhooks to your local dev server:

\`\`\`bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
\`\`\`

This lets you trigger webhooks locally without deploying to production.

**3. Integration tests**: Write tests that hit your checkout API with test mode credentials:

\`\`\`typescript
// __tests__/checkout.test.ts
import { createCheckoutSession } from '@/app/actions/checkout';

test('creates deposit checkout session', async () => {
  const session = await createCheckoutSession({
    orderId: 'test_order_123',
    amount: 25000,
    paymentType: 'deposit',
  });

  expect(session.url).toContain('checkout.stripe.com');
  expect(session.metadata.payment_type).toBe('deposit');
});
\`\`\`

**4. End-to-end tests**: Use Playwright with Stripe test cards to test the full checkout flow:

\`\`\`typescript
test('complete checkout flow', async ({ page }) => {
  await page.goto('/checkout');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="card"]', '4242 4242 4242 4242');
  await page.fill('[name="exp"]', '12/34');
  await page.fill('[name="cvc"]', '123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/checkout/success');
  expect(page.url()).toContain('success');
});
\`\`\`

Testing Stripe thoroughly catches edge cases before customers hit them. I've caught bugs around failed payments, expired sessions, and webhook retries this way.

## Get Help with Complex Checkouts

Building production-ready Stripe integrations takes time. If you need deposit flows, mixed carts, custom UIs, or webhook handlers that don't break, I can help.

I've built these patterns for NeedThisDone.com and client projects. The code is battle-tested in production handling real payments.

See examples of my work on the [portfolio page](/work), or check out the [services page](/services) for what I offer. Want to discuss your project? [Get in touch](/contact).

Related reading: [Request Deduplication: Preventing Double Submissions](/blog/request-deduplication-preventing-double-submissions) covers the idempotency patterns that keep webhooks safe.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Post 9: Production-Ready Circuit Breakers with Redis and Node.js
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'circuit-breaker-redis-nodejs-production',
    title: 'Production-Ready Circuit Breakers with Redis and Node.js',
    excerpt:
      'Scale circuit breakers across multiple servers using Redis. Includes distributed state, monitoring, and graceful degradation patterns for production systems.',
    category: 'tutorial',
    tags: ['Node.js', 'circuit-breaker', 'Redis', 'reliability', 'production', 'backend', 'resilience'],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: 'Production Circuit Breakers with Redis and Node.js | Advanced Tutorial',
    meta_description:
      'Scale circuit breakers across multiple servers using Redis. Includes distributed state, monitoring, and graceful degradation patterns for production systems.',
    content: `# Production-Ready Circuit Breakers with Redis and Node.js

In [Building Circuit Breaker Pattern in Node.js](/blog/building-circuit-breaker-pattern-nodejs), I showed how to implement an in-memory circuit breaker. It works great for single-server applications: when a third-party API starts failing, the circuit breaker trips, stops hammering the failing service, and gives it time to recover.

But what happens when you scale to multiple servers? Each server has its own circuit breaker, tracking its own failure counts. Server A's circuit might be open (protecting against failures) while Server B's is still closed (still hitting the failing API). The circuit breaker's job is to detect system-wide problems and react accordingly. In-memory state breaks this when you have multiple processes.

Here's how to solve it with Redis-backed distributed circuit breakers.

## When In-Memory Circuit Breakers Aren't Enough

The in-memory implementation from Part 1 stored state in a JavaScript Map:

\`\`\`typescript
// Works for single-server apps
const circuitState = new Map<string, { failures: number; state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' }>();
\`\`\`

This breaks in multi-server deployments because:

1. **No shared state**: Each server tracks failures independently. A service might be completely down, but if failures are spread across 10 servers, no individual circuit trips.

2. **Wasted retries**: When the circuit opens on Server A, Server B doesn't know and keeps hammering the failing service. You're still sending 90% of the requests you wanted to block.

3. **Inconsistent user experience**: Some users hit servers with open circuits (fast failures) while others hit servers with closed circuits (slow timeouts).

The solution: move circuit state to Redis. Now all servers share the same view of each service's health.

## Distributed Circuit Breaker Architecture

A Redis-backed circuit breaker uses Redis as a shared state store. When any server detects failures, all servers immediately know about it. When a circuit opens on one server, it opens everywhere.

**State transitions**: The circuit breaker has three states, just like Part 1:

1. **CLOSED**: Normal operation, requests flow through
2. **OPEN**: Failure threshold exceeded, all requests fail fast
3. **HALF_OPEN**: Testing if the service has recovered

**Redis data structure**:

\`\`\`
circuit:{service_name}:state       → "CLOSED" | "OPEN" | "HALF_OPEN"
circuit:{service_name}:failures    → Integer (failure count)
circuit:{service_name}:opened_at   → Timestamp (when circuit opened)
circuit:{service_name}:test_lock   → Lock for HALF_OPEN testing
\`\`\`

When any server increments the failure count past the threshold, it sets the state to OPEN. All other servers immediately see this when they check circuit state before making requests.

## Implementation: Redis-Backed Circuit Breaker

Here's the production implementation I use on NeedThisDone.com and client projects:

\`\`\`typescript
// lib/circuit-breaker-redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Successes needed to close from half-open
  timeout: number; // How long to stay open (ms)
}

export class RedisCircuitBreaker {
  constructor(
    private serviceName: string,
    private options: CircuitBreakerOptions = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000, // 1 minute
    }
  ) {}

  private keys = {
    state: \`circuit:\${this.serviceName}:state\`,
    failures: \`circuit:\${this.serviceName}:failures\`,
    openedAt: \`circuit:\${this.serviceName}:opened_at\`,
    testLock: \`circuit:\${this.serviceName}:test_lock\`,
  };

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check circuit state
    const state = await this.getState();

    if (state === 'OPEN') {
      // Check if timeout has passed
      const openedAt = await redis.get(this.keys.openedAt);
      if (openedAt && Date.now() - parseInt(openedAt) > this.options.timeout) {
        await this.transitionToHalfOpen();
      } else {
        throw new Error(\`Circuit breaker OPEN for \${this.serviceName}\`);
      }
    }

    if (state === 'HALF_OPEN') {
      // Only one request at a time in half-open state
      const acquired = await this.acquireTestLock();
      if (!acquired) {
        throw new Error(\`Circuit breaker testing, request rejected for \${this.serviceName}\`);
      }
    }

    try {
      const result = await operation();
      await this.onSuccess();
      return result;
    } catch (error) {
      await this.onFailure();
      throw error;
    }
  }

  private async getState(): Promise<'CLOSED' | 'OPEN' | 'HALF_OPEN'> {
    const state = await redis.get(this.keys.state);
    return (state as 'CLOSED' | 'OPEN' | 'HALF_OPEN') || 'CLOSED';
  }

  private async transitionToHalfOpen(): Promise<void> {
    // Use Lua script for atomic state transition
    await redis.eval(
      \`
      if redis.call("get", KEYS[1]) == "OPEN" then
        redis.call("set", KEYS[1], "HALF_OPEN")
        redis.call("del", KEYS[2])
        return 1
      end
      return 0
      \`,
      2,
      this.keys.state,
      this.keys.testLock
    );
  }

  private async acquireTestLock(): Promise<boolean> {
    const result = await redis.set(this.keys.testLock, '1', 'EX', 10, 'NX');
    return result === 'OK';
  }

  private async onSuccess(): Promise<void> {
    const state = await this.getState();

    if (state === 'HALF_OPEN') {
      // Check if we've hit success threshold
      const successes = await redis.incr(\`\${this.keys.state}:successes\`);
      if (successes >= this.options.successThreshold) {
        // Close circuit - use Lua for atomicity
        await redis.eval(
          \`
          redis.call("set", KEYS[1], "CLOSED")
          redis.call("del", KEYS[2], KEYS[3], KEYS[4])
          return 1
          \`,
          4,
          this.keys.state,
          this.keys.failures,
          this.keys.openedAt,
          \`\${this.keys.state}:successes\`
        );
      }
      // Release test lock
      await redis.del(this.keys.testLock);
    }
  }

  private async onFailure(): Promise<void> {
    const state = await this.getState();

    if (state === 'HALF_OPEN') {
      // Failure in half-open state reopens circuit
      await redis.eval(
        \`
        redis.call("set", KEYS[1], "OPEN")
        redis.call("set", KEYS[2], ARGV[1])
        redis.call("del", KEYS[3])
        return 1
        \`,
        3,
        this.keys.state,
        this.keys.openedAt,
        this.keys.testLock,
        Date.now().toString()
      );
      return;
    }

    // Increment failure count
    const failures = await redis.incr(this.keys.failures);

    if (failures >= this.options.failureThreshold) {
      // Open circuit
      await redis.eval(
        \`
        redis.call("set", KEYS[1], "OPEN")
        redis.call("set", KEYS[2], ARGV[1])
        return 1
        \`,
        2,
        this.keys.state,
        this.keys.openedAt,
        Date.now().toString()
      );
    }
  }
}
\`\`\`

**Usage**:

\`\`\`typescript
// Wrap any external API call
import { RedisCircuitBreaker } from '@/lib/circuit-breaker-redis';

const medusaBreaker = new RedisCircuitBreaker('medusa-api', {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
});

async function fetchProducts() {
  return medusaBreaker.execute(async () => {
    const response = await fetch(\`\${process.env.MEDUSA_URL}/store/products\`);
    if (!response.ok) throw new Error('Medusa API error');
    return response.json();
  });
}
\`\`\`

**Why Lua scripts?**: Redis Lua scripts execute atomically. The state transition from OPEN to HALF_OPEN involves checking state, updating it, and deleting keys—all of which must happen together. Without Lua, another server could read stale state mid-transition.

## Monitoring and Alerting

Production circuit breakers need observability. You want to know when circuits open, how often they're tripping, and what's causing failures.

**Prometheus-style metrics**:

\`\`\`typescript
// lib/circuit-breaker-metrics.ts
export class CircuitBreakerMetrics {
  private counters = {
    successes: 0,
    failures: 0,
    rejections: 0, // Requests blocked by open circuit
  };

  recordSuccess(serviceName: string) {
    this.counters.successes++;
    // Export to Prometheus/Datadog/CloudWatch
  }

  recordFailure(serviceName: string) {
    this.counters.failures++;
  }

  recordRejection(serviceName: string) {
    this.counters.rejections++;
  }

  async getMetrics() {
    return {
      ...this.counters,
      errorRate: this.counters.failures / (this.counters.successes + this.counters.failures),
    };
  }
}
\`\`\`

**Add metrics to circuit breaker**:

\`\`\`typescript
async execute<T>(operation: () => Promise<T>): Promise<T> {
  const state = await this.getState();

  if (state === 'OPEN') {
    metrics.recordRejection(this.serviceName);
    throw new Error(\`Circuit breaker OPEN for \${this.serviceName}\`);
  }

  try {
    const result = await operation();
    metrics.recordSuccess(this.serviceName);
    return result;
  } catch (error) {
    metrics.recordFailure(this.serviceName);
    throw error;
  }
}
\`\`\`

**Alerting strategy**: Set up alerts when:
- Circuit opens (immediate notification—something is down)
- Error rate exceeds 10% for 5 minutes (service is degraded)
- Circuit flaps (opens/closes repeatedly—unstable service)

I use Discord webhooks for circuit breaker alerts. When a circuit opens, I get notified immediately and can investigate before customers complain.

## Graceful Degradation Strategies

When a circuit opens, fail fast—but fail gracefully. Don't just throw errors at users. Give them a degraded but functional experience.

**Strategy 1: Cached fallbacks**

\`\`\`typescript
async function fetchProducts() {
  try {
    return await medusaBreaker.execute(fetchFromMedusa);
  } catch (error) {
    console.warn('Circuit open, using cached products');
    return await getCachedProducts();
  }
}
\`\`\`

**Strategy 2: Feature flags**

\`\`\`typescript
async function getRecommendations(userId: string) {
  const recommendationsEnabled = await redis.get('feature:recommendations');

  if (!recommendationsEnabled || !(await isRecommendationServiceHealthy())) {
    // Circuit is open or feature disabled—skip recommendations
    return [];
  }

  return recommendationBreaker.execute(() => fetchRecommendations(userId));
}
\`\`\`

**Strategy 3: Default responses**

\`\`\`typescript
async function getProductReviews(productId: string) {
  try {
    return await reviewServiceBreaker.execute(() => fetchReviews(productId));
  } catch (error) {
    // Circuit open—return empty state instead of breaking the page
    return { reviews: [], averageRating: null, count: 0 };
  }
}
\`\`\`

The goal: when a circuit opens, users should notice minimal disruption. Maybe they don't see personalized recommendations, but the rest of the app works fine.

## Production Checklist

Before deploying Redis-backed circuit breakers to production, verify:

**1. Redis High Availability**: Use Redis Sentinel or Redis Cluster. If Redis goes down, your circuit breakers stop working. Sentinel provides automatic failover when the primary Redis instance fails.

**2. Connection Pooling**: Reuse Redis connections. Creating a new connection for every request adds latency. Use \`ioredis\` with connection pooling:

\`\`\`typescript
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});
\`\`\`

**3. Timeout Tuning**: Set appropriate circuit breaker timeouts for each service. Critical services might get 30-second timeouts (recover quickly). Non-critical services might get 5-minute timeouts (don't waste resources retrying).

**4. Key Expiration**: Set TTLs on Redis keys to prevent stale circuit state from persisting forever:

\`\`\`typescript
await redis.set(this.keys.state, 'OPEN', 'EX', 3600); // Expire after 1 hour
\`\`\`

**5. Logging**: Log every state transition. When circuits open in production, you need context:

\`\`\`typescript
console.log({
  level: 'warn',
  message: 'Circuit breaker opened',
  serviceName: this.serviceName,
  failures,
  threshold: this.options.failureThreshold,
  timestamp: new Date().toISOString(),
});
\`\`\`

**6. Testing**: Test circuit breaker behavior under load. Use tools like \`k6\` or \`Artillery\` to simulate failure scenarios and verify circuits open/close correctly across multiple servers.

## Need Backend Reliability Help?

Building production-grade circuit breakers is one part of a larger reliability strategy. If you need help with distributed systems, error handling, or scaling Node.js backends, I can help.

I've built these patterns for NeedThisDone.com and client projects. The code handles real production traffic and has prevented outages when third-party services failed.

See examples of reliability work on the [portfolio page](/work), or check out the [services page](/services) for what I offer.

Related reading:
- [Building Circuit Breaker Pattern in Node.js](/blog/building-circuit-breaker-pattern-nodejs) - Part 1 of this series, covering in-memory circuit breakers
- [Request Deduplication: Preventing Double Submissions](/blog/request-deduplication-preventing-double-submissions) - Another production reliability pattern using Redis`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Post 10: Supabase Connection Pooling in Next.js: Fixing "Too Many Connections"
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'supabase-connection-pooling-production-nextjs',
    title: 'Supabase Connection Pooling in Next.js: Fixing "Too Many Connections"',
    excerpt:
      'Fix Supabase connection errors in production. Learn connection pooling, singleton patterns, and serverless best practices for Next.js apps.',
    category: 'tutorial',
    tags: ['Supabase', 'PostgreSQL', 'connection-pooling', 'Next.js', 'backend', 'production', 'serverless'],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: 'Supabase Connection Pooling in Next.js | Avoid \'Too Many Connections\' Errors',
    meta_description:
      'Fix Supabase connection errors in production. Learn connection pooling, singleton patterns, and serverless best practices for Next.js apps.',
    content: `# Supabase Connection Pooling in Next.js: Fixing "Too Many Connections"

If you've ever deployed a Next.js app to production and watched it crash with \`FATAL: remaining connection slots are reserved for non-replication superuser connections\`, you're not alone. Connection exhaustion is one of the most common production issues when using Supabase (or any PostgreSQL database) with serverless functions.

The problem is subtle during development but brutal in production. Your local dev server reuses connections, but Vercel's serverless functions create new ones on every request. Within minutes, you hit PostgreSQL's connection limit, and your app stops working.

I've debugged this issue for multiple clients, and it always comes down to the same three solutions. This guide covers all of them, with real code and production deployment tips.

## The "Too Many Connections" Problem

PostgreSQL has a hard limit on concurrent connections. Supabase's free tier caps at 60 connections, paid plans at 200+. Every time a Next.js API route executes, it can create a new database connection. If those connections aren't reused or properly closed, you quickly exhaust the pool.

Here's what the error looks like in your logs:

\`\`\`
Error: P1001: Can't reach database server
FATAL: remaining connection slots are reserved for non-replication superuser connections
\`\`\`

Or sometimes:

\`\`\`
Error: Connection terminated unexpectedly
FATAL: sorry, too many clients already
\`\`\`

Why does this happen? Serverless functions are stateless. Each invocation starts fresh, which means:

- No connection reuse between requests (by default)
- Connections may not close immediately after the function exits
- High traffic = dozens of concurrent function instances = dozens of open connections

During development, \`npm run dev\` runs a single long-lived process that reuses the same Supabase client. In production, every request spins up a new isolated function instance.

## Solution 1 — Singleton Supabase Client

The most effective fix: create a single Supabase client at the module level and reuse it across all requests. This works because Node.js caches imported modules, so the client is instantiated once per function instance (not once per request).

**Wrong approach (creates new client every request):**

\`\`\`typescript
// app/api/products/route.ts
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  // BAD: New client on every request
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data } = await supabase.from('products').select('*');
  return Response.json(data);
}
\`\`\`

**Correct approach (singleton pattern):**

\`\`\`typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false },
        db: {
          schema: 'public',
        },
      }
    );
  }
  return supabaseInstance;
}
\`\`\`

\`\`\`typescript
// app/api/products/route.ts
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from('products').select('*');
  return Response.json(data);
}
\`\`\`

**Why this works:** The module-level variable \`supabaseInstance\` is created once per function instance. As long as that instance stays warm (Vercel keeps them alive for ~5 minutes), all requests to that instance reuse the same client and connection.

**Key settings:**

- \`auth: { persistSession: false }\` — Serverless functions don't need session persistence
- \`db: { schema: 'public' }\` — Explicit schema reduces query overhead

This single change typically reduces connection usage by 80-90%.

## Solution 2 — Supabase Connection Pooler

Even with a singleton client, you might hit limits during traffic spikes. Supabase provides a connection pooler (PgBouncer) that sits between your app and PostgreSQL, managing a pool of reusable connections.

**Two modes:**

| Mode | Best For | Connection String |
|------|----------|-------------------|
| **Transaction** | Serverless functions (default) | \`[SUPABASE_URL]:6543\` |
| **Session** | Long-running servers, migrations | \`[SUPABASE_URL]:5432\` |

**Transaction mode** is what you want for Next.js. It assigns a connection for the duration of a single transaction, then returns it to the pool. This allows hundreds of concurrent requests to share a small pool of actual PostgreSQL connections.

**How to enable it:**

1. Go to Supabase Dashboard → Settings → Database
2. Copy the "Transaction" connection string (port 6543)
3. Update your environment variable:

\`\`\`bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Use pooler connection string for production
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres
\`\`\`

**When to use Session mode:** If you're running database migrations, long-running background jobs, or need prepared statements, use Session mode (port 5432). For API routes and server actions, stick with Transaction mode.

For more production-grade reliability patterns, check out [Building a Circuit Breaker Pattern in Node.js](/blog/building-circuit-breaker-pattern-nodejs) and [Request Deduplication: Preventing Double Submissions](/blog/request-deduplication-preventing-double-submissions).

## Solution 3 — Serverless-Specific Patterns

Beyond connection pooling, there are architectural patterns that reduce connection churn:

**1. Route handler middleware (connection reuse across routes):**

\`\`\`typescript
// lib/with-supabase.ts
import { getSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export function withSupabase(
  handler: (supabase: ReturnType<typeof getSupabaseClient>) => Promise<NextResponse>
) {
  return async () => {
    const supabase = getSupabaseClient();
    return handler(supabase);
  };
}
\`\`\`

\`\`\`typescript
// app/api/products/route.ts
import { withSupabase } from '@/lib/with-supabase';

export const GET = withSupabase(async (supabase) => {
  const { data } = await supabase.from('products').select('*');
  return Response.json(data);
});
\`\`\`

**2. Edge Runtime (when possible):**

Next.js Edge Runtime uses Cloudflare Workers, which have better connection pooling. If your route doesn't need Node.js APIs, add:

\`\`\`typescript
export const runtime = 'edge';
\`\`\`

**3. Warming strategies (keep instances alive):**

Use a cron job to ping your API routes every 4-5 minutes. This keeps Vercel function instances warm, maintaining connection reuse.

\`\`\`typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok' });
}
\`\`\`

Then use Vercel Cron or an external service (UptimeRobot, Better Stack) to hit \`/api/health\` every 5 minutes.

## Monitoring Connection Usage

You can't fix what you don't measure. Here's how to monitor your connection pool:

**Supabase Dashboard:**

1. Navigate to Database → Connection Pooling
2. Watch "Active Connections" graph
3. Set up alerts if connections exceed 80% of your limit

**SQL query to check active connections:**

\`\`\`sql
SELECT 
  count(*) as total_connections,
  state,
  application_name
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state, application_name
ORDER BY count(*) DESC;
\`\`\`

Run this in Supabase SQL Editor during traffic spikes to see which clients are holding connections.

**Log connection events in your app:**

\`\`\`typescript
// lib/supabase.ts
export function getSupabaseClient() {
  if (!supabaseInstance) {
    console.log('[Supabase] Creating new client instance');
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return supabaseInstance;
}
\`\`\`

In production logs, you should see very few "Creating new client instance" messages. If you see hundreds, you're creating too many clients.

## Production Deployment Guide

**Environment variable checklist:**

\`\`\`bash
# Required for Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Use pooler connection string (port 6543)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres

# Optional: Connection timeout settings
SUPABASE_CONNECTION_TIMEOUT=10000
\`\`\`

**Vercel-specific tips:**

1. **Use Vercel Cron for warming:** Add \`vercel.json\`:

\`\`\`json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "*/5 * * * *"
    }
  ]
}
\`\`\`

2. **Enable Edge Runtime where possible:** Reduces cold starts and connection churn

3. **Monitor function duration:** Settings → Deployments → Functions. If functions run longer than 10s, you might be hitting connection timeouts.

**Common mistakes:**

- ❌ Creating Supabase client inside request handlers (handler-level, not module-level)
- ❌ Using Session mode pooler for API routes (use Transaction mode)
- ❌ Not setting \`persistSession: false\` for serverless
- ❌ Mixing direct connection and pooler connection strings
- ❌ Not monitoring connection usage before hitting production

For a complete production deployment guide, see [Why I Built My Own Ecommerce Platform](/blog/why-i-built-my-own-ecommerce-platform) where I cover Supabase + Medusa + Next.js architecture.

## Need Help Scaling Your Supabase App?

If you're hitting connection limits, dealing with slow queries, or need help optimizing your Supabase + Next.js stack, I can help. I specialize in production-grade web apps with Next.js, Supabase, and Medusa.

- [View my services](/services) — Full-stack development, API optimization, architecture consulting
- [See my work](/work) — Case studies and portfolio projects
- [Get in touch](/contact) — Let's talk about your project

For more production reliability patterns, check out:
- [RAG with Supabase pgvector and Next.js](/blog/rag-supabase-pgvector-nextjs-tutorial)
- [Circuit Breaker with Redis in Node.js](/blog/circuit-breaker-redis-nodejs-production)
- [Building a Circuit Breaker Pattern in Node.js](/blog/building-circuit-breaker-pattern-nodejs)`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Post 11: Combat Medic to Developer: Military Skills That Transfer to Tech
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'combat-medic-to-developer-skills-transfer',
    title: 'Combat Medic to Developer: Military Skills That Transfer to Tech',
    excerpt:
      'How Army combat medic training prepared me for software development. Lessons on problem-solving, resilience, and learning under pressure.',
    category: 'behind-the-scenes',
    tags: ['veteran', 'career-transition', 'military', 'full-stack', 'self-taught', 'soft-skills'],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: 'Combat Medic to Developer: Military Skills That Transfer to Tech',
    meta_description:
      'How Army combat medic training prepared me for software development. Lessons on problem-solving, resilience, and learning under pressure.',
    content: `# Combat Medic to Developer: Military Skills That Transfer to Tech

When I tell people I was a combat medic in the Army before becoming a software developer, they usually assume I changed careers completely. But the truth is, some of the most critical skills I use every day as a developer were drilled into me during my time in the military.

This isn't about discipline or "getting up early." Those are great, but every veteran hears that advice. This is about the tactical, specific skills that made me a better combat medic and now make me a better developer. If you're a veteran considering a career in tech, you already have more relevant experience than you think.

## Why This Story Matters

Veterans often underestimate how much of their military experience translates to tech. I've talked to dozens of veterans who think they're "starting from zero" when they learn to code. They're wrong.

The problem-solving, high-pressure decision-making, and team coordination you learned in the military are exactly what tech companies need. The coding part? That's the easy part. Anyone can learn syntax. Not everyone can stay calm when the production server crashes at 2 AM and customers are locked out.

I'll break down five specific skills I used as a combat medic that I now use every single day as a full-stack developer. Then I'll share practical advice for veterans making the switch.

## Triage and Prioritization

As a combat medic, triage is everything. When casualties come in, you don't treat them in the order they arrive. You assess, prioritize, and allocate resources to maximize lives saved. A soldier screaming in pain might not be the most critical patient. The quiet one going into shock? That's your priority.

Software development has the exact same dynamic, and we even use the same terminology. When a production bug hits, you don't fix issues in the order they're reported. You triage:

- **P0 (Critical):** Production is down, customers can't check out. Drop everything.
- **P1 (High):** Feature broken, affects users, but workarounds exist. Fix today.
- **P2 (Medium):** Minor bug, limited impact. Schedule for next sprint.
- **P3 (Low):** Nice-to-have improvement. Backlog.

Last month, a client's checkout flow went down during a product launch. We had three issues reported simultaneously: payment processing failures (P0), a visual bug on the product page (P3), and slow-loading images (P2). I fixed the payment issue first, deployed, verified, then moved to the others. That's triage.

The instinct to assess severity, prioritize by impact, and execute under pressure? That came from treating casualties in the field. The technical skills I learned later. The judgment under fire? That was Army training.

## Learning Under Pressure

Combat medic training is 16 weeks of compressed, high-intensity learning. You're memorizing anatomy, pharmacology, trauma care protocols, and practicing procedures until they're muscle memory. The stakes are life and death, and the pace is relentless.

That training taught me I can learn *anything* if I have a clear goal and enough reps. When I decided to transition to tech, I approached coding the same way I approached learning emergency medicine: break it down, practice obsessively, apply it immediately.

I didn't go to a four-year CS program. I used free resources (freeCodeCamp, The Odin Project, YouTube), built projects, broke things, fixed them, and repeated. It wasn't comfortable, but I'd already spent months learning how to insert chest tubes and start IVs on moving vehicles. Learning JavaScript loops felt manageable by comparison.

The lesson: veterans already know how to learn under pressure. If you survived military training, you can survive a coding bootcamp or self-teaching grind. The difference is no one's shooting at you, and Stack Overflow exists.

For more on my self-teaching journey, check out [Self-Taught to Full-Stack: How I Built a Career in Development](/blog/self-taught-to-full-stack).

## Documentation and Checklists

In the Army, everything has a Standard Operating Procedure (SOP). Before we ran missions, we went through pre-combat checks. After missions, we did after-action reviews (AARs). If you didn't document what happened, you couldn't improve for next time.

Software development is the same. The best developers I know are obsessive about documentation:

- **Code comments:** Explain *why* the code exists, not just what it does
- **README files:** Setup instructions, architecture decisions, deployment steps
- **Runbooks:** What to do when things break (because they will)
- **Postmortems:** After an outage, document what happened, why, and how to prevent it

I keep a checklist for every deployment:

1. Run tests locally
2. Check environment variables
3. Review database migration scripts
4. Deploy to staging
5. Smoke test critical paths
6. Deploy to production
7. Monitor logs for 15 minutes

Checklists prevent mistakes. When you're rushing to fix a production bug at midnight, your brain is foggy. The checklist keeps you from skipping steps and making things worse.

Military training taught me that documentation saves lives. In software, it saves projects. For more on building reliable systems, read [Request Deduplication: Preventing Double Submissions](/blog/request-deduplication-preventing-double-submissions).

## Teamwork in High-Stakes Environments

In the military, you don't work alone. Every mission depends on your team trusting you and you trusting them. If I called for a medevac, the pilots trusted my assessment. If a soldier went down, the squad trusted me to handle it while they covered me.

Software development is a team sport. You're working with designers, product managers, other developers, and stakeholders. Code reviews, pair programming, sprint planning, incident response—all require trust and communication.

One skill that transferred directly: **clear communication under pressure.** During a production incident, I don't send vague Slack messages like "something's broken." I send:

> **INCIDENT:** Checkout API returning 500 errors. Affecting ~30% of users. Investigating payment provider integration. ETA 15 minutes.

Short, clear, actionable. Same format as a radio report in the field: **SITUATION → IMPACT → ACTION → ETA.**

Another skill: **knowing when to ask for help.** As a medic, if I encountered something beyond my training, I called for backup immediately. Pride doesn't save lives. Same in development. If I'm stuck debugging a weird database issue for more than 30 minutes, I ping a teammate. Fresh eyes solve problems faster.

## Advice for Veterans Making the Switch

If you're a veteran considering a career in tech, here's what I wish someone had told me:

**1. Use your benefits.** The GI Bill covers coding bootcamps. VET TEC (Veteran Employment Through Technology Education Courses) is a free program that pays your housing while you learn. Don't ignore these resources.

**2. Start with free resources.** You don't need an expensive bootcamp to start. Try [The Odin Project](https://www.theodinproject.com/), [freeCodeCamp](https://www.freecodecamp.org/), or [CS50](https://cs50.harvard.edu/). If you can stick with free resources for 3 months, you have the discipline to succeed.

**3. Build projects, not tutorials.** Tutorials teach syntax. Projects teach problem-solving. Build something you'd actually use: a budget tracker, a workout log, a tool for veterans. Employers care more about your GitHub than your certificates.

**4. Join veteran tech communities.** [Operation Code](https://operationcode.org/), [VetsWhoCode](https://vetswhocode.io/), and [Shift.org](https://shift.org/) connect veterans with mentors, job leads, and peer support. You're not alone in this transition.

**5. Be honest about the timeline.** This isn't a 3-month sprint. Expect 12-18 months to go from zero to job-ready if you're self-teaching. If you're doing a bootcamp, expect 6-9 months. It's a marathon, and your military endurance training applies here.

**6. Translate your experience.** On your resume, don't just list your MOS. Translate it: "Managed triage and resource allocation under high-pressure conditions" = project management and prioritization. "Trained junior medics on SOPs" = documentation and mentorship. Make it easy for non-military recruiters to see your value.

For more on my personal transition story, read [Combat Medic to Code: How Military Discipline Shaped My Development Career](/blog/combat-medic-to-code-military-discipline-development).

## Hire a Veteran Developer

If you're a company looking to hire, consider veterans. We bring skills that can't be taught in a classroom: composure under pressure, team coordination, accountability, and a bias toward action. The technical skills come with training. The intangibles? Those are already there.

I'm currently open to new projects and opportunities. If you need a full-stack developer who can build production-grade web apps, handle complex integrations, and stay calm when things break, let's talk.

- [View my work](/work) — Case studies and portfolio projects
- [Check out my resume](/resume) — Technical skills and experience
- [Get in touch](/contact) — Let's discuss your project

And if you're a veteran making the transition, feel free to reach out. I'm happy to answer questions, review your code, or just talk about the process. We take care of our own.

For more posts on building production systems:
- [Building a Circuit Breaker Pattern in Node.js](/blog/building-circuit-breaker-pattern-nodejs)
- [Why I Built My Own Ecommerce Platform](/blog/why-i-built-my-own-ecommerce-platform)
- [About me](/about) — My full story and background`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Post 12: Next.js E-commerce Architecture: A Case Study of NeedThisDone.com
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'nextjs-typescript-ecommerce-system-design',
    title: 'Next.js E-commerce Architecture: A Case Study of NeedThisDone.com',
    excerpt:
      'Deep dive into production e-commerce architecture: Next.js, Medusa, Supabase, Stripe. Includes diagrams, trade-offs, and lessons learned.',
    category: 'case-study',
    tags: ['Next.js', 'TypeScript', 'system-design', 'e-commerce', 'architecture', 'case-study', 'Medusa'],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: 'Next.js E-commerce Architecture | Case Study: NeedThisDone.com Shop',
    meta_description:
      'Deep dive into production e-commerce architecture: Next.js, Medusa, Supabase, Stripe. Includes diagrams, trade-offs, and lessons learned.',
    content: `# Next.js E-commerce Architecture: A Case Study of NeedThisDone.com

I spent two and a half months building NeedThisDone.com — a full-featured e-commerce platform for project services and digital products. This case study walks through the architecture decisions, design trade-offs, and lessons learned from building production e-commerce as a solo developer.

## Project Requirements

The shop needed to handle multiple product types: one-time services, recurring subscriptions, physical products, and digital add-ons. Customers needed accounts to track orders, manage addresses, leave reviews, and earn loyalty points. Admins needed dashboards for order management, product catalog control, customer analytics, and email campaigns.

The constraints were equally important: I was the only developer, I needed to iterate fast based on real customer feedback, and the platform had to be production-ready from day one. No "MVP now, fix it later" approach — the architecture needed to scale from launch.

## High-Level Architecture

The system is built on four main pillars:

**Next.js 15 App Router** handles the frontend and API routes. Server Components render product pages, Client Components manage interactive cart state, and API routes orchestrate backend operations. Everything deploys to Vercel with edge caching for static content.

**Medusa backend** runs on Railway and serves as the product catalog and order management system. It handles product variants, pricing rules, cart operations, and checkout flow. Medusa owns the source of truth for what's in stock and what things cost.

**Supabase** manages authentication, customer data, reviews, loyalty points, and order history. User sessions live in Supabase Auth with row-level security protecting customer data. When Medusa creates an order, a webhook syncs it to Supabase for customer account tracking.

**Stripe** processes all payments. Checkout sessions are created through Next.js API routes that coordinate between Medusa's cart and Stripe's payment intents. Webhooks flow back through the system to confirm successful payments and trigger order fulfillment.

The data flow for a typical purchase: Customer adds item to cart (Medusa cart API) → Clicks checkout (Next.js API route creates Stripe session) → Completes payment (Stripe webhook confirms) → Order synced to Supabase (customer sees it in account dashboard) → Admin sees order in Medusa dashboard.

## Key Design Decisions

**Server Components vs Client Components**: Product listing pages are Server Components that fetch directly from Medusa on each request. This keeps pricing and inventory accurate without client-side cache staleness. The cart is a Client Component using React Context because it needs instant interactivity — add to cart, update quantity, remove items — without full page reloads.

**Why Medusa over Shopify or WooCommerce**: Shopify's transaction fees and template limitations didn't fit the vision. WooCommerce tied me to WordPress. Medusa gave me a headless commerce engine with full API control, no transaction fees, and the ability to customize every aspect of the checkout flow. The trade-off was more infrastructure to manage, but for a developer-focused product, that's a feature not a bug.

**Why Supabase over direct Postgres**: Supabase provided authentication, real-time subscriptions, row-level security, and automatic API generation out of the box. Setting up equivalent features with raw Postgres would have taken weeks. The managed service model meant I could focus on business logic instead of database administration.

**Cart state management**: I chose React Context over Redux or Zustand because the cart state is relatively simple and doesn't need time-travel debugging or complex middleware. Context provides enough structure to share cart data across components without prop drilling, and it integrates cleanly with Next.js's rendering model.

## Data Model Design

Products live in Medusa with a metadata schema that extends the base product model:

\`\`\`
metadata: {
  type: 'package' | 'addon' | 'service' | 'subscription',
  deposit_percent: 50,
  features: ['Feature 1', 'Feature 2'],
  billing_period: 'monthly',
  stripe_price_id: 'price_xxx'
}
\`\`\`

This metadata drives the frontend presentation. Packages show deposit requirements, subscriptions display billing periods, addons indicate they're supplementary products. The seed script (\`scripts/seed-products.ts\`) creates products with this schema, ensuring consistency across the catalog.

Orders start in Medusa and sync to Supabase through webhooks. The \`orders\` table in Supabase stores order metadata, line items, shipping addresses, and fulfillment status. This duplication is intentional — Medusa owns order creation and payment processing, Supabase owns customer-facing order history and analytics.

Customer data splits across systems: authentication credentials in Supabase Auth, order history in both Medusa and Supabase, loyalty points and reviews exclusively in Supabase. The frontend queries Supabase for customer dashboard data because it's faster than aggregating across Medusa's API.

## Reliability Patterns

Production e-commerce can't fail when Redis goes down or form submissions get double-clicked. The architecture includes several reliability layers:

**Circuit breaker for Redis**: The loyalty points system uses Redis for caching. When Redis is unreachable, the circuit breaker opens and requests fall back to direct Supabase queries. This prevents cascade failures where one slow dependency blocks the entire request. Full details in my [circuit breaker pattern post](/blog/building-circuit-breaker-pattern-nodejs).

**Request deduplication**: Checkout forms use SHA-256 fingerprinting to detect duplicate submissions within a 60-second window. This prevents double charges when users click "Pay Now" multiple times. Implementation details in my [request deduplication post](/blog/request-deduplication-preventing-double-submissions).

**Connection pooling**: The Supabase client uses singleton instantiation to prevent connection leaks. Without this, concurrent requests during traffic spikes would exhaust database connections and crash the app. See my [Supabase connection pooling post](/blog/supabase-connection-pooling-production-nextjs) for the full pattern.

**Rate limiting**: Authentication endpoints have per-IP rate limits (5 login attempts, 3 signup attempts per 15 minutes) to prevent brute force attacks and signup spam. This runs at the API route level before hitting Supabase.

These patterns weren't theoretical exercises — each one solved a real production incident or prevented one that was obviously coming.

## Performance Results

Current Lighthouse scores: Performance 95+, Accessibility 100, Best Practices 100, SEO 100. Core Web Vitals are all green: LCP under 1.2s, FID under 50ms, CLS under 0.05.

The optimizations that made the biggest difference:

**Server Components** eliminated client-side JavaScript for product listing pages. The initial page load went from 180KB of JS to 45KB by moving product fetching to the server and sending rendered HTML.

**Image optimization** through Next.js's Image component provided automatic WebP conversion, lazy loading, and responsive srcsets. Product images that were 800KB JPEGs became 120KB WebP files with no visible quality loss.

**Edge caching** for static content (homepage, about page, blog posts) pushed content closer to users geographically. Server response times dropped from 200ms average to 50ms for cached routes.

**Partial Prerendering** (Next.js 15 feature) allowed mixing static shells with dynamic product data. Product pages render instantly with cached layouts while fresh pricing loads on demand.

The lesson: most performance wins come from not sending code to the browser in the first place. Server Components and edge caching matter more than bundle size optimization or code splitting.

## Lessons Learned

**Start with Medusa was the right call**. The flexibility to customize checkout flows, add metadata schemas, and integrate with any payment provider paid off repeatedly. The setup time was worth it.

**Supabase's row-level security is powerful but tricky**. I spent hours debugging policies that blocked legitimate queries. The mental model of "policies must explicitly allow, everything is denied by default" took time to internalize. Test RLS policies thoroughly in development.

**Webhooks need retry logic**. Stripe webhooks occasionally fail due to network issues or deployment timing. The architecture now includes webhook event logging in Supabase so failed events can be replayed manually. This should have been built from the start.

**Admin dashboards matter more than I expected**. I initially focused on customer-facing features, but the admin tools for managing products, viewing analytics, and handling customer support requests became critical for daily operations. Invest in admin UX early.

**TypeScript prevents an entire class of bugs**. The type system caught issues with product metadata, cart item structures, and API response shapes before they hit production. The upfront cost of defining types pays back many times over.

**Testing isn't optional**. The E2E test suite (Playwright) caught regressions during refactoring multiple times. Accessibility tests enforced WCAG standards automatically. Tests gave me confidence to ship quickly without breaking existing features.

What I'd do differently: implement feature flags from day one. Rolling out loyalty points required coordinating frontend and backend changes across multiple deploys. A feature flag system would have allowed gradual rollout and easy rollback.

What worked well: the CLAUDE.md configuration for AI-assisted development. Having coding standards, TDD requirements, and color system rules documented meant Claude Code could generate consistent, production-ready code. More on this in my upcoming [AI development workflow post](/blog/claude-code-ai-development-workflow).

## Want This for Your Business?

This architecture handles thousands of products, hundreds of orders, and concurrent checkout sessions without breaking a sweat. If you need e-commerce that scales, check out my [services](/services) or see [pricing](/pricing) for package options.

For technical implementation details, read my guides on [Medusa setup](/blog/nextjs-medusa-headless-commerce-setup-guide), [Stripe checkout integration](/blog/custom-stripe-checkout-nextjs-server-actions), and [production reliability patterns](/blog/circuit-breaker-redis-nodejs-production).

Ready to build something? [Let's talk](/contact).`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Post 13: How I Use Claude Code to Build Production Apps Faster
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'claude-code-ai-development-workflow',
    title: 'How I Use Claude Code to Build Production Apps Faster',
    excerpt:
      'How I use Claude Code to build production apps faster. Real examples, prompts, and workflow optimizations for full-stack development.',
    category: 'behind-the-scenes',
    tags: ['Claude-Code', 'AI', 'development-workflow', 'productivity', 'full-stack', 'automation'],
    status: 'published',
    source: 'original',
    author_name: 'Abe Reyes',
    meta_title: 'My AI Development Workflow with Claude Code | Full-Stack Productivity',
    meta_description:
      'How I use Claude Code to build production apps faster. Real examples, prompts, and workflow optimizations for full-stack development.',
    content: `# How I Use Claude Code to Build Production Apps Faster

I've been using Claude Code to build NeedThisDone.com for the past two and a half months. The platform now has full e-commerce, customer accounts, admin dashboards, loyalty points, referral programs, and email campaigns — all built as a solo developer. AI-assisted development made this pace possible, but not in the way you might think.

## Why AI-Assisted Development Matters in 2026

The landscape changed fast. A year ago, AI code tools generated plausible-looking garbage that broke as soon as you tried to run it. Six months ago, they got better at small functions but couldn't handle complex architectures. Today, Claude Code can write production-ready features across multiple files while following project-specific coding standards.

The productivity gap between developers using AI tools effectively and those avoiding them entirely is now significant. It's not about AI replacing developers — it's about developers who use AI replacing developers who don't.

But "using AI effectively" is the critical phrase. Claude Code is not autopilot. It's a force multiplier that still requires human judgment, architecture knowledge, and the ability to spot when the AI is confidently wrong.

## My Claude Code Setup

The key to consistent output is configuration. My project has a \`CLAUDE.md\` file in the root that defines how code should be written:

**Coding standards**: Separation of concerns, DRY principle, file organization, naming conventions, TypeScript patterns. Claude Code reads this before generating code and follows these rules consistently.

**TDD requirements**: Every feature needs tests first. The TDD rule in \`.claude/rules/tdd.md\` enforces red-green-refactor cycles. Claude Code writes failing tests, implements minimal code to pass them, then refactors while keeping tests green.

**Color system**: The \`.claude/rules/colors.md\` file defines the BJJ belt progression color hierarchy (emerald → blue → purple → gold) and contrast requirements for accessibility. New components automatically follow these standards without me repeating them in every prompt.

**Design patterns**: Rules for inline editing state sync, hero gradient layouts, glassmorphism effects, and testing requirements ensure visual consistency across pages.

The memory system (\`memory/MEMORY.md\`) tracks completed work, architecture decisions, and key facts about the project. This prevents Claude Code from suggesting changes that conflict with established patterns or redoing work that's already done.

Project-specific instructions let me encode knowledge once and reuse it hundreds of times. Instead of "remember to use Server Components for product pages and Client Components for cart state" in every prompt, that pattern lives in the rules and applies automatically.

## The Daily Workflow

Building a new feature typically follows this pattern:

**Planning**: I describe what I want in plain English. "Add a customer referral program where users can send a unique code to friends and earn \$10 store credit per successful referral." Claude Code asks clarifying questions about data model, UI placement, and edge cases.

**Test writing**: Claude Code writes E2E tests that describe the expected user flow. Referral code generation, validation, credit application, tracking in customer dashboard — all tested before a single line of implementation code exists.

**Implementation**: With failing tests in place, Claude Code generates the components, API routes, database schema, and utility functions needed to make tests pass. It follows the established patterns: Server Components for pages, Client Components for interactive state, Supabase for data, Stripe for payments.

**Review**: I read every line. Sometimes the code is perfect. Sometimes it's 90% correct with subtle bugs. Sometimes it's architecturally wrong and needs redirection. This is the human judgment phase — I'm not blindly accepting generated code.

**Commit**: Claude Code drafts commit messages using the \`/dac\` command. The messages follow project conventions: concise summaries, detailed descriptions, Co-Authored-By attribution to Claude.

This loop happens multiple times per day. Small iterations, constant feedback, continuous integration.

## What Claude Code Excels At

**Boilerplate elimination**: Creating API routes with standardized error handling, validation, and response formats used to take 30 minutes per endpoint. Now it's 2 minutes. The patterns are consistent because they follow documented rules.

**Test coverage**: Writing comprehensive E2E tests for every user flow is tedious but critical. Claude Code generates Playwright tests that cover happy paths, error states, edge cases, and accessibility requirements automatically.

**Cross-file refactoring**: When I needed to extract inline editing logic into a reusable hook, Claude Code updated seven components simultaneously while maintaining existing behavior. Manual refactoring would have taken an hour and probably introduced bugs.

**Bug investigation**: Describing a bug ("typing in FAQ fields doesn't update the content") triggers systematic debugging. Claude Code checks the state management, event handlers, path construction, and component lifecycle — often finding the issue faster than I would manually.

**Seed data generation**: The blog post seeding script needed realistic content with proper metadata, tags, and relationships. Claude Code generated five complete posts with varied topics, appropriate tone, and correct database schema in minutes.

**Commit message quality**: The \`/dac\` command analyzes git diffs and generates commit messages that actually describe what changed and why. Better than "fix bug" or "update component" messages I'd write manually.

Real example from NeedThisDone.com: implementing the loyalty points system took four hours from concept to deployment. That included designing the database schema, building admin analytics dashboards, creating customer point tracking UI, adding checkout integration, writing E2E tests, and deploying to production. Solo developer, one afternoon, production-ready feature.

## What Still Needs Human Judgment

**Architecture decisions**: Choosing between Medusa and Shopify, structuring the cart state management, deciding on Server Components vs Client Components — these choices shape the entire application. Claude Code can explain trade-offs, but I make the final call based on project requirements and long-term maintainability.

**UX design**: Claude Code can implement a design system, but it can't decide if the checkout flow is intuitive or if the dashboard layout makes sense for customers. User experience requires empathy and product thinking that AI doesn't have.

**Business logic**: Determining how loyalty points should accrue, when referral credits expire, how admin permissions work — these are business decisions with product implications. Claude Code implements the rules I define, but it doesn't define them.

**Security review**: AI-generated authentication code needs human verification. Rate limiting thresholds, session management, data access policies, webhook signature validation — I review every security-critical path personally.

**Knowing when to push back**: Sometimes Claude Code suggests technically correct solutions that are architecturally wrong for the project. Recognizing "this will create technical debt" or "this violates separation of concerns" requires experience and project context.

**Prompt engineering itself**: Getting good output requires clear prompts, appropriate context, and knowing when to break complex tasks into smaller steps. This is a skill that improves with practice.

The best results come from treating Claude Code as a highly capable junior developer: great at implementation, needs guidance on architecture, requires code review, and improves with clear feedback.

## Productivity by the Numbers

Rough estimates from building NeedThisDone.com over 2.5 months:

**Feature development speed**: 2-3x faster than solo coding. Complex features that would take a week now take 2-3 days. Simple features that took a day now take 2-4 hours.

**Code review time**: About 20% of development time goes to reviewing and correcting AI-generated code. This is comparable to reviewing pull requests from human collaborators.

**Bug introduction rate**: Lower than expected. The TDD workflow catches most issues before they reach production. The bugs that slip through are usually business logic edge cases, not implementation errors.

**Refactoring confidence**: Significantly higher. Comprehensive test coverage (generated by AI) makes large refactorings safe. I've restructured major components multiple times without breaking existing functionality.

**Documentation quality**: Better than my solo work. Commit messages are detailed, code comments explain why not just what, and architecture decisions are documented in MEMORY.md consistently.

Total feature count delivered: Customer accounts, order management, product catalog, shopping cart, checkout flow, loyalty points, referral program, waitlist system, product reviews, admin dashboards, analytics, email campaigns, saved addresses, spending analytics, appointment booking, blog system. That's 15+ major features in 10 weeks as a solo developer.

Would I have built this without AI assistance? Eventually. But it would have taken six months instead of two, I would have skipped test coverage to save time, and the code quality would be inconsistent because I would have rushed features when pressure mounted.

## Get AI-Powered Development

This workflow isn't just for my projects. If you want applications built with this AI-assisted methodology — production-ready code, comprehensive tests, modern architecture — check out my [services](/services) or [contact me](/contact) directly.

For technical deep dives, read my [RAG implementation guide](/blog/rag-supabase-pgvector-nextjs-tutorial) and [self-taught developer story](/blog/self-taught-to-full-stack).

The tools are here. The question is whether you're using them effectively.`,
  },
];

// ============================================================================
// Seed Function
// ============================================================================

async function seed() {
  console.log('Seeding blog posts...\n');

  for (const post of posts) {
    // Upsert: insert new posts or update existing ones (e.g. to refresh internal links)
    const { error } = await supabase.from('blog_posts').upsert(
      {
        ...post,
        published_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );

    if (error) {
      console.error(`  Failed: "${post.title}" — ${error.message}`);
    } else {
      console.log(`  Upserted: "${post.title}"`);
    }
  }

  console.log('\nDone.');
}

seed().catch(console.error);
