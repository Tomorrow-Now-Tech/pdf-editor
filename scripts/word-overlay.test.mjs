import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { PDFDocument, PDFName, PDFDict } from 'pdf-lib';
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { pdfDocumentOptions } from '../pdf/runtime.mjs';
import { changedWord, observedFontGlyphs, planWordOverlay, assertWordArea, assertNoTextOverlap, applyWordOverlay } from '../pdf/word-overlay.mjs';

const { createCanvas } = createRequire(import.meta.url)('@napi-rs/canvas');
const options = bytes => ({ ...pdfDocumentOptions(bytes, `${import.meta.dirname}/../public/pdfjs/`), useWorkerFetch: false });
async function fixture() {
  const bytes = new Uint8Array(await readFile(new URL('./fixtures/word-font.pdf',import.meta.url)));
  const task = getDocument(options(bytes)), document = await task.promise, page = await document.getPage(1);
  const canvas = createCanvas(800,480);
  await page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport: page.getViewport({ scale: 2 }) }).promise;
  const content = await page.getTextContent(), ops = await page.getOperatorList();
  const boxes = content.items.filter(i=>i.str?.trim()).map((item,index)=>({
    id: String(index), text: item.str, transform: item.transform, sourceFontName: page.commonObjs.get(item.fontName).name,
    sourceFontId: item.fontName, pdfWidth: item.width, pdfRectX: item.transform[4],
    pdfRectY: item.transform[5]+content.styles[item.fontName].descent*item.height,
    pdfHeight: (content.styles[item.fontName].ascent-content.styles[item.fontName].descent)*item.height,
    ascent: content.styles[item.fontName].ascent, descent: content.styles[item.fontName].descent,
  }));
  const item = boxes.find(i=>i.text==='Torino Torino strada'), pdf=await PDFDocument.load(bytes);
  const observed = observedFontGlyphs(ops, item.sourceFontId, OPS);
  return { bytes, task, page, canvas, boxes, item, pdf, observed };
}

test('only one changed word is admitted; paragraphs and whitespace fail closed',()=>{
  assert.deepEqual(changedWord('Torino Torino strada','Torino Milano strada'), { start:7,end:13,word:'Milano' });
  for (const text of ['Milano Milano strada','Torino via Milano strada','Torino Torino strada','']) assert.equal(changedWord('Torino Torino strada',text),null);
});

test('word overlay reuses the actual embedded face and leaves all other pixels identical', async()=>{
  const f=await fixture();
  let after;
  try {
    const plan=planWordOverlay(f.pdf,0,f.item,'Torino Milano strada',f.observed);
    const [x,y,w,h]=plan.bounds;
    const left=Math.floor(x*2),top=Math.floor((240-y-h)*2),width=Math.ceil(w*2)+2,height=Math.ceil(h*2)+2;
    const pixels=f.canvas.getContext('2d').getImageData(left,top,width,height).data;
    assertWordArea(plan,f.item,f.boxes,pixels,width,height);
    applyWordOverlay(f.pdf,0,plan);
    after=getDocument(options(await f.pdf.save()));
    const page=await(await after.promise).getPage(1), canvas=createCanvas(800,480);
    await page.render({ canvas,canvasContext:canvas.getContext('2d'),viewport:page.getViewport({ scale:2 }) }).promise;
    const a=f.canvas.getContext('2d').getImageData(0,0,800,480).data,b=canvas.getContext('2d').getImageData(0,0,800,480).data;
    let changed=0;
    for(let row=0;row<480;row++)for(let col=0;col<800;col++) {
      const index=(row*800+col)*4, differs=[0,1,2].some(c=>a[index+c]!==b[index+c]);
      if(!differs) continue;
      changed++;
      assert.ok(col>=left && col<left+width && row>=top && row<top+height,'Neighbouring pixels must not change');
    }
    assert.ok(changed>20,'The replacement must actually be visible');
    const content=await page.getTextContent(), replacement=content.items.find(i=>i.str==='Milano');
    assert.ok(replacement);
    assert.equal(page.commonObjs.get(replacement.fontName).name,f.item.sourceFontName);
    assert.ok(content.items.some(i=>i.str==='Torino Torino strada'),'Original remains recoverable, as disclosed');
    const fonts=f.pdf.getPage(0).node.normalizedEntries().Font;
    assert.equal(fonts.entries().length,1,'No substitute font was embedded');
  } finally { await f.task.destroy(); if(after)await after.destroy(); }
});

test('missing glyphs, ambiguous resources and mismatched metrics never mutate the document',async()=>{
  const f=await fixture();
  try {
    for(const [item,text,observed] of [[f.item,'Torino ZZZ strada',f.observed],
      [{...f.item,pdfWidth:f.item.pdfWidth+3},'Torino Milano strada',f.observed],
      [f.item,'Torino Milano strada',new Map()]]) assert.throws(()=>planWordOverlay(f.pdf,0,item,text,observed));
    const fonts=f.pdf.getPage(0).node.normalizedEntries().Font;
    fonts.set(PDFName.of('Ambiguous'),fonts.entries()[0][1]);
    assert.throws(()=>planWordOverlay(f.pdf,0,f.item,'Torino Milano strada',f.observed));
  } finally { await f.task.destroy(); }
});

test('overlapping text and a coloured or grey background block an overlay',()=>{
  const item={id:'1'},plan={bounds:[20,20,40,18]},pixels=new Uint8ClampedArray(20*20*4).fill(255);
  const neighbour={id:'2',pdfRectX:20,pdfRectY:19,pdfWidth:40,pdfHeight:20};
  assert.throws(()=>assertNoTextOverlap(plan.bounds,item,[neighbour]));
  pixels[420]=0;pixels[421]=0;pixels[422]=0;
  assert.doesNotThrow(()=>assertWordArea(plan,item,[],pixels,20,20));
  pixels[0]=240;pixels[1]=240;pixels[2]=240;
  assert.throws(()=>assertWordArea(plan,item,[],pixels,20,20));
  pixels.fill(255);pixels[400]=80;pixels[401]=130;pixels[402]=160;
  assert.throws(()=>assertWordArea(plan,item,[],pixels,20,20));
});

test('compressed CMap expansion and oversized word areas are bounded before allocation',async()=>{
  const f=await fixture();
  try {
    assert.throws(()=>planWordOverlay(f.pdf,0,{...f.item,transform:[1e9,0,0,1e9,40,140]},'Torino Milano strada',f.observed));
    const fonts=f.pdf.getPage(0).node.normalizedEntries().Font;
    const font=f.pdf.context.lookup(fonts.entries()[0][1],PDFDict);
    font.set(PDFName.of('ToUnicode'),f.pdf.context.register(f.pdf.context.flateStream('X'.repeat(1_000_000))));
    assert.throws(()=>planWordOverlay(f.pdf,0,f.item,'Torino Milano strada',f.observed));
  } finally { await f.task.destroy(); }
});
