'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileArchive,
  FilePlus2,
  FileText,
  Grip,
  LoaderCircle,
  PencilLine,
  RotateCw,
  Scissors,
  Trash2,
  Type,
  Upload,
  X,
} from 'lucide-react';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, PageViewport, RenderTask } from 'pdfjs-dist';

type FontFamily = 'Helvetica' | 'Times' | 'Courier';
type ToolMode = 'select' | 'add' | 'edit' | 'compress' | 'split';

type DraftText = {
  screenX: number;
  screenY: number;
  pdfX: number;
  pdfY: number;
  text: string;
};

type ExistingTextBox = {
  id: string;
  text: string;
  screenX: number;
  screenY: number;
  screenWidth: number;
  screenHeight: number;
  pdfX: number;
  pdfY: number;
  pdfRectX: number;
  pdfRectY: number;
  pdfWidth: number;
  pdfHeight: number;
  fontFamily: FontFamily;
  fontName: string;
  fontSize: number;
};

type PdfTextItem = {
  str: string;
  width: number;
  height: number;
  fontName: string;
  transform: number[];
};

const SOURCE_URL = 'https://github.com/Trader855/PDF';
const RELEASE_URL = 'https://github.com/Trader855/PDF/releases/latest';

async function importPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  return pdfjs;
}

function baseName(fileName: string) {
  return fileName.replace(/\.pdf$/i, '') || 'documento';
}

function safeDownloadName(fileName: string) {
  return `${baseName(fileName)} - modificato.pdf`;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  return {
    red: Number.parseInt(normalized.slice(0, 2), 16) / 255,
    green: Number.parseInt(normalized.slice(2, 4), 16) / 255,
    blue: Number.parseInt(normalized.slice(4, 6), 16) / 255,
  };
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function isPdfTextItem(item: unknown): item is PdfTextItem {
  return Boolean(item && typeof item === 'object' && 'str' in item && 'transform' in item);
}

function mapFontFamily(fontName = '', cssFamily = ''): FontFamily {
  const value = `${fontName} ${cssFamily}`.toLowerCase();
  if (/courier|mono|consolas|menlo/.test(value)) return 'Courier';
  if (/times|serif|georgia|garamond/.test(value) && !/sans/.test(value)) return 'Times';
  return 'Helvetica';
}

function standardFontFor(family: FontFamily) {
  if (family === 'Times') return StandardFonts.TimesRoman;
  if (family === 'Courier') return StandardFonts.Courier;
  return StandardFonts.Helvetica;
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Impossibile comprimere la pagina.')), type, quality);
  });
}

export function PdfEditor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasFrameRef = useRef<HTMLDivElement>(null);
  const pdfDocumentRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const viewportRef = useRef<PageViewport | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const renderGenerationRef = useRef(0);
  const thumbnailGenerationRef = useRef(0);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dragState = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [documentVersion, setDocumentVersion] = useState(0);
  const [fileName, setFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [textBoxes, setTextBoxes] = useState<ExistingTextBox[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Pronto');
  const [error, setError] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [tool, setTool] = useState<ToolMode>('select');
  const [draft, setDraft] = useState<DraftText | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<FontFamily>('Helvetica');
  const [fontColor, setFontColor] = useState('#111827');
  const [splitFrom, setSplitFrom] = useState(1);
  const [splitTo, setSplitTo] = useState(1);

  const selectedTextBox = textBoxes.find((box) => box.id === selectedTextId) || null;

  const setActiveTool = (nextTool: ToolMode) => {
    setTool((value) => value === nextTool ? 'select' : nextTool);
    setDraft(null);
    setSelectedTextId(null);
    setError('');
  };

  const renderCurrentPage = useCallback(async () => {
    const pdf = pdfDocumentRef.current;
    const canvas = canvasRef.current;
    const frame = canvasFrameRef.current;
    if (!pdf || !canvas || !frame) return;

    const generation = ++renderGenerationRef.current;
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch { /* already complete */ }
    }

    const page = await pdf.getPage(currentPage);
    const baseViewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(280, Math.min(980, frame.clientWidth - 32));
    const scale = Math.min(2, availableWidth / baseViewport.width);
    const viewport = page.getViewport({ scale });
    viewportRef.current = viewport;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    canvas.width = Math.ceil(viewport.width * ratio);
    canvas.height = Math.ceil(viewport.height * ratio);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const renderTask = page.render({
      canvas,
      canvasContext: context,
      viewport,
      transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
    });
    renderTaskRef.current = renderTask;

    try {
      await renderTask.promise;
      if (generation !== renderGenerationRef.current) return;

      const pdfjs = await importPdfJs();
      const content = await page.getTextContent();
      if (generation !== renderGenerationRef.current) return;

      const textItems = content.items.filter((item) => isPdfTextItem(item) && item.str.trim()) as unknown as PdfTextItem[];
      const boxes = textItems.map((item, index) => {
        const transformed = pdfjs.Util.transform(viewport.transform, item.transform);
        const screenHeight = Math.max(6, Math.hypot(transformed[2], transformed[3]) || item.height * viewport.scale);
        const style = content.styles[item.fontName] as { fontFamily?: string; ascent?: number; descent?: number } | undefined;
        const ascent = style?.ascent
          ? style.ascent * screenHeight
          : style?.descent
            ? (1 + style.descent) * screenHeight
            : screenHeight * 0.82;
        const screenX = transformed[4];
        const screenY = transformed[5] - ascent;
        const screenWidth = Math.max(3, item.width * viewport.scale);
        const [firstX, firstY] = viewport.convertToPdfPoint(screenX, screenY);
        const [secondX, secondY] = viewport.convertToPdfPoint(screenX + screenWidth, screenY + screenHeight);
        return {
          id: `${currentPage}-${index}`,
          text: item.str,
          screenX,
          screenY,
          screenWidth,
          screenHeight,
          pdfX: item.transform[4],
          pdfY: item.transform[5],
          pdfRectX: Math.min(firstX, secondX),
          pdfRectY: Math.min(firstY, secondY),
          pdfWidth: Math.abs(secondX - firstX),
          pdfHeight: Math.abs(secondY - firstY),
          fontFamily: mapFontFamily(item.fontName, style?.fontFamily),
          fontName: style?.fontFamily || item.fontName || 'Carattere PDF',
          fontSize: Math.max(6, Math.hypot(item.transform[2], item.transform[3]) || item.height || 12),
        } satisfies ExistingTextBox;
      });
      setTextBoxes(boxes);
    } catch (renderError: unknown) {
      if (!(renderError instanceof Error) || renderError.name !== 'RenderingCancelledException') throw renderError;
    }
  }, [currentPage]);

  const renderThumbnails = useCallback(async (pdf: PDFDocumentProxy, generation: number) => {
    setThumbnails(Array.from({ length: pdf.numPages }, () => ''));
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      if (generation !== thumbnailGenerationRef.current) return;
      try {
        const page = await pdf.getPage(pageNumber);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: 138 / base.width });
        const canvas = window.document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext('2d', { alpha: false });
        if (context) await page.render({ canvas, canvasContext: context, viewport }).promise;
        if (generation !== thumbnailGenerationRef.current) return;
        const image = canvas.toDataURL('image/jpeg', 0.72);
        setThumbnails((values) => values.map((value, index) => index === pageNumber - 1 ? image : value));
      } catch (thumbnailError: unknown) {
        if (generation !== thumbnailGenerationRef.current) return;
        if (!(thumbnailError instanceof Error) || thumbnailError.name !== 'RenderingCancelledException') {
          console.warn('Miniatura non disponibile', thumbnailError);
        }
      }
    }
  }, []);

  const loadBytes = useCallback(async (nextBytes: Uint8Array, nextName?: string, preferredPage = 1) => {
    setBusy(true);
    setError('');
    setStatus('Apertura del PDF…');
    const thumbnailGeneration = ++thumbnailGenerationRef.current;
    ++renderGenerationRef.current;
    try {
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch { /* already complete */ }
      }
      const previousLoadingTask = loadingTaskRef.current;
      loadingTaskRef.current = null;
      pdfDocumentRef.current = null;
      if (previousLoadingTask) {
        try { await previousLoadingTask.destroy(); } catch { /* render cancellation is expected */ }
      }

      const pdfjs = await importPdfJs();
      const loadingTask = pdfjs.getDocument({ data: nextBytes.slice() });
      loadingTaskRef.current = loadingTask;
      const pdf = await loadingTask.promise as PDFDocumentProxy;
      pdfDocumentRef.current = pdf;
      setBytes(nextBytes);
      if (nextName) setFileName(nextName);
      setPageCount(pdf.numPages);
      setCurrentPage(Math.max(1, Math.min(preferredPage, pdf.numPages)));
      setSplitFrom(1);
      setSplitTo(pdf.numPages);
      setDraft(null);
      setSelectedTextId(null);
      setTextBoxes([]);
      setDocumentVersion((value) => value + 1);
      setStatus('Documento elaborato soltanto nel browser');
      void renderThumbnails(pdf, thumbnailGeneration);
    } catch (loadError: unknown) {
      setError(errorMessage(loadError, 'Impossibile aprire questo PDF.'));
      setStatus('Errore');
    } finally {
      setBusy(false);
    }
  }, [renderThumbnails]);

  const acceptFile = useCallback(async (file?: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Seleziona un file PDF valido.');
      return;
    }
    await loadBytes(new Uint8Array(await file.arrayBuffer()), file.name);
  }, [loadBytes]);

  useEffect(() => {
    if (!pdfDocumentRef.current) return;
    renderCurrentPage().catch((renderError) => setError(errorMessage(renderError, 'Rendering non riuscito.')));
  }, [currentPage, documentVersion, renderCurrentPage]);

  useEffect(() => {
    thumbnailRefs.current[currentPage - 1]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    const onResize = () => renderCurrentPage().catch(() => undefined);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [renderCurrentPage]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const moving = dragState.current;
      const viewport = viewportRef.current;
      if (!moving || !viewport) return;
      const screenX = Math.max(0, moving.initialX + event.clientX - moving.startX);
      const screenY = Math.max(0, moving.initialY + event.clientY - moving.startY);
      const [pdfX, pdfY] = viewport.convertToPdfPoint(screenX, screenY + fontSize);
      setDraft((value) => value && { ...value, screenX, screenY, pdfX, pdfY });
    };
    const stop = () => { dragState.current = null; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
  }, [fontSize]);

  useEffect(() => () => {
    ++thumbnailGenerationRef.current;
    ++renderGenerationRef.current;
    try { renderTaskRef.current?.cancel(); } catch { /* already complete */ }
    void loadingTaskRef.current?.destroy();
  }, []);

  const mutatePdf = async (mutation: (pdf: PDFDocument) => Promise<void> | void, preferredPage = currentPage) => {
    if (!bytes) return;
    setBusy(true);
    setError('');
    try {
      const pdf = await PDFDocument.load(bytes.slice());
      await mutation(pdf);
      const saved = await pdf.save({ useObjectStreams: true });
      await loadBytes(saved, undefined, preferredPage);
    } catch (mutationError: unknown) {
      setError(errorMessage(mutationError, 'Modifica non riuscita.'));
    } finally {
      setBusy(false);
    }
  };

  const placeTextDraft = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'add' || !viewportRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const screenX = event.clientX - bounds.left;
    const screenY = event.clientY - bounds.top;
    const [pdfX, pdfY] = viewportRef.current.convertToPdfPoint(screenX, screenY + fontSize);
    setDraft({ screenX, screenY, pdfX, pdfY, text: '' });
  };

  const commitText = async () => {
    if (!draft?.text.trim()) {
      setError('Scrivi il testo da aggiungere.');
      return;
    }
    await mutatePdf(async (pdf) => {
      const page = pdf.getPage(currentPage - 1);
      const font = await pdf.embedFont(standardFontFor(fontFamily));
      const color = hexToRgb(fontColor);
      page.drawText(draft.text, {
        x: draft.pdfX,
        y: draft.pdfY,
        size: fontSize,
        font,
        color: rgb(color.red, color.green, color.blue),
      });
    });
    setTool('select');
    setStatus('Testo aggiunto. Scarica il PDF quando hai terminato.');
  };

  const selectExistingText = (box: ExistingTextBox) => {
    setSelectedTextId(box.id);
    setEditText(box.text);
    setFontFamily(box.fontFamily);
    setFontSize(Math.round(box.fontSize * 10) / 10);
    setFontColor('#111827');
  };

  const commitExistingText = async () => {
    if (!selectedTextBox) return;
    await mutatePdf(async (pdf) => {
      const page = pdf.getPage(currentPage - 1);
      const font = await pdf.embedFont(standardFontFor(fontFamily));
      const color = hexToRgb(fontColor);
      page.drawRectangle({
        x: selectedTextBox.pdfRectX - 1,
        y: selectedTextBox.pdfRectY - 1,
        width: selectedTextBox.pdfWidth + 2,
        height: selectedTextBox.pdfHeight + 2,
        color: rgb(1, 1, 1),
      });
      if (editText.trim()) {
        const desiredWidth = font.widthOfTextAtSize(editText, fontSize);
        const fittedSize = desiredWidth > selectedTextBox.pdfWidth * 1.15
          ? Math.max(6, fontSize * ((selectedTextBox.pdfWidth * 1.15) / desiredWidth))
          : fontSize;
        page.drawText(editText, {
          x: selectedTextBox.pdfX,
          y: selectedTextBox.pdfY,
          size: fittedSize,
          font,
          color: rgb(color.red, color.green, color.blue),
        });
      }
    });
    setTool('select');
    setStatus('Testo sostituito direttamente nel PDF.');
  };

  const downloadPdf = () => {
    if (!bytes) return;
    downloadBlob(new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'application/pdf' }), safeDownloadName(fileName));
  };

  const movePage = async (direction: -1 | 1) => {
    if (!bytes) return;
    const target = currentPage - 1 + direction;
    if (target < 0 || target >= pageCount) return;
    setBusy(true);
    try {
      const source = await PDFDocument.load(bytes.slice());
      const reordered = await PDFDocument.create();
      const order = Array.from({ length: source.getPageCount() }, (_, index) => index);
      [order[currentPage - 1], order[target]] = [order[target], order[currentPage - 1]];
      const copiedPages = await reordered.copyPages(source, order);
      copiedPages.forEach((page) => reordered.addPage(page));
      await loadBytes(await reordered.save({ useObjectStreams: true }), undefined, target + 1);
    } catch (moveError: unknown) {
      setError(errorMessage(moveError, 'Riordino non riuscito.'));
    } finally {
      setBusy(false);
    }
  };

  const compressLossless = async () => {
    if (!bytes) return;
    setBusy(true);
    setError('');
    setStatus('Ottimizzazione senza perdita…');
    try {
      const pdf = await PDFDocument.load(bytes.slice());
      const saved = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
      if (saved.length >= bytes.length) {
        setStatus('Il PDF è già ottimizzato: nessun aumento inutile delle dimensioni.');
        return;
      }
      const savedPercent = Math.round((1 - saved.length / bytes.length) * 100);
      await loadBytes(saved, undefined, currentPage);
      setStatus(`PDF ottimizzato: ${savedPercent}% più leggero, testo preservato.`);
    } catch (compressionError: unknown) {
      setError(errorMessage(compressionError, 'Compressione non riuscita.'));
    } finally {
      setBusy(false);
    }
  };

  const compressStrong = async () => {
    const sourcePdf = pdfDocumentRef.current;
    if (!bytes || !sourcePdf) return;
    setBusy(true);
    setError('');
    try {
      const output = await PDFDocument.create();
      for (let pageNumber = 1; pageNumber <= sourcePdf.numPages; pageNumber += 1) {
        setStatus(`Compressione forte: pagina ${pageNumber} di ${sourcePdf.numPages}…`);
        const page = await sourcePdf.getPage(pageNumber);
        const pageSize = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: 1.15 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('Canvas non disponibile.');
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        const jpeg = await canvasToBlob(canvas, 'image/jpeg', 0.66);
        const embedded = await output.embedJpg(await jpeg.arrayBuffer());
        const outputPage = output.addPage([pageSize.width, pageSize.height]);
        outputPage.drawImage(embedded, { x: 0, y: 0, width: pageSize.width, height: pageSize.height });
      }
      const saved = await output.save({ useObjectStreams: true });
      if (saved.length >= bytes.length) {
        setStatus('La compressione forte non ridurrebbe questo PDF: ho mantenuto l’originale.');
        return;
      }
      const savedPercent = Math.round((1 - saved.length / bytes.length) * 100);
      await loadBytes(saved, undefined, Math.min(currentPage, output.getPageCount()));
      setStatus(`PDF compresso del ${savedPercent}%. Le pagine sono state rasterizzate.`);
    } catch (compressionError: unknown) {
      setError(errorMessage(compressionError, 'Compressione forte non riuscita.'));
    } finally {
      setBusy(false);
    }
  };

  const downloadSplitRange = async () => {
    if (!bytes) return;
    const from = Math.max(1, Math.min(splitFrom, pageCount));
    const to = Math.max(from, Math.min(splitTo, pageCount));
    setBusy(true);
    setError('');
    try {
      const source = await PDFDocument.load(bytes.slice());
      const output = await PDFDocument.create();
      const indexes = Array.from({ length: to - from + 1 }, (_, index) => from - 1 + index);
      const pages = await output.copyPages(source, indexes);
      pages.forEach((page) => output.addPage(page));
      const saved = await output.save({ useObjectStreams: true });
      downloadBlob(new Blob([saved.buffer as ArrayBuffer], { type: 'application/pdf' }), `${baseName(fileName)} - pagine ${from}-${to}.pdf`);
      setStatus(`Estratte le pagine da ${from} a ${to}.`);
    } catch (splitError: unknown) {
      setError(errorMessage(splitError, 'Divisione non riuscita.'));
    } finally {
      setBusy(false);
    }
  };

  const downloadPagesZip = async () => {
    if (!bytes) return;
    setBusy(true);
    setError('');
    try {
      const { default: JSZip } = await import('jszip');
      const source = await PDFDocument.load(bytes.slice());
      const zip = new JSZip();
      for (let index = 0; index < source.getPageCount(); index += 1) {
        setStatus(`Divisione: pagina ${index + 1} di ${source.getPageCount()}…`);
        const output = await PDFDocument.create();
        const [page] = await output.copyPages(source, [index]);
        output.addPage(page);
        zip.file(`${baseName(fileName)} - pagina ${index + 1}.pdf`, await output.save({ useObjectStreams: true }));
      }
      downloadBlob(await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }), `${baseName(fileName)} - pagine separate.zip`);
      setStatus('PDF diviso: archivio ZIP pronto.');
    } catch (splitError: unknown) {
      setError(errorMessage(splitError, 'Divisione in pagine non riuscita.'));
    } finally {
      setBusy(false);
    }
  };

  const convertToWord = async () => {
    const sourcePdf = pdfDocumentRef.current;
    if (!sourcePdf) return;
    setBusy(true);
    setError('');
    try {
      const { Document: WordDocument, Packer, PageBreak, Paragraph, TextRun } = await import('docx');
      const children: InstanceType<typeof Paragraph>[] = [];
      for (let pageNumber = 1; pageNumber <= sourcePdf.numPages; pageNumber += 1) {
        setStatus(`Conversione Word: pagina ${pageNumber} di ${sourcePdf.numPages}…`);
        const page = await sourcePdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const lines = new Map<number, Array<{ x: number; text: string }>>();
        const textItems = content.items.filter(isPdfTextItem) as unknown as PdfTextItem[];
        textItems.forEach((item) => {
          const y = Math.round(item.transform[5] / 4) * 4;
          const row = lines.get(y) || [];
          row.push({ x: item.transform[4], text: item.str });
          lines.set(y, row);
        });
        [...lines.entries()].sort((a, b) => b[0] - a[0]).forEach(([, row]) => {
          const text = row.sort((a, b) => a.x - b.x).map((part) => part.text.trim()).filter(Boolean).join(' ');
          if (text) children.push(new Paragraph({ children: [new TextRun({ text, size: 22 })], spacing: { after: 100 } }));
        });
        if (pageNumber < sourcePdf.numPages) children.push(new Paragraph({ children: [new PageBreak()] }));
      }
      const word = new WordDocument({ sections: [{ properties: {}, children }] });
      downloadBlob(await Packer.toBlob(word), `${baseName(fileName)}.docx`);
      setStatus('Documento Word creato localmente. Controlla l’impaginazione complessa.');
    } catch (wordError: unknown) {
      setError(errorMessage(wordError, 'Conversione Word non riuscita.'));
    } finally {
      setBusy(false);
    }
  };

  if (!bytes) {
    return (
      <div className="editor-shell">
        <EditorTopBar status={status} busy={busy} />
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => void acceptFile(event.target.files?.[0])} />
        <div className="flex min-h-[500px] items-center justify-center bg-[radial-gradient(circle_at_center,rgba(35,46,82,.42),transparent_68%)] p-5 sm:p-10">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => { event.preventDefault(); setIsDraggingFile(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDraggingFile(false);
              void acceptFile(event.dataTransfer.files?.[0]);
            }}
            className={`group flex w-full max-w-2xl flex-col items-center rounded-[28px] border border-dashed px-6 py-14 text-center transition sm:py-16 ${isDraggingFile ? 'border-cyan-300 bg-cyan-300/8 shadow-[0_0_50px_rgba(0,229,255,.12)]' : 'border-white/16 bg-white/[.025] hover:border-cyan-300/45 hover:bg-white/[.045]'}`}
          >
            <span className="mb-6 grid size-20 place-items-center rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/16 via-blue-500/12 to-fuchsia-400/16 text-cyan-200 shadow-[0_20px_70px_rgba(26,83,255,.2)] transition group-hover:-translate-y-1"><Upload className="size-8" /></span>
            <span className="text-xl font-bold text-white sm:text-2xl">Trascina qui il tuo PDF</span>
            <span className="mt-2 max-w-md text-sm leading-6 text-slate-400">Modifica testo, comprimi, dividi e converti in Word. Senza account e senza inviare il documento ai nostri server.</span>
            <span className="brand-button mt-7 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white"><FilePlus2 className="size-4" /> Apri PDF</span>
            {error && <span className="mt-4 text-sm font-medium text-red-300">{error}</span>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-shell">
      <EditorTopBar status={status} busy={busy} />
      <div className="flex flex-wrap items-center gap-2 border-b border-white/8 bg-[#0b0f1a] px-3 py-2.5">
        <ToolbarButton active={tool === 'edit'} onClick={() => setActiveTool('edit')} title="Modifica il testo esistente"><PencilLine /><span>Modifica testo</span></ToolbarButton>
        <ToolbarButton active={tool === 'add'} onClick={() => setActiveTool('add')} title="Aggiungi testo"><Type /><span>Aggiungi testo</span></ToolbarButton>
        <ToolbarButton active={tool === 'compress'} onClick={() => setActiveTool('compress')} title="Comprimi PDF"><FileArchive /><span className="hidden xl:inline">Comprimi</span></ToolbarButton>
        <ToolbarButton active={tool === 'split'} onClick={() => setActiveTool('split')} title="Dividi PDF"><Scissors /><span className="hidden xl:inline">Dividi</span></ToolbarButton>
        <ToolbarButton onClick={() => void convertToWord()} title="Converti PDF in Word"><FileText /><span className="hidden xl:inline">PDF in Word</span></ToolbarButton>
        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
        <ToolbarButton onClick={() => void mutatePdf((pdf) => {
          const page = pdf.getPage(currentPage - 1);
          page.setRotation(degrees((page.getRotation().angle + 90) % 360));
        })} title="Ruota pagina"><RotateCw /></ToolbarButton>
        <ToolbarButton onClick={() => void mutatePdf(async (pdf) => {
          const [copy] = await pdf.copyPages(pdf, [currentPage - 1]);
          pdf.insertPage(currentPage, copy);
        }, currentPage + 1)} title="Duplica pagina"><Copy /></ToolbarButton>
        <ToolbarButton disabled={pageCount <= 1} danger onClick={() => void mutatePdf((pdf) => pdf.removePage(currentPage - 1), Math.max(1, currentPage - 1))} title="Elimina pagina"><Trash2 /></ToolbarButton>
        <ToolbarButton disabled={currentPage <= 1} onClick={() => void movePage(-1)} title="Sposta pagina prima"><ChevronLeft /></ToolbarButton>
        <ToolbarButton disabled={currentPage >= pageCount} onClick={() => void movePage(1)} title="Sposta pagina dopo"><ChevronRight /></ToolbarButton>
        <button type="button" onClick={downloadPdf} className="brand-button ml-auto inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold text-white sm:text-sm"><ArrowDownToLine className="size-4" /> Scarica PDF</button>
      </div>

      {error && <div className="border-b border-red-300/15 bg-red-400/8 px-4 py-2 text-sm text-red-200">{error}</div>}

      <div className="editor-workspace grid lg:grid-cols-[190px_minmax(0,1fr)_270px]">
        <aside className="hidden min-h-0 overflow-y-auto border-r border-white/8 bg-[#0b0f1a]/75 p-3 lg:block">
          <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Pagine</p>
          <div className="space-y-3">
            {thumbnails.map((thumbnail, index) => (
              <button
                key={`${index}-${thumbnail.slice(-12)}`}
                ref={(element) => { thumbnailRefs.current[index] = element; }}
                type="button"
                onClick={() => { setDraft(null); setSelectedTextId(null); setCurrentPage(index + 1); }}
                className={`w-full rounded-xl border p-2 transition ${currentPage === index + 1 ? 'border-cyan-300/70 bg-cyan-300/8' : 'border-white/8 bg-white/[.02] hover:border-white/20'}`}
              >
                {thumbnail ? (
                  // oxlint-disable-next-line next/no-img-element -- data URL generata localmente dal PDF
                  <img src={thumbnail} alt={`Pagina ${index + 1}`} className="mx-auto max-h-48 rounded bg-white shadow-lg" />
                ) : <span className="mx-auto grid aspect-[.72] w-[138px] place-items-center rounded bg-white/5"><LoaderCircle className="size-4 animate-spin text-slate-600" /></span>}
                <span className="mt-1.5 block text-xs text-slate-400">{index + 1}</span>
              </button>
            ))}
          </div>
        </aside>

        <div ref={canvasFrameRef} className="editor-canvas-scroll relative flex min-h-0 items-start justify-center overflow-auto bg-[#171b24] p-3 sm:p-6">
          <div className="relative shrink-0 shadow-[0_24px_80px_rgba(0,0,0,.48)]">
            <canvas ref={canvasRef} onClick={placeTextDraft} className={tool === 'add' ? 'cursor-text bg-white' : 'bg-white'} />
            {tool === 'edit' && textBoxes.map((box) => (
              <button
                key={box.id}
                type="button"
                aria-label={`Modifica: ${box.text}`}
                title={box.text}
                onClick={() => selectExistingText(box)}
                className={`absolute z-[5] border transition ${selectedTextId === box.id ? 'border-cyan-300 bg-cyan-300/20 shadow-[0_0_0_2px_rgba(34,211,238,.16)]' : 'border-transparent bg-transparent hover:border-cyan-300/80 hover:bg-cyan-300/10'}`}
                style={{ left: box.screenX, top: box.screenY, width: box.screenWidth, height: box.screenHeight }}
              />
            ))}
            {draft && (
              <div className="absolute z-10 flex min-w-44 items-start rounded-lg border border-cyan-400 bg-white shadow-2xl" style={{ left: draft.screenX, top: draft.screenY }}>
                <button type="button" className="grid h-9 w-8 shrink-0 cursor-move place-items-center border-r border-slate-200 text-slate-500" title="Trascina per spostare" onPointerDown={(event) => {
                  event.preventDefault();
                  dragState.current = { startX: event.clientX, startY: event.clientY, initialX: draft.screenX, initialY: draft.screenY };
                }}><Grip className="size-4" /></button>
                <textarea rows={1} value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} placeholder="Scrivi direttamente qui…" className="min-h-9 min-w-56 resize both bg-transparent px-2 py-1.5 outline-none" style={{ fontFamily, fontSize, color: fontColor }} />
                <button type="button" className="grid h-9 w-8 shrink-0 place-items-center text-slate-400 hover:text-slate-900" onClick={() => setDraft(null)}><X className="size-4" /></button>
              </div>
            )}
          </div>
          {busy && <div className="absolute inset-0 z-20 grid place-items-center bg-[#080b14]/55 backdrop-blur-sm"><LoaderCircle className="size-8 animate-spin text-cyan-300" /></div>}
        </div>

        <aside className="min-h-0 overflow-y-auto border-l border-white/8 bg-[#0b0f1a]/75 p-4">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Proprietà</p>
          {tool === 'edit' && (
            <div className="space-y-4">
              <InfoBox>{selectedTextBox ? 'Modifica il testo e applica. Il carattere viene abbinato alla famiglia rilevata.' : 'Passa sul testo del PDF e clicca la parte che vuoi modificare.'}</InfoBox>
              {selectedTextBox && <>
                <label className="block text-xs font-semibold text-slate-400">Testo originale
                  <textarea value={editText} onChange={(event) => setEditText(event.target.value)} rows={4} className="mt-1.5 w-full resize-y rounded-lg border border-white/10 bg-[#141a28] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50" />
                </label>
                <p className="rounded-lg bg-white/[.035] px-3 py-2 text-[11px] leading-5 text-slate-500">Rilevato: {selectedTextBox.fontName} · {selectedTextBox.fontSize.toFixed(1)} pt</p>
                <TextStyleControls fontFamily={fontFamily} setFontFamily={setFontFamily} fontSize={fontSize} setFontSize={setFontSize} fontColor={fontColor} setFontColor={setFontColor} />
                <button type="button" onClick={() => void commitExistingText()} className="brand-button h-10 w-full rounded-lg text-sm font-bold text-white"><Check className="mr-2 inline size-4" />Applica modifica</button>
              </>}
            </div>
          )}
          {tool === 'add' && (
            <div className="space-y-4">
              <InfoBox>Clicca sul PDF, scrivi direttamente e trascina la maniglia per posizionare il testo.</InfoBox>
              <TextStyleControls fontFamily={fontFamily} setFontFamily={setFontFamily} fontSize={fontSize} setFontSize={setFontSize} fontColor={fontColor} setFontColor={setFontColor} />
              <button type="button" disabled={!draft?.text.trim()} onClick={() => void commitText()} className="brand-button h-10 w-full rounded-lg text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Applica testo</button>
            </div>
          )}
          {tool === 'compress' && (
            <div className="space-y-4">
              <InfoBox>La modalità standard conserva testo e qualità. Quella forte riduce maggiormente, ma trasforma le pagine in immagini.</InfoBox>
              <button type="button" onClick={() => void compressLossless()} className="h-11 w-full rounded-xl border border-white/10 bg-white/[.045] text-sm font-semibold text-white hover:bg-white/[.08]">Ottimizza senza perdita</button>
              <button type="button" onClick={() => void compressStrong()} className="brand-button h-11 w-full rounded-xl text-sm font-bold text-white">Comprimi forte</button>
            </div>
          )}
          {tool === 'split' && (
            <div className="space-y-4">
              <InfoBox>Estrai un intervallo oppure scarica tutte le pagine come PDF separati dentro un archivio ZIP.</InfoBox>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-semibold text-slate-400">Da pagina<input type="number" min="1" max={pageCount} value={splitFrom} onChange={(event) => setSplitFrom(Number(event.target.value) || 1)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#141a28] px-3 text-sm text-white outline-none" /></label>
                <label className="text-xs font-semibold text-slate-400">A pagina<input type="number" min="1" max={pageCount} value={splitTo} onChange={(event) => setSplitTo(Number(event.target.value) || 1)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#141a28] px-3 text-sm text-white outline-none" /></label>
              </div>
              <button type="button" onClick={() => void downloadSplitRange()} className="brand-button h-11 w-full rounded-xl text-sm font-bold text-white">Scarica intervallo</button>
              <button type="button" onClick={() => void downloadPagesZip()} className="h-11 w-full rounded-xl border border-white/10 bg-white/[.045] text-sm font-semibold text-white hover:bg-white/[.08]">Dividi tutte in ZIP</button>
            </div>
          )}
          {tool === 'select' && (
            <div className="space-y-3 text-sm text-slate-400">
              <p className="font-semibold text-white">{fileName}</p>
              <p>Pagina {currentPage} di {pageCount}</p>
              <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[.05] p-3 text-xs leading-5 text-emerald-100/65">Il documento resta nel browser. Usa “Modifica testo” per selezionare direttamente le scritte.</div>
              <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200">Consulta il codice sorgente <ChevronDown className="size-3 -rotate-90" /></a>
            </div>
          )}
        </aside>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 bg-[#090d17] px-4 py-2 text-[11px] text-slate-500">
        <span>{fileName} · {pageCount} {pageCount === 1 ? 'pagina' : 'pagine'}</span>
        <span>Elaborazione locale · Per OCR, firme e font incorporati usa <a className="text-cyan-300 hover:text-cyan-200" href={RELEASE_URL}>l’app Mac</a></span>
      </div>
    </div>
  );
}

function TextStyleControls({ fontFamily, setFontFamily, fontSize, setFontSize, fontColor, setFontColor }: {
  fontFamily: FontFamily;
  setFontFamily: (value: FontFamily) => void;
  fontSize: number;
  setFontSize: (value: number) => void;
  fontColor: string;
  setFontColor: (value: string) => void;
}) {
  return <>
    <label className="block text-xs font-semibold text-slate-400">Carattere
      <select value={fontFamily} onChange={(event) => setFontFamily(event.target.value as FontFamily)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#141a28] px-3 text-sm text-white outline-none"><option>Helvetica</option><option>Times</option><option>Courier</option></select>
    </label>
    <label className="block text-xs font-semibold text-slate-400">Dimensione
      <input type="number" min="6" max="96" step="0.5" value={fontSize} onChange={(event) => setFontSize(Math.max(6, Math.min(96, Number(event.target.value) || 18)))} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#141a28] px-3 text-sm text-white outline-none" />
    </label>
    <label className="block text-xs font-semibold text-slate-400">Colore
      <input type="color" value={fontColor} onChange={(event) => setFontColor(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#141a28] p-1" />
    </label>
  </>;
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[.05] p-3 text-xs leading-5 text-cyan-100/70">{children}</div>;
}

function EditorTopBar({ status, busy }: { status: string; busy: boolean }) {
  return (
    <div className="editor-toolbar">
      <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#ff5f57]" /><span className="size-2.5 rounded-full bg-[#febc2e]" /><span className="size-2.5 rounded-full bg-[#28c840]" /></div>
      <div className="hidden items-center gap-2 rounded-lg border border-white/8 bg-white/[.035] px-3 py-1.5 text-xs text-slate-400 sm:flex">{busy ? <LoaderCircle className="size-3.5 animate-spin text-cyan-300" /> : <span className="size-2 rounded-full bg-emerald-400" />}{status}</div>
      <span className="text-xs font-medium text-slate-500">Nessun upload</span>
    </div>
  );
}

function ToolbarButton({ children, onClick, disabled = false, active = false, danger = false, title }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean; danger?: boolean; title: string }) {
  return <button type="button" title={title} disabled={disabled} onClick={onClick} className={`inline-flex h-9 items-center gap-2 rounded-lg border px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-30 [&_svg]:size-4 ${active ? 'border-cyan-300/45 bg-cyan-300/12 text-cyan-100' : danger ? 'border-red-300/10 bg-red-300/[.035] text-red-200 hover:bg-red-300/10' : 'border-white/8 bg-white/[.035] text-slate-300 hover:border-white/16 hover:bg-white/[.07] hover:text-white'}`}>{children}</button>;
}
