import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { localizedPath } from '../i18n/routes.mjs';
import { pageMetadata } from '../seo/site.mjs';

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
