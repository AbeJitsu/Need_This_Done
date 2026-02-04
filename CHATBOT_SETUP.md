# Chatbot Contextual Responses - Setup Guide

## Problem Fixed

The chatbot was responding with generic answers instead of using your site content. This guide shows how to index your pages so the chatbot can answer questions with context.

## Why This Happens

The chatbot uses **Retrieval-Augmented Generation (RAG)**:
1. User asks a question
2. System searches indexed pages for relevant content
3. ChatGPT uses that content to generate a contextual answer

**Without indexed content** → Generic OpenAI responses
**With indexed content** → Site-specific answers with citations

## Quick Start (3 Commands)

```bash
# 1. Verify database is ready
npx tsx scripts/verify-chatbot-db.ts

# 2. Index all pages (this is the critical step)
npx tsx scripts/index-all-pages.ts

# 3. Test that search works
npx tsx scripts/test-vector-search.ts

# 4. Start dev server
cd app && npm run dev

# 5. Open http://localhost:3000 and test chatbot
```

## Step-by-Step Details

### Step 1: Verify Database Setup (Optional but Recommended)

```bash
npx tsx scripts/verify-chatbot-db.ts
```

**What it checks:**
- ✓ Supabase connection
- ✓ pgvector extension installed
- ✓ page_embeddings table exists
- ✓ OpenAI API key configured

**Expected output:**
```
🔍 Checking chatbot database setup...

1️⃣  Testing Supabase connection...
   ✓ Supabase connection OK

2️⃣  Checking pgvector extension...
   ✓ pgvector extension is enabled

3️⃣  Checking page_embeddings table...
   ✓ page_embeddings table exists

4️⃣  Counting indexed pages...
   ℹ️  Found 0 indexed pages
   📋 Next step: Run indexing script

5️⃣  Checking OpenAI API key...
   ✓ OpenAI API key configured

✅ All database checks passed!
```

**If something fails:**
- Missing `page_embeddings` table? Run: `supabase db push`
- Missing environment variables? Check `.env.local`

### Step 2: Index Your Pages (CRITICAL)

```bash
npx tsx scripts/index-all-pages.ts
```

**What it does:**
1. Discovers all public pages on your site
2. Fetches each page as HTML
3. Extracts clean text content
4. Generates embeddings using OpenAI
5. Stores in database for chatbot search

**Expected output:**
```
🔍 Discovering pages...

Found 15 public pages to index

[1/15] 📄 / - ✓ (3 chunks)
[2/15] 📄 /services - ✓ (5 chunks)
[3/15] 📄 /pricing - ✓ (2 chunks)
...

============================================================
📊 Indexing Complete
============================================================
✅ Indexed: 15 pages
❌ Failed: 0 pages
📦 Total chunks: 47
⏱️  Time: 45.3s
```

**This is what fixes the chatbot!** After this completes, the chatbot will have access to your page content.

### Step 3: Test Vector Search

```bash
npx tsx scripts/test-vector-search.ts
```

**What it does:**
- Takes a test query: "What services do you offer?"
- Searches the indexed content
- Shows top 3 matching pages with relevance scores

**Expected output:**
```
🔎 Testing Vector Search

1️⃣  Checking indexed content...
   ✓ Found 47 indexed embeddings

2️⃣  Generating embedding for test query...
   Query: "What services do you offer?"
   ✓ Generated embedding (1536 dimensions)

3️⃣  Searching for matching pages...
   ✓ Found 3 matching pages

Results (sorted by relevance):
─────────────────────────────────────────────────────

1. Services (/services)
   Similarity: 92.3%
   Preview: "We offer web development, SEO optimization, and..."

2. Pricing (/pricing)
   Similarity: 78.6%
   Preview: "Our service packages start at $500 and include..."

3. How It Works (/how-it-works)
   Similarity: 65.4%
   Preview: "Here's how our process works: 1. Initial consultation..."

✅ Vector search is working!
```

### Step 4: Test in Development

```bash
cd app && npm run dev
```

Then:
1. Open http://localhost:3000 in your browser
2. Click the chatbot button (bottom right)
3. Ask: "What services do you offer?"
4. ✓ Should respond with content from your /services page

**Compare the difference:**
- **Before indexing:** "I'm an AI assistant..." (generic)
- **After indexing:** "Based on your website, Need This Done offers web development, SEO optimization, and..." (contextual with citations)

## What Gets Indexed

**Included:**
- All public pages (/, /services, /pricing, /faq, etc.)
- Page titles and content
- Navigation menus (for context)

**Excluded:**
- Admin pages (/admin/*)
- User dashboard (/dashboard/*)
- Auth pages (/login, etc.)
- API routes
- Chatbot widget itself

## Monitoring

### Check Health Status

```bash
curl http://localhost:3000/api/chatbot/health
```

**Response:**
```json
{
  "status": "healthy",
  "readiness": "Ready for chatbot queries",
  "indexed_embeddings": 47,
  "indexed_pages": 15,
  "pages": ["/", "/services", "/pricing", ...],
  "last_indexed": "2026-02-04T10:57:23.456Z",
  "timestamp": "2026-02-04T10:57:45.123Z"
}
```

## Re-indexing

If you update page content and want the chatbot to use the new information:

```bash
npx tsx scripts/index-all-pages.ts
```

The script automatically:
- Detects changed pages (using content hash)
- Removes old embeddings
- Creates new ones with updated content

## Configuration

### Adjust Similarity Threshold

In `.env.local`:

```
# How similar search results need to be (0.0 - 1.0)
# Lower = more results but less relevant
# Higher = fewer results but more relevant
VECTOR_SEARCH_SIMILARITY_THRESHOLD=0.5

# Maximum number of pages to search before generating response
VECTOR_SEARCH_MAX_RESULTS=5
```

### Change What Gets Indexed

Edit the `EDITABLE_PAGE_SLUGS` in `app/e2e/utils/page-discovery.ts` to customize which pages the indexing script finds.

## Troubleshooting

### "No indexed content found"

```bash
# Database might not be set up
supabase db push

# Then re-run indexing
npx tsx scripts/index-all-pages.ts
```

### "Content too short" errors

Pages need at least 50 characters of content to be indexed. Add more text to short pages.

### "API returned 401" or "Unauthorized"

Check that `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`

### Chatbot still not using context

1. Run verification: `npx tsx scripts/verify-chatbot-db.ts`
2. Check health: `curl http://localhost:3000/api/chatbot/health`
3. Look for errors in dev console

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Your Site Pages (/, /services, /pricing, etc.)             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  index-all-pages.ts Script                                  │
│  • Discovers pages                                          │
│  • Fetches HTML                                             │
│  • Extracts text                                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  /api/embeddings/index (API Route)                          │
│  • Chunks text (~6000 chars each)                           │
│  • Generates OpenAI embeddings                              │
│  • Stores in Supabase                                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase page_embeddings Table                             │
│  • Stores chunks + embeddings + metadata                    │
│  • Uses pgvector for semantic search                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Chatbot Message Flow                                       │
│  1. User asks question                                      │
│  2. Generate embedding of question                          │
│  3. Search page_embeddings table for similar chunks         │
│  4. Pass relevant chunks to ChatGPT                         │
│  5. ChatGPT generates answer using page context             │
└─────────────────────────────────────────────────────────────┘
```

## Files Created

| File | Purpose |
|------|---------|
| `scripts/verify-chatbot-db.ts` | Check database setup |
| `scripts/index-all-pages.ts` | Index all pages (critical) |
| `scripts/test-vector-search.ts` | Test search works |
| `app/api/chatbot/health/route.ts` | Health check endpoint |

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=sk-...
VECTOR_SEARCH_SIMILARITY_THRESHOLD=0.5
VECTOR_SEARCH_MAX_RESULTS=5
```

All should be in `app/.env.local`

## Next Steps

1. ✅ Run verification: `npx tsx scripts/verify-chatbot-db.ts`
2. ✅ Index pages: `npx tsx scripts/index-all-pages.ts`
3. ✅ Test search: `npx tsx scripts/test-vector-search.ts`
4. ✅ Start dev: `cd app && npm run dev`
5. ✅ Open http://localhost:3000 and test chatbot

After these steps, your chatbot will respond with site-specific information!
