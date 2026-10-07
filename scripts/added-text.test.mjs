import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { getDocument, Util } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { clampZoom, focusConnectedDraft, materializeAddedTexts, textEditConsentKey } from '../pdf/added-text.mjs';
import { pdfDocumentOptions } from '../pdf/runtime.mjs';

const options = (data) => ({ ...pdfDocumentOptions(data, `${import.meta.dirname}/../public/pdfjs/`), useWorkerFetch: false });

test('zoom is bounded and normalises invalid input', () => {
  assert.equal(clampZoom(10), 35);
  assert.equal(clampZoom(107.4), 107);
  assert.equal(clampZoom(300), 250);
  assert.equal(clampZoom(Number.NaN), 100);
});

test('draft focus is immediate, connected and cannot steal a later field selection', async () => {
  let focused = 'sidebar';
  const calls = [];
  focusConnectedDraft(null);
  focusConnectedDraft({ isConnected: false, focus: () => assert.fail('Detached draft must not receive focus') });
  focusConnectedDraft({ isConnected: true, focus: options => { calls.push(options); focused = 'draft'; } });
  assert.equal(focused, 'draft', 'Mount focus must happen synchronously');
  assert.deepEqual(calls, [{ preventScroll: true }]);
  focused = 'sidebar';
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(focused, 'sidebar', 'No queued callback may take focus back from the user');
});

test('visual font consent cannot carry over to another document, target or edit', () => {
  const approved = [1, 1, '1-0', 'Helvetica', 'DATE 6', 12];
  const key = textEditConsentKey(...approved);
  assert.equal(textEditConsentKey(...approved), key);
  for (const [index, value] of [[0, 2], [1, 2], [2, '1-1'], [3, 'Times-Roman'], [4, 'DATE 7'], [5, 18]]) {
    const changed = [...approved];
    changed[index] = value;
    assert.notEqual(textEditConsentKey(...changed), key);
  }
});

test('a moved session text object is materialised once at its final coordinates', async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage([595, 842]);
  const object = {
    page: 1,
    pdfX: 220,
    pdfY: 510,
    text: 'ONLINE OBJECT 6',
    fontFamily: 'Helvetica',
    fontSize: 18,
    fontColor: '#1d4ed8',
  };
  await materializeAddedTexts(pdf, [object]);
  const task = getDocument(options(await pdf.save()));
  try {
    const page = await (await task.promise).getPage(1);
    const items = (await page.getTextContent()).items.filter((item) => 'str' in item && item.str.includes('ONLINE OBJECT 6'));
    assert.equal(items.length, 1, 'Lo spostamento prima del download non deve lasciare copie nascoste');
    const item = items[0];
    assert.ok('transform' in item);
    assert.ok(Math.abs(item.transform[4] - object.pdfX) < 0.5, 'La coordinata finale deve essere quella dell’oggetto spostato');
    const visual = Util.transform(page.getViewport({ scale: 1 }).transform, item.transform);
    assert.equal(Math.round(Math.atan2(visual[1], visual[0]) * 180 / Math.PI), 0);
  } finally {
    await task.destroy();
  }
});
