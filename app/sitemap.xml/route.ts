import { canonicalUrl } from '@/seo/site.mjs';
import { TOOL_PAGES } from '@/seo/tools.mjs';

export function GET() {
  const paths = [
    '/',
    ...TOOL_PAGES.map((tool) => `/${tool.slug}`),
    '/privacy',
    '/terms',
    '/licenses',
  ];
  // No invented lastmod: deploy dates are not content modification dates.
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${canonicalUrl(path)}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
