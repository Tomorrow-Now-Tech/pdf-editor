import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { readSourceRevision, sourceProvenancePlugin } from './source-provenance.mjs';
import { COMPANY, PENDING_COMPANY_DETAIL } from '../legal/company.mjs';

const root = resolve(import.meta.dirname, '..');

test('operator details preserve the supplied contact and mark unknown identifiers as pending', async () => {
  assert.equal(COMPANY.name, 'Tomorrow Now S.r.l.');
  assert.equal(COMPANY.address, 'Corso Galileo Ferraris 53 — 10128 Torino');
  assert.equal(COMPANY.email, 'info@tomorrownow.tech');
  assert.equal(COMPANY.vat, null);
  assert.equal(COMPANY.pec, null);
  assert.equal(PENDING_COMPANY_DETAIL, '(in fase di emissione)');
  const component = await readFile(`${root}/components/company-details.tsx`, 'utf8');
  assert.ok(component.includes('COMPANY.vat ?? PENDING_COMPANY_DETAIL'));
  assert.ok(component.includes('COMPANY.pec') && component.includes(': PENDING_COMPANY_DETAIL'));
  for (const path of ['app/page.tsx', 'app/privacy/page.tsx', 'app/terms/page.tsx', 'components/legal-page.tsx']) {
    assert.ok((await readFile(`${root}/${path}`, 'utf8')).includes('<CompanyDetails'), path);
  }
});

test('production provenance refuses modified or untracked source', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'pdf-source-provenance-'));
  const git = (...args) => execFileSync('git', args, { cwd: fixture, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  try {
    git('init');
    await writeFile(join(fixture, 'example.txt'), 'synthetic source\n');
    git('add', 'example.txt');
    git('-c', 'user.name=Synthetic QA', '-c', 'user.email=qa@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-m', 'Synthetic fixture');
    const sha = git('rev-parse', 'HEAD');
    assert.equal(readSourceRevision(fixture, true), sha);
    await writeFile(join(fixture, 'example.txt'), 'modified\n');
    assert.equal(readSourceRevision(fixture), '');
    assert.throws(() => readSourceRevision(fixture, true), /Commit the exact web source/);
    await writeFile(join(fixture, 'example.txt'), 'synthetic source\n');
    await writeFile(join(fixture, 'untracked.txt'), 'new source\n');
    assert.throws(() => readSourceRevision(fixture, true), /Commit the exact web source/);
  } finally { await rm(fixture, { recursive: true, force: true }); }
});

test('provenance manifest links the same exact source commit and ZIP', () => {
  const revision = 'a'.repeat(40);
  let artifact;
  sourceProvenancePlugin(revision).generateBundle.call({ emitFile: (value) => { artifact = value; } });
  assert.equal(artifact.fileName, 'source-version.json');
  const json = JSON.parse(artifact.source);
  assert.equal(json.revision, revision);
  assert.equal(json.sourceUrl, `https://github.com/Trader855/PDF/tree/${revision}`);
  assert.equal(json.archiveUrl, `https://github.com/Trader855/PDF/archive/${revision}.zip`);
});

test('license inventory covers every locked entry and preserves texts', async () => {
  const rawLock = await readFile(`${root}/package-lock.json`);
  const lock = JSON.parse(rawLock);
  const inventory = JSON.parse(await readFile(`${root}/public/legal/dependencies.json`));
  const notices = await readFile(`${root}/public/legal/THIRD_PARTY_LICENSES.txt`, 'utf8');
  assert.equal(inventory.lockfileSha256, createHash('sha256').update(rawLock).digest('hex'));
  assert.equal(inventory.packages.length, Object.keys(lock.packages).length - 1);
  for (const name of ['pdfjs-dist', 'vinext', 'react-server-dom-webpack', 'wrangler', '@cloudflare/vite-plugin']) {
    assert.ok(inventory.packages.some((entry) => entry.name === name), name);
  }
  for (const entry of inventory.packages) {
    for (const file of entry.files || []) {
      const content = await readFile(`${root}/${entry.location}/${file.path}`);
      assert.equal(file.sha256, createHash('sha256').update(content).digest('hex'));
      assert.ok(notices.includes(content.toString('utf8')), `${entry.name}: original text missing`);
    }
  }
  assert.deepEqual(await readFile(`${root}/public/legal/AGPL-3.0.txt`), await readFile(`${root}/LICENSE`));
  assert.equal(JSON.parse(await readFile(`${root}/package.json`)).license, 'AGPL-3.0-only');
});
