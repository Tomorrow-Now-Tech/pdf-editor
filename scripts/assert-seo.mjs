import assert from 'node:assert/strict';
import { TOOL_PAGES } from '../seo/tools.mjs';
import { EN_TOOL_PAGES } from '../seo/tools-en.mjs';
import { PUBLIC_PATHS, ROUTE_PAIRS } from '../i18n/routes.mjs';
import {
  SITE_ORIGIN,
  GOOGLE_SITE_VERIFICATION,
  canonicalUrl,
} from '../seo/site.mjs';

// Read the server-rendered HTML: crawlers must not need to open a PDF or run
// the editor to discover titles, navigation, content and ownership metadata.
export async function assertSeo(get) {
  const paths = PUBLIC_PATHS;
  const sitemap = await get('/sitemap.xml');
  assert.equal(sitemap.status, 200, 'sitemap');
  assert.match(sitemap.headers.get('content-type') || '', /application\/xml/);
  const xml = await sitemap.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(
    urls.sort(),
    paths.map(canonicalUrl).sort(),
    'Sitemap must contain only canonical public pages',
  );
  const robots = await get('/robots.txt');
  assert.equal(robots.status, 200, 'robots');
  const robotsText = await robots.text();
  assert.ok(robotsText.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`));
  assert.ok(
    !/^Disallow:\s*\/\s*$/im.test(robotsText),
    'Public crawling must not be blocked',
  );
  const titles = new Set();
  for (const path of paths) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    assert.ok(
      !/noindex/i.test(response.headers.get('x-robots-tag') || ''),
      path,
    );
    assert.equal(
      response.headers.get('set-cookie'),
      null,
      'SEO must not introduce tracking cookies',
    );
    const html = await response.text();
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
    const locale = path === '/en' || path.startsWith('/en/') ? 'en' : 'it';
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`), `Document language: ${path}`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `One H1: ${path}`);
    const links = [...head.matchAll(/<link\b[^>]*>/gi)].map(
      (match) => match[0],
    );
    const canonicals = links.filter((link) => /rel="canonical"/.test(link));
    assert.equal(canonicals.length, 1, `One canonical required: ${path}`);
    const canonical = canonicals[0].match(/href="([^"]+)"/)?.[1];
    assert.equal(new URL(canonical).href, canonicalUrl(path), path);
    const pair = ROUTE_PAIRS.find(route => route[locale] === path);
    for (const [language, destination] of Object.entries({ ...pair, 'x-default': pair.it })) {
      const alternate = links.find(link => new RegExp(`hreflang="${language}"`, 'i').test(link));
      assert.ok(alternate, `Missing alternate ${language}: ${path}`);
      assert.equal(new URL(alternate.match(/href="([^"]+)"/)?.[1]).href, canonicalUrl(destination));
      assert.ok(xml.includes(`hreflang="${language}" href="${canonicalUrl(destination)}"`));
    }
    assert.ok(html.includes(`href="${pair.it}"`) && html.includes(`href="${pair.en}"`), `Language switch: ${path}`);
    const title = head.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(
      title && !titles.has(title),
      `Missing or duplicate title: ${path}`,
    );
    titles.add(title);
    assert.match(head, /<meta\b[^>]*name="description"[^>]*>/);
    assert.ok(
      !/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(head),
      path,
    );
    if (path === '/' || path === '/en') {
      assert.ok(
        head.includes(`content="${GOOGLE_SITE_VERIFICATION}"`),
        'Google verification must be in the initial head',
      );
      for (const tool of locale === "en" ? EN_TOOL_PAGES : TOOL_PAGES)
        assert.ok(html.includes(`href="${locale === "en" ? "/en" : ""}/${tool.slug}"`), tool.slug);
    }
    const tool = (locale === "en" ? EN_TOOL_PAGES : TOOL_PAGES).find(candidate => path === `${locale === "en" ? "/en" : ""}/${candidate.slug}`);
    if (locale === 'en') {
      const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ');
      assert.doesNotMatch(visible, /\b(?:Scarica|Trascina|Nessun|Pagine|Carattere|Informazioni legali|Partita IVA|in fase di emissione)\b/, `Untranslated English page: ${path}`);
    }
    if (tool) {
      assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
      assert.ok(
        html.includes(tool.heading) && html.includes(tool.warning),
        `Visible content missing: ${path}`,
      );
      assert.ok(
        html.includes('type="file"'),
        `Usable local editor missing: ${path}`,
      );
      const scripts = [
        ...html.matchAll(
          /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
        ),
      ];
      const breadcrumb = scripts
        .map((match) => JSON.parse(match[1]))
        .find((data) => data['@type'] === 'BreadcrumbList');
      assert.equal(
        breadcrumb?.itemListElement[1].item,
        canonicalUrl(path),
        `Breadcrumb mismatch: ${path}`,
      );
    }
  }
  for (const unknown of ['/en/not-a-real-tool', '/fr', '/en/comprimi-pdf']) assert.equal((await get(unknown)).status, 404, unknown);
  console.log(
    `SEO verified: ${paths.length} canonical pages, sitemap, robots, public verification tag and crawlable tool content.`,
  );
}
