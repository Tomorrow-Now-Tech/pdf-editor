import { readFile, readdir, mkdir, writeFile, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'public/legal');
const rawLock = await readFile(resolve(root, 'package-lock.json'));
const lock = JSON.parse(rawLock);
const hash = (data) => createHash('sha256').update(data).digest('hex');
const entries = [];
const text = ['THIRD-PARTY LICENSE NOTICES — AUTOMATED INVENTORY',
  'Includes installed npm runtime and build packages, not a claim that every package is delivered to browsers.',
  'Optional packages absent on this build platform are listed in dependencies.json.',
  'Metadata is not a license text. Missing notices and native/bundled components still require review.', ''];

for (const [location, locked] of Object.entries(lock.packages).sort(([a], [b]) => a.localeCompare(b))) {
  if (!location) continue;
  if (!location.startsWith('node_modules/') || location.split('/').includes('..')) throw new Error('Unexpected lockfile path');
  const directory = resolve(root, location);
  let pkg;
  try { pkg = JSON.parse(await readFile(`${directory}/package.json`, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT' || !locked.optional) throw error;
    entries.push({ location, version: locked.version, declaredLicense: locked.license || null, status: 'optional-not-installed' });
    continue;
  }
  if (pkg.version !== locked.version) throw new Error(`Installed version differs from lockfile: ${location}`);
  const files = [];
  async function collect(relative = '', depth = 0) {
    for (const entry of (await readdir(`${directory}/${relative}`, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = `${relative}${entry.name}`;
      if (entry.isDirectory() && depth < 2 && /^(licenses?|legal|notices?)$/i.test(entry.name)) await collect(`${path}/`, depth + 1);
      else if (entry.isFile() && (depth > 0 || /^(licen[cs]e|notice|copying|copyright)([._-]|$)/i.test(entry.name))) {
        const content = await readFile(`${directory}/${path}`);
        files.push({ path, sha256: hash(content) });
        text.push(`===== ${pkg.name}@${pkg.version} — ${path} =====`, content.toString('utf8'), '');
      }
    }
  }
  await collect();
  const declaredLicense = typeof pkg.license === 'string' ? pkg.license : (locked.license || null);
  entries.push({ name: pkg.name, version: pkg.version, location, declaredLicense,
    scope: locked.dev ? 'build-tooling' : 'runtime-or-transitive',
    status: files.length ? 'notice-files-collected' : 'notice-text-review-required', files });
}

await mkdir(output, { recursive: true });
const inventory = { lockfileSha256: hash(rawLock), scope: 'installed npm packages and skipped optional platforms',
  nativeAndBundledComponentsRequireReview: true, packages: entries };
await writeFile(`${output}/dependencies.json`, `${JSON.stringify(inventory, null, 2)}\n`);
await writeFile(`${output}/THIRD_PARTY_LICENSES.txt`, `${text.join('\n')}\n`);
await cp(`${root}/LICENSE`, `${output}/AGPL-3.0.txt`);
await cp(`${root}/THIRD_PARTY_NOTICES.md`, `${output}/THIRD_PARTY_NOTICES.md`);
const pending = entries.filter((entry) => entry.status === 'notice-text-review-required');
console.log(`License inventory: ${entries.length} locked packages; ${pending.length} installed packages need notice-text review.`);
