/**
 * Benchmark Chat Models — TTFT & Total Response Time
 *
 * Compares gpt-4o-mini (current), gpt-4.1-nano, and gpt-5-nano
 * using the same Vercel AI SDK streaming path as the real chatbot.
 *
 * Usage: cd app && npx tsx scripts/benchmark-chat-models.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// ============================================
// CONFIGURATION
// ============================================

const MODELS = ['gpt-4o-mini', 'gpt-4.1-nano', 'gpt-5-nano'] as const;
const ITERATIONS = 5;

// Cost per 1M tokens (input/output) — used to estimate cost per 1K calls
const COST_TABLE: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4.1-nano': { input: 0.10, output: 0.40 },
  'gpt-5-nano': { input: 0.05, output: 0.40 },
};

// Simplified version of the real chatbot system prompt (no RAG context)
const SYSTEM_PROMPT = `You are a friendly and helpful AI assistant for NeedThisDone.com, a professional project services platform.

Your role is to:
- Answer questions about our services, pricing, and how we work
- Help visitors understand what we offer and how we can help them
- Be warm, professional, and concise

IMPORTANT GUIDELINES:
- Keep responses concise but helpful (2-4 sentences)
- Encourage visitors to get a quote or contact us when appropriate
- Never make up specific pricing — suggest contacting us for a custom quote`;

// Representative queries covering short, medium, and long user inputs
const TEST_PROMPTS = [
  'What services do you offer?',
  'How much does a website cost and what\'s included?',
  'I need a website for my BJJ gym with online booking and payments. Can you help?',
];

// ============================================
// TYPES
// ============================================

interface RunResult {
  ttftMs: number;
  totalMs: number;
  responseLength: number;
  responsePreview: string;
}

interface ModelStats {
  model: string;
  avgTtft: number;
  avgTotal: number;
  p95Total: number;
  medianTtft: number;
  medianTotal: number;
  estimatedCostPer1K: string;
  sampleResponse: string;
}

// ============================================
// BENCHMARK RUNNER
// ============================================

async function runSingle(
  model: string,
  prompt: string
): Promise<RunResult> {
  const start = performance.now();
  let ttft = 0;
  let firstChunk = true;
  let fullText = '';

  const result = streamText({
    model: openai(model),
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
    maxOutputTokens: 300,
    temperature: 0.7,
  });

  for await (const chunk of result.textStream) {
    if (firstChunk) {
      ttft = performance.now() - start;
      firstChunk = false;
    }
    fullText += chunk;
  }

  const totalMs = performance.now() - start;

  return {
    ttftMs: Math.round(ttft),
    totalMs: Math.round(totalMs),
    responseLength: fullText.length,
    responsePreview: fullText.slice(0, 120).replace(/\n/g, ' '),
  };
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

// Estimate cost per 1K chatbot calls
// Assumes ~150 input tokens (system + user) and ~200 output tokens per call
function estimateCostPer1K(model: string): string {
  const cost = COST_TABLE[model];
  if (!cost) return 'N/A';
  const inputCost = (150 / 1_000_000) * cost.input * 1000;
  const outputCost = (200 / 1_000_000) * cost.output * 1000;
  return `$${(inputCost + outputCost).toFixed(3)}`;
}

// ============================================
// MAIN
// ============================================

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY in .env.local');
    process.exit(1);
  }

  console.log('='.repeat(70));
  console.log('  Chat Model Benchmark — TTFT & Total Response Time');
  console.log(`  Models: ${MODELS.join(', ')}`);
  console.log(`  Iterations per prompt: ${ITERATIONS}`);
  console.log(`  Test prompts: ${TEST_PROMPTS.length}`);
  console.log('='.repeat(70));
  console.log();

  const allStats: ModelStats[] = [];

  for (const model of MODELS) {
    console.log(`\n--- ${model} ---`);
    const allTtfts: number[] = [];
    const allTotals: number[] = [];
    let sampleResponse = '';

    for (let pi = 0; pi < TEST_PROMPTS.length; pi++) {
      const prompt = TEST_PROMPTS[pi];
      const label = prompt.slice(0, 50);
      process.stdout.write(`  Prompt ${pi + 1}: "${label}..." `);

      for (let i = 0; i < ITERATIONS; i++) {
        try {
          const result = await runSingle(model, prompt);
          allTtfts.push(result.ttftMs);
          allTotals.push(result.totalMs);

          // Keep last response as sample
          if (i === 0 && pi === 0) {
            sampleResponse = result.responsePreview;
          }

          process.stdout.write('.');
        } catch (err) {
          process.stdout.write('X');
          console.error(`\n    Error: ${err instanceof Error ? err.message : err}`);
        }
      }
      console.log(' done');
    }

    // Sort for percentile calculations
    const sortedTtfts = [...allTtfts].sort((a, b) => a - b);
    const sortedTotals = [...allTotals].sort((a, b) => a - b);

    if (sortedTtfts.length === 0) {
      console.log(`  SKIPPED — all calls failed`);
      continue;
    }

    const stats: ModelStats = {
      model,
      avgTtft: Math.round(allTtfts.reduce((a, b) => a + b, 0) / allTtfts.length),
      avgTotal: Math.round(allTotals.reduce((a, b) => a + b, 0) / allTotals.length),
      p95Total: percentile(sortedTotals, 95),
      medianTtft: median(sortedTtfts),
      medianTotal: median(sortedTotals),
      estimatedCostPer1K: estimateCostPer1K(model),
      sampleResponse,
    };

    allStats.push(stats);
    console.log(`  Avg TTFT: ${stats.avgTtft}ms | Avg Total: ${stats.avgTotal}ms | p95: ${stats.p95Total}ms`);
  }

  // ============================================
  // RESULTS TABLE
  // ============================================
  console.log('\n' + '='.repeat(70));
  console.log('  RESULTS');
  console.log('='.repeat(70));

  // Header
  const cols = {
    model: 16,
    ttft: 12,
    medTtft: 12,
    total: 12,
    medTotal: 12,
    p95: 10,
    cost: 14,
  };

  console.log(
    '\n' +
    pad('Model', cols.model) +
    pad('Avg TTFT', cols.ttft) +
    pad('Med TTFT', cols.medTtft) +
    pad('Avg Total', cols.total) +
    pad('Med Total', cols.medTotal) +
    pad('p95', cols.p95) +
    pad('Cost/1K', cols.cost)
  );
  console.log('-'.repeat(Object.values(cols).reduce((a, b) => a + b, 0)));

  for (const s of allStats) {
    console.log(
      pad(s.model, cols.model) +
      pad(`${s.avgTtft}ms`, cols.ttft) +
      pad(`${s.medianTtft}ms`, cols.medTtft) +
      pad(`${s.avgTotal}ms`, cols.total) +
      pad(`${s.medianTotal}ms`, cols.medTotal) +
      pad(`${s.p95Total}ms`, cols.p95) +
      pad(s.estimatedCostPer1K, cols.cost)
    );
  }

  console.log();

  // Sample responses
  console.log('--- Sample Responses ---');
  for (const s of allStats) {
    console.log(`  ${s.model}: "${s.sampleResponse}..."`);
  }

  console.log('\nDone.');
}

function pad(str: string, len: number): string {
  return str.padEnd(len);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
