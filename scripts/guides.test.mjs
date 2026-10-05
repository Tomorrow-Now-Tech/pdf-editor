import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { localizedPath } from '../i18n/routes.mjs';
import { pageMetadata } from '../seo/site.mjs';
import { measureCompressionFixture } from './compression-guide-fixture.mjs';

test('date guide has equivalent routes and self-canonical metadata', () => {
  assert.equal(localizedPath('/aggiungere-data-pdf', 'en'), '/en/add-date-to-pdf');
  assert.equal(localizedPath('/en/add-date-to-pdf', 'it'), '/aggiungere-data-pdf');
  for (const path of ['/aggiungere-data-pdf', '/en/add-date-to-pdf']) {
    const metadata = pageMetadata(path, 'Title', 'Description');
    assert.equal(metadata.alternates.canonical, `https://pdf.tomorrownow.tech${path}`);
  }
});

test('date guide is reproducible, honest and connected to the existing editor', async () => {
  const component = await readFile(new URL('../components/date-guide-page.tsx', import.meta.url), 'utf8');
  for (const required of [
    '21/09/2026',
    'senza documenti o dati di clienti',
    'without uploading a customer document or personal information',
    'non è redazione sicura',
    'this is not secure redaction',
    '/modifica-pdf#editor-pdf',
    '/en/edit-pdf#editor-pdf',
    "'@type': 'Article'",
  ]) assert.ok(component.includes(required), required);

  const home = await readFile(new URL('../components/home-page.tsx', import.meta.url), 'utf8');
  const tool = await readFile(new URL('../components/seo-tool-page.tsx', import.meta.url), 'utf8');
  assert.ok(home.includes('path("/aggiungere-data-pdf")'));
  assert.ok(tool.includes("path('/aggiungere-data-pdf')") && tool.includes('id="editor-pdf"'));

  for (const route of [
    '../app/(it)/aggiungere-data-pdf/page.tsx',
    '../app/en/add-date-to-pdf/page.tsx',
  ]) {
    const source = await readFile(new URL(route, import.meta.url), 'utf8');
    assert.ok(source.includes('<DateGuidePage') && source.includes('pageMetadata('));
  }
});

test('email compression guide has equivalent routes and self-canonical metadata', () => {
  assert.equal(localizedPath('/pdf-troppo-pesante-email', 'en'), '/en/pdf-too-large-for-email');
  assert.equal(localizedPath('/en/pdf-too-large-for-email', 'it'), '/pdf-troppo-pesante-email');
  for (const path of ['/pdf-troppo-pesante-email', '/en/pdf-too-large-for-email']) {
    const metadata = pageMetadata(path, 'Title', 'Description');
    assert.equal(metadata.alternates.canonical, `https://pdf.tomorrownow.tech${path}`);
  }
});

test('email compression guide uses measured synthetic evidence and states the tradeoffs', async () => {
  const measurements = await measureCompressionFixture();
  assert.equal(measurements.pages, 4);
  assert.equal((measurements.originalBytes / 1_000_000).toFixed(1), '22.5');
  assert.equal((measurements.strongBytes / 1_000_000).toFixed(1), '0.9');
  assert.equal(measurements.strongReductionPercent, 96);
  assert.ok(measurements.losslessBytes >= measurements.originalBytes);
  assert.ok(measurements.sampledLuminanceRange > 40);

  const component = await readFile(new URL('../components/email-compression-guide-page.tsx', import.meta.url), 'utf8');
  for (const required of [
    '22,5 MB',
    '22.5 MB',
    '0,9 MB',
    '0.9 MB',
    'riduzione del 96%',
    'measured reduction of 96%',
    'non una promessa per ogni PDF',
    'not a promise for every PDF',
    'non sostituisce una redazione verificata',
    'is not a substitute for verified redaction',
    '/comprimi-pdf#editor-pdf',
    '/en/compress-pdf#editor-pdf',
    "'@type': 'Article'",
  ]) assert.ok(component.includes(required), required);
  assert.ok(!component.includes('—') && !component.includes('–'));

  const home = await readFile(new URL('../components/home-page.tsx', import.meta.url), 'utf8');
  const tool = await readFile(new URL('../components/seo-tool-page.tsx', import.meta.url), 'utf8');
  assert.ok(home.includes('path("/pdf-troppo-pesante-email")'));
  assert.ok(tool.includes("path('/pdf-troppo-pesante-email')"));

  for (const route of [
    '../app/(it)/pdf-troppo-pesante-email/page.tsx',
    '../app/en/pdf-too-large-for-email/page.tsx',
  ]) {
    const source = await readFile(new URL(route, import.meta.url), 'utf8');
    assert.ok(source.includes('<EmailCompressionGuidePage') && source.includes('pageMetadata('));
  }
});
