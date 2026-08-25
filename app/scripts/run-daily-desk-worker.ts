#!/usr/bin/env npx tsx
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'dotenv';
import { OpenRouterClient } from '@/lib/openrouter-core';
import { MacMiniDailyDeskResearchWorker, SignedDailyDeskWorkerTransport } from '@/lib/daily-desk-worker';

type WorkerEnvironment = {
  OPENROUTER_API_KEY: string;
  DAILY_DESK_WORKER_SECRET: string;
  DAILY_DESK_WORKER_BASE_URL: string;
  DAILY_DESK_WORKER_ID: string;
};

function usage(): never {
  throw new Error('Usage: npx tsx scripts/run-daily-desk-worker.ts --env-file /absolute/private.env --schedule [--once] | --once');
}

function readEnvironment(path: string): WorkerEnvironment {
  const absolute = resolve(path);
  const stat = statSync(absolute);
  if (!stat.isFile() || (stat.mode & 0o077) !== 0) {
    throw new Error('The Daily Desk Mac-mini environment file must be a regular chmod-600 file.');
  }
  const values = parse(readFileSync(absolute));
  if (Object.keys(values).some((key) => key.startsWith('NEXT_PUBLIC_'))) {
    throw new Error('The Daily Desk private worker environment must not define NEXT_PUBLIC variables.');
  }
  const required = ['OPENROUTER_API_KEY', 'DAILY_DESK_WORKER_SECRET', 'DAILY_DESK_WORKER_BASE_URL', 'DAILY_DESK_WORKER_ID'] as const;
  for (const key of required) if (!values[key]?.trim()) throw new Error(`The Daily Desk worker environment file is missing ${key}.`);
  return values as WorkerEnvironment;
}

const args = process.argv.slice(2);
const envIndex = args.indexOf('--env-file');
if (envIndex < 0 || !args[envIndex + 1]) usage();
if (!args.includes('--schedule') && !args.includes('--once')) usage();
const environment = readEnvironment(args[envIndex + 1]);

async function main() {
  const worker = new MacMiniDailyDeskResearchWorker(
    environment.DAILY_DESK_WORKER_ID,
    new SignedDailyDeskWorkerTransport(environment.DAILY_DESK_WORKER_BASE_URL, environment.DAILY_DESK_WORKER_SECRET),
    new OpenRouterClient(environment.OPENROUTER_API_KEY),
  );
  const scheduled = args.includes('--schedule') ? await worker.scheduleDueRuns() : undefined;
  const ran = args.includes('--once') ? await worker.runOnce() : false;
  process.stdout.write(`${JSON.stringify({ scheduled, ran, boundary: 'signed-outbound-public-web-research-only' })}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'Daily Desk worker failed.'}\n`);
  process.exitCode = 1;
});
