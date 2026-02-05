#!/usr/bin/env tsx

/**
 * Chatbot 10-Question Test
 * Tests all critical user questions to verify semantic search is working
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface TestQuestion {
  q: string;
  shouldMention: string;
  description: string;
}

const questions: TestQuestion[] = [
  { q: "How much does a website cost?", shouldMention: "$500", description: "Launch Site pricing" },
  { q: "What add-ons are available for websites?", shouldMention: "add-on", description: "Add-ons listing" },
  { q: "What services do you offer?", shouldMention: "website", description: "Services overview" },
  { q: "Can you help me set up automation?", shouldMention: "automation", description: "Automation services" },
  { q: "What is managed AI?", shouldMention: "AI", description: "Managed AI explanation" },
  { q: "Do you provide support after launch?", shouldMention: "support", description: "Post-launch support" },
  { q: "What's the difference between Launch Site and Growth Site?", shouldMention: "Launch", description: "Package comparison" },
  { q: "How much deposit do I need?", shouldMention: "50%", description: "Deposit amount" },
  { q: "Can you integrate payment processing?", shouldMention: "payment", description: "Payment integration" },
  { q: "What happens after my website launches?", shouldMention: "launch", description: "Post-launch process" },
];

async function askChatbot(question: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: question }],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullResponse += decoder.decode(value, { stream: true });
  }

  return fullResponse;
}

async function runTest() {
  console.log('🤖 Testing Chatbot - 10 Critical Questions\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < questions.length; i++) {
    const { q, shouldMention, description } = questions[i];

    process.stdout.write(`Q${i + 1}: ${description}... `);

    try {
      const answer = await askChatbot(q);
      const lowerAnswer = answer.toLowerCase();
      const lowerExpected = shouldMention.toLowerCase();

      if (lowerAnswer.includes(lowerExpected)) {
        console.log(`✅ PASS`);
        passed++;
      } else {
        console.log(`❌ FAIL`);
        console.log(`   Question: "${q}"`);
        console.log(`   Expected to find: "${shouldMention}"`);
        console.log(`   Answer: ${answer.substring(0, 200)}...\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR`);
      console.log(`   ${error}\n`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Results: ${passed}/${questions.length} passed`);
  console.log('='.repeat(60));

  if (passed === questions.length) {
    console.log('\n🎉 All tests passed! Chatbot is working correctly.');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Check logs above for details.`);
    process.exit(1);
  }
}

runTest();
