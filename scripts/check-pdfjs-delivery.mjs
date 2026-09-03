import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const base = process.argv[2];
// HTTP checks never send document contents. Use a local server URL, or run
// without a URL to verify that every copied asset is in production output.
if (base && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(base)) {
  throw new Error('Use an exact local server origin for this diagnostic.');
}
async function verify(relative) {
  const bytes = await readFile(`${root}/public/${relative}`);
  assert.deepEqual(await readFile(`${root}/dist/client/${relative}`), bytes, `Built asset: ${relative}`);
}
async function verifyDirectory(relative) {
  for (const entry of await readdir(`${root}/public/${relative}`, { withFileTypes: true })) {
    const child = `${relative}/${entry.name}`;
    if (entry.isDirectory()) await verifyDirectory(child);
    else await verify(child);
  }
}
await verify('pdf.worker.min.mjs');
await verifyDirectory('pdfjs');
if (base) {
  for (const path of ['pdf.worker.min.mjs', 'pdfjs/wasm/openjpeg.wasm', 'pdfjs/wasm/jbig2.wasm',
    'pdfjs/wasm/qcms_bg.wasm', 'pdfjs/wasm/openjpeg_nowasm_fallback.js',
    'pdfjs/wasm/jbig2_nowasm_fallback.js', 'pdfjs/cmaps/Adobe-Japan1-UCS2.bcmap',
    'pdfjs/standard_fonts/LiberationSans-Regular.ttf', 'pdfjs/iccs/CGATS001Compat-v2-micro.icc']) {
    const response = await fetch(new URL(path, `${base.replace(/\/$/, '')}/`), { redirect: 'error' });
    assert.equal(response.status, 200, path);
    if (path.endsWith('.wasm')) assert.match(response.headers.get('content-type') || '', /application\/wasm/);
    if (/\.m?js$/.test(path)) assert.match(response.headers.get('content-type') || '', /javascript/);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(`${root}/public/${path}`), `HTTP asset: ${path}`);
  }
}
console.log('PDF.js delivery verified: complete production assets' + (base ? ', HTTP bytes and decoder MIME types.' : '.'));
