import assert from 'node:assert/strict';
import { MAC_APP_SOURCE_URL, MAC_DMG_DOWNLOAD_URL } from '../downloads/mac.mjs';

const origin = 'https://pdf.tomorrownow.tech';
const get = (path) =>
  fetch(new URL(path, origin), {
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
    headers: { 'Cache-Control': 'no-cache' },
  });

const pages = [
  {
    path: '/editor-pdf-mac',
    canonical: `${origin}/editor-pdf-mac`,
    alternate: `${origin}/en/pdf-editor-for-mac`,
  },
  {
    path: '/en/pdf-editor-for-mac',
    canonical: `${origin}/en/pdf-editor-for-mac`,
    alternate: `${origin}/editor-pdf-mac`,
  },
];

for (const page of pages) {
  const response = await get(page.path);
  assert.equal(response.status, 200, page.path);
  assert.equal(
    response.headers.get('set-cookie'),
    null,
    `Unexpected cookie: ${page.path}`,
  );
  const html = await response.text();
  assert.ok(
    html.includes(`rel="canonical" href="${page.canonical}"`),
    `Canonical missing: ${page.path}`,
  );
  assert.ok(
    html.includes(`href="${page.alternate}"`),
    `Language alternate missing: ${page.path}`,
  );
  assert.ok(
    html.includes(MAC_DMG_DOWNLOAD_URL),
    `Direct DMG link missing: ${page.path}`,
  );
  assert.ok(
    html.includes(MAC_APP_SOURCE_URL),
    `Release source link missing: ${page.path}`,
  );
  assert.ok(
    html.includes('Mac-PDF-Editor-1.5.1-arm64.dmg'),
    `DMG version missing: ${page.path}`,
  );
}

for (const [path, destination] of [
  ['/', '/editor-pdf-mac'],
  ['/en', '/en/pdf-editor-for-mac'],
]) {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  assert.ok(
    (await response.text()).includes(`href="${destination}"`),
    `Mac page link missing: ${path}`,
  );
}

const download = await fetch(MAC_DMG_DOWNLOAD_URL, {
  method: 'HEAD',
  redirect: 'follow',
  signal: AbortSignal.timeout(30_000),
});
assert.equal(download.status, 200, 'DMG download');
assert.match(
  download.headers.get('content-disposition') || '',
  /attachment;\s*filename=Mac-PDF-Editor-1\.5\.1-arm64\.dmg/i,
);
assert.equal(download.headers.get('content-type'), 'application/octet-stream');
assert.ok(
  Number(download.headers.get('content-length')) > 100_000_000,
  'DMG appears incomplete',
);

console.log(
  'Mac landing verified: IT/EN pages, internal links and direct DMG download.',
);
