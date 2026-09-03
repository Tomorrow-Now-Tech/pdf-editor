import assert from 'node:assert/strict';
import { Document as WordDocument, Packer, PageBreak, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
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
const loadingTask = getDocument(options(outputBytes));
const rendered = await loadingTask.promise;
assert.equal(rendered.numPages, 3, 'La duplicazione deve produrre tre pagine');
const firstPage = await rendered.getPage(1);
const textContent = await firstPage.getTextContent();
const extracted = textContent.items.map((item) => 'str' in item ? item.str : '').join(' ');
assert.match(extracted, /WEB EDIT TEST 0123456789/, 'Il testo aggiunto deve essere presente nel PDF salvato');
assert.equal(firstPage.rotate, 90, 'La rotazione deve essere conservata');
await loadingTask.destroy();

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
