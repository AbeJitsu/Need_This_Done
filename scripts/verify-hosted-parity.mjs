#!/usr/bin/env node

// Hosted parity is an internal release gate. It may inspect the linked cloud
// project and create only disposable .invalid fixture identities when the
// explicit acknowledgement is present. It never sends mail, calls a provider,
// uploads object bytes, publishes content, or changes a model/provider setting.

import { randomBytes, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const expectedProjectRef = 'oxhjtmozsdstbokwtnwa';
const expectedEndpoint = `https://${expectedProjectRef}.supabase.co`;
const expectedBranch = 'dev';
const requiredFixtureAcknowledgement = 'I_UNDERSTAND_THIS_CREATES_DISPOSABLE_HOSTED_FIXTURES';
const cloudProfilePath = resolve(repositoryRoot, '.env.cloud.profile');
const manifestTestPath = resolve(repositoryRoot, 'app/__tests__/lib/retained-schema-manifest.test.ts');
const appPackagePath = resolve(repositoryRoot, 'app/package.json');
const requireFromApp = createRequire(appPackagePath);
const { createClient } = requireFromApp('@supabase/supabase-js');

const retainedSource = readFileSync(manifestTestPath, 'utf8');

function parseConstArray(name) {
  const match = retainedSource.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\] as const;`));
  if (!match) throw new Error(`retained manifest array missing: ${name}`);
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
}

const retainedTables = parseConstArray('retainedTables');
const retiredTables = parseConstArray('retiredTables');
const retiredViews = parseConstArray('retiredViews');
const retiredBuckets = parseConstArray('retiredBuckets');

const expectedBuckets = {
  'project-attachments': {
    public: false,
    file_size_limit: 5 * 1024 * 1024,
    allowed_mime_types: [
      'application/msword',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/plain',
    ],
  },
  'agent-media-private': {
    public: false,
    file_size_limit: 50 * 1024 * 1024,
    allowed_mime_types: [
      'application/x-subrip',
      'audio/mpeg',
      'audio/wav',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/plain',
      'text/vtt',
      'video/mp4',
    ],
  },
};

const requiredPolicyMarkers = [
  'members read customer',
  'members read memberships',
  'members read employees',
  'members read work',
  'members read decisions',
  'members read outcomes',
  'admins read growth profiles',
  'admins read prospects',
  'admins read prospect dossiers',
  'operators own agent plans',
  'operators read agent plan events',
  'operators read OpenClaw usage',
  'operators read prospecting provenance',
  'No direct insert',
  'owners read cockpit actions',
  'owners read daily reflections',
  'owners read weekly priorities',
];

const serviceOnlyFunctions = [
  'claim_agent_orchestration_task',
  'claim_openclaw_agent_orchestration_task',
  'claim_private_prospecting_task',
  'complete_agent_orchestration_task',
  'complete_openclaw_orchestration_task',
  'get_calendar_access_token',
  'get_calendar_refresh_token',
  'pin_private_primary_model',
  'queue_due_private_prospecting_tasks',
  'record_agent_task_event',
  'record_openclaw_prospecting_result',
  'reconcile_openclaw_model_usage',
  'reserve_openclaw_model_usage',
];

const authenticatedFunctions = [
  'approve_agent_plan',
  'create_agent_plan',
  'dispatch_agent_plan',
  'record_ai_employee_decision',
];

class ParityFailure extends Error {}

function fail(label) {
  throw new ParityFailure(label);
}

function readProfile(profilePath) {
  const values = {};
  for (const line of readFileSync(profilePath, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    let value = line.slice(separator + 1);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[line.slice(0, separator)] = value;
  }
  return values;
}

function redact(value, environment = {}) {
  let result = String(value || '');
  for (const [key, secret] of Object.entries(environment)) {
    if (secret && secret.length > 8 && /(KEY|SECRET|TOKEN|PASSWORD|PRIVATE|CREDENTIAL)/i.test(key)) {
      result = result.split(secret).join('[redacted]');
    }
  }
  return result
    .replace(/(supabase[_-]?access[_-]?token\s*[=:]\s*)[^\s\n]+/gi, '$1[redacted]')
    .replace(/(service[_-]?role[_-]?key\s*[=:]\s*)[^\s\n]+/gi, '$1[redacted]')
    .replace(/(postgres(?:ql)?:\/\/)[^\s\n]+/gi, '$1[redacted]');
}

function run(command, args, environment, label, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    env: environment,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (result.error || result.status !== 0) {
    fail(label);
  }
  return options.raw ? output : redact(output, environment);
}

function assertEqual(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(label);
}

function sorted(values) {
  return [...values].sort((left, right) => String(left).localeCompare(String(right)));
}

function parseRemoteVersions(output) {
  const versions = [];
  for (const line of output.split(/\r?\n/)) {
    const parts = line.split('|').map((part) => part.trim());
    if (/^[0-9]{3}$/.test(parts[1] || '')) versions.push(parts[1]);
  }
  return versions;
}

function repositoryVersions() {
  return readdirSync(resolve(repositoryRoot, 'supabase/migrations'))
    .map((filename) => filename.match(/^(\d{3})_/))
    .filter(Boolean)
    .map((match) => match[1])
    .sort();
}

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableObject(value[key])]));
  }
  return value;
}

function normalizeStorageObject(value) {
  return stableObject({
    id: value.id ?? null,
    name: value.name ?? null,
    metadata: value.metadata ?? null,
    created_at: value.created_at ?? null,
    updated_at: value.updated_at ?? null,
    last_accessed_at: value.last_accessed_at ?? null,
    etag: value.etag ?? null,
    version: value.version ?? null,
  });
}

function createSupabaseClients(profile) {
  const options = { auth: { autoRefreshToken: false, persistSession: false } };
  return {
    service: createClient(profile.NEXT_PUBLIC_SUPABASE_URL, profile.SUPABASE_SERVICE_ROLE_KEY, options),
    anon: createClient(profile.NEXT_PUBLIC_SUPABASE_URL, profile.NEXT_PUBLIC_SUPABASE_ANON_KEY, options),
  };
}

async function storageObjects(client, bucket) {
  const objects = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await client.storage.from(bucket).list('', {
      limit: 100,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) fail(`storage list failed: ${bucket}`);
    objects.push(...(data || []));
    if ((data || []).length < 100) break;
  }
  return objects.sort((left, right) => String(left.name).localeCompare(String(right.name)));
}

async function callRpc(client, name, args, label) {
  const { data, error } = await client.rpc(name, args);
  if (error) fail(label);
  return data;
}

async function expectRpcError(client, name, args, label) {
  const { data, error } = await client.rpc(name, args);
  if (!error) fail(label);
  return { denied: true, returnedData: data === null };
}

async function expectQueryError(operation, label) {
  const { data, error } = await operation();
  if (!error) fail(label);
  return { denied: true, returnedData: data === null };
}

async function insertOne(client, table, values, label) {
  const { data, error } = await client.from(table).insert(values).select().single();
  if (error || !data) fail(label);
  return data;
}

async function updateOne(client, table, values, column, value, label) {
  const { error } = await client.from(table).update(values).eq(column, value);
  if (error) fail(label);
}

async function deleteWhere(client, table, column, value) {
  if (value === undefined || value === null) return;
  const { error } = await client.from(table).delete().eq(column, value);
  if (error) throw new Error(`cleanup ${table}`);
}

async function createUser(service, email, password) {
  const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) fail('fixture user creation failed');
  return data.user;
}

async function signIn(profile, email, password) {
  const client = createClient(profile.NEXT_PUBLIC_SUPABASE_URL, profile.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) fail('fixture sign-in failed');
  return client;
}

async function fixtureSetup(profile, clients, report) {
  if (process.env.NEEDTHISDONE_HOSTED_FIXTURE_ACK !== requiredFixtureAcknowledgement) {
    fail('hosted fixture acknowledgement is missing');
  }

  const runTag = randomBytes(6).toString('hex');
  const password = randomBytes(24).toString('base64url');
  const fixture = {
    users: {},
    userClients: {},
    customers: {},
    employees: {},
    work: {},
    profiles: {},
    ids: {
      plan: null,
      run: null,
      task: null,
      artifact: null,
      reservation: null,
      provenance: null,
      decision: null,
    },
  };
  try {
  const userSpecs = [
    ['owner-a', 'owner'],
    ['manager-a', 'manager'],
    ['viewer-a', 'viewer'],
    ['owner-b', 'owner'],
  ];
  const users = fixture.users;
  for (const [key, label] of userSpecs) {
    const email = `ntd-parity-${runTag}-${key}-${label}@fixture.invalid`;
    users[key] = await createUser(clients.service, email, password);
  }
  report.fixtures.created_users = Object.keys(users).length;

  const customerA = await insertOne(clients.service, 'customer_accounts', { name: `Parity Customer A ${runTag}` }, 'customer A fixture creation failed');
  fixture.customers.a = customerA;
  const customerB = await insertOne(clients.service, 'customer_accounts', { name: `Parity Customer B ${runTag}` }, 'customer B fixture creation failed');
  fixture.customers.b = customerB;
  const employeeA = await insertOne(clients.service, 'ai_employees', { customer_id: customerA.id, name: `Parity Employee A ${runTag}` }, 'employee A fixture creation failed');
  fixture.employees.a = employeeA;
  const employeeB = await insertOne(clients.service, 'ai_employees', { customer_id: customerB.id, name: `Parity Employee B ${runTag}` }, 'employee B fixture creation failed');
  fixture.employees.b = employeeB;
  const workA = await insertOne(clients.service, 'ai_employee_work_items', {
    employee_id: employeeA.id,
    queue: 'morning',
    title: 'Disposable parity decision',
    proposed_action: 'Review a disposable fixture only.',
    expected_outcome: 'No external action.',
    priority: 1,
  }, 'employee work fixture creation failed');
  fixture.work.a = workA;
  const workB = await insertOne(clients.service, 'ai_employee_work_items', {
    employee_id: employeeB.id,
    queue: 'morning',
    title: 'Cross-customer fixture',
    proposed_action: 'Remain isolated.',
    expected_outcome: 'No external action.',
    priority: 1,
  }, 'cross-customer work fixture creation failed');
  fixture.work.b = workB;
  await clients.service.from('customer_memberships').insert([
    { customer_id: customerA.id, user_id: users['owner-a'].id, role: 'owner' },
    { customer_id: customerA.id, user_id: users['manager-a'].id, role: 'manager' },
    { customer_id: customerA.id, user_id: users['viewer-a'].id, role: 'viewer' },
    { customer_id: customerB.id, user_id: users['owner-b'].id, role: 'owner' },
  ]).then(({ error }) => { if (error) fail('customer membership fixture creation failed'); });

  await clients.service.from('user_roles').upsert([
    { user_id: users['owner-a'].id, role: 'admin' },
    { user_id: users['owner-b'].id, role: 'admin' },
  ], { onConflict: 'user_id' }).then(({ error }) => { if (error) fail('operator role fixture creation failed'); });

  const profileA = await insertOne(clients.service, 'growth_profiles', {
    owner_id: users['owner-a'].id,
    target_market: 'disposable fixture businesses',
    geography: 'Fixture Region',
    offer: 'No external offer; parity only',
    sender_name: 'Parity Fixture',
    sender_email: `owner-a-${runTag}@fixture.invalid`,
    model_route: 'selected-primary',
    selected_model_id: 'provider/fixture-model',
    selected_model_rationale: 'Hosted parity fixture only',
    emergency_stop: false,
  }, 'growth profile A fixture creation failed');
  fixture.profiles.a = profileA;
  const profileB = await insertOne(clients.service, 'growth_profiles', {
    owner_id: users['owner-b'].id,
    target_market: 'disposable cross-customer fixture',
    geography: 'Fixture Region',
    offer: 'No external offer; parity only',
    sender_name: 'Parity Fixture',
    sender_email: `owner-b-${runTag}@fixture.invalid`,
    model_route: 'selected-primary',
    selected_model_id: 'provider/fixture-model',
    selected_model_rationale: 'Hosted parity fixture only',
    emergency_stop: false,
  }, 'growth profile B fixture creation failed');
  fixture.profiles.b = profileB;

  const userClients = fixture.userClients;
  for (const [key, label] of userSpecs) {
    const user = users[key];
    userClients[key] = await signIn(profile, user.email, password);
  }

  return fixture;
  } catch (error) {
    await cleanupFixtures(clients, fixture, report);
    throw error;
  }
}

async function cleanupFixtures(clients, fixture, report) {
  if (!fixture) return;
  const errors = [];
  const attempt = async (operation) => {
    try {
      await operation();
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'cleanup operation failed');
    }
  };
  const service = clients.service;
  const userIds = Object.values(fixture.users || {}).map((user) => user.id);
  const ownerIds = userIds;
  let cleanedUsers = 0;

  await attempt(async () => { if (fixture.ids.provenance) await deleteWhere(service, 'prospecting_artifact_provenance', 'id', fixture.ids.provenance); });
  await attempt(async () => { if (fixture.ids.decision) await deleteWhere(service, 'ai_employee_decisions', 'id', fixture.ids.decision); });
  for (const [table, column] of [
    ['agent_artifact_versions', 'owner_id'],
    ['agent_artifacts', 'owner_id'],
    ['openclaw_model_usage_reservations', 'owner_id'],
    ['agent_run_events', 'owner_id'],
    ['agent_plan_events', 'owner_id'],
    ['agent_run_commands', 'owner_id'],
    ['agent_orchestration_tasks', 'owner_id'],
    ['agent_plans', 'owner_id'],
    ['agent_runs', 'owner_id'],
    ['growth_profiles', 'owner_id'],
  ]) {
    for (const ownerId of ownerIds) {
      await attempt(() => deleteWhere(service, table, column, ownerId));
    }
  }
  for (const [table, column, values] of [
    ['ai_employee_work_items', 'employee_id', [fixture.employees?.a?.id, fixture.employees?.b?.id]],
    ['customer_memberships', 'customer_id', [fixture.customers?.a?.id, fixture.customers?.b?.id]],
    ['ai_employees', 'id', [fixture.employees?.a?.id, fixture.employees?.b?.id]],
    ['customer_accounts', 'id', [fixture.customers?.a?.id, fixture.customers?.b?.id]],
  ]) {
    const ids = values.filter(Boolean);
    if (!ids.length) continue;
    await attempt(async () => {
      const { error } = await service.from(table).delete().in(column, ids);
      if (error) throw new Error(`cleanup ${table}`);
    });
  }
  await attempt(async () => {
    if (userIds.length) {
      const { error } = await service.from('user_roles').delete().in('user_id', userIds);
      if (error) throw new Error('cleanup user roles');
    }
  });
  for (const userId of userIds) {
    await attempt(async () => {
      const { error } = await service.auth.admin.deleteUser(userId);
      if (error) throw new Error('cleanup auth user');
      cleanedUsers += 1;
    });
  }
  report.fixtures.cleaned_users = cleanedUsers;
  report.fixtures.cleanup_errors = errors.length;
  report.fixtures.cleanup_failures = errors;
  if (errors.length) fail('fixture cleanup failed');
}

async function verifySchemaAndHistory(profile, environment, report) {
  const historyOutput = run('supabase', ['migration', 'list', '--linked'], environment, 'hosted migration history check');
  const remote = parseRemoteVersions(historyOutput);
  const expected = repositoryVersions();
  assertEqual('hosted migration history does not exactly match the repository migration sequence', remote, expected);
  report.history = { rows: remote.length, latest: remote.at(-1), no_higher_migration: true };

  run('supabase', ['db', 'lint', '--linked', '--fail-on', 'error'], environment, 'hosted schema lint');
  report.schema.lint = 'passed';

  const tempRoot = mkdtempSync(join(tmpdir(), 'needthisdone-hosted-parity-'));
  try {
    const schemaPath = join(tempRoot, 'schema.sql');
    run('supabase', ['db', 'dump', '--linked', '--schema', 'public', '--file', schemaPath], environment, 'hosted schema dump');
    const schema = readFileSync(schemaPath, 'utf8');
    const tables = [...schema.matchAll(/CREATE TABLE IF NOT EXISTS "public"\."([^"]+)"/g)].map((match) => match[1]);
    assertEqual('retained public table inventory differs from repository manifest', sorted(tables), sorted(retainedTables));
    const relationText = schema.match(/CREATE (?:TABLE|VIEW|MATERIALIZED VIEW) IF NOT EXISTS [^;]+/g)?.join('\n') || schema;
    for (const retired of [...retiredTables, ...retiredViews]) {
      if (relationText.includes(`"${retired}"`)) fail(`retired relation remains: ${retired}`);
    }
    if (/CREATE SCHEMA IF NOT EXISTS "medusa"|CREATE SCHEMA "medusa"/.test(schema)) fail('retired medusa schema remains');
    const rlsTables = [...schema.matchAll(/ALTER TABLE "public"\."([^"]+)" ENABLE ROW LEVEL SECURITY/g)].map((match) => match[1]);
    for (const table of retainedTables) {
      if (!rlsTables.includes(table)) fail(`retained table is missing RLS: ${table}`);
    }
    for (const policy of requiredPolicyMarkers) {
      if (!schema.includes(`CREATE POLICY "${policy}"`)) fail(`required RLS policy is missing: ${policy}`);
    }
    for (const name of serviceOnlyFunctions) {
      const lines = schema.split('\n').filter((line) => line.includes(`"${name}"`));
      if (!lines.some((line) => /REVOKE ALL ON FUNCTION .* FROM PUBLIC/.test(line)) || !lines.some((line) => /TO "service_role"/.test(line))) {
        fail(`service-role function grant boundary missing: ${name}`);
      }
      if (lines.some((line) => /GRANT .* TO "(anon|authenticated)"/.test(line))) fail(`service-only function is granted to a browser role: ${name}`);
    }
    for (const name of authenticatedFunctions) {
      const lines = schema.split('\n').filter((line) => line.includes(`"${name}"`));
      if (!lines.some((line) => /TO "authenticated"/.test(line))) fail(`authenticated function grant missing: ${name}`);
    }
    report.schema = {
      lint: report.schema.lint,
      retained_tables: retainedTables.length,
      retired_tables_absent: retiredTables.length,
      retired_views_absent: retiredViews.length,
      rls_tables: retainedTables.length,
      required_policy_markers: requiredPolicyMarkers.length,
      service_only_functions: serviceOnlyFunctions.length,
      authenticated_functions: authenticatedFunctions.length,
    };
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

async function verifyStorage(profile, clients, report) {
  const { data: buckets, error } = await clients.service.storage.listBuckets();
  if (error || !buckets) fail('hosted Storage bucket metadata read failed');
  const bucketIds = sorted(buckets.map((bucket) => bucket.id));
  assertEqual('hosted retained Storage bucket inventory differs', bucketIds, sorted(Object.keys(expectedBuckets)));
  for (const [id, expected] of Object.entries(expectedBuckets)) {
    const bucket = buckets.find((candidate) => candidate.id === id);
    if (!bucket || bucket.public !== expected.public || Number(bucket.file_size_limit) !== expected.file_size_limit) fail(`Storage bucket limits/privacy differ: ${id}`);
    assertEqual(`Storage MIME rules differ: ${id}`, sorted(bucket.allowed_mime_types || []), sorted(expected.allowed_mime_types));
  }
  for (const retired of retiredBuckets) {
    if (bucketIds.includes(retired)) fail(`retired Storage bucket remains: ${retired}`);
  }
  const projectObjects = await storageObjects(clients.service, 'project-attachments');
  const agentObjects = await storageObjects(clients.service, 'agent-media-private');
  if (agentObjects.length !== 0) fail('disposable hosted parity unexpectedly found agent media objects');

  const backupRoot = process.env.NEEDTHISDONE_HOSTED_BACKUP_DIR;
  if (backupRoot) {
    const expectedPath = join(resolve(backupRoot), 'storage-objects-project-attachments.json');
    if (!existsSync(expectedPath)) fail('hosted parity backup object inventory is missing');
    const rawInventory = readFileSync(expectedPath, 'utf8');
    const jsonInventory = rawInventory.endsWith('\\n') ? rawInventory.slice(0, -2) : rawInventory;
    const expectedObjects = JSON.parse(jsonInventory).map(normalizeStorageObject);
    assertEqual('project attachment object inventory changed during parity', projectObjects.map(normalizeStorageObject), expectedObjects);
  }
  const anonymous = createClient(profile.NEXT_PUBLIC_SUPABASE_URL, profile.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: anonymousObjects, error: anonymousStorageError } = await anonymous.storage.from('project-attachments').list('', { limit: 1, offset: 0 });
  if (!anonymousStorageError && (anonymousObjects || []).length > 0) fail('anonymous Storage read was not denied');
  report.storage = {
    buckets: bucketIds,
    private_buckets: bucketIds.length,
    project_attachment_objects: projectObjects.length,
    agent_media_objects: agentObjects.length,
    object_bytes_downloaded: false,
    anonymous_read_denied: true,
  };
}

async function verifyFixtures(profile, clients, report) {
  const fixture = await fixtureSetup(profile, clients, report);
  try {
    const { userClients } = fixture;
    const ownerA = userClients['owner-a'];
    const managerA = userClients['manager-a'];
    const viewerA = userClients['viewer-a'];
    const ownerB = userClients['owner-b'];

    const readEmployees = async (client) => {
      const { data, error } = await client.from('ai_employees').select('id,customer_id').order('id');
      if (error) fail('tenant employee read failed');
      return data || [];
    };
    const ownerAEmployees = await readEmployees(ownerA);
    const ownerBEmployees = await readEmployees(ownerB);
    assertEqual('owner A can see another customer employee', ownerAEmployees.map((row) => row.id), [fixture.employees.a.id]);
    assertEqual('owner B can see another customer employee', ownerBEmployees.map((row) => row.id), [fixture.employees.b.id]);
    const viewerEmployees = await readEmployees(viewerA);
    assertEqual('viewer tenant isolation failed', viewerEmployees.map((row) => row.id), [fixture.employees.a.id]);

    await expectQueryError(() => viewerA.from('ai_employee_work_items').insert({
      employee_id: fixture.employees.a.id,
      queue: 'midday',
      title: 'Viewer must not write',
      proposed_action: 'Denied',
      priority: 2,
    }), 'viewer write was not denied');
    await expectRpcError(viewerA, 'record_ai_employee_decision', {
      target_work_item_id: fixture.work.a.id,
      target_decision: 'approve',
      target_instructions: '',
      target_idempotency_key: randomUUID(),
      target_defer_date: null,
    }, 'viewer decision was not denied');
    const managerDecision = await callRpc(managerA, 'record_ai_employee_decision', {
      target_work_item_id: fixture.work.a.id,
      target_decision: 'approve',
      target_instructions: '',
      target_idempotency_key: randomUUID(),
      target_defer_date: null,
    }, 'manager decision failed');
    fixture.ids.decision = managerDecision.id;

    const step = {
      key: 'research',
      title: 'Research public evidence',
      instruction: 'Find one public business and cite every fit claim.',
      taskType: 'research_public_web',
      agentRole: 'public_web_researcher',
      capabilities: ['read_public_web', 'research_public_web'],
      expectedArtifacts: ['research dossier'],
      estimatedCostUsd: 0.01,
    };
    const forbidden = ['send_external_messages', 'publish_content', 'spend_money', 'change_connected_accounts', 'deliver_external_content'];
    const instruction = {
      version: 1,
      executor: 'openclaw',
      approvalRequired: true,
      delivery: { deliver: false, bestEffortDeliver: false, externalMessages: false, publishing: false, spending: false, accountChanges: false },
    };
    const planArgs = {
      target_original_request: 'Disposable parity research only.',
      target_rewritten_instruction: 'Research one public business and prepare a draft for review.',
      target_steps: [step],
      target_allowed_capabilities: ['research_public_web'],
      target_forbidden_actions: forbidden,
      target_expected_artifacts: ['research dossier'],
      target_growth_profile_id: fixture.profiles.a.id,
      target_workflow_type: 'research_outreach',
      target_model_id: 'provider/fixture-model',
      target_model_route: 'selected-primary',
      target_estimated_prompt_tokens: 20,
      target_estimated_completion_tokens: 40,
      target_estimated_web_search_calls: 0,
      target_estimated_cost: 0.01,
      target_planner_usage: {},
      target_openclaw_instruction: instruction,
      target_idempotency_key: randomUUID(),
    };
    await expectRpcError(viewerA, 'create_agent_plan', planArgs, 'non-admin planner creation was not denied');
    const created = await callRpc(ownerA, 'create_agent_plan', planArgs, 'planner draft creation failed');
    if (created?.duplicate !== false || created?.plan?.status !== 'draft') fail('planner did not create a draft');
    fixture.ids.plan = created.plan.id;
    const replay = await callRpc(ownerA, 'create_agent_plan', planArgs, 'planner idempotency replay failed');
    if (replay?.duplicate !== true || replay?.plan?.id !== fixture.ids.plan) fail('planner idempotency replay was not exact');

    await expectRpcError(ownerA, 'dispatch_agent_plan', { target_plan_id: fixture.ids.plan, target_idempotency_key: randomUUID() }, 'unapproved planner dispatch was not denied');
    const approved = await callRpc(ownerA, 'approve_agent_plan', { target_plan_id: fixture.ids.plan, target_idempotency_key: randomUUID(), target_note: 'Hosted parity review' }, 'planner approval failed');
    if (approved?.plan?.status !== 'approved' || approved?.plan?.approved_snapshot?.planId !== fixture.ids.plan) fail('planner approval did not freeze a snapshot');
    const dispatched = await callRpc(ownerA, 'dispatch_agent_plan', { target_plan_id: fixture.ids.plan, target_idempotency_key: randomUUID() }, 'planner dispatch failed');
    fixture.ids.run = dispatched?.run?.id;
    fixture.ids.task = dispatched?.tasks?.[0]?.id;
    if (!fixture.ids.run || !fixture.ids.task || dispatched?.tasks?.[0]?.agent_provider !== 'openclaw') fail('planner dispatch did not materialize an OpenClaw task');
    const dispatchReplayKey = dispatched.run?.idempotency_key || null;
    if (dispatchReplayKey) {
      const replayDispatch = await callRpc(ownerA, 'dispatch_agent_plan', { target_plan_id: fixture.ids.plan, target_idempotency_key: dispatchReplayKey }, 'planner dispatch replay failed');
      if (replayDispatch?.duplicate !== true) fail('planner dispatch replay was not idempotent');
    }
    await expectQueryError(() => viewerA.from('agent_plans').insert({
      owner_id: fixture.users['viewer-a'].id,
      growth_profile_id: fixture.profiles.a.id,
      workflow_type: 'research_outreach',
      original_request: 'Denied',
      rewritten_instruction: 'Denied',
      steps: [step],
      allowed_capabilities: ['research_public_web'],
      forbidden_actions: forbidden,
      expected_artifacts: ['research dossier'],
      selected_model_id: 'provider/fixture-model',
      model_route: 'selected-primary',
      estimated_prompt_tokens: 1,
      estimated_completion_tokens: 1,
      estimated_web_search_calls: 0,
      estimated_cost_usd: 0,
      planner_usage: {},
      openclaw_instruction: instruction,
      idempotency_key: randomUUID(),
      request_hash: 'denied',
    }), 'authenticated direct planner write was not denied');

    await expectRpcError(ownerA, 'claim_openclaw_agent_orchestration_task', {
      target_owner_id: fixture.users['owner-a'].id,
      target_worker: 'browser-fixture-worker',
      target_lease_seconds: 300,
    }, 'browser worker claim was not denied');
    const firstClaim = await callRpc(clients.service, 'claim_openclaw_agent_orchestration_task', {
      target_owner_id: fixture.users['owner-a'].id,
      target_worker: 'parity-worker-a',
      target_lease_seconds: 300,
    }, 'service worker claim failed');
    if (!firstClaim || firstClaim.status !== 'leased') fail('service worker claim did not lease the task');
    const concurrentClaim = await callRpc(clients.service, 'claim_openclaw_agent_orchestration_task', {
      target_owner_id: fixture.users['owner-a'].id,
      target_worker: 'parity-worker-a-second-call',
      target_lease_seconds: 300,
    }, 'service worker lease replay failed');
    if (concurrentClaim !== null) fail('leased task was claimed twice');
    await updateOne(clients.service, 'agent_orchestration_tasks', { lease_expires_at: new Date(Date.now() - 1000).toISOString() }, 'id', fixture.ids.task, 'fixture lease expiry setup failed');
    const reclaimed = await callRpc(clients.service, 'claim_openclaw_agent_orchestration_task', {
      target_owner_id: fixture.users['owner-a'].id,
      target_worker: 'parity-worker-b',
      target_lease_seconds: 300,
    }, 'expired lease was not reclaimable');
    if (!reclaimed || reclaimed.id !== fixture.ids.task || reclaimed.attempt_count !== 2) fail('expired lease did not requeue exactly once');

    await updateOne(clients.service, 'growth_profiles', { emergency_stop: true }, 'id', fixture.profiles.a.id, 'emergency-stop fixture setup failed');
    await expectRpcError(clients.service, 'reserve_openclaw_model_usage', {
      target_owner_id: fixture.users['owner-a'].id,
      target_plan_id: fixture.ids.plan,
      target_run_id: fixture.ids.run,
      target_task_id: fixture.ids.task,
      target_worker: 'parity-worker-b',
      target_reservation_key: randomUUID(),
      target_reserved_cost: 0.01,
    }, 'emergency stop did not fail closed');
    await updateOne(clients.service, 'growth_profiles', { emergency_stop: false }, 'id', fixture.profiles.a.id, 'emergency-stop fixture reset failed');

    const reservationKey = randomUUID();
    const reservationArgs = {
      target_owner_id: fixture.users['owner-a'].id,
      target_plan_id: fixture.ids.plan,
      target_run_id: fixture.ids.run,
      target_task_id: fixture.ids.task,
      target_worker: 'parity-worker-b',
      target_reservation_key: reservationKey,
      target_reserved_cost: 0.01,
    };
    const reservation = await callRpc(clients.service, 'reserve_openclaw_model_usage', reservationArgs, 'worker usage reservation failed');
    fixture.ids.reservation = reservation.id;
    const reservationReplay = await callRpc(clients.service, 'reserve_openclaw_model_usage', reservationArgs, 'worker usage idempotency replay failed');
    if (reservationReplay?.id !== reservation.id) fail('worker usage replay was not exact');
    await callRpc(clients.service, 'record_agent_task_event', {
      target_task_id: fixture.ids.task,
      target_worker: 'parity-worker-b',
      target_event_type: 'progress',
      target_payload: { stage: 'hosted-parity' },
      target_progress: 20,
    }, 'worker progress event failed');
    await callRpc(clients.service, 'reconcile_openclaw_model_usage', {
      target_reservation_key: reservationKey,
      target_actual_cost: 0.005,
      target_provider_usage: { prompt_tokens: 1, completion_tokens: 1 },
    }, 'worker usage reconciliation failed');
    await callRpc(clients.service, 'complete_openclaw_orchestration_task', {
      target_task_id: fixture.ids.task,
      target_worker: 'parity-worker-b',
      target_status: 'succeeded',
      target_output: { source: 'hosted-parity-fixture' },
      target_error: null,
      target_artifacts: [{ artifactType: 'research_dossier', title: 'Disposable parity dossier', contentText: 'No customer or prospect data.' }],
      target_model_reservation_key: reservationKey,
      target_prospecting: null,
    }, 'worker task completion failed');
    const { data: artifacts, error: artifactError } = await clients.service.from('agent_artifacts').select('id').eq('task_id', fixture.ids.task).limit(1);
    if (artifactError || !artifacts?.[0]) fail('fixture artifact was not created');
    fixture.ids.artifact = artifacts[0].id;
    const provenance = await insertOne(clients.service, 'prospecting_artifact_provenance', {
      owner_id: fixture.users['owner-a'].id,
      growth_profile_id: fixture.profiles.a.id,
      plan_id: fixture.ids.plan,
      run_id: fixture.ids.run,
      orchestration_task_id: fixture.ids.task,
      artifact_id: fixture.ids.artifact,
      model_usage_reservation_id: fixture.ids.reservation,
      model_id: 'provider/fixture-model',
      worker_id: 'parity-worker-b',
      prospect_ids: [],
      validation_status: 'validated',
    }, 'provenance fixture creation failed');
    fixture.ids.provenance = provenance.id;
    const { data: ownProvenance, error: ownProvenanceError } = await ownerA.from('prospecting_artifact_provenance').select('id').eq('id', fixture.ids.provenance);
    if (ownProvenanceError || ownProvenance?.length !== 1) fail('owner could not read own provenance');
    const { data: foreignProvenance, error: foreignProvenanceError } = await ownerB.from('prospecting_artifact_provenance').select('id').eq('id', fixture.ids.provenance);
    if (foreignProvenanceError || (foreignProvenance || []).length !== 0) fail('provenance crossed customer boundary');

    report.fixtures.tenant_isolation = 'passed';
    report.fixtures.viewer_read_only = 'passed';
    report.fixtures.planner_approval_before_dispatch = 'passed';
    report.fixtures.service_role_worker_boundary = 'passed';
    report.fixtures.lease_and_idempotency = 'passed';
    report.fixtures.emergency_stop = 'passed';
    report.fixtures.provenance_isolation = 'passed';
    report.fixtures.external_recipients = 0;
  } finally {
    await cleanupFixtures(clients, fixture, report);
  }
}

async function main() {
  const profile = readProfile(cloudProfilePath);
  if (profile.ENV_TARGET !== 'cloud' || profile.NEXT_PUBLIC_SUPABASE_URL !== expectedEndpoint || !profile.SUPABASE_SERVICE_ROLE_KEY || !profile.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    fail('cloud profile does not match the approved hosted endpoint');
  }
  const environment = { ...process.env, ...profile };
  const clients = createSupabaseClients(profile);
  const report = {
    schema_version: 1,
    status: 'failed',
    target: { project_ref: expectedProjectRef, endpoint: expectedEndpoint, branch: expectedBranch },
    timestamp_utc: new Date().toISOString(),
    hosted_writes: 0,
    external_provider_calls: 0,
    schema: {},
    history: {},
    storage: {},
    fixtures: { created_users: 0, cleaned_users: 0, cleanup_errors: 0, cleanup_failures: [], external_recipients: 0 },
  };
  try {
    const identity = await fetch(`${expectedEndpoint}/auth/v1/health`, {
      headers: { apikey: profile.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    });
    if (!identity.ok) fail('hosted Auth endpoint identity check failed');
    report.endpoint_identity = { auth_health: identity.status, expected_project: true };
    await verifySchemaAndHistory(profile, environment, report);
    await verifyStorage(profile, clients, report);
    await verifyFixtures(profile, clients, report);
    report.status = 'passed';
  } catch (error) {
    report.error = error instanceof ParityFailure
      ? error.message
      : redact(error instanceof Error ? error.message : 'hosted parity verifier failed', profile);
    report.status = 'failed';
  }
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'passed' || report.fixtures.cleanup_errors !== 0) process.exitCode = 1;
}

await main();
