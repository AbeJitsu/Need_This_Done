import { openai } from '@ai-sdk/openai';
import { streamText, embed, type CoreMessage } from 'ai';
import { getSupabaseAdmin } from '@/lib/supabase';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

// ============================================================================
// Chat API Route - POST /api/chat
// ============================================================================
// What: Handles chat messages with RAG (Retrieval-Augmented Generation)
// Why: Provides context-aware answers based on indexed site content
// How: Embeds user query → Vector search → Stream response with context

/**
 * POST /api/chat
 *
 * Processes chat messages using:
 * 1. Vector similarity search to find relevant content
 * 2. GPT-4o mini for generating responses
 * 3. Streaming for real-time response delivery
 */
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // ========================================================================
    // Input Validation - Prevent DoS and Resource Exhaustion
    // ========================================================================

    // Validate messages array exists and is array
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prevent DoS via large message arrays (max 50 messages in history)
    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array cannot be empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Too many messages. Maximum 50 messages allowed.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate each message has required fields
    for (const msg of messages) {
      if (!msg.role || typeof msg.role !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid message format: missing role' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Role must be one of: user, assistant, system
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: 'Invalid message role. Must be: user, assistant, or system' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate total conversation size (prevent memory exhaustion)
    const totalContentLength = messages.reduce((sum, msg) => {
      const content = msg.content || msg.parts?.[0]?.text || '';
      return sum + content.length;
    }, 0);

    // Maximum 50KB of total conversation content
    if (totalContentLength > 50000) {
      return new Response(
        JSON.stringify({ error: 'Conversation too long. Please start a new chat.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // Rate Limiting - Prevent Abuse and Control API Costs
    // ========================================================================
    // Limit to 20 requests per minute per IP address
    // Uses Redis for distributed rate limiting across multiple instances

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

    const rateLimitKey = `rate:chat:${clientIp}`;
    const rateLimitWindow = 60; // 60 seconds
    const rateLimitMax = 20; // 20 requests per minute

    try {
      // Increment request counter for this IP
      const requestCount = await redis.incr(rateLimitKey);

      // Set expiration on first request in window
      if (requestCount === 1) {
        await redis.raw.expire(rateLimitKey, rateLimitWindow);
      }

      // Block if over limit
      if (requestCount > rateLimitMax) {
        console.warn(`[Chat] Rate limit exceeded for IP: ${clientIp} (${requestCount} requests)`);
        return new Response(
          JSON.stringify({
            error: 'Too many requests. Please wait a moment before trying again.',
            retryAfter: rateLimitWindow,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': rateLimitWindow.toString(),
              'X-RateLimit-Limit': rateLimitMax.toString(),
              'X-RateLimit-Remaining': Math.max(0, rateLimitMax - requestCount).toString(),
            }
          }
        );
      }

      // Add rate limit headers to successful responses (informational)
      req.headers.set('X-RateLimit-Remaining', (rateLimitMax - requestCount).toString());
    } catch (rateLimitError) {
      // If rate limiting fails (Redis down), allow request through
      // Better to serve users than to block them on infrastructure failure
      console.error('[Chat] Rate limiting failed:', rateLimitError);
    }

    // ========================================================================
    // Extract message content (handles AI SDK v5 format with parts array)
    // ========================================================================
    // AI SDK v5 sends: { parts: [{ type: "text", text: "..." }], role: "user" }
    // Legacy format:   { content: "...", role: "user" }
    const getMessageContent = (msg: { content?: string; parts?: { type: string; text: string }[] }): string | null => {
      if (msg.content) return msg.content;
      if (msg.parts?.[0]?.text) return msg.parts[0].text;
      return null;
    };

    // Get the last user message for embedding
    const lastMessage = messages[messages.length - 1];
    const lastMessageContent = getMessageContent(lastMessage);

    if (!lastMessageContent) {
      return new Response(
        JSON.stringify({ error: 'Invalid message format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Transform messages to standard format for streamText
    const normalizedMessages: CoreMessage[] = messages.map((msg: { role: string; content?: string; parts?: { type: string; text: string }[] }) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: getMessageContent(msg) || '',
    }));

    // ========================================================================
    // Step 1: Generate embedding for user's question
    // ========================================================================
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: lastMessageContent,
    });

    // ========================================================================
    // Step 2: Search for relevant content using vector similarity
    // ========================================================================
    const supabase = getSupabaseAdmin();

    // Vector search config - values must be set via environment variables
    const similarityThreshold = parseFloat(
      process.env.VECTOR_SEARCH_SIMILARITY_THRESHOLD!
    );
    const maxResults = parseInt(
      process.env.VECTOR_SEARCH_MAX_RESULTS!
    );

    if (isNaN(similarityThreshold) || isNaN(maxResults)) {
      throw new Error(
        'VECTOR_SEARCH_SIMILARITY_THRESHOLD and VECTOR_SEARCH_MAX_RESULTS env vars are required'
      );
    }

    // Convert embedding array to string format for pgvector RPC
    const embeddingStr = `[${embedding.join(',')}]`;

    const { data: matches, error: searchError } = await supabase.rpc(
      'match_page_embeddings',
      {
        query_embedding: embeddingStr,
        match_threshold: similarityThreshold,
        match_count: maxResults,
      }
    );

    if (searchError) {
      console.error('Vector search error:', searchError);
      // Continue without context rather than failing completely
    }

    // ========================================================================
    // Step 3: Build context from matched content
    // ========================================================================
    let context = 'No relevant information found in the knowledge base.';
    let validUrls: string[] = [];

    if (matches && matches.length > 0) {
      // Extract unique URLs from matches for the system prompt
      // This ensures the LLM only links to pages that actually exist
      validUrls = [...new Set(matches.map(
        (m: { page_url: string }) => m.page_url
      ))] as string[];

      // Build context string with source attribution
      // The system prompt instructs the LLM to cite sources using markdown links
      context = matches
        .map(
          (m: { page_title: string; page_url: string; content_chunk: string }) =>
            `[${m.page_title}](${m.page_url}):\n${m.content_chunk}`
        )
        .join('\n\n---\n\n');
    }

    // ========================================================================
    // Step 4: Build system prompt with context
    // ========================================================================
    const systemPrompt = `You are a friendly and helpful AI assistant for NeedThisDone.com, a professional project services platform.

Your role is to:
- Answer questions about our services, pricing, and how we work
- Help visitors understand what we offer and how we can help them
- Provide accurate information based on the context provided below
- Be warm, professional, and concise

IMPORTANT GUIDELINES:
- Base your answers on the CONTEXT provided below
- If the context doesn't contain relevant information, say so politely and suggest contacting us
- Always cite sources using markdown links when referencing specific information
- Encourage visitors to get a quote or contact us when appropriate
- Never make up information not in the context
- Keep responses concise but helpful
- ALWAYS use relative URLs (starting with /) - never use absolute URLs with domain names

CONTEXT FROM KNOWLEDGE BASE:
${context}

VALID URLS (only link to URLs from this list):
${validUrls.length > 0 ? validUrls.map(url => `- ${url}`).join('\n') : '- /contact (for quotes and inquiries)'}

CITATION FORMAT:
- ONLY use URLs from the VALID URLS list above - never invent URLs
- Use relative URLs (starting with /) - never use absolute URLs with domain names
- Example: [Get a Quote](/contact) or [Services](/services)`;

    // ========================================================================
    // Step 5: Stream response using Vercel AI SDK
    // ========================================================================
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: normalizedMessages,
      maxOutputTokens: 1000,
      temperature: 0.7,
    });

    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);

    // Return a user-friendly error
    return new Response(
      JSON.stringify({
        error: 'Sorry, something went wrong. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
