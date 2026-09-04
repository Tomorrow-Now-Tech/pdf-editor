import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { TOOL_PAGES } from '../seo/tools.mjs';
import {
  canonicalUrl,
  GOOGLE_SITE_VERIFICATION,
  pageMetadata,
  safeJsonLd,
} from '../seo/site.mjs';

test('SEO tools have unique canonical URLs, metadata and useful tool-specific content', async () => {
  assert.equal(TOOL_PAGES.length, 4);
  for (const field of ['slug', 'title', 'description', 'heading']) {
    assert.equal(
      new Set(TOOL_PAGES.map((tool) => tool[field])).size,
      TOOL_PAGES.length,
    );
  }
  const home = await readFile(
    new URL('../components/home-page.tsx', import.meta.url),
    'utf8',
  );
  for (const tool of TOOL_PAGES) {
    assert.ok(['compress', 'split', 'word', 'edit'].includes(tool.mode));
    assert.ok(tool.steps.length >= 3 && tool.faqs.length >= 3);
    assert.ok(tool.warning.length > 100 && tool.detail.length >= 2);
    assert.ok(
      home.includes(`path("/${tool.slug}")`),
      'Tools must be discoverable from the home page',
    );
    const source = await readFile(
      new URL(`../app/(it)/${tool.slug}/page.tsx`, import.meta.url),
      'utf8',
    );
    assert.ok(
      source.includes(`TOOLS['${tool.slug}']`) &&
        source.includes('<SeoToolPage tool={tool}'),
    );
    const metadata = pageMetadata(
      `/${tool.slug}`,
      tool.title,
      tool.description,
    );
    assert.equal(metadata.alternates.canonical, canonicalUrl(`/${tool.slug}`));
    assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
    assert.equal(metadata.twitter.title, tool.title);
  }
});

test('SEO data cannot create arbitrary canonical hosts or executable JSON-LD', () => {
  for (const invalid of [
    '//example.org',
    'https://example.org',
    '/foo?bar=1',
    '/foo#bar',
    '/..',
  ]) {
    assert.throws(() => canonicalUrl(invalid));
  }
  assert.equal(canonicalUrl('/'), 'https://pdf.tomorrownow.tech/');
  const hostile = { name: '</script><script>alert(1)</script>' };
  assert.ok(!safeJsonLd(hostile).includes('<'));
  assert.deepEqual(JSON.parse(safeJsonLd(hostile)), hostile);
  assert.match(GOOGLE_SITE_VERIFICATION, /^[A-Za-z0-9_-]+$/);
});

test('tool landings preselect the editor tool without bypassing visual-edit safeguards', async () => {
  const page = await readFile(
    new URL('../components/seo-tool-page.tsx', import.meta.url),
    'utf8',
  );
  const editor = await readFile(
    new URL('../components/pdf-editor.tsx', import.meta.url),
    'utf8',
  );
  assert.ok(page.includes('initialTool={tool.mode}'));
  assert.ok(editor.includes('useState<ToolMode>(initialTool)'));
  assert.ok(editor.includes('disabled={hasVisualEdits}'));
  assert.ok(editor.includes('visualEditAcknowledged'));
  assert.ok(
    page.includes('WEB_SOURCE_URL') && page.includes('<CompanyDetails'),
  );
});
