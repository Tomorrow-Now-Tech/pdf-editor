import { PDFArray, PDFDict, PDFName, PDFNumber, PDFRawStream, decodePDFRawStream } from 'pdf-lib';

const name = value => (value instanceof PDFName ? value.decodeText() : String(value)).replace(/-Identity-H$/, '').replace(/^[A-Z]{6}\+/, '');
const fail = () => { throw new Error('Font o impaginazione non verificabili nel browser. Nessuna modifica applicata.'); };

/** Only one changed word; no paragraph reflow or font reconstruction. */
export function changedWord(oldText, newText) {
  if (oldText.length > 2000 || newText.length > 2000 || oldText === newText) return null;
  let start = 0, end = oldText.length, nextEnd = newText.length;
  while (start < Math.min(end, nextEnd) && oldText[start] === newText[start]) start++;
  while (end > start && nextEnd > start && oldText[end - 1] === newText[nextEnd - 1]) { end--; nextEnd--; }
  while (start > 0 && !/\s/.test(oldText[start - 1])) start--;
  while (end < oldText.length && !/\s/.test(oldText[end])) end++;
  const suffix = oldText.slice(end), word = newText.slice(start, newText.length - suffix.length);
  if (!word || word.length > 32 || /\s/.test(word) || /\s/.test(oldText.slice(start, end)) ||
      oldText.slice(0, start) !== newText.slice(0, start) || !newText.endsWith(suffix)) return null;
  return { start, end, word };
}

export function observedFontGlyphs(operators, fontId, ops) {
  if (operators.fnArray.length > 100_000) fail();
  const observed = new Map(), stack = [];
  let active = null;
  operators.fnArray.forEach((op, i) => {
    const args = operators.argsArray[i];
    if (op === ops.save) stack.push(active);
    else if (op === ops.restore) active = stack.pop() ?? null;
    else if (op === ops.setFont) active = args[0];
    else if (op === ops.showText && active === fontId) {
      for (const glyph of args[0]) if (glyph && (glyph.isInFont || /^[ \u00a0]$/.test(glyph.unicode) && glyph.width > 0) && !glyph.accent && glyph.unicode.length === 1 && glyph.originalCharCode > 0) {
        const code = glyph.originalCharCode;
        const character = glyph.unicode === '\u00a0' ? ' ' : glyph.unicode;
        if (observed.has(code) && observed.get(code) !== character) fail();
        observed.set(code, character);
      }
    }
  });
  return observed;
}

function unicodeMap(font) {
  const stream = font.lookup(PDFName.of('ToUnicode'));
  if (!(stream instanceof PDFRawStream) || stream.contents.length > 200_000) fail();
  const filter = stream.dict.get(PDFName.of('Filter'))?.toString();
  if (filter && filter !== '/FlateDecode' || stream.dict.has(PDFName.of('DecodeParms'))) fail();
  const decoder = decodePDFRawStream(stream);
  // The pinned pdf-lib decoder checks this hook before growing its buffer.
  // A compressed CMap must not allocate an unbounded decompression buffer.
  if (filter) {
    if (typeof decoder.ensureBuffer !== 'function') fail();
    const ensure = decoder.ensureBuffer.bind(decoder);
    decoder.ensureBuffer = size => { if (size > 400_000) fail(); return ensure(size); };
  }
  const data = decoder.getBytes(200_001);
  if (data.length > 200_000) fail();
  const text = new TextDecoder('ascii').decode(data);
  if (/beginbfrange|usecmap/.test(text)) fail();
  const map = new Map();
  for (const block of text.matchAll(/(\d+)\s+beginbfchar([\s\S]*?)endbfchar/g)) {
    const pairs = [...block[2].matchAll(/<([\da-f]{4})>\s*<([\da-f]{4})>/gi)];
    if (pairs.length !== Number(block[1])) fail();
    for (const [, code, encoded] of pairs) {
      const cid = parseInt(code, 16), character = String.fromCharCode(parseInt(encoded, 16)).replace('\u00a0',' ');
      if (cid === 0 || map.has(character) && map.get(character) !== cid) fail();
      map.set(character, cid);
    }
  }
  if (!map.size || map.size > 4096) fail();
  return map;
}

function widths(descendant) {
  const values = descendant.lookup(PDFName.of('W'), PDFArray);
  if (values.size() > 8192) fail();
  const result = new Map();
  for (let i = 0; i < values.size();) {
    const start = values.lookup(i++, PDFNumber).asNumber();
    const item = values.lookup(i++);
    if (!Number.isInteger(start) || start < 0 || start > 65535) fail();
    if (item instanceof PDFArray) {
      if (item.size() > 4096) fail();
      for (let j = 0; j < item.size(); j++) result.set(start + j, item.lookup(j, PDFNumber).asNumber());
    } else {
      if (!(item instanceof PDFNumber)) fail();
      const end = item.asNumber(), width = values.lookup(i++, PDFNumber).asNumber();
      if (!Number.isInteger(end) || end < start || end - start > 4096) fail();
      for (let j = start; j <= end; j++) result.set(j, width);
    }
  }
  for (const [code, width] of result) if (code > 65535 || !Number.isFinite(width) || width < 0 || width > 5000) fail();
  return result;
}

/** The original stays recoverable: this is a verified visual overlay, not native editing.
 * Font identity and metrics must be exact; ambiguity and unavailable glyphs fail closed.
 */
export function planWordOverlay(pdf, pageIndex, item, newText, observed) {
  const changed = changedWord(item.text, newText), page = pdf.getPage(pageIndex);
  if (!changed || page.getRotation().angle !== 0 || !item.sourceFontName) fail();
  const [a,b,c,d,x,y] = item.transform || [];
  if (![a,b,c,d,x,y].every(Number.isFinite) || a <= 0 || d <= 0 || a > 200 || d > 200 || Math.abs(b/a) > .02 || Math.abs(c) > .001) fail();
  if (pdf.catalog.has(PDFName.of('OCProperties'))) fail();
  const fonts = page.node.normalizedEntries().Font;
  const matches = fonts.entries().filter(([,ref]) => {
    const font = pdf.context.lookup(ref);
    return font instanceof PDFDict && name(font.get(PDFName.of('BaseFont'))) === name(item.sourceFontName);
  });
  if (matches.length !== 1 || !/^\/[A-Za-z0-9_]+$/.test(matches[0][0].toString())) fail();
  const [resource, ref] = matches[0], font = pdf.context.lookup(ref, PDFDict);
  if (font.get(PDFName.of('Subtype'))?.toString() !== '/Type0' || font.get(PDFName.of('Encoding'))?.toString() !== '/Identity-H') fail();
  const descendants = font.lookup(PDFName.of('DescendantFonts'), PDFArray);
  if (descendants.size() !== 1) fail();
  const descendant = descendants.lookup(0, PDFDict);
  const subtype = descendant.get(PDFName.of('Subtype'))?.toString();
  if (subtype !== '/CIDFontType0' && subtype !== '/CIDFontType2') fail();
  // Missing CIDToGIDMap defaults to Identity for CIDFontType2.
  if (subtype === '/CIDFontType2' && descendant.has(PDFName.of('CIDToGIDMap')) && descendant.get(PDFName.of('CIDToGIDMap'))?.toString() !== '/Identity') fail();
  const descriptor = descendant.lookup(PDFName.of('FontDescriptor'), PDFDict);
  if (!(descriptor.lookup(PDFName.of(subtype === '/CIDFontType0' ? 'FontFile3' : 'FontFile2')) instanceof PDFRawStream)) fail();
  const map = unicodeMap(font), sizes = widths(descendant);
  const encode = text => [...text].map(character => {
    const code = map.get(character);
    if (!code || !sizes.has(code) || sizes.get(code) <= 0 || observed?.get(code) !== character) fail();
    return code;
  });
  const measure = codes => codes.reduce((sum, code) => sum + sizes.get(code), 0) / 1000;
  const original = encode(item.text), replacement = encode(changed.word);
  const total = measure(original) * a;
  // Do not infer Tc/Tw/TJ spacing from an approximate family match.
  if (Math.abs(total - item.pdfWidth) > .15) fail();
  const offset = measure(original.slice(0, changed.start));
  const oldWidth = measure(original.slice(changed.start, changed.end)) * a;
  const scale = Math.min(1, oldWidth / (measure(replacement) * a));
  if (scale < .85 || !Number.isFinite(scale)) fail();
  const wordX = x + offset * a, wordY = y + offset * b;
  const ascent = Number(item.ascent), descent = Number(item.descent);
  if (!Number.isFinite(ascent) || !Number.isFinite(descent) || ascent <= 0 || descent > 0 || ascent - descent > 2.5) fail();
  const bounds = [wordX - 1.5, wordY + d * descent - 1.5, oldWidth + 3, d * (ascent - descent) + 3 + Math.abs(b/a)*oldWidth];
  const crop = page.getCropBox();
  if (!bounds.every(Number.isFinite) || bounds[0] < crop.x || bounds[1] < crop.y ||
      bounds[0]+bounds[2] > crop.x+crop.width || bounds[1]+bounds[3] > crop.y+crop.height ||
      (Math.ceil(bounds[2]*2)+2)*(Math.ceil(bounds[3]*2)+2) > 500_000) fail();
  const encoded = replacement.map(code => code.toString(16).padStart(4,'0')).join('');
  // Encoded CIDs, a restricted existing resource name and validated numbers only.
  const program = `q BT ${resource} 1 Tf 0 g ${a*scale} ${b*scale} ${c} ${d} ${wordX} ${wordY} Tm <${encoded}> Tj ET Q\n`;
  return { bounds, program, fontName: item.sourceFontName, word: changed.word };
}

/** Do not cover another text box, images or a non-white background. */
export function assertNoTextOverlap(bounds, item, allItems) {
  const [x,y,w,h] = bounds;
  if (![x,y,w,h].every(Number.isFinite) || w <= 0 || h <= 0) fail();
  for (const other of allItems) {
    if (other.id === item.id) continue;
    if (other.pdfRectX < x+w && other.pdfRectX+other.pdfWidth > x &&
        other.pdfRectY < y+h && other.pdfRectY+other.pdfHeight > y) fail();
  }
}

export function assertWordArea(plan, item, allItems, pixels, pixelWidth, pixelHeight) {
  assertNoTextOverlap(plan.bounds, item, allItems);
  if (!pixelWidth || !pixelHeight || pixelWidth*pixelHeight > 500_000) fail();
  let darkest = 255;
  // Black native text on white only. Coloured/patterned backgrounds require
  // a different engine, not a guessed white/grey rectangle.
  for (let row = 0; row < pixelHeight; row++) for (let col = 0; col < pixelWidth; col++) {
    const at = (row*pixelWidth+col)*4, r=pixels[at], g=pixels[at+1], b=pixels[at+2];
    if (Math.abs(r-g)>2 || Math.abs(g-b)>2 || pixels[at+3] !== 255) fail();
    darkest = Math.min(darkest,r,g,b);
    if ((row < 2 || col < 2 || row >= pixelHeight-2 || col >= pixelWidth-2) && Math.min(r,g,b)<250) fail();
  }
  if (darkest > 25) fail();
}

export function applyWordOverlay(pdf, pageIndex, plan) {
  const [x,y,width,height] = plan.bounds;
  const stream = `q 1 g ${x} ${y} ${width} ${height} re f Q\n${plan.program}`;
  const page = pdf.getPage(pageIndex);
  page.node.addContentStream(pdf.context.register(pdf.context.flateStream(stream)));
}
