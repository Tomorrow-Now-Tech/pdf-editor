import { canonicalUrl } from '@/seo/site.mjs';
import { PUBLIC_PATHS, ROUTE_PAIRS } from '@/i18n/routes.mjs';

export function GET() {
  const paths = PUBLIC_PATHS;
  // No invented lastmod: deploy dates are not content modification dates.
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${paths.map((path) => {
    const pair = ROUTE_PAIRS.find((route) => route.it === path || route.en === path)!;
    const alternates = Object.entries({ ...pair, 'x-default': pair.it }).map(([language, alternate]) => `<xhtml:link rel="alternate" hreflang="${language}" href="${canonicalUrl(alternate)}"/>`).join('');
    return `  <url><loc>${canonicalUrl(path)}</loc>${alternates}</url>`;
  }).join('\n')}\n</urlset>\n`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
