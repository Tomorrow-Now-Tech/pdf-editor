import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { resolve } from 'node:path';
import { readSourceRevision } from './source-provenance.mjs';
import { SOURCE_REPOSITORY } from '../legal/source-config.mjs';

const root = resolve(import.meta.dirname, '..');
const revision = readSourceRevision(root, true);
const origin = 'http://127.0.0.1:4178';
const manifest = JSON.parse(await readFile(`${root}/dist/client/source-version.json`, 'utf8'));
assert.equal(manifest.revision, revision);
assert.equal(manifest.deploymentTarget, 'cloudflare');

const child = spawn(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'dev',
  '--config', 'dist/server/wrangler.json', '--local', '--ip', '127.0.0.1',
  '--port', '4178', '--inspector-port', '0'], {
  cwd: root,
  env: { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_WRITE_LOGS: 'false',
    WRANGLER_LOG_PATH: '.wrangler/logs', CI: 'true' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
let ready = false;
let spawnError;
let exited = false;
child.on('error', (error) => { spawnError = error; });
const exit = new Promise((done) => child.once('close', () => { exited = true; done(); }));
for (const stream of [child.stdout, child.stderr]) stream.on('data', (data) => {
  const text = data.toString();
  output = (output + text).slice(-6000);
  if (output.includes(`Ready on ${origin}`)) ready = true;
});
const get = (path) => fetch(new URL(path, origin), { redirect: 'error', signal: AbortSignal.timeout(20_000) });
try {
  const deadline = Date.now() + 30_000;
  while (!ready && !exited && !spawnError && Date.now() < deadline) await delay(100);
  assert.ok(ready && !exited && !spawnError, `Local Worker did not start: ${spawnError || output}`);
  for (const path of ['/', '/privacy', '/terms', '/licenses']) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('set-cookie'), null, 'The editor must not set an account cookie');
    const html = await response.text();
    assert.ok(html.includes('Tomorrow Now'), path);
    assert.ok(html.includes('(in fase di emissione)'), path);
    assert.ok(html.includes(`${SOURCE_REPOSITORY}/tree/${revision}`), 'Exact source link missing');
    if (path === '/privacy') assert.ok(html.includes('senza passare da Sites'));
  }
  const version = await get('/source-version.json');
  assert.deepEqual(await version.json(), manifest);
  for (const path of ['pdf.worker.min.mjs', 'pdfjs/wasm/openjpeg.wasm', 'pdfjs/wasm/jbig2.wasm',
    'pdfjs/wasm/qcms_bg.wasm', 'pdfjs/wasm/openjpeg_nowasm_fallback.js',
    'pdfjs/wasm/jbig2_nowasm_fallback.js', 'pdfjs/cmaps/Adobe-Japan1-UCS2.bcmap',
    'pdfjs/standard_fonts/LiberationSans-Regular.ttf', 'pdfjs/iccs/CGATS001Compat-v2-micro.icc',
    'legal/dependencies.json', 'legal/AGPL-3.0.txt', 'legal/THIRD_PARTY_LICENSES.txt']) {
    const response = await get(`/${path}`);
    assert.equal(response.status, 200, path);
    if (path.endsWith('.wasm')) assert.match(response.headers.get('content-type') || '', /application\/wasm/);
    if (/\.m?js$/.test(path)) assert.match(response.headers.get('content-type') || '', /javascript/);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(`${root}/public/${path}`), path);
  }
  assert.equal((await get('/not-a-real-pdf-editor-page')).status, 404);
  console.log('Cloudflare Worker smoke passed: anonymous pages, source, PDF decoders, fonts, licenses and 404.');
} finally {
  child.kill('SIGTERM');
  const forceKill = setTimeout(() => child.kill('SIGKILL'), 3000);
  forceKill.unref();
  await exit;
  clearTimeout(forceKill);
}
