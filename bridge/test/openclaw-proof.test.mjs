import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { test } from 'node:test';

const execFileAsync = promisify(execFile);
const patchUrl = new URL('../openclaw-proof/openclaw-luna-max.patch.json', import.meta.url);
const verifierUrl = new URL('../openclaw-proof/verify-profile.mjs', import.meta.url);
const runnerUrl = new URL('../openclaw-proof/run-proof.sh', import.meta.url);
const forbiddenProbeUrl = new URL('../openclaw-proof/probe-forbidden.mjs', import.meta.url);
const resultsVerifierUrl = new URL('../openclaw-proof/verify-results.mjs', import.meta.url);
const runbookUrl = new URL('../openclaw-proof/RUNBOOK.txt', import.meta.url);

test('OpenClaw proof profile is Luna/max, OAuth-only, loopback, and web-read-only', async () => {
  const config = JSON.parse(await readFile(patchUrl, 'utf8'));

  assert.equal(config.agents.defaults.model.primary, 'openai/gpt-5.6-luna');
  assert.deepEqual(config.agents.defaults.model.fallbacks, []);
  assert.equal(config.agents.defaults.thinkingDefault, 'max');
  assert.equal(config.agents.defaults.fastModeDefault, false);
  assert.deepEqual(Object.keys(config.agents.defaults.models), ['openai/gpt-5.6-luna']);
  assert.deepEqual(config.auth.order.openai, ['openai:needthisdone-oauth']);
  assert.equal(config.auth.profiles['openai:needthisdone-oauth'].mode, 'oauth');

  assert.equal(config.gateway.bind, 'loopback');
  assert.equal(config.gateway.auth.mode, 'token');
  assert.equal(config.gateway.auth.token.source, 'env');
  assert.equal(config.gateway.controlUi.enabled, false);
  assert.equal(config.gateway.http.endpoints.chatCompletions.enabled, false);
  assert.equal(config.gateway.http.endpoints.responses.enabled, false);

  assert.deepEqual(config.tools.allow, ['web_search', 'web_fetch']);
  assert.equal(config.tools.web.search.provider, 'duckduckgo');
  assert.deepEqual(config.plugins.allow, ['openai', 'duckduckgo', 'web-readability']);
  assert.equal(config.discovery.mdns.mode, 'off');
  assert.equal(config.agents.defaults.sandbox.mode, 'all');
  assert.equal(config.agents.defaults.sandbox.workspaceAccess, 'none');
  assert.equal(config.agents.defaults.sandbox.docker.network, 'none');
  assert.equal(config.tools.elevated.enabled, false);
  assert.deepEqual(config.channels, {});
  assert.equal(config.cron.enabled, false);
  assert.equal(config.hooks.enabled, false);

  const serialized = JSON.stringify(config).toLowerCase();
  assert.doesNotMatch(serialized, /openrouter|api[_-]?key|"ultra"/);

  await execFileAsync(process.execPath, [verifierUrl.pathname, patchUrl.pathname]);
});

test('OpenClaw proof runner strips paid-key fallbacks and removes raw success artifacts', async () => {
  const runner = await readFile(runnerUrl, 'utf8');

  assert.match(runner, /env -u OPENAI_API_KEY -u OPENROUTER_API_KEY -u CODEX_API_KEY/);
  assert.match(runner, /--model "\$model" --thinking max/);
  assert.match(runner, /gateway run --bind loopback --auth token/);
  assert.match(runner, /verify-results\.mjs" status/);
  assert.match(runner, /model-status-check\.raw\.txt/);
  assert.match(runner, /model-status\.json/);
  assert.match(runner, /verify-results\.mjs" policy/);
  assert.match(runner, /security audit --deep --json/);
  assert.match(runner, /probe-forbidden\.mjs/);
  assert.match(runner, /gateway\.error\.log/);
  assert.match(runner, /rm -f/);

  const forbiddenProbe = await readFile(forbiddenProbeUrl, 'utf8');
  assert.match(forbiddenProbe, /tools\/invoke/);
  assert.match(forbiddenProbe, /response\.status === 403 \|\| response\.status === 404/);

  const resultsVerifier = await readFile(resultsVerifierUrl, 'utf8');
  assert.match(resultsVerifier, /mode === 'status'/);
  assert.match(resultsVerifier, /quotaWindows/);

  const runbook = await readFile(runbookUrl, 'utf8');
  assert.match(runbook, /update --tag 2026\.8\.1/);
  assert.match(runbook, /plugins install[\s\S]*duckduckgo-plugin@2026\.8\.1/);
  assert.match(runbook, /docker build --tag openclaw-sandbox:bookworm-slim/);
  assert.match(runbook, /model-status\.json[\s\S]*quota-window percentages/);
});
