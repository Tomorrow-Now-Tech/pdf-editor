import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { resolve } from 'node:path';
import { readSourceRevision } from './source-provenance.mjs';
import { SOURCE_REPOSITORY } from '../legal/source-config.mjs';
import { MAC_DMG_DOWNLOAD_URL } from '../downloads/mac.mjs';

const root = resolve(import.meta.dirname, '..');
const revision = readSourceRevision(root, true);
const origin = 'https://pdf.tomorrownow.tech';
const manifest = JSON.parse(await readFile(`${root}/dist/client/source-version.json`, 'utf8'));
assert.equal(manifest.revision, revision);
assert.equal(manifest.deploymentTarget, 'cloudflare');
const get = (path) => fetch(new URL(path, origin), {
  redirect: 'error', signal: AbortSignal.timeout(15_000), headers: { 'Cache-Control': 'no-cache' },
});

// Give an already successful upload time to reach the edge, but fail closed
// when the public version never matches the exact verified source revision.
let published = false;
for (let attempt = 0; attempt < 12; attempt += 1) {
  try {
    const response = await get(`/source-version.json?verify=${revision}`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), manifest);
    published = true;
    break;
  } catch {
    if (attempt < 11) await delay(5000);
  }
}
assert.ok(published, 'The public source revision does not match this release');
for (const path of ['/', '/privacy', '/terms', '/licenses']) {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  assert.equal(response.headers.get('set-cookie'), null, 'Unexpected account/tracking cookie');
  const html = await response.text();
  assert.ok(html.includes(`${SOURCE_REPOSITORY}/tree/${revision}`), `Exact source link missing: ${path}`);
  assert.ok(html.includes('(in fase di emissione)'), `Company details missing: ${path}`);
  if (path === '/privacy') assert.ok(html.includes('senza passare da Sites'));
  if (path === '/') assert.equal(html.split(`href="${MAC_DMG_DOWNLOAD_URL}"`).length - 1, 2, 'Both Mac download buttons must link directly to the DMG');
}
for (const path of ['pdf.worker.min.mjs', 'pdfjs/wasm/openjpeg.wasm', 'pdfjs/wasm/jbig2.wasm',
  'pdfjs/wasm/qcms_bg.wasm', 'pdfjs/wasm/openjpeg_nowasm_fallback.js',
  'pdfjs/wasm/jbig2_nowasm_fallback.js', 'pdfjs/cmaps/Adobe-Japan1-UCS2.bcmap',
  'pdfjs/standard_fonts/LiberationSans-Regular.ttf', 'pdfjs/iccs/CGATS001Compat-v2-micro.icc',
  'legal/dependencies.json', 'legal/AGPL-3.0.txt', 'legal/THIRD_PARTY_LICENSES.txt']) {
  const response = await get(`/${path}`);
  assert.equal(response.status, 200, path);
  const mime = response.headers.get('content-type') || '';
  if (path.endsWith('.wasm')) assert.match(mime, /application\/wasm/);
  if (/\.m?js$/.test(path)) assert.match(mime, /javascript/);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(`${root}/public/${path}`), path);
}
assert.equal((await get('/not-a-real-pdf-editor-page')).status, 404);
console.log(`Public release verified over HTTPS: ${revision}. No PDF uploaded.`);
