import assert from 'node:assert/strict';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const source = await PDFDocument.create();
const sourcePage = source.addPage([595, 842]);
const sourceFont = await source.embedFont(StandardFonts.Helvetica);
sourcePage.drawText('DOCUMENTO DI PROVA', { x: 72, y: 770, size: 18, font: sourceFont });

const sourceBytes = await source.save();
const edited = await PDFDocument.load(sourceBytes);
const page = edited.getPage(0);
const font = await edited.embedFont(StandardFonts.Helvetica);
page.drawText('WEB EDIT TEST 0123456789', {
  x: 72,
  y: 720,
  size: 16,
  font,
  color: rgb(0.05, 0.12, 0.22),
});
page.setRotation(degrees(90));
const [duplicate] = await edited.copyPages(edited, [0]);
edited.addPage(duplicate);

const outputBytes = await edited.save();
const loadingTask = getDocument({ data: outputBytes.slice() });
const rendered = await loadingTask.promise;
assert.equal(rendered.numPages, 2, 'La duplicazione deve produrre due pagine');
const firstPage = await rendered.getPage(1);
const textContent = await firstPage.getTextContent();
const extracted = textContent.items.map((item) => 'str' in item ? item.str : '').join(' ');
assert.match(extracted, /WEB EDIT TEST 0123456789/, 'Il testo aggiunto deve essere presente nel PDF salvato');
assert.equal(firstPage.rotate, 90, 'La rotazione deve essere conservata');
await loadingTask.destroy();

console.log('QA browser editor superata: testo, cifre, rotazione, duplicazione e riapertura PDF.');
