#!/usr/bin/env npx tsx
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'dotenv';
import { OpenRouterClient } from '@/lib/openrouter-core';
import { SignedPrivateResearchWorkerTransport, MacMiniProspectingWorker } from '@/lib/prospecting-worker';
import { SignedBenchmarkTransport, runMeasuredBenchmark } from '@/lib/prospecting-benchmark';

type WorkerEnvironment = {
  OPENROUTER_API_KEY: string;
  PROSPECTING_WORKER_SECRET: string;
  PROSPECTING_WORKER_BASE_URL: string;
  PROSPECTING_WORKER_ID: string;
  PROSPECTING_PROFILE_ID?: string;
  PROSPECTING_BENCHMARK_APPROVAL?: string;
};

function usage(): never {
  throw new Error('Usage: npx tsx scripts/run-prospecting-worker.ts --env-file /absolute/private.env [--schedule] [--once] [--benchmark]');
}

function readEnvironment(path: string): WorkerEnvironment {
  const absolute = resolve(path);
  const stat = statSync(absolute);
  if (!stat.isFile() || (stat.mode & 0o077) !== 0) {
    throw new Error('The Mac-mini worker environment file must be a regular chmod-600 file.');
  }
  const values = parse(readFileSync(absolute));
  const required = ['OPENROUTER_API_KEY', 'PROSPECTING_WORKER_SECRET', 'PROSPECTING_WORKER_BASE_URL', 'PROSPECTING_WORKER_ID'] as const;
  for (const key of required) if (!values[key]?.trim()) throw new Error(`The private worker environment file is missing ${key}.`);
  return values as WorkerEnvironment;
}

const args = process.argv.slice(2);
const envIndex = args.indexOf('--env-file');
if (envIndex < 0 || !args[envIndex + 1]) usage();
const environment = readEnvironment(args[envIndex + 1]);
const openRouter = new OpenRouterClient(environment.OPENROUTER_API_KEY);

async function main() {
  if (args.includes('--benchmark')) {
    if (environment.PROSPECTING_BENCHMARK_APPROVAL !== 'I_HAVE_EXPLICIT_APPROVAL') {
      throw new Error('Benchmarking is locked. Add PROSPECTING_BENCHMARK_APPROVAL=I_HAVE_EXPLICIT_APPROVAL only after explicit human approval.');
    }
    if (!environment.PROSPECTING_PROFILE_ID) throw new Error('PROSPECTING_PROFILE_ID is required for a measured benchmark.');
    const policy = await runMeasuredBenchmark({
      workerId: environment.PROSPECTING_WORKER_ID,
      profileId: environment.PROSPECTING_PROFILE_ID,
      transport: new SignedBenchmarkTransport(environment.PROSPECTING_WORKER_BASE_URL, environment.PROSPECTING_WORKER_SECRET),
      openRouter,
    });
    process.stdout.write(`${JSON.stringify({ benchmark: 'completed', policy })}\n`);
    return;
  }

  const worker = new MacMiniProspectingWorker(
    environment.PROSPECTING_WORKER_ID,
    new SignedPrivateResearchWorkerTransport(environment.PROSPECTING_WORKER_BASE_URL, environment.PROSPECTING_WORKER_SECRET),
    openRouter,
  );
  const scheduled = args.includes('--schedule') ? await worker.scheduleDueTasks() : undefined;
  const ran = args.includes('--once') ? await worker.runOnce() : false;
  if (!args.includes('--schedule') && !args.includes('--once')) usage();
  process.stdout.write(`${JSON.stringify({ scheduled, ran })}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'Private worker failed.'}\n`);
  process.exitCode = 1;
});
