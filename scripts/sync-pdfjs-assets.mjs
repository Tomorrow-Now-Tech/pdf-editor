import { cp, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const source = dirname(require.resolve('pdfjs-dist/package.json'));
const root = resolve(import.meta.dirname, '..');
const { version } = JSON.parse(await readFile(resolve(source, 'package.json'), 'utf8'));
// The image-validation adapter is tested against this exact worker/API pair.
if (version !== '6.3.289') throw new Error('Review PDF.js rendering guards before upgrading its version.');
await mkdir(resolve(root, 'public/pdfjs'), { recursive: true });
await cp(resolve(source, 'build/pdf.worker.min.mjs'), resolve(root, 'public/pdf.worker.min.mjs'));
for (const directory of ['wasm', 'cmaps', 'standard_fonts', 'iccs']) {
  // Include each directory's upstream license files, not just the binaries.
  await cp(resolve(source, directory), resolve(root, 'public/pdfjs', directory), { recursive: true });
}
await cp(resolve(source, 'LICENSE'), resolve(root, 'public/pdfjs/LICENSE'));
console.log(`PDF.js ${version}: worker, decoders, CMaps, fonts, ICC profiles and licenses synchronized.`);
