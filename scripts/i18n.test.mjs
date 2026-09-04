import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { EN, FORMATS, TRANSLATORS, formatMessage, localizedError } from '../i18n/messages.mjs';
import { PUBLIC_PATHS, ROUTE_PAIRS, localizedPath } from '../i18n/routes.mjs';
import { EN_TOOL_PAGES } from '../seo/tools-en.mjs';
import { TOOL_PAGES } from '../seo/tools.mjs';
import { canonicalUrl, pageMetadata } from '../seo/site.mjs';
import { MAC_DMG_DESCRIPTION } from '../downloads/mac.mjs';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { pdfDocumentOptions } from '../pdf/runtime.mjs';

test('language variants have distinct URLs, reciprocal alternates and self-canonicals', () => {
  assert.equal(PUBLIC_PATHS.length, 16);
  assert.equal(new Set(PUBLIC_PATHS).size, 16);
  for (const pair of ROUTE_PAIRS) {
    for (const locale of ['it', 'en']) {
      assert.equal(localizedPath(pair.it, locale), pair[locale]);
      assert.equal(localizedPath(pair.en, locale), pair[locale]);
      const metadata = pageMetadata(pair[locale], 'Title', 'Description');
      assert.equal(metadata.alternates.canonical, canonicalUrl(pair[locale]));
      assert.deepEqual(metadata.alternates.languages, {
        it: canonicalUrl(pair.it), en: canonicalUrl(pair.en), 'x-default': canonicalUrl(pair.it),
      });
    }
  }
  assert.throws(() => localizedPath('/fr', 'en'));
  assert.throws(() => localizedPath('//example.org', 'en'));
});

test('English tools preserve functionality and have complete editorial content', async () => {
  assert.equal(EN_TOOL_PAGES.length, TOOL_PAGES.length);
  for (const field of ['slug', 'title', 'description', 'heading']) assert.equal(new Set(EN_TOOL_PAGES.map(tool => tool[field])).size, 4);
  for (const tool of EN_TOOL_PAGES) {
    const italian = TOOL_PAGES.find(candidate => candidate.mode === tool.mode);
    assert.equal(localizedPath(`/${italian.slug}`, 'en'), `/en/${tool.slug}`);
    assert.equal(tool.steps.length, italian.steps.length);
    assert.equal(tool.faqs.length, italian.faqs.length);
    assert.ok(tool.warning.length > 100 && tool.detail.length >= 2);
    const route = await readFile(new URL(`../app/en/${tool.slug}/page.tsx`, import.meta.url), 'utf8');
    assert.ok(route.includes(`EN_TOOLS['${tool.slug}']`) && route.includes('locale="en"'));
  }
});

test('shared UI copy cannot silently fall back to untranslated Italian', async () => {
  const allowed = new Set(['Tomorrow Now', 'PDF Editor', 'A Tomorrow Now product', 'Privacy', 'Open source', 'Mac', 'Web + Mac', '·', 'pt', 'Helvetica', 'Times', 'Courier', '/', '.']);
  const files = ['components/home-page.tsx', 'components/pdf-editor.tsx', 'components/seo-tool-page.tsx', 'components/legal-page.tsx', 'components/company-details.tsx'];
  let translated = 0;
  for (const file of files) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isJsxText(node)) {
        const text = node.text.replace(/\s+/g, ' ').trim();
        if (text) assert.ok(allowed.has(text), `Untranslated UI text in ${file}: ${text}`);
      }
      if (ts.isCallExpression(node) && node.expression.getText(sf) === 't' && ts.isStringLiteral(node.arguments[0])) {
        assert.ok(Object.hasOwn(EN, node.arguments[0].text), `Missing translation: ${node.arguments[0].text}`);
        translated++;
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);
  }
  assert.ok(translated > 120);
  assert.ok(Object.hasOwn(EN, MAC_DMG_DESCRIPTION));
  assert.equal(TRANSLATORS.en('__proto__'), '__proto__');
  assert.equal(TRANSLATORS.it('Apri PDF'), 'Apri PDF');
});

test('progress, safety messages and image failures are localised without losing meaning', () => {
  assert.deepEqual(Object.keys(FORMATS.en).sort(), Object.keys(FORMATS.it).sort());
  const placeholders = value => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
  for (const key of Object.keys(FORMATS.en)) assert.deepEqual(placeholders(FORMATS.en[key]), placeholders(FORMATS.it[key]));
  assert.equal(formatMessage('en', 'preview', { page: 6, count: 12 }), 'PDF preview, page 6 of 12');
  const failure = new Error('Pagina 6: immagine non decodificata. Il PDF precedente è stato conservato.');
  assert.match(localizedError(failure, 'Failed', 'en'), /page 6.*could not be decoded.*previous PDF has been kept/);
  assert.equal(localizedError(failure, 'Errore', 'it'), failure.message);
  assert.match(localizedError(new Error('WinAnsi cannot encode'), 'Failed', 'en'), /font cannot display/);
  assert.equal(TRANSLATORS.en('Non è una cancellazione sicura.'), 'This is not secure redaction.');
});

test('English text, digits and punctuation survive PDF save and extraction in every available font', async () => {
  const sample = 'Invoice 6 — £1,234.56 / $78.90 / €12.34: “Approved” — it’s ready!';
  for (const fontName of [StandardFonts.Helvetica, StandardFonts.TimesRoman, StandardFonts.Courier]) {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(fontName);
    pdf.addPage([1000, 300]).drawText(sample, { x: 30, y: 200, font, size: 14 });
    const bytes = await pdf.save();
    const task = getDocument({ ...pdfDocumentOptions(bytes, `${import.meta.dirname}/../public/pdfjs/`), useWorkerFetch: false });
    try {
      const doc = await task.promise;
      const text = (await (await doc.getPage(1)).getTextContent()).items.map(item => item.str || '').join('');
      assert.equal(text, sample, fontName);
    } finally { await task.destroy(); }
  }
});
