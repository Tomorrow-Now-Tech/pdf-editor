declare const __WEB_HOSTING_TARGET__: string;

export const WEB_HOSTING_DESCRIPTION = typeof __WEB_HOSTING_TARGET__ === 'string'
  && __WEB_HOSTING_TARGET__ === 'cloudflare'
  ? 'Cloudflare Workers con Static Assets, senza passare da Sites'
  : 'Sites con una distribuzione su Cloudflare Workers';
