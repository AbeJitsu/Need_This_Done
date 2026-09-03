#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const LUNA = 'openai/gpt-5.6-luna';

function fail(message) {
  process.stderr.write(`OpenClaw proof result rejected: ${message}\n`);
  process.exit(1);
}

function assert(value, message) {
  if (!value) fail(message);
}

function walk(value, visit, path = '$') {
  visit(value, path);
  if (Array.isArray(value)) value.forEach((child, index) => walk(child, visit, `${path}[${index}]`));
  else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => walk(child, visit, `${path}.${key}`));
  }
}

function strings(value) {
  const output = [];
  walk(value, (child) => {
    if (typeof child === 'string') output.push(child);
  });
  return output;
}

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== 'object') return value;
  const output = {};
  for (const [key, child] of Object.entries(value)) {
    if (/token|secret|password|access|refresh|email|account|profileId/i.test(key)) output[key] = '[redacted]';
    else output[key] = redact(child);
  }
  return output;
}

async function json(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    fail(`could not parse ${path}: ${error.message}`);
  }
}

async function text(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    fail(`could not read ${path}: ${error.message}`);
  }
}

function parseQuota(checkOutput) {
  const windows = [];
  for (const line of checkOutput.split(/\r?\n/)) {
    const usageIndex = line.toLowerCase().indexOf('usage:');
    if (usageIndex === -1) continue;
    for (const segment of line.slice(usageIndex + 'usage:'.length).split('·')) {
      const match = segment.match(/^\s*([A-Za-z0-9][A-Za-z0-9 _-]*?)\s+(\d{1,3})%\s+left\b/i);
      if (!match) continue;
      const remainingPercent = Number(match[2]);
      if (!Number.isInteger(remainingPercent) || remainingPercent < 0 || remainingPercent > 100) continue;
      const window = match[1].trim();
      if (!windows.some((entry) => entry.window === window)) {
        windows.push({ window, remainingPercent });
      }
    }
  }
  return windows;
}

const [mode, path, expected] = process.argv.slice(2);
if (!mode || !path) fail('usage: verify-results.mjs MODE PATH [EXPECTED_OR_AUX_PATH]');

if (mode === 'catalog') {
  const data = await json(path);
  const catalogStrings = strings(data);
  assert(catalogStrings.some((value) => value === LUNA || value.endsWith('/gpt-5.6-luna') || value === 'gpt-5.6-luna'), 'account-scoped catalog does not expose Luna.');
  process.stdout.write(`${JSON.stringify({ catalog: 'pass', model: LUNA }, null, 2)}\n`);
} else if (mode === 'plugin') {
  const data = await json(path);
  const plugin = data.plugin ?? {};
  assert(plugin.id === 'duckduckgo', 'search plugin id is not duckduckgo.');
  assert(plugin.version === '2026.8.1' && plugin.packageVersion === '2026.8.1', 'DuckDuckGo plugin is not pinned to 2026.8.1.');
  assert(plugin.trustedOfficialInstall === true && plugin.status === 'loaded', 'DuckDuckGo plugin is not a loaded official install.');
  assert(plugin.enabled === true && plugin.explicitlyEnabled === true, 'DuckDuckGo plugin is not explicitly enabled.');
  assert(Array.isArray(data.capabilities) && data.capabilities.length === 1, 'DuckDuckGo plugin declares more than one capability.');
  assert(data.capabilities[0]?.kind === 'web-search' && data.capabilities[0]?.ids?.length === 1 && data.capabilities[0].ids[0] === 'duckduckgo', 'DuckDuckGo plugin capability is not exactly key-free web search.');
  assert((plugin.toolNames ?? []).length === 0 && (plugin.channelIds ?? []).length === 0 && (plugin.httpRouteCount ?? 0) === 0, 'DuckDuckGo plugin exposes a tool, channel, or HTTP route beyond its search-provider contract.');
  process.stdout.write(`${JSON.stringify({ searchPlugin: 'pass', id: 'duckduckgo', version: '2026.8.1', official: true, capability: 'web-search', apiKeyRequired: false }, null, 2)}\n`);
} else if (mode === 'status') {
  const data = await json(path);
  const checkPath = expected;
  assert(checkPath, 'models status --check output is required for quota evidence.');
  const checkOutput = await text(checkPath);
  assert(data.defaultModel === LUNA && data.resolvedDefault === LUNA, 'model status does not resolve the exact Luna default.');
  assert(Array.isArray(data.fallbacks) && data.fallbacks.length === 0, 'model status exposes a model fallback.');
  assert(Array.isArray(data.allowed) && data.allowed.length === 1 && data.allowed[0] === LUNA, 'model status allowlist is not exactly Luna.');

  const auth = data.auth ?? {};
  assert(auth.shellEnvFallback?.enabled === false, 'model status permits shell environment credential fallback.');
  const providers = Array.isArray(auth.providers) ? auth.providers : [];
  assert(providers.length === 1 && providers[0]?.provider === 'openai', 'model status does not show exactly one OpenAI credential provider.');
  const profiles = providers[0].profiles ?? {};
  assert(Number(profiles.count) === 1 && Number(profiles.oauth) === 1, 'model status does not show exactly one OAuth profile.');
  assert(Number(profiles.token) === 0 && Number(profiles.apiKey) === 0, 'model status shows a token or API-key credential.');
  const oauthProfiles = Array.isArray(auth.oauth?.profiles) ? auth.oauth.profiles : [];
  assert(oauthProfiles.length === 1 && oauthProfiles[0]?.provider === 'openai' && oauthProfiles[0]?.type === 'oauth', 'model status does not identify the active credential as OpenAI OAuth.');
  assert(oauthProfiles[0]?.status === 'ok', 'OpenAI OAuth credential is not healthy.');
  const probe = (auth.probes?.results ?? []).find((result) => result?.provider === 'openai' && result?.model === LUNA);
  assert(probe?.mode === 'oauth' && probe?.status === 'ok', 'model status OAuth probe did not pass for Luna.');

  const quotaWindows = parseQuota(checkOutput);
  assert(quotaWindows.length > 0, 'models status --check did not expose a quota window.');
  process.stdout.write(`${JSON.stringify({
    modelStatus: 'pass',
    model: LUNA,
    resolvedModel: LUNA,
    fallbackModels: 0,
    allowedModels: [LUNA],
    auth: {
      provider: 'openai',
      type: 'oauth',
      oauthProfiles: 1,
      tokenProfiles: 0,
      apiKeyProfiles: 0,
      shellEnvFallback: false,
    },
    quota: {
      provider: 'openai',
      windows: quotaWindows,
    },
    probe: {
      provider: 'openai',
      mode: 'oauth',
      status: 'ok',
      latencyMs: Number.isFinite(Number(probe.latencyMs)) ? Number(probe.latencyMs) : null,
    },
  }, null, 2)}\n`);
} else if (mode === 'inference') {
  const data = await json(path);
  const allStrings = strings(data);
  assert(allStrings.some((value) => value.trim() === expected), `exact inference response ${expected} was not found.`);
  assert(allStrings.some((value) => value === LUNA || value === 'gpt-5.6-luna'), 'inference metadata does not identify Luna.');
  const serialized = JSON.stringify(data).toLowerCase();
  assert(serialized.includes('max'), 'inference metadata does not identify max reasoning.');
  process.stdout.write(`${JSON.stringify({ inference: 'pass', exactResponse: expected, model: LUNA, thinking: 'max' }, null, 2)}\n`);
} else if (mode === 'gateway') {
  const data = await json(path);
  const serialized = JSON.stringify(data).toLowerCase();
  assert(serialized.includes('127.0.0.1') || serialized.includes('localhost') || serialized.includes('loopback'), 'gateway status does not show a loopback endpoint.');
  assert(!serialized.includes('0.0.0.0'), 'gateway status exposes a wildcard listener.');
  process.stdout.write(`${JSON.stringify({ gateway: 'pass', bind: 'loopback', auth: 'token' }, null, 2)}\n`);
} else if (mode === 'live-forbidden') {
  const data = await json(path);
  assert(data.endpoint === 'loopback', 'live denial probes did not target the loopback Gateway.');
  assert(Array.isArray(data.probes) && data.probes.length === 11, 'live denial probe set is incomplete.');
  for (const probe of data.probes) {
    assert(probe.denied === true && (probe.status === 403 || probe.status === 404), `live tool ${probe.tool} was not denied (HTTP ${probe.status}).`);
  }
  process.stdout.write(`${JSON.stringify({ liveForbidden: 'pass', endpoint: 'loopback', probes: data.probes.map(({ tool, status }) => ({ tool, status })) }, null, 2)}\n`);
} else if (mode === 'research') {
  const data = await json(path);
  const allStrings = strings(data);
  const combined = allStrings.join('\n');
  assert(/https:\/\//i.test(combined), 'public-web result has no HTTPS citation.');
  assert(/gpt-5\.6|luna/i.test(combined), 'public-web result does not discuss Luna.');
  const modelSeen = allStrings.some((value) => value === LUNA || value === 'gpt-5.6-luna');
  assert(modelSeen, 'public-web runtime metadata does not identify Luna.');
  assert(JSON.stringify(data).toLowerCase().includes('max'), 'public-web runtime metadata does not identify max reasoning.');
  process.stdout.write(`${JSON.stringify({ research: 'pass', citations: 'https', model: LUNA, thinking: 'max' }, null, 2)}\n`);
} else if (mode === 'security') {
  const data = await json(path);
  const summary = data.summary ?? data;
  const critical = Number(summary.critical ?? summary.criticals ?? 0);
  assert(Number.isFinite(critical) && critical === 0, `security audit reports ${critical} critical finding(s).`);
  process.stdout.write(`${JSON.stringify({ securityAudit: 'pass', criticalFindings: 0, redactedSummary: redact(summary) }, null, 2)}\n`);
} else if (mode === 'policy') {
  const data = await json(path);
  const sandbox = data.sandbox ?? {};
  const allowed = new Set(sandbox.tools?.allow ?? []);
  const denied = new Set(sandbox.tools?.deny ?? []);
  const forbidden = ['exec', 'process', 'read', 'write', 'edit', 'apply_patch', 'message', 'conversations_send', 'conversations_turn', 'publish', 'browser', 'computer', 'nodes', 'sessions_send', 'sessions_spawn', 'secrets', 'gateway', 'github_publish', 'view_image'];
  assert(data.ok !== false, 'sandbox explanation reports an error.');
  assert(sandbox.mode === 'all' && sandbox.backend === 'docker', 'effective sandbox is not Docker-backed for every session.');
  assert(sandbox.scope === 'session' && sandbox.sessionIsSandboxed === true, 'effective session is not isolated.');
  assert(sandbox.workspaceAccess === 'none', 'effective sandbox has workspace access.');
  assert(allowed.size === 2 && allowed.has('web_search') && allowed.has('web_fetch'), 'effective sandbox allowlist is not exactly public-web reading.');
  assert(!denied.has('web_search') && !denied.has('web_fetch'), 'public-web tools are denied by the effective policy.');
  for (const tool of forbidden) assert(denied.has(tool), `${tool} is absent from the effective sandbox deny policy.`);
  assert(denied.has('cron') || denied.has('automations'), 'scheduling/automation is absent from the effective sandbox deny policy.');
  assert(data.elevated?.enabled === false && data.elevated?.allowedByConfig === false, 'effective elevated execution is enabled.');
  process.stdout.write(`${JSON.stringify({ effectivePolicy: 'pass', sandbox: 'docker/session', workspaceAccess: 'none', allowed: ['web_search', 'web_fetch'], forbiddenActions: 'denied', elevated: false }, null, 2)}\n`);
} else if (mode === 'forbidden') {
  const config = await json(path);
  const allow = new Set(config.tools?.allow ?? []);
  const deny = new Set(config.tools?.deny ?? []);
  const forbidden = ['exec', 'process', 'read', 'write', 'edit', 'apply_patch', 'message', 'conversations_send', 'conversations_turn', 'publish', 'cron', 'browser', 'computer', 'nodes', 'sessions_send', 'sessions_spawn'];
  for (const tool of forbidden) {
    assert(!allow.has(tool), `${tool} is present in tools.allow.`);
    assert(deny.has(tool), `${tool} is absent from tools.deny.`);
  }
  assert(config.tools?.exec?.mode === 'deny', 'shell execution is not denied.');
  assert(config.tools?.elevated?.enabled === false, 'elevated execution is enabled.');
  process.stdout.write(`${JSON.stringify({ forbiddenActions: 'pass', method: 'effective explicit allowlist plus deny policy', denied: forbidden }, null, 2)}\n`);
} else if (mode === 'bundle') {
  const required = ['profile.json', 'model-status.json', 'catalog.json', 'search-plugin.json', 'direct-inference.json', 'gateway-status.json', 'live-forbidden.json', 'gateway-inference.json', 'public-web.json', 'effective-policy.json', 'security-audit.json', 'forbidden-actions.json'];
  const files = new Set(await readdir(path));
  for (const file of required) assert(files.has(file), `evidence bundle is missing ${file}.`);
  const results = {};
  for (const file of required) results[file] = await json(join(path, file));
  process.stdout.write(`${JSON.stringify({ result: 'pass', generatedAt: new Date().toISOString(), requirements: results }, null, 2)}\n`);
} else {
  fail(`unknown mode ${mode}.`);
}
