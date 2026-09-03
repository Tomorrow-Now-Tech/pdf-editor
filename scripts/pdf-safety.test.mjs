import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { PDFDocument, StandardFonts, pushGraphicsState, popGraphicsState, concatTransformationMatrix, drawObject, rgb } from 'pdf-lib';
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { assertRasterSize, pdfDocumentOptions, rasterizeChecked } from '../pdf/runtime.mjs';

const require = createRequire(import.meta.url);
const { createCanvas } = require('@napi-rs/canvas');
const root = resolve(import.meta.dirname, '..');
const assets = `${root}/public/pdfjs/`;

// Original synthetic fixtures, not customer documents. 16x16 red JPEG2000
// produced with Pillow/OpenJPEG 2.5.4. The CCITT Group4 stream encodes a
// 16x16 monochrome square and is wrapped in JBIG2 generic MMR segments below.
const jpx = Buffer.from('AAAADGpQICANCocKAAAAFGZ0eXBqcDIgAAAAAGpwMiAAAAAtanAyaAAAABZpaGRyAAAAEAAAABAAAwcHAAAAAAAPY29scgEAAAAAABAAAACqanAyY/9P/1EALwAAAAAAEAAAABAAAAAAAAAAAAAAABAAAAAQAAAAAAAAAAAAAwcBAQcBAQcBAf9SAAwAAAABAAQEBAAB/1wAEEBASEhQSEhQSEhQSEhQ/2QAJQABQ3JlYXRlZCBieSBPcGVuSlBFRyB2ZXJzaW9uIDIuNS40/5AACgAAAAAAJgAB/5PPtAQA34AIB9+ACAeAgICAgICAgICAgID/2Q==', 'base64');
const ccitt = Buffer.from('JqC/8uf////4/wAQAQ==', 'base64');
function segment(number, type, data) {
  const header = Buffer.alloc(11);
  header.writeUInt32BE(number, 0);
  header[4] = type;
  header[6] = 1;
  header.writeUInt32BE(data.length, 7);
  return Buffer.concat([header, data]);
}
const pageInfo = Buffer.alloc(19);
pageInfo.writeUInt32BE(16, 0);
pageInfo.writeUInt32BE(16, 4);
const generic = Buffer.alloc(18);
generic.writeUInt32BE(16, 0);
generic.writeUInt32BE(16, 4);
generic[17] = 1; // MMR encoding
const jbig2 = Buffer.concat([segment(1, 48, pageInfo), segment(2, 38, Buffer.concat([generic, ccitt])), segment(3, 49, Buffer.alloc(0))]);

async function imagePdf(filter, imageData, addFirstPage = false) {
  const pdf = await PDFDocument.create();
  if (addFirstPage) {
    const first = pdf.addPage([64, 64]);
    first.drawRectangle({ x: 4, y: 4, width: 30, height: 30, color: rgb(0, 0, 1) });
  }
  const page = pdf.addPage([64, 64]);
  const stream = pdf.context.stream(imageData, {
    Type: 'XObject', Subtype: 'Image', Width: 16, Height: 16,
    ColorSpace: filter === 'JPXDecode' ? 'DeviceRGB' : 'DeviceGray',
    BitsPerComponent: filter === 'JPXDecode' ? 8 : 1, Filter: filter,
  });
  const name = page.node.newXObject('Synthetic', pdf.context.register(stream));
  page.pushOperators(pushGraphicsState(), concatTransformationMatrix(64, 0, 0, 64, 0, 0), drawObject(name), popGraphicsState());
  return pdf.save();
}

async function compress(bytes, resourceRoot = assets, verifyCanvas = () => {}) {
  const task = getDocument({ ...pdfDocumentOptions(bytes, resourceRoot), useWorkerFetch: false });
  let saveCalls = 0;
  try {
    const pdf = await task.promise;
    const output = await PDFDocument.create();
    const save = output.save.bind(output);
    output.save = (...args) => { saveCalls += 1; return save(...args); };
    const compressed = await rasterizeChecked(pdf, createCanvas, (canvas) => {
      verifyCanvas(canvas);
      return canvas.toBuffer('image/jpeg');
    }, output);
    assert.equal(saveCalls, 1);
    return compressed;
  } catch (error) {
    assert.equal(saveCalls, 0, 'Do not save a partially rendered document');
    throw error;
  } finally {
    await task.destroy();
  }
}

test('all PDF.js resources and licenses match the pinned dependency', async () => {
  const source = dirname(require.resolve('pdfjs-dist/package.json'));
  assert.equal(JSON.parse(await readFile(`${source}/package.json`)).version, '6.3.289');
  assert.equal(OPS.dependency, 1, 'Review image-dependency adapter if the API changes');
  async function sameTree(relative) {
    for (const entry of await readdir(`${source}/${relative}`, { withFileTypes: true })) {
      const child = `${relative}/${entry.name}`;
      if (entry.isDirectory()) await sameTree(child);
      else assert.deepEqual(await readFile(`${assets}${child}`), await readFile(`${source}/${child}`), child);
    }
  }
  for (const directory of ['wasm', 'cmaps', 'standard_fonts', 'iccs']) await sameTree(directory);
  assert.deepEqual(await readFile(`${root}/public/pdf.worker.min.mjs`), await readFile(`${source}/build/pdf.worker.min.mjs`));
  assert.deepEqual(await readFile(`${assets}LICENSE`), await readFile(`${source}/LICENSE`));
});

// Run missing resources BEFORE valid decodes: PDF.js caches decoder bytes in
// the process. This case verifies the real decoder fallback, not a stub.
for (const [filter, data] of [['JPXDecode', jpx], ['JBIG2Decode', jbig2]]) {
  test(`${filter}: missing WASM and JS fallback abort export`, async () => {
    const bytes = await imagePdf(filter, data, true);
    const original = bytes.slice();
    await assert.rejects(compress(bytes, `${root}/absent-test-resources/`), /immagine non decodificata/);
    assert.deepEqual(bytes, original, 'Original bytes must remain untouched');
  });
}

test('JPEG2000 renders red pixels and exports a nonblank PDF', async () => {
  let checked = false;
  const saved = await compress(await imagePdf('JPXDecode', jpx), assets, (canvas) => {
    const [r, g, b] = canvas.getContext('2d').getImageData(32, 32, 1, 1).data;
    assert.ok(r > 200 && g < 30 && b < 30, 'Image must be red, not a blank white page');
    checked = true;
  });
  assert.ok(checked);
  assert.equal((await PDFDocument.load(saved)).getPageCount(), 1);
});

test('JBIG2 renders both black and white pixels and exports', async () => {
  let checked = false;
  const saved = await compress(await imagePdf('JBIG2Decode', jbig2), assets, (canvas) => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    const reds = Array.from(pixels).filter((_, index) => index % 4 === 0);
    assert.ok(reds.some((value) => value < 30) && reds.some((value) => value > 225));
    checked = true;
  });
  assert.ok(checked);
  assert.equal((await PDFDocument.load(saved)).getPageCount(), 1);
});

for (const filter of ['JPXDecode', 'JBIG2Decode']) {
  test(`${filter}: corrupt second page cannot create a partial export`, async () => {
    const bytes = await imagePdf(filter, Buffer.from('invalid synthetic codec data'), true);
    const original = bytes.slice();
    await assert.rejects(compress(bytes));
    assert.deepEqual(bytes, original);
  });
}

test('oversized, empty or nonfinite raster dimensions are rejected', () => {
  assert.doesNotThrow(() => assertRasterSize(1000, 2000));
  for (const [w, h] of [[20000, 100], [5000, 5000], [Infinity, 1], [NaN, 1], [0, 1], [-1, 4]]) {
    assert.throws(() => assertRasterSize(w, h), /troppo grande/);
  }
});

test('visual replacement leaves original extractable, as the UI warns', async () => {
  const doc = await PDFDocument.create();
  const page = doc.addPage();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText('ORIGINAL SECRET 6', { x: 50, y: 700, size: 12, font });
  page.drawRectangle({ x: 45, y: 690, width: 200, height: 30, color: rgb(1, 1, 1) });
  page.drawText('VISIBLE REPLACEMENT', { x: 50, y: 700, size: 12, font });
  const task = getDocument({ ...pdfDocumentOptions(await doc.save(), assets), useWorkerFetch: false });
  try {
    const pdf = await task.promise;
    const content = await (await pdf.getPage(1)).getTextContent();
    const extracted = content.items.map((item) => item.str || '').join(' ');
    assert.match(extracted, /ORIGINAL SECRET 6/);
    assert.match(extracted, /VISIBLE REPLACEMENT/);
  } finally { await task.destroy(); }
  const ui = await readFile(`${root}/components/pdf-editor.tsx`, 'utf8');
  assert.match(ui, /Non è una cancellazione sicura/);
  assert.match(ui, /disabled=\{!visualEditAcknowledged\}/);
  assert.match(ui, /tool === 'edit' \|\| hasVisualEdits/);
  assert.match(ui, /if \(hasVisualEdits\)/);
  assert.doesNotMatch(ui, /Testo sostituito direttamente nel PDF/);
});
