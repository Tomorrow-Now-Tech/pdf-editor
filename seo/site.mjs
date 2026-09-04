import { ROUTE_PAIRS } from '../i18n/routes.mjs';
export const SITE_ORIGIN = 'https://pdf.tomorrownow.tech';
export const SITE_NAME = 'Tomorrow Now PDF Editor';
// Public ownership tag supplied by Search Console, not an API credential.
export const GOOGLE_SITE_VERIFICATION =
  '0Ii6k1ZvylipMcRcHxABj_TJT8zTS7DpWoMX3AsLmm4';

/** @param {string} path */
export function canonicalUrl(path) {
  if (path !== '/' && !/^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(path))
    throw new Error('Invalid canonical path');
  return `${SITE_ORIGIN}${path}`;
}

/** @param {string} path @param {string} title @param {string} description
 * @returns {import('next').Metadata} */
export function pageMetadata(path, title, description) {
  const pair = ROUTE_PAIRS.find((route) => route.it === path || route.en === path);
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl(path),
      ...(pair ? { languages: { it: canonicalUrl(pair.it), en: canonicalUrl(pair.en), 'x-default': canonicalUrl(pair.it) } } : {}),
    },
    openGraph: {
      type: 'website',
      locale: path === '/en' || path.startsWith('/en/') ? 'en_GB' : 'it_IT',
      siteName: SITE_NAME,
      url: canonicalUrl(path),
      title,
      description,
      images: [
        {
          url: `${SITE_ORIGIN}/og.png`,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_ORIGIN}/og.png`],
    },
  };
}

/** @param {unknown} value */
export function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
