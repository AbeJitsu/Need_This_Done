#!/usr/bin/env npx tsx
/**
 * Email Test Script
 * =================
 * Sends test emails to verify templates work correctly.
 *
 * Usage: npm run test:emails (from app/ directory)
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

// ============================================================================
// Load .env.local manually
// ============================================================================
// ESM hoisting makes dotenv tricky, so we load env vars manually

// Check root .env.local first (where RESEND vars live), then app/.env.local
const possiblePaths = [
  join(process.cwd(), "..", ".env.local"), // root .env.local (has RESEND)
  join(process.cwd(), ".env.local"), // app/.env.local (fallback)
];

let envPath: string | null = null;
for (const path of possiblePaths) {
  if (existsSync(path)) {
    envPath = path;
    break;
  }
}

if (!envPath) {
  console.error(`❌ .env.local not found in:`);
  possiblePaths.forEach((p) => console.error(`   - ${p}`));
  process.exit(1);
}

const envContent = readFileSync(envPath, "utf-8");
const keysFound: string[] = [];
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex);
  let value = trimmed.slice(eqIndex + 1);
  // Remove quotes if present
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
  if (key.includes("RESEND")) keysFound.push(key);
}
console.log(`✅ Loaded env from: ${envPath}`);
console.log(
  `   Found RESEND keys: ${keysFound.length > 0 ? keysFound.join(", ") : "NONE"}\n`,
);

// ============================================================================
// Verify required env vars
// ============================================================================

console.log("📧 Email Test Script");
console.log("====================");
console.log(
  `RESEND_API_KEY: ${process.env.RESEND_API_KEY ? "✅ Found" : "❌ Missing"}`,
);
console.log(
  `RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || "❌ Missing"}`,
);
console.log(
  `RESEND_ADMIN_EMAIL: ${process.env.RESEND_ADMIN_EMAIL || "❌ Missing"}\n`,
);

if (!process.env.RESEND_API_KEY) {
  console.error("❌ Cannot proceed without RESEND_API_KEY");
  process.exit(1);
}

// ============================================================================
// Send test emails
// ============================================================================

async function main() {
  // Dynamic import after env is loaded
  const {
    sendWelcomeEmail,
    sendLoginNotification,
    sendAdminNotification,
    sendClientConfirmation,
  } = await import("../lib/email-service.js");

  const TEST_EMAIL = process.env.RESEND_ADMIN_EMAIL || "test@example.com";
  const testRun = `manual-email-test:${Date.now()}`;
  console.log(`Sending test emails to: ${TEST_EMAIL}\n`);

  // Helper to avoid rate limits (Resend free tier: 2 requests/second)
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Test 1: Welcome Email
  console.log("1️⃣ Sending Welcome Email...");
  try {
    const result = await sendWelcomeEmail({
      email: TEST_EMAIL,
      name: "Test User",
    }, {
      operationKey: `${testRun}:welcome`,
      domainReference: `${testRun}:welcome`,
    });
    console.log(`   ✅ Welcome email sent! ID: ${result}\n`);
  } catch (error) {
    console.error(`   ❌ Welcome email failed:`, error);
  }

  await delay(1000); // Wait 1 second to avoid rate limit

  // Test 2: Login Notification
  console.log("2️⃣ Sending Login Notification...");
  try {
    const result = await sendLoginNotification({
      email: TEST_EMAIL,
      loginTime: new Date().toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }),
      ipAddress: "192.168.1.100",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0",
    }, {
      operationKey: `${testRun}:login`,
      domainReference: `${testRun}:login`,
    });
    console.log(`   ✅ Login notification sent! ID: ${result}\n`);
  } catch (error) {
    console.error(`   ❌ Login notification failed:`, error);
  }

  await delay(1000); // Wait 1 second to avoid rate limit

  // Test 3: Admin Notification (Project Submission)
  console.log("3️⃣ Sending Admin Notification (Project Alert)...");
  try {
    const result = await sendAdminNotification({
      projectId: "test-proj-" + Date.now(),
      name: "John Smith",
      email: "john.smith@example.com",
      company: "Acme Corporation",
      service: "Website Builds",
      message:
        "Hi! I need help building a new e-commerce website for my business. We sell handmade crafts and want a modern, mobile-friendly design with payment processing.",
      attachmentCount: 2,
      submittedAt: new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    }, {
      operationKey: `${testRun}:admin`,
      domainReference: `${testRun}:admin`,
    });
    console.log(`   ✅ Admin notification sent! ID: ${result}\n`);
  } catch (error) {
    console.error(`   ❌ Admin notification failed:`, error);
  }

  await delay(1000); // Wait 1 second to avoid rate limit

  // Test 4: Client Confirmation
  console.log("4️⃣ Sending Client Confirmation...");
  try {
    const result = await sendClientConfirmation(TEST_EMAIL, {
      name: "Jane Doe",
      service: "Managed Automation",
    }, {
      operationKey: `${testRun}:confirmation`,
      domainReference: `${testRun}:confirmation`,
    });
    console.log(`   ✅ Client confirmation sent! ID: ${result}\n`);
  } catch (error) {
    console.error(`   ❌ Client confirmation failed:`, error);
  }

  await delay(1000); // Wait 1 second to avoid rate limit

  console.log("====================");
  console.log("✨ Done! Check your inbox at:", TEST_EMAIL);
  console.log("   Look for 4 emails from hello@needthisdone.com");
}

main().catch(console.error);
