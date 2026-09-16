import assert from 'node:assert/strict';
import { Document as WordDocument, Packer, PageBreak, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { getDocument, Util } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { uprightTextRotation } from '../pdf/page-rotation.mjs';
import { pdfDocumentOptions } from '../pdf/runtime.mjs';

const options = (data) => ({ ...pdfDocumentOptions(data, `${import.meta.dirname}/../public/pdfjs/`), useWorkerFetch: false });

const source = await PDFDocument.create();
const sourcePage = source.addPage([595, 842]);
const sourceFont = await source.embedFont(StandardFonts.Helvetica);
sourcePage.drawText('DOCUMENTO DI PROVA', { x: 72, y: 770, size: 18, font: sourceFont });
const secondSourcePage = source.addPage([595, 842]);
secondSourcePage.drawText('SECONDA PAGINA 6', { x: 72, y: 770, size: 18, font: sourceFont });

const sourceBytes = await source.save();
const edited = await PDFDocument.load(sourceBytes);
const page = edited.getPage(0);
const font = await edited.embedFont(StandardFonts.Helvetica);
page.setRotation(degrees(90));
page.drawText('WEB EDIT TEST 0123456789', {
  x: 72,
  y: 400,
  size: 16,
  font,
  color: rgb(0.05, 0.12, 0.22),
  rotate: degrees(uprightTextRotation(page.getRotation().angle)),
});
const [duplicate] = await edited.copyPages(edited, [0]);
edited.addPage(duplicate);

const outputBytes = await edited.save();
const loadingTask = getDocument(options(outputBytes));
const rendered = await loadingTask.promise;
assert.equal(rendered.numPages, 3, 'La duplicazione deve produrre tre pagine');
const firstPage = await rendered.getPage(1);
const textContent = await firstPage.getTextContent();
const extracted = textContent.items.map((item) => 'str' in item ? item.str : '').join(' ');
assert.match(extracted, /WEB EDIT TEST 0123456789/, 'Il testo aggiunto deve essere presente nel PDF salvato');
assert.equal(firstPage.rotate, 90, 'La rotazione deve essere conservata');
const insertedItem = textContent.items.find((item) => 'str' in item && item.str.includes('WEB EDIT TEST'));
assert.ok(insertedItem && 'transform' in insertedItem, 'Il testo aggiunto deve avere una trasformazione verificabile');
const visualTransform = Util.transform(firstPage.getViewport({ scale: 1 }).transform, insertedItem.transform);
const visualAngle = ((Math.round(Math.atan2(visualTransform[1], visualTransform[0]) * 180 / Math.PI) % 360) + 360) % 360;
assert.equal(visualAngle, 0, 'Il testo aggiunto deve apparire diritto su una pagina ruotata');
await loadingTask.destroy();

const rotationPdf = await PDFDocument.create();
const rotationFont = await rotationPdf.embedFont(StandardFonts.Helvetica);
for (const rotation of [0, 90, 180, 270]) {
  const rotatedPage = rotationPdf.addPage([300, 300]);
  rotatedPage.setRotation(degrees(rotation));
  rotatedPage.drawText(`ROTATION ${rotation}`, {
    x: 150,
    y: 150,
    size: 12,
    font: rotationFont,
    rotate: degrees(uprightTextRotation(rotatedPage.getRotation().angle)),
  });
}
const rotationTask = getDocument(options(await rotationPdf.save()));
const rotationDocument = await rotationTask.promise;
for (let pageNumber = 1; pageNumber <= rotationDocument.numPages; pageNumber += 1) {
  const rotatedPage = await rotationDocument.getPage(pageNumber);
  const content = await rotatedPage.getTextContent();
  const item = content.items.find((candidate) => 'str' in candidate && candidate.str.startsWith('ROTATION'));
  assert.ok(item && 'transform' in item, `Testo di rotazione mancante a pagina ${pageNumber}`);
  const transform = Util.transform(rotatedPage.getViewport({ scale: 1 }).transform, item.transform);
  const angle = ((Math.round(Math.atan2(transform[1], transform[0]) * 180 / Math.PI) % 360) + 360) % 360;
  assert.equal(angle, 0, `Il testo deve restare diritto con /Rotate=${rotatedPage.rotate}`);
}
await rotationTask.destroy();

const splitSource = await PDFDocument.load(sourceBytes);
const extractedPdf = await PDFDocument.create();
const [extractedPage] = await extractedPdf.copyPages(splitSource, [1]);
extractedPdf.addPage(extractedPage);
const extractedBytes = await extractedPdf.save({ useObjectStreams: true });
const extractedRender = getDocument(options(extractedBytes));
const extractedDocument = await extractedRender.promise;
assert.equal(extractedDocument.numPages, 1, 'L’estrazione deve produrre una sola pagina');
const extractedText = await (await extractedDocument.getPage(1)).getTextContent();
assert.match(extractedText.items.map((item) => 'str' in item ? item.str : '').join(' '), /SECONDA PAGINA 6/, 'La pagina estratta deve conservare testo e numero 6');
await extractedRender.destroy();

const archive = new JSZip();
archive.file('pagina-1.pdf', sourceBytes);
archive.file('pagina-2.pdf', extractedBytes);
const archiveBytes = await archive.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
const reopenedArchive = await JSZip.loadAsync(archiveBytes);
assert.deepEqual(Object.keys(reopenedArchive.files).sort(), ['pagina-1.pdf', 'pagina-2.pdf'], 'Lo ZIP deve contenere i PDF separati');

const word = new WordDocument({
  sections: [{
    children: [
      new Paragraph({ children: [new TextRun('DOCUMENTO DI PROVA 0123456789')] }),
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({ children: [new TextRun('SECONDA PAGINA 6')] }),
    ],
  }],
});
const wordBytes = await Packer.toBuffer(word);
const wordArchive = await JSZip.loadAsync(wordBytes);
const wordXml = await wordArchive.file('word/document.xml').async('string');
assert.match(wordXml, /DOCUMENTO DI PROVA 0123456789/, 'Il DOCX deve contenere lettere e cifre');
assert.match(wordXml, /SECONDA PAGINA 6/, 'Il DOCX deve mantenere la seconda pagina');

console.log('QA browser editor superata: testo, cifre, rotazione, pagine, ZIP, DOCX e riapertura PDF.');
