/** @typedef {'it' | 'en'} Locale */

// Keep the existing Italian URLs stable. Only ship locales with complete copy.
export const ROUTE_PAIRS = [
  { it: '/', en: '/en' },
  { it: '/comprimi-pdf', en: '/en/compress-pdf' },
  { it: '/dividi-pdf', en: '/en/split-pdf' },
  { it: '/pdf-in-word', en: '/en/pdf-to-word' },
  { it: '/modifica-pdf', en: '/en/edit-pdf' },
  { it: '/privacy', en: '/en/privacy' },
  { it: '/terms', en: '/en/terms' },
  { it: '/licenses', en: '/en/licenses' },
];

/** @param {string} path @param {Locale} locale */
export function localizedPath(path, locale) {
  const pair = ROUTE_PAIRS.find((route) => route.it === path || route.en === path);
  if (!pair) throw new Error('Unknown localized route');
  return pair[locale];
}

export const PUBLIC_PATHS = ROUTE_PAIRS.flatMap((pair) => [pair.it, pair.en]);
