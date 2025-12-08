# How the Smart Chatbot Works

A friendly guide to understanding our AI-powered chatbot system.

## Overview

The chatbot answers visitor questions using content from your actual website pages. It's like having a helpful assistant who has read everything on your site and can quickly find relevant information.

## How It Works (The Simple Version)

```
Visitor asks a question
        ↓
Chatbot searches your indexed pages
        ↓
Finds the most relevant content
        ↓
Generates a helpful answer with sources
```

## The Three Main Pieces

### 1. Page Indexer (Automatic Learning)

Every time someone visits a page, the system:

1. **Extracts the content** - Pulls text from headings, paragraphs, and lists
2. **Creates a fingerprint** - Generates a unique hash of the content
3. **Checks if it's new** - Compares the hash to what's already stored
4. **Indexes only if changed** - Saves time and money by skipping unchanged pages

This means the chatbot automatically stays up-to-date when you change your site content.

### 2. Vector Search (Finding Relevant Info)

When someone asks a question:

1. The question gets converted into a mathematical representation (embedding)
2. We compare it against all stored page content
3. The most similar content gets returned
4. This works even if the exact words don't match - it understands meaning

For example, "How much does it cost?" will match content about "pricing" and "$50" even though those exact words weren't in the question.

### 3. AI Response (Generating Answers)

The AI assistant:

1. Receives the relevant content as context
2. Generates a natural, helpful response
3. Cites sources with links so visitors can learn more
4. Stays focused on what's actually on your site (no making things up)

## What Gets Indexed

**Included:**
- Homepage (/)
- Services page (/services)
- Pricing page (/pricing)
- FAQ page (/faq)
- How It Works (/how-it-works)
- Any CMS pages you create

**Excluded:**
- Admin dashboard (/admin)
- User dashboard (/dashboard)
- Login pages (/login)
- Cart and checkout
- API routes

## Debug Tools (For Developers)

### Check Indexing Status
```
GET /api/embeddings/status
```
Shows all indexed pages with their content hashes and chunk counts.

### Test Vector Search
```
GET /api/embeddings/debug?query=pricing
```
Tests the search with any query and shows similarity scores.

### Check Specific Page
```
GET /api/embeddings/check?page_url=/pricing&content_hash=abc123
```
Verifies if a page is indexed with a specific content hash.

## Configuration

Set these in your environment or docker-compose.yml:

| Variable | Required | Description |
|----------|----------|-------------|
| `VECTOR_SEARCH_SIMILARITY_THRESHOLD` | Yes | Minimum similarity score (0-1). Recommended: 0.5 |
| `VECTOR_SEARCH_MAX_RESULTS` | Yes | Maximum chunks to include in context. Recommended: 5 |

Lower threshold = more results but potentially less relevant.
Higher threshold = fewer but more precise matches.

## How Content Hashing Prevents Waste

The system uses SHA-256 hashing to detect changes:

```
Page content → SHA-256 hash → Compare to stored hash
                                    ↓
                    Same? Skip indexing (save API costs)
                    Different? Re-index the page
```

This means:
- Unchanged pages are never re-indexed
- Only actual content changes trigger new embeddings
- You save money on OpenAI API calls

## File Locations

| File | Purpose |
|------|---------|
| `app/components/chatbot/PageIndexer.tsx` | Automatic page indexing on load |
| `app/components/chatbot/ChatbotWidget.tsx` | The chat UI component |
| `app/app/api/chat/route.ts` | Chat API with RAG pipeline |
| `app/app/api/embeddings/index/route.ts` | Indexing endpoint |
| `app/app/api/embeddings/check/route.ts` | Hash check endpoint |
| `app/lib/chatbot/content-extractor.ts` | DOM content extraction |
| `app/lib/chatbot/content-hash.ts` | SHA-256 hashing |
| `supabase/migrations/008_create_page_embeddings.sql` | Database schema |

## Common Questions

**Q: Why isn't the chatbot finding my content?**
Check `/api/embeddings/status` to see if the page is indexed. If not, visit the page to trigger indexing.

**Q: How do I force a re-index?**
Use the re-index button in the chat panel header (dev mode), or change the page content which will create a new hash.

**Q: Why are similarity scores low?**
This is normal for semantic search. Scores of 0.15-0.30 often indicate good matches. The threshold is set low (0.1) to catch relevant content.

**Q: How much does this cost?**
- Indexing: ~$0.0001 per page (one-time per content change)
- Chat queries: ~$0.001 per question (embedding + GPT-4o-mini)
