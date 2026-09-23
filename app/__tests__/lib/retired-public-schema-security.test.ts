import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(__dirname, '../../..');
const migration = readFileSync(
  resolve(repositoryRoot, 'supabase/migrations/20260915183432_115_lock_down_retired_public_tables.sql'),
  'utf8',
);
const schemaManifest = readFileSync(
  resolve(repositoryRoot, 'app/__tests__/lib/retained-schema-manifest.test.ts'),
  'utf8',
);
const executableSql = migration
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/--.*$/gm, '');

function quotedNames(source: string, declaration: string) {
  const body = source.match(new RegExp(`${declaration} = \\[(.*?)\\] as const;`, 's'))?.[1];
  if (!body) throw new Error(`Could not find ${declaration}`);
  return [...body.matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

function migrationQuotedNames(source: string) {
  const body = source.match(/retired_tables constant text\[\] := array\[(.*?)\];/s)?.[1];
  if (!body) throw new Error('Could not find retired_tables array');
  return [...body.matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

const retiredManifestNames = quotedNames(schemaManifest, 'const retiredTables');
const retainedManifestNames = quotedNames(schemaManifest, 'const retainedTables');
const migrationNames = migrationQuotedNames(migration);

describe('retired public schema security contract', () => {
  it('covers the live advisor-offender relations', () => {
    expect(migration).toContain("'api_key'");
    expect(migration).toContain("'link_module_migrations'");
    expect(migration).toContain('and c.relkind in (\'r\', \'p\')');
  });

  it('covers every relation in the repository retirement manifest', () => {
    expect(retiredManifestNames.every((name) => migrationNames.includes(name))).toBe(true);
    expect(migrationNames.some((name) => retainedManifestNames.includes(name))).toBe(false);
  });

  it('fails closed for browser roles while preserving service access', () => {
    expect(migration).toContain('enable row level security');
    expect(migration).toContain('revoke all on table %I.%I from public, anon, authenticated');
    expect(migration).toContain('grant all on table %I.%I to service_role');
    expect(migration).toContain('drop policy if exists %I on %I.%I');
    expect(migration).not.toMatch(/create policy[\s\S]*?using\s*\(\s*true\s*\)/i);
  });

  it('does not make the correction destructive', () => {
    expect(executableSql).not.toMatch(/\b(drop|truncate|delete)\s+(table|schema|from)\b/i);
    expect(executableSql).not.toMatch(/select\s+.*\b(token|secret|password|api_key)\b/i);
  });
});
