import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Exposure = 'public' | 'operator' | 'signed_worker' | 'signed_webhook' | 'retired';
type Capability = {
  route: string;
  methods: string[];
  exposure: Exposure;
  capability: string;
  evidence: string[];
};

const appRoot = resolve(__dirname, '..');
const repositoryRoot = resolve(appRoot, '..');
const manifestPath = resolve(appRoot, 'config/capability-manifest.json');
const routeRoot = resolve(appRoot, 'app');
const allowedMethods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'];
const allowedExposure: Exposure[] = ['public', 'operator', 'signed_worker', 'signed_webhook', 'retired'];

function routeFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? routeFiles(path) : entry.name === 'route.ts' ? [path] : [];
  });
}

function routeForFile(file: string) {
  const route = `/${relative(routeRoot, dirname(file)).replaceAll('\\', '/')}`;
  return route === '/.' ? '/' : route;
}

function methodsForSource(source: string) {
  const methods = new Set<string>();
  for (const match of source.matchAll(/export\s+(?:async\s+)?function\s+(DELETE|GET|HEAD|OPTIONS|PATCH|POST|PUT)\b/g)) methods.add(match[1]);
  for (const match of source.matchAll(/export\s+const\s+(DELETE|GET|HEAD|OPTIONS|PATCH|POST|PUT)\s*=/g)) methods.add(match[1]);
  for (const match of source.matchAll(/\bas\s+(DELETE|GET|HEAD|OPTIONS|PATCH|POST|PUT)\b/g)) methods.add(match[1]);
  return [...methods].sort();
}

describe('HTTP capability manifest', () => {
  it('classifies every route and rejects stale or incomplete entries', () => {
    expect(existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Capability[];
    const files = routeFiles(routeRoot);
    const actualRoutes = files.map(routeForFile).sort();
    const manifestRoutes = manifest.map((entry) => entry.route).sort();

    expect(new Set(manifestRoutes).size).toBe(manifestRoutes.length);
    expect(manifestRoutes).toEqual(actualRoutes);

    for (const entry of manifest) {
      expect(entry.capability.trim().length).toBeGreaterThan(4);
      expect(allowedExposure).toContain(entry.exposure);
      expect(entry.methods.length).toBeGreaterThan(0);
      expect(entry.methods.every((method) => allowedMethods.includes(method))).toBe(true);
      expect(entry.evidence.length).toBeGreaterThan(0);
      for (const evidence of entry.evidence) expect(existsSync(resolve(repositoryRoot, evidence))).toBe(true);

      const file = files.find((candidate) => routeForFile(candidate) === entry.route);
      expect(file).toBeDefined();
      const source = readFileSync(file!, 'utf8');
      expect(entry.methods.slice().sort()).toEqual(methodsForSource(source));

      if (entry.exposure === 'operator') {
        expect(source).toMatch(/verifyAdmin(?:Auth)?\s*\(/);
        expect(source).not.toMatch(/verifyProjectAccess\s*\(|verifyAuth\s*\(/);
      }
      if (entry.exposure === 'retired') {
        expect(source).toMatch(/status:\s*410/);
      }
      if (entry.exposure === 'signed_worker') {
        expect(source).toMatch(/verifySigned(?:AgentBridge|Worker|DailyDeskWorker)Request\s*\(/);
      }
      if (entry.exposure === 'signed_webhook') {
        expect(source).toMatch(/signature|verifyResendWebhook|Webhook\(/i);
      }
    }
  });
});
