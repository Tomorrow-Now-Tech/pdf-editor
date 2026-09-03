export const SITE_ORIGIN = 'https://pdf.tomorrownow.tech';
export const SITE_NAME = 'Tomorrow Now PDF Editor';
// Public ownership tag supplied by Search Console, not an API credential.
export const GOOGLE_SITE_VERIFICATION =
  '0Ii6k1ZvylipMcRcHxABj_TJT8zTS7DpWoMX3AsLmm4';

/** @param {string} path */
export function canonicalUrl(path) {
  if (path !== '/' && !/^\/[a-z0-9-]+$/.test(path))
    throw new Error('Invalid canonical path');
  return `${SITE_ORIGIN}${path}`;
}

/** @param {string} path @param {string} title @param {string} description
 * @returns {import('next').Metadata} */
export function pageMetadata(path, title, description) {
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(path) },
    openGraph: {
      type: 'website',
      locale: 'it_IT',
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
