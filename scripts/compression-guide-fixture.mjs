import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

import { PDFDocument } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

import { pdfDocumentOptions, rasterizeChecked } from '../pdf/runtime.mjs';

const require = createRequire(import.meta.url);
const { createCanvas } = require('@napi-rs/canvas');
const resourceRoot = `${import.meta.dirname}/../public/pdfjs/`;

function pseudoRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function syntheticScan(pageNumber) {
  const width = 1240;
  const height = 1754;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  const random = pseudoRandom(20261005 + pageNumber);

  context.fillStyle = '#f8f8f5';
  context.fillRect(0, 0, width, height);

  const pixels = context.getImageData(0, 0, width, height);
  for (let index = 0; index < pixels.data.length; index += 4) {
    pixels.data[index] = Math.floor(random() * 256);
    pixels.data[index + 1] = Math.floor(random() * 256);
    pixels.data[index + 2] = Math.floor(random() * 256);
    pixels.data[index + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);

  context.fillStyle = '#172554';
  context.fillRect(90, 90, width - 180, 104);
  context.fillStyle = '#ffffff';
  context.font = 'bold 42px sans-serif';
  context.fillText(`DOCUMENTO SINTETICO ${pageNumber}`, 130, 158);

  context.fillStyle = '#1f2937';
  for (let row = 0; row < 29; row += 1) {
    const y = 285 + row * 43;
    const length = 690 + Math.floor(random() * 360);
    context.globalAlpha = 0.62 + random() * 0.25;
    context.fillRect(105, y, length, 8 + Math.floor(random() * 4));
  }
  context.globalAlpha = 1;

  context.fillStyle = '#dbeafe';
  context.fillRect(105, 1450, width - 210, 170);
  context.fillStyle = '#1e3a8a';
  context.font = '28px sans-serif';
  context.fillText('Esempio generato, nessun dato personale', 145, 1535);

  return canvas.toBuffer('image/png');
}

export async function measureCompressionFixture() {
  const source = await PDFDocument.create();
  for (let pageNumber = 1; pageNumber <= 4; pageNumber += 1) {
    const image = await source.embedPng(syntheticScan(pageNumber));
    const page = source.addPage([595, 842]);
    page.drawImage(image, { x: 0, y: 0, width: 595, height: 842 });
  }
  const original = await source.save({ useObjectStreams: true });

  const lossless = await (
    await PDFDocument.load(original)
  ).save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const task = getDocument({
    ...pdfDocumentOptions(original, resourceRoot),
    useWorkerFetch: false,
  });
  try {
    const input = await task.promise;
    const output = await PDFDocument.create();
    let encodedJpegBytes = 0;
    let sampledLuminanceRange = 0;
    const strong = await rasterizeChecked(
      input,
      (width, height) => createCanvas(width, height),
      (canvas) => {
        const pixels = canvas
          .getContext('2d')
          .getImageData(0, 0, canvas.width, canvas.height).data;
        let minimum = 255;
        let maximum = 0;
        for (let index = 0; index < pixels.length; index += 4096) {
          minimum = Math.min(minimum, pixels[index]);
          maximum = Math.max(maximum, pixels[index]);
        }
        sampledLuminanceRange = Math.max(
          sampledLuminanceRange,
          maximum - minimum,
        );
        // Browser canvas.toBlob uses a 0-1 quality value. The native test
        // encoder expects the equivalent 0-100 value.
        const jpeg = canvas.encodeSync('jpeg', 66);
        encodedJpegBytes += jpeg.length;
        return jpeg;
      },
      output,
    );
    if (sampledLuminanceRange < 40)
      throw new Error('La fixture rasterizzata risulta priva di dettaglio.');
    return {
      pages: input.numPages,
      originalBytes: original.length,
      losslessBytes: lossless.length,
      strongBytes: strong.length,
      encodedJpegBytes,
      sampledLuminanceRange,
      strongReductionPercent:
        Math.round((1 - strong.length / original.length) * 1000) / 10,
    };
  } finally {
    await task.destroy();
  }
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  console.log(JSON.stringify(await measureCompressionFixture(), null, 2));
}
