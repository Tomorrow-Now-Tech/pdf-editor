import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readSourceRevision } from './source-provenance.mjs';
import { SOURCE_REPOSITORY } from '../legal/source-config.mjs';

const root = resolve(import.meta.dirname, '..');
const revision = readSourceRevision(root, true);
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const source = await readJson('dist/client/source-version.json');
assert.equal(source.revision, revision, 'Rebuild the current committed source before deploying');
assert.equal(source.deploymentTarget, 'cloudflare', 'Use npm run build:cloudflare, not the Sites build');
assert.equal(source.sourceUrl, `${SOURCE_REPOSITORY}/tree/${revision}`);
const config = await readJson('dist/server/wrangler.json');
assert.equal(config.name, 'tomorrow-now-pdf-editor');
assert.equal(config.workers_dev, true);
assert.equal(config.observability?.enabled, false, 'No unsolicited production logging');
assert.equal(resolve(root, 'dist/server', config.assets.directory), resolve(root, 'dist/client'));
for (const binding of ['d1_databases', 'r2_buckets', 'kv_namespaces', 'services', 'routes']) {
  assert.ok(!config[binding]?.length, `Unexpected binding/route: ${binding}`);
}
assert.equal(config.route, undefined, 'Attach the custom domain only after remote verification');
await stat(resolve(root, 'dist/server', config.main));
let files = 0;
let largest = { name: '', size: 0 };
async function checkAssets(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Unexpected asset symlink: ${entry.name}`);
    if (entry.isDirectory()) await checkAssets(path);
    else {
      const { size } = await stat(path);
      assert.ok(size <= 25 * 1024 * 1024, `Static asset exceeds 25 MiB: ${entry.name}`);
      if (size > largest.size) largest = { name: entry.name, size };
      files += 1;
    }
  }
}
await checkAssets(resolve(root, 'dist/client'));
assert.ok(files <= 20_000, 'Static asset count exceeds the Free plan limit');
for (const name of ['dependencies.json', 'THIRD_PARTY_LICENSES.txt', 'AGPL-3.0.txt', 'THIRD_PARTY_NOTICES.md']) {
  assert.deepEqual(await readFile(`${root}/dist/client/legal/${name}`), await readFile(`${root}/public/legal/${name}`));
}
console.log(`Cloudflare build verified: ${revision}; ${files} assets; largest ${largest.name} (${largest.size} bytes).`);
