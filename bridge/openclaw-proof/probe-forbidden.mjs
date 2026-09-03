#!/usr/bin/env node

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:18789';
const token = process.env.OPENCLAW_GATEWAY_TOKEN;
if (!token || token.length < 32) {
  process.stderr.write('OPENCLAW_GATEWAY_TOKEN is required for live denial probes.\n');
  process.exit(65);
}

const tools = [
  'exec',
  'write',
  'message',
  'conversations_send',
  'conversations_turn',
  'github_publish',
  'cron',
  'gateway',
  'nodes',
  'sessions_spawn',
  'browser',
];
const probes = [];

for (const tool of tools) {
  let response;
  try {
    response = await fetch(`${baseUrl}/tools/invoke`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ tool, args: {} }),
    });
  } catch (error) {
    process.stderr.write(`live denial probe could not reach the Gateway: ${error.message}\n`);
    process.exit(67);
  }
  probes.push({ tool, status: response.status, denied: response.status === 403 || response.status === 404 });
  await response.body?.cancel();
}

process.stdout.write(`${JSON.stringify({ endpoint: 'loopback', probes }, null, 2)}\n`);
