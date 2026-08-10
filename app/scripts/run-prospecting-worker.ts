#!/usr/bin/env npx tsx
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'dotenv';
import { parseOpenRouterModelConfig } from '@/lib/openrouter-model-config';
import { OpenRouterClient } from '@/lib/openrouter-core';
import { SignedPrivateResearchWorkerTransport, MacMiniProspectingWorker } from '@/lib/prospecting-worker';
import { SignedBenchmarkTransport, runConfiguredModelComparison } from '@/lib/prospecting-benchmark';

type WorkerEnvironment = {
  OPENROUTER_API_KEY: string;
  OPENROUTER_PRIMARY_MODEL: string;
  OPENROUTER_TEST_MODEL: string;
  PROSPECTING_WORKER_SECRET: string;
  PROSPECTING_WORKER_BASE_URL: string;
  PROSPECTING_WORKER_ID: string;
  PROSPECTING_PROFILE_ID?: string;
  PROSPECTING_BENCHMARK_APPROVAL?: string;
  PROSPECTING_PRIMARY_MODEL_APPROVAL?: string;
};

function usage(): never {
  throw new Error('Usage: npx tsx scripts/run-prospecting-worker.ts --env-file /absolute/private.env [--schedule] [--once] [--pin-primary] [--benchmark|--compare-models]');
}

function readEnvironment(path: string): WorkerEnvironment {
  const absolute = resolve(path);
  const stat = statSync(absolute);
  if (!stat.isFile() || (stat.mode & 0o077) !== 0) {
    throw new Error('The Mac-mini worker environment file must be a regular chmod-600 file.');
  }
  const values = parse(readFileSync(absolute));
  if (values.NEXT_PUBLIC_OPENROUTER_PRIMARY_MODEL || values.NEXT_PUBLIC_OPENROUTER_TEST_MODEL) {
    throw new Error('The private worker environment must not define NEXT_PUBLIC OpenRouter model variables.');
  }
  const required = ['OPENROUTER_API_KEY', 'PROSPECTING_WORKER_SECRET', 'PROSPECTING_WORKER_BASE_URL', 'PROSPECTING_WORKER_ID'] as const;
  for (const key of required) if (!values[key]?.trim()) throw new Error(`The private worker environment file is missing ${key}.`);
  const modelConfig = parseOpenRouterModelConfig(values);
  return {
    ...values,
    OPENROUTER_PRIMARY_MODEL: modelConfig.primaryModel,
    OPENROUTER_TEST_MODEL: modelConfig.testModel,
  } as WorkerEnvironment;
}

const args = process.argv.slice(2);
const envIndex = args.indexOf('--env-file');
if (envIndex < 0 || !args[envIndex + 1]) usage();
const environment = readEnvironment(args[envIndex + 1]);
const openRouter = new OpenRouterClient(environment.OPENROUTER_API_KEY);
const privateTransport = new SignedPrivateResearchWorkerTransport(environment.PROSPECTING_WORKER_BASE_URL, environment.PROSPECTING_WORKER_SECRET);

async function main() {
  const pinPrimary = args.includes('--pin-primary');
  const compareModels = args.includes('--benchmark') || args.includes('--compare-models');
  if ((pinPrimary && compareModels) || (pinPrimary && (args.includes('--schedule') || args.includes('--once'))) || (compareModels && (args.includes('--schedule') || args.includes('--once')))) usage();

  if (pinPrimary) {
    if (environment.PROSPECTING_PRIMARY_MODEL_APPROVAL !== 'I_HAVE_EXPLICIT_APPROVAL') {
      throw new Error('Primary model pinning is locked. Add PROSPECTING_PRIMARY_MODEL_APPROVAL=I_HAVE_EXPLICIT_APPROVAL only after explicit human approval.');
    }
    if (!environment.PROSPECTING_PROFILE_ID) throw new Error('PROSPECTING_PROFILE_ID is required to pin the primary model.');
    await privateTransport.pinPrimary(environment.PROSPECTING_WORKER_ID, environment.PROSPECTING_PROFILE_ID, environment.OPENROUTER_PRIMARY_MODEL);
    process.stdout.write(`${JSON.stringify({ primaryModelPinned: true })}\n`);
    return;
  }

  if (compareModels) {
    if (environment.PROSPECTING_BENCHMARK_APPROVAL !== 'I_HAVE_EXPLICIT_APPROVAL') {
      throw new Error('Model comparison is locked. Add PROSPECTING_BENCHMARK_APPROVAL=I_HAVE_EXPLICIT_APPROVAL only after explicit human approval.');
    }
    if (!environment.PROSPECTING_PROFILE_ID) throw new Error('PROSPECTING_PROFILE_ID is required for model comparison.');
    await runConfiguredModelComparison({
      workerId: environment.PROSPECTING_WORKER_ID,
      profileId: environment.PROSPECTING_PROFILE_ID,
      transport: new SignedBenchmarkTransport(environment.PROSPECTING_WORKER_BASE_URL, environment.PROSPECTING_WORKER_SECRET),
      openRouter,
      modelConfig: { primaryModel: environment.OPENROUTER_PRIMARY_MODEL, testModel: environment.OPENROUTER_TEST_MODEL },
    });
    process.stdout.write(`${JSON.stringify({ benchmark: 'completed', comparisonOnly: true })}\n`);
    return;
  }

  const worker = new MacMiniProspectingWorker(
    environment.PROSPECTING_WORKER_ID,
    privateTransport,
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
