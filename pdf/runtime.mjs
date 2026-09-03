/** Same-origin resources only. No PDF data is sent to these resource URLs. */
export function pdfDocumentOptions(data, resourceRoot = '/pdfjs/') {
  return {
    data: data.slice(),
    cMapUrl: `${resourceRoot}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${resourceRoot}standard_fonts/`,
    wasmUrl: `${resourceRoot}wasm/`,
    iccUrl: `${resourceRoot}iccs/`,
    isEvalSupported: false,
    stopAtErrors: true,
  };
}

const imageId = /(?:^|_)(?:img|mask)_/;

/**
 * PDF.js 6.3.289 resolves failed image XObjects to null even with stopAtErrors.
 * Check decoded image dependencies after rendering, before committing a raster
 * export. PDFObjects and image IDs are version-sensitive: keep the pin + tests.
 * This is an incomplete-image guard, NOT a guarantee of fidelity or redaction.
 * @param {import('pdfjs-dist').PDFPageProxy} page
 */
export async function assertRenderedImages(page) {
  const ops = await page.getOperatorList();
  const stores = [page.objs, page.commonObjs];
  if (stores.some((store) => !store || typeof store[Symbol.iterator] !== 'function')) {
    throw new Error('Controllo immagini non disponibile: operazione interrotta.');
  }
  const check = async (id) => {
    if (typeof id !== 'string' || !imageId.test(id)) return;
    const store = stores.find((candidate) => candidate.has(id)) || (id.startsWith('g_') ? page.commonObjs : page.objs);
    let timer;
    let value;
    try {
      // getOperatorList has a separate cache from display rendering. Its image
      // messages can still be pending; do not mistake a slow decode for failure.
      value = store.has(id) ? store.get(id) : await new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error('Verifica immagine scaduta: compressione interrotta.')), 15_000);
        store.get(id, resolve);
      });
    } finally { clearTimeout(timer); }
    if (!value || !(value.width > 0 && value.height > 0) || !(value.bitmap || value.data)) {
      throw new Error(`Pagina ${page.pageNumber}: immagine non decodificata. Il PDF precedente è stato conservato.`);
    }
  };
  // Dependencies also cover repeated images and masks. Inspect common objects
  // for images inside Type3 glyphs which are not in the page's top-level list.
  const dependencies = new Set();
  ops.fnArray.forEach((op, index) => {
    // OPS.dependency === 1 in the pinned API (asserted by regression tests).
    // Do not interpret arbitrary user text or glyph strings as resource IDs.
    if (op === 1) ops.argsArray[index].forEach((id) => dependencies.add(id));
  });
  for (const store of stores) for (const [id] of store) dependencies.add(id);
  await Promise.all([...dependencies].map(check));
}

/** Limit the extra raster allocation before creating a compression canvas. */
export function assertRasterSize(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 ||
      width > 16384 || height > 16384 || width * height > 16_000_000) {
    throw new Error('Pagina troppo grande per la compressione forte nel browser. Il PDF precedente è stato conservato.');
  }
}

/**
 * No externally visible bytes are produced unless every page passes.
 * @param {import('pdfjs-dist').PDFDocumentProxy} pdf
 * @param {(width: number, height: number) => any} createCanvas
 * @param {(canvas: any) => Promise<ArrayBuffer> | Uint8Array} encodeJpeg
 * @param {import('pdf-lib').PDFDocument} output
 * @param {(page: number, count: number) => void} onProgress
 */
export async function rasterizeChecked(pdf, createCanvas, encodeJpeg, output, onProgress = () => {}) {
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    onProgress(pageNumber, pdf.numPages);
    const page = await pdf.getPage(pageNumber);
    const pageSize = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 1.15 });
    assertRasterSize(viewport.width, viewport.height);
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    try {
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('Canvas non disponibile.');
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      await assertRenderedImages(page);
      const embedded = await output.embedJpg(await encodeJpeg(canvas));
      const outputPage = output.addPage([pageSize.width, pageSize.height]);
      outputPage.drawImage(embedded, { x: 0, y: 0, width: pageSize.width, height: pageSize.height });
    } finally {
      canvas.width = canvas.height = 0;
    }
  }
  return output.save({ useObjectStreams: true });
}
