/**
 * Seed Blog Posts Script
 *
 * Seeds 5 professional blog posts into the blog_posts table.
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

This is the exact problem the circuit breaker pattern solves. And it's one of the first reliability patterns I implemented in NeedThisDone.com.

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

Build your reliability patterns before you need them. By the time you're in an incident, it's too late to add them.`,
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

Then I decided to build NeedThisDone.com from scratch, and everything changed.

## The Background Nobody Expects

My resume doesn't look like a typical developer's. Five years as an Army combat medic. Seven years selling cars and structuring finance deals at Toyota. A few years at Full Sail University helping military students navigate the GI Bill.

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

It just takes longer than you think it should.`,
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

NeedThisDone.com runs on four main services:

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

Just go in with your eyes open about what each path costs. And if you choose the custom route, commit to it fully. Half-custom, half-platform is the worst of both worlds.`,
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

Since deploying this pattern on NeedThisDone.com:

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

If processing a duplicate would cause harm (financial, data corruption, spam), add deduplication. If duplicates are harmless, don't add complexity.`,
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

I didn't plan to become a developer when I left the Army. But the Army gave me the foundation that makes me the developer I am today.

If you're a veteran considering tech: your experience is an asset, not a gap. The discipline you learned under real pressure is exactly what software teams need. Don't let anyone tell you otherwise.`,
  },
];

// ============================================================================
// Seed Function
// ============================================================================

async function seed() {
  console.log('Seeding blog posts...\n');

  for (const post of posts) {
    // Check if post already exists
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('slug', post.slug)
      .single();

    if (existing) {
      console.log(`  Skipping "${post.title}" (already exists)`);
      continue;
    }

    const { error } = await supabase.from('blog_posts').insert({
      ...post,
      published_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`  Failed: "${post.title}" — ${error.message}`);
    } else {
      console.log(`  Created: "${post.title}"`);
    }
  }

  console.log('\nDone.');
}

seed().catch(console.error);
