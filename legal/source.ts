declare const __WEB_SOURCE_REVISION__: string;

export const WEB_SOURCE_REVISION = typeof __WEB_SOURCE_REVISION__ === 'string' ? __WEB_SOURCE_REVISION__ : '';
export const WEB_SOURCE_BRANCH = 'https://github.com/Trader855/PDF/tree/web';
export const WEB_SOURCE_URL = WEB_SOURCE_REVISION
  ? `https://github.com/Trader855/PDF/tree/${WEB_SOURCE_REVISION}`
  : WEB_SOURCE_BRANCH;
export const WEB_SOURCE_ARCHIVE = WEB_SOURCE_REVISION
  ? `https://github.com/Trader855/PDF/archive/${WEB_SOURCE_REVISION}.zip`
  : null;
