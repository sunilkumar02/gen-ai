import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const runtimeRequire = createRequire(import.meta.url);

// Compile the actual app modules so tests exercise the API and store together.
const modules = new Map();
function load(relativePath) {
  const filename = path.resolve(relativePath);
  if (modules.has(filename)) return modules.get(filename).exports;
  const compiledModule = { exports: {} };
  modules.set(filename, compiledModule);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = (name) => name.startsWith('@/') ? load(`src/${name.slice(2)}.ts`) : runtimeRequire(name);
  new Function('require', 'module', 'exports', source)(localRequire, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}

const originalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
process.env.NEXT_PUBLIC_API_BASE_URL ??= "http://localhost:8000";
const originalFetch = global.fetch;
const originalStorage = global.localStorage;
const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
after(() => {
  global.fetch = originalFetch;
  global.localStorage = originalStorage;
  if (originalApiUrl === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
  else process.env.NEXT_PUBLIC_API_BASE_URL = originalApiUrl;
});
const { loginUser } = load('src/lib/api/auth.ts');
const { useChatStore: store, selectCurrentWorkspace } = load('src/stores/chat-store.ts');
const sample = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  email: 'sample@example.com', name: 'Sample User',
  created_at: '2026-11-13T10:22:47.402Z', updated_at: '2026-11-13T10:22:47.402Z',
};

function reply(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

test('POSTs username and UTF-8 Base64 password; retains only documented user fields', async () => {
  global.fetch = async (url, options) => {
    assert.equal(url, `${(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '')}/auth/login`);
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.equal(options.cache, 'no-store');
    assert.deepEqual(JSON.parse(options.body), { username: 'sample', password: Buffer.from(' päss🔑 ').toString('base64') });
    return reply({ ...sample, password: 'never retain', access_token: 'never retain' });
  };
  assert.deepEqual(await loginUser(' sample ', ' päss🔑 '), sample);
});

test('rejects blank input without requesting the backend', async () => {
  global.fetch = async () => { assert.fail('Unexpected request'); };
  await assert.rejects(loginUser(' ', 'password'), /username and password/);
  await assert.rejects(loginUser('sample', '  '), /username and password/);
});

test('403 and network failures show actionable errors', async () => {
  global.fetch = async () => reply({ detail: 'Forbidden' }, 403);
  await assert.rejects(loginUser('sample', 'password'), (error) => error.status === 403 && /Check your username/.test(error.message));
  global.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(loginUser('sample', 'password'), /backend is running/);
});

test('rejects malformed success responses, invalid JSON, and empty bodies', async () => {
  for (const invalid of [{}, { ...sample, id: '' }, { ...sample, updated_at: 'invalid' }, { user: sample }]) {
    global.fetch = async () => reply(invalid);
    await assert.rejects(loginUser('sample', 'password'), /invalid user details/);
  }
  global.fetch = async () => new Response('not json', { status: 200 });
  await assert.rejects(loginUser('sample', 'password'), /Couldn't sign in/);
  global.fetch = async () => new Response(null, { status: 204 });
  await assert.rejects(loginUser('sample', 'password'), /invalid user details/);
});

test('failed login leaves chat closed and resets the loading state', async () => {
  store.getState().signOut();
  global.fetch = async () => reply({}, 403);
  await assert.rejects(store.getState().signIn('sample', 'password'));
  assert.equal(store.getState().user, null);
  assert.equal(store.getState().isSigningIn, false);
});

test('persists backend user details and partitions history by backend ID', async () => {
  global.fetch = async () => reply(sample);
  await store.getState().signIn('sample', 'password');
  assert.equal(store.getState().user.email, sample.email);
  assert.equal(store.getState().user.displayName, sample.name);
  assert.equal(store.getState().user.created_at, sample.created_at);
  store.getState().sendMessage('Hello');
  assert.equal(selectCurrentWorkspace(store.getState()).conversations.length, 1);
  store.getState().signOut();
  global.fetch = async () => reply({ ...sample, id: 'different-user' });
  await store.getState().signIn('sample', 'password');
  assert.equal(selectCurrentWorkspace(store.getState()).conversations.length, 0);
  global.fetch = async () => reply(sample);
  await store.getState().signIn('renamed-username', 'password');
  assert.equal(selectCurrentWorkspace(store.getState()).conversations.length, 1);
  const persisted = JSON.parse(storage.get('aster-chat-workspace'));
  assert.deepEqual(Object.keys(persisted.state), ['workspaces', 'user']);
  assert.equal(persisted.state.user.email, sample.email);
  assert.equal(persisted.state.user.name, sample.name);
  assert.equal(JSON.stringify(persisted).includes('password'), false);
  assert.equal(JSON.stringify(persisted).includes('access_token'), false);
});

test('old stored profiles cannot restore a signed-in session', async () => {
  const options = store.persist.getOptions();
  const legacy = { user: { id: 'sample', username: 'sample', displayName: 'Sample' }, workspaces: {} };
  assert.equal(options.migrate(legacy, 1).user, undefined);
  assert.equal(options.merge(legacy, store.getState()).user, null);
  storage.set('aster-chat-workspace', JSON.stringify({ state: legacy, version: 1 }));
  await store.persist.rehydrate();
  assert.equal(store.getState().user, null);
});

test('signing out while login is pending cannot reopen chat', async () => {
  let complete;
  global.fetch = () => new Promise((resolve) => { complete = resolve; });
  const pending = store.getState().signIn('sample', 'password');
  assert.equal(store.getState().isSigningIn, true);
  store.getState().signOut();
  complete(reply(sample));
  await pending;
  assert.equal(store.getState().user, null);
  assert.equal(store.getState().isSigningIn, false);
});

test('restores saved API user details after reload and removes them on sign-out', async () => {
  global.fetch = async () => reply(sample);
  await store.getState().signIn('sample', 'password');
  store.getState().sendMessage('Keep this chat');
  const saved = storage.get('aster-chat-workspace');
  const history = JSON.parse(saved).state.workspaces;
  store.setState({ user: null });
  storage.set('aster-chat-workspace', saved);
  await store.persist.rehydrate();
  assert.equal(store.getState().user.id, sample.id);
  assert.equal(store.getState().user.email, sample.email);
  store.getState().signOut();
  const signedOut = JSON.parse(storage.get('aster-chat-workspace'));
  assert.equal('user' in signedOut.state, false);
  assert.equal(JSON.stringify(signedOut).includes(sample.email), false);
  assert.deepEqual(signedOut.state.workspaces, history);
});

test('ignores malformed profiles and strips unexpected persisted credentials', () => {
  const options = store.persist.getOptions();
  const invalid = options.merge({ user: { id: 'invalid' } }, store.getState());
  assert.equal(invalid.user, null);
  assert.match(invalid.storageError, /invalid/);
  const restored = options.merge({ user: { ...sample, username: 'sample', password: 'secret', access_token: 'secret' } }, store.getState());
  assert.equal(restored.user.id, sample.id);
  assert.equal('password' in restored.user, false);
  assert.equal('access_token' in restored.user, false);
});

test('sign-out clears memory and reports storage failures visibly', async () => {
  global.fetch = async () => reply(sample);
  await store.getState().signIn('sample', 'password');
  const setItem = global.localStorage.setItem;
  global.localStorage.setItem = () => { throw new Error('Storage unavailable'); };
  try {
    store.getState().signOut();
    assert.equal(store.getState().user, null);
    assert.match(store.getState().storageError, /may remain after sign-out/);
  } finally {
    global.localStorage.setItem = setItem;
    store.getState().signOut();
    store.setState({ storageError: null });
  }
});
