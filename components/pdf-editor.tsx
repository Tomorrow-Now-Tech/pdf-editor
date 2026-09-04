'use client';

import { TRANSLATORS, formatMessage, localizedError } from '@/i18n/messages.mjs';
import { type Locale } from '@/i18n/routes.mjs';
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
import { assertRenderedImages, pdfDocumentOptions, rasterizeChecked } from '@/pdf/runtime.mjs';
import { WEB_SOURCE_URL } from '@/legal/source';
import { MAC_DMG_DOWNLOAD_URL, MAC_DMG_FILENAME, MAC_DMG_DESCRIPTION } from '@/downloads/mac.mjs';

type FontFamily = 'Helvetica' | 'Times' | 'Courier';
type ToolMode = 'select' | 'add' | 'edit' | 'compress' | 'split' | 'word';

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

const SOURCE_URL = WEB_SOURCE_URL;

async function importPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  return pdfjs;
}

function baseName(fileName: string, locale: Locale = 'it') {
  return fileName.replace(/\.pdf$/i, '') || TRANSLATORS[locale]('documento');
}

function safeDownloadName(fileName: string, locale: Locale) {
  return `${baseName(fileName, locale)} - ${TRANSLATORS[locale]('modificato')}.pdf`;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  return {
    red: Number.parseInt(normalized.slice(0, 2), 16) / 255,
    green: Number.parseInt(normalized.slice(2, 4), 16) / 255,
    blue: Number.parseInt(normalized.slice(4, 6), 16) / 255,
  };
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

export function PdfEditor({ initialTool = 'select', uploadHint, locale = 'it' }: { initialTool?: ToolMode; uploadHint?: string; locale?: Locale } = {}) {
  const t = TRANSLATORS[locale];
  const message = (key: keyof typeof import('@/i18n/messages.mjs').FORMATS.en, values: Record<string, string | number> = {}) => formatMessage(locale, key, values);
  const errorMessage = useCallback((error: unknown, fallback: string) => localizedError(error, fallback, locale), [locale]);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasFrameRef = useRef<HTMLDivElement>(null);
  const pdfDocumentRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const viewportRef = useRef<PageViewport | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const renderGenerationRef = useRef(0);
  const thumbnailGenerationRef = useRef(0);
  const loadGenerationRef = useRef(0);
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
  const [status, setStatus] = useState(t("Pronto"));
  const [error, setError] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [tool, setTool] = useState<ToolMode>(initialTool);
  const [draft, setDraft] = useState<DraftText | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<FontFamily>('Helvetica');
  const [fontColor, setFontColor] = useState('#111827');
  const [splitFrom, setSplitFrom] = useState(1);
  const [splitTo, setSplitTo] = useState(1);
  const [visualEditAcknowledged, setVisualEditAcknowledged] = useState(false);
  const [hasVisualEdits, setHasVisualEdits] = useState(false);

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
      try { await renderTaskRef.current.promise; } catch { /* cancellation is expected */ }
    }

    const page = await pdf.getPage(currentPage);
    if (generation !== renderGenerationRef.current) return;
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
      await assertRenderedImages(page);

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
          fontName: style?.fontFamily || item.fontName || t("Carattere PDF"),
          fontSize: Math.max(6, Math.hypot(item.transform[2], item.transform[3]) || item.height || 12),
        } satisfies ExistingTextBox;
      });
      setTextBoxes(boxes);
    } catch (renderError: unknown) {
      if (!(renderError instanceof Error) || renderError.name !== 'RenderingCancelledException') throw renderError;
    }
  }, [currentPage, t]);

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
    const loadGeneration = ++loadGenerationRef.current;
    setBusy(true);
    setError('');
    setStatus(t("Apertura del PDF…"));
    let candidateTask: PDFDocumentLoadingTask | null = null;
    try {
      const pdfjs = await importPdfJs();
      candidateTask = pdfjs.getDocument(pdfDocumentOptions(nextBytes));
      const pdf = await candidateTask.promise as PDFDocumentProxy;
      if (loadGeneration !== loadGenerationRef.current) {
        await candidateTask.destroy();
        return false;
      }
      const thumbnailGeneration = ++thumbnailGenerationRef.current;
      ++renderGenerationRef.current;
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch { /* already complete */ }
      }
      const previousLoadingTask = loadingTaskRef.current;
      loadingTaskRef.current = candidateTask;
      pdfDocumentRef.current = pdf;
      setBytes(nextBytes);
      if (nextName) {
        setFileName(nextName);
        setHasVisualEdits(false);
        setVisualEditAcknowledged(false);
      }
      setPageCount(pdf.numPages);
      setCurrentPage(Math.max(1, Math.min(preferredPage, pdf.numPages)));
      setSplitFrom(1);
      setSplitTo(pdf.numPages);
      setDraft(null);
      setSelectedTextId(null);
      setTextBoxes([]);
      setDocumentVersion((value) => value + 1);
      setStatus(t("Documento elaborato soltanto nel browser"));
      void renderThumbnails(pdf, thumbnailGeneration);
      void previousLoadingTask?.destroy().catch(() => undefined);
      return true;
    } catch (loadError: unknown) {
      if (candidateTask && candidateTask !== loadingTaskRef.current) await candidateTask.destroy().catch(() => undefined);
      if (loadGeneration === loadGenerationRef.current) {
        setError(errorMessage(loadError, t("Impossibile aprire questo PDF. Il documento precedente non è stato modificato.")));
        setStatus(t("Operazione non completata"));
      }
      return false;
    } finally {
      if (loadGeneration === loadGenerationRef.current) setBusy(false);
    }
  }, [renderThumbnails, t, errorMessage]);

  const acceptFile = useCallback(async (file?: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError(t("Seleziona un file PDF valido."));
      return;
    }
    await loadBytes(new Uint8Array(await file.arrayBuffer()), file.name);
  }, [loadBytes, t]);

  useEffect(() => {
    if (!pdfDocumentRef.current) return;
    renderCurrentPage().catch((renderError) => setError(errorMessage(renderError, t("Rendering non riuscito."))));
  }, [currentPage, documentVersion, renderCurrentPage, t, errorMessage]);

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

  useEffect(() => {
    if (!bytes) return;
    const confirmLanguageChange = (event: Event) => {
      if (!window.confirm(formatMessage(locale, 'leave'))) event.preventDefault();
    };
    window.addEventListener('pdf-language-change', confirmLanguageChange);
    return () => window.removeEventListener('pdf-language-change', confirmLanguageChange);
  }, [bytes, locale]);

  useEffect(() => () => {
    ++loadGenerationRef.current;
    ++thumbnailGenerationRef.current;
    ++renderGenerationRef.current;
    try { renderTaskRef.current?.cancel(); } catch { /* already complete */ }
    void loadingTaskRef.current?.destroy();
  }, []);

  const mutatePdf = async (mutation: (pdf: PDFDocument) => Promise<void> | void, preferredPage = currentPage) => {
    if (!bytes || busy) return false;
    setBusy(true);
    setError('');
    try {
      const pdf = await PDFDocument.load(bytes.slice());
      await mutation(pdf);
      const saved = await pdf.save({ useObjectStreams: true });
      return await loadBytes(saved, undefined, preferredPage);
    } catch (mutationError: unknown) {
      setError(errorMessage(mutationError, t("Modifica non riuscita.")));
      return false;
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
      setError(t("Scrivi il testo da aggiungere."));
      return;
    }
    const saved = await mutatePdf(async (pdf) => {
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
    if (!saved) return;
    setTool('select');
    setStatus(t("Testo aggiunto. Scarica il PDF quando hai terminato."));
  };

  const selectExistingText = (box: ExistingTextBox) => {
    setSelectedTextId(box.id);
    setEditText(box.text);
    setFontFamily(box.fontFamily);
    setFontSize(Math.round(box.fontSize * 10) / 10);
    setFontColor('#111827');
  };

  const commitExistingText = async () => {
    if (!selectedTextBox || !visualEditAcknowledged) return;
    const saved = await mutatePdf(async (pdf) => {
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
    if (!saved) return;
    setHasVisualEdits(true);
    setTool('select');
    setStatus(t("Modifica visiva applicata. Il testo originale resta recuperabile."));
  };

  const downloadPdf = () => {
    if (!bytes) return;
    downloadBlob(new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'application/pdf' }), safeDownloadName(fileName, locale));
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
      setError(errorMessage(moveError, t("Riordino non riuscito.")));
    } finally {
      setBusy(false);
    }
  };

  const compressLossless = async () => {
    if (!bytes) return;
    setBusy(true);
    setError('');
    setStatus(t("Ottimizzazione senza perdita…"));
    try {
      const pdf = await PDFDocument.load(bytes.slice());
      const saved = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
      if (saved.length >= bytes.length) {
        setStatus(t("Il PDF è già ottimizzato: nessun aumento inutile delle dimensioni."));
        return;
      }
      const savedPercent = Math.round((1 - saved.length / bytes.length) * 100);
      await loadBytes(saved, undefined, currentPage);
      setStatus(message('optimised', { percent: savedPercent }));
    } catch (compressionError: unknown) {
      setError(errorMessage(compressionError, t("Compressione non riuscita.")));
    } finally {
      setBusy(false);
    }
  };

  const compressStrong = async () => {
    if (!bytes || busy) return;
    setBusy(true);
    setError('');
    let strictTask: PDFDocumentLoadingTask | null = null;
    try {
      // Fresh worker/document: do not reuse partially decoded preview caches.
      const pdfjs = await importPdfJs();
      strictTask = pdfjs.getDocument(pdfDocumentOptions(bytes));
      const sourcePdf = await strictTask.promise;
      const output = await PDFDocument.create();
      const saved = await rasterizeChecked(sourcePdf, (width: number, height: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
      }, async (canvas: HTMLCanvasElement) => (await canvasToBlob(canvas, 'image/jpeg', 0.66)).arrayBuffer(), output,
      (pageNumber: number, count: number) => setStatus(message('compressing', { page: pageNumber, count })));
      if (saved.length >= bytes.length) {
        setStatus(t("La compressione forte non ridurrebbe questo PDF: ho mantenuto l’originale."));
        return;
      }
      const savedPercent = Math.round((1 - saved.length / bytes.length) * 100);
      if (!await loadBytes(saved, undefined, Math.min(currentPage, output.getPageCount()))) return;
      setStatus(message('compressed', { percent: savedPercent }));
    } catch (compressionError: unknown) {
      setError(`${t("Compressione interrotta: il PDF precedente è stato conservato.")} ${errorMessage(compressionError, t("Controlla il documento prima di riprovare."))}`);
      setStatus(t("Compressione non applicata"));
    } finally {
      await strictTask?.destroy().catch(() => undefined);
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
      downloadBlob(new Blob([saved.buffer as ArrayBuffer], { type: 'application/pdf' }), `${baseName(fileName, locale)} - ${t("pagine")} ${from}-${to}.pdf`);
      setStatus(message('extracted', { from, to }));
    } catch (splitError: unknown) {
      setError(errorMessage(splitError, t("Divisione non riuscita.")));
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
        setStatus(message('splitting', { page: index + 1, count: source.getPageCount() }));
        const output = await PDFDocument.create();
        const [page] = await output.copyPages(source, [index]);
        output.addPage(page);
        zip.file(`${baseName(fileName, locale)} - ${t("pagina")} ${index + 1}.pdf`, await output.save({ useObjectStreams: true }));
      }
      downloadBlob(await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }), `${baseName(fileName, locale)} - ${t("pagine separate")}.zip`);
      setStatus(t("PDF diviso: archivio ZIP pronto."));
    } catch (splitError: unknown) {
      setError(errorMessage(splitError, t("Divisione in pagine non riuscita.")));
    } finally {
      setBusy(false);
    }
  };

  const convertToWord = async () => {
    if (hasVisualEdits) {
      setError(t("Conversione Word bloccata per questo documento: le modifiche visive lasciano il testo originale recuperabile, che verrebbe incluso nel DOCX. Usa un documento senza coperture di testo."));
      return;
    }
    const sourcePdf = pdfDocumentRef.current;
    if (!sourcePdf) return;
    setBusy(true);
    setError('');
    try {
      const { Document: WordDocument, Packer, PageBreak, Paragraph, TextRun } = await import('docx');
      const children: InstanceType<typeof Paragraph>[] = [];
      for (let pageNumber = 1; pageNumber <= sourcePdf.numPages; pageNumber += 1) {
        setStatus(message('word', { page: pageNumber, count: sourcePdf.numPages }));
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
      downloadBlob(await Packer.toBlob(word), `${baseName(fileName, locale)}.docx`);
      setStatus(t("Documento Word creato localmente. Controlla l’impaginazione complessa."));
    } catch (wordError: unknown) {
      setError(errorMessage(wordError, t("Conversione Word non riuscita.")));
    } finally {
      setBusy(false);
    }
  };

  if (!bytes) {
    return (
      <div className="editor-shell">
        <EditorTopBar locale={locale} status={status} busy={busy} />
        <input ref={inputRef} aria-label={t("Apri PDF")} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => void acceptFile(event.target.files?.[0])} />
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
            <span className="text-xl font-bold text-white sm:text-2xl">{t("Trascina qui il tuo PDF")}</span>
            <span className="mt-2 max-w-md text-sm leading-6 text-slate-400">{uploadHint || t("Aggiungi testo, comprimi, dividi e converti in Word. La modifica del testo esistente è solo visiva: non cancella l’originale. Nessun documento inviato ai nostri server.")}</span>
            <span className="brand-button mt-7 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white"><FilePlus2 className="size-4" /> {t("Apri PDF")}</span>
            {error && <span className="mt-4 text-sm font-medium text-red-300">{error}</span>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-shell">
      <EditorTopBar locale={locale} status={status} busy={busy} />
      <fieldset disabled={busy} className="m-0 min-w-0 border-0 p-0">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/8 bg-[#0b0f1a] px-3 py-2.5">
        <ToolbarButton active={tool === 'edit'} onClick={() => setActiveTool('edit')} title={t("Copri e riscrivi: l’originale resta recuperabile")}><PencilLine /><span>{t("Modifica visiva")}</span></ToolbarButton>
        <ToolbarButton active={tool === 'add'} onClick={() => setActiveTool('add')} title={t("Aggiungi testo")}><Type /><span>{t("Aggiungi testo")}</span></ToolbarButton>
        <ToolbarButton active={tool === 'compress'} onClick={() => setActiveTool('compress')} title={t("Comprimi PDF")}><FileArchive /><span className="hidden xl:inline">{t("Comprimi")}</span></ToolbarButton>
        <ToolbarButton active={tool === 'split'} onClick={() => setActiveTool('split')} title={t("Dividi PDF")}><Scissors /><span className="hidden xl:inline">{t("Dividi")}</span></ToolbarButton>
        <ToolbarButton active={tool === 'word'} onClick={() => setActiveTool('word')} title={t("Converti PDF in Word")}><FileText /><span className="hidden xl:inline">{t("PDF in Word")}</span></ToolbarButton>
        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
        <ToolbarButton onClick={() => void mutatePdf((pdf) => {
          const page = pdf.getPage(currentPage - 1);
          page.setRotation(degrees((page.getRotation().angle + 90) % 360));
        })} title={t("Ruota pagina")}><RotateCw /></ToolbarButton>
        <ToolbarButton onClick={() => void mutatePdf(async (pdf) => {
          const [copy] = await pdf.copyPages(pdf, [currentPage - 1]);
          pdf.insertPage(currentPage, copy);
        }, currentPage + 1)} title={t("Duplica pagina")}><Copy /></ToolbarButton>
        <ToolbarButton disabled={pageCount <= 1} danger onClick={() => void mutatePdf((pdf) => pdf.removePage(currentPage - 1), Math.max(1, currentPage - 1))} title={t("Elimina pagina")}><Trash2 /></ToolbarButton>
        <ToolbarButton disabled={currentPage <= 1} onClick={() => void movePage(-1)} title={t("Sposta pagina prima")}><ChevronLeft /></ToolbarButton>
        <ToolbarButton disabled={currentPage >= pageCount} onClick={() => void movePage(1)} title={t("Sposta pagina dopo")}><ChevronRight /></ToolbarButton>
        <button type="button" onClick={downloadPdf} className="brand-button ml-auto inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold text-white sm:text-sm"><ArrowDownToLine className="size-4" /> {t("Scarica PDF")}</button>
      </div>

      {error && <div role="alert" className="border-b border-red-300/15 bg-red-400/8 px-4 py-2 text-sm text-red-200">{error}</div>}
      {(tool === 'edit' || hasVisualEdits) && <div role="note" className="border-b border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100">
        <strong>{t("Non è una cancellazione sicura.")}</strong> {t("Il testo originale viene coperto in bianco, ma rimane nel PDF ed è recuperabile con copia, ricerca o estrazione. Non usare questa funzione per oscurare dati personali o riservati. Il font è sostitutivo e lo sfondo potrebbe essere coperto.")} {hasVisualEdits && <span className="block">{t("Questo avviso vale anche per il PDF scaricato. La conversione Word è bloccata per evitare l’esportazione del testo coperto.")}</span>}
      </div>}

      <div className="editor-workspace grid lg:grid-cols-[190px_minmax(0,1fr)_270px]">
        <aside className="hidden min-h-0 overflow-y-auto border-r border-white/8 bg-[#0b0f1a]/75 p-3 lg:block">
          <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{t("Pagine")}</p>
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
                  <img src={thumbnail} alt={message('thumbnail', { page: index + 1 })} className="mx-auto max-h-48 rounded bg-white shadow-lg" />
                ) : <span className="mx-auto grid aspect-[.72] w-[138px] place-items-center rounded bg-white/5"><LoaderCircle className="size-4 animate-spin text-slate-600" /></span>}
                <span className="mt-1.5 block text-xs text-slate-400">{index + 1}</span>
              </button>
            ))}
          </div>
        </aside>

        <div ref={canvasFrameRef} className="editor-canvas-scroll relative flex min-h-0 items-start justify-center overflow-auto bg-[#171b24] p-3 sm:p-6">
          <div className="relative shrink-0 shadow-[0_24px_80px_rgba(0,0,0,.48)]">
            <canvas ref={canvasRef} aria-label={message('preview', { page: currentPage, count: pageCount })} onClick={placeTextDraft} className={tool === 'add' ? 'cursor-text bg-white' : 'bg-white'} />
            {tool === 'edit' && textBoxes.map((box) => (
              <button
                key={box.id}
                type="button"
                aria-label={message('edit', { text: box.text })}
                title={box.text}
                onClick={() => selectExistingText(box)}
                className={`absolute z-[5] border transition ${selectedTextId === box.id ? 'border-cyan-300 bg-cyan-300/20 shadow-[0_0_0_2px_rgba(34,211,238,.16)]' : 'border-transparent bg-transparent hover:border-cyan-300/80 hover:bg-cyan-300/10'}`}
                style={{ left: box.screenX, top: box.screenY, width: box.screenWidth, height: box.screenHeight }}
              />
            ))}
            {draft && (
              <div className="absolute z-10 flex min-w-44 items-start rounded-lg border border-cyan-400 bg-white shadow-2xl" style={{ left: draft.screenX, top: draft.screenY }}>
                <button type="button" className="grid h-9 w-8 shrink-0 cursor-move place-items-center border-r border-slate-200 text-slate-500" title={t("Trascina per spostare")} onPointerDown={(event) => {
                  event.preventDefault();
                  dragState.current = { startX: event.clientX, startY: event.clientY, initialX: draft.screenX, initialY: draft.screenY };
                }}><Grip className="size-4" /></button>
                <textarea rows={1} value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} placeholder={t("Scrivi direttamente qui…")} className="min-h-9 min-w-56 resize both bg-transparent px-2 py-1.5 outline-none" style={{ fontFamily, fontSize, color: fontColor }} />
                <button type="button" className="grid h-9 w-8 shrink-0 place-items-center text-slate-400 hover:text-slate-900" aria-label={t("Annulla testo")} onClick={() => setDraft(null)}><X className="size-4" /></button>
              </div>
            )}
          </div>
          {busy && <div className="absolute inset-0 z-20 grid place-items-center bg-[#080b14]/55 backdrop-blur-sm"><LoaderCircle className="size-8 animate-spin text-cyan-300" /></div>}
        </div>

        <aside className="min-h-0 overflow-y-auto border-l border-white/8 bg-[#0b0f1a]/75 p-4">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{t("Proprietà")}</p>
          {tool === 'edit' && (
            <div className="space-y-4">
              <InfoBox>{selectedTextBox ? t("Copri e riscrivi il testo con uno dei tre font disponibili. Il testo originale non viene rimosso e il font esatto non è garantito.") : t("Clicca la scritta da coprire e riscrivere. Non usare questo strumento per nascondere informazioni riservate.")}</InfoBox>
              <label className="flex items-start gap-2 text-sm leading-6 text-amber-100"><input type="checkbox" checked={visualEditAcknowledged} onChange={(event) => setVisualEditAcknowledged(event.target.checked)} className="mt-1.5" />{t("Ho capito: il testo coperto resta recuperabile.")}</label>
              {selectedTextBox && <>
                <label className="block text-xs font-semibold text-slate-400">{t("Nuovo testo visibile")} <textarea value={editText} onChange={(event) => setEditText(event.target.value)} rows={4} className="mt-1.5 w-full resize-y rounded-lg border border-white/10 bg-[#141a28] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50" />
                </label>
                <p className="rounded-lg bg-white/[.035] px-3 py-2 text-[11px] leading-5 text-slate-500">{t("Rilevato:")} {selectedTextBox.fontName} · {selectedTextBox.fontSize.toFixed(1)} pt</p>
                <TextStyleControls locale={locale} fontFamily={fontFamily} setFontFamily={setFontFamily} fontSize={fontSize} setFontSize={setFontSize} fontColor={fontColor} setFontColor={setFontColor} />
                <button type="button" disabled={!visualEditAcknowledged} onClick={() => void commitExistingText()} className="brand-button h-10 w-full rounded-lg text-sm font-bold text-white disabled:opacity-40"><Check className="mr-2 inline size-4" />{t("Applica modifica visiva")}</button>
              </>}
            </div>
          )}
          {tool === 'add' && (
            <div className="space-y-4">
              <InfoBox>{t("Clicca sul PDF, scrivi direttamente e trascina la maniglia per posizionare il testo.")}</InfoBox>
              <TextStyleControls locale={locale} fontFamily={fontFamily} setFontFamily={setFontFamily} fontSize={fontSize} setFontSize={setFontSize} fontColor={fontColor} setFontColor={setFontColor} />
              <button type="button" disabled={!draft?.text.trim()} onClick={() => void commitText()} className="brand-button h-10 w-full rounded-lg text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{t("Applica testo")}</button>
            </div>
          )}
          {tool === 'compress' && (
            <div className="space-y-4">
              <InfoBox>{t("La modalità standard conserva testo e qualità. Quella forte trasforma le pagine in immagini: perde testo selezionabile, link, moduli e altre funzioni interattive. Se un’immagine non viene decodificata, la compressione viene interrotta. Controlla sempre il risultato.")}</InfoBox>
              <button type="button" onClick={() => void compressLossless()} className="h-11 w-full rounded-xl border border-white/10 bg-white/[.045] text-sm font-semibold text-white hover:bg-white/[.08]">{t("Ottimizza senza perdita")}</button>
              <button type="button" onClick={() => void compressStrong()} className="brand-button h-11 w-full rounded-xl text-sm font-bold text-white">{t("Comprimi forte")}</button>
            </div>
          )}
          {tool === 'split' && (
            <div className="space-y-4">
              <InfoBox>{t("Estrai un intervallo oppure scarica tutte le pagine come PDF separati dentro un archivio ZIP.")}</InfoBox>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-semibold text-slate-400">{t("Da pagina")}<input type="number" min="1" max={pageCount} value={splitFrom} onChange={(event) => setSplitFrom(Number(event.target.value) || 1)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#141a28] px-3 text-sm text-white outline-none" /></label>
                <label className="text-xs font-semibold text-slate-400">{t("A pagina")}<input type="number" min="1" max={pageCount} value={splitTo} onChange={(event) => setSplitTo(Number(event.target.value) || 1)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#141a28] px-3 text-sm text-white outline-none" /></label>
              </div>
              <button type="button" onClick={() => void downloadSplitRange()} className="brand-button h-11 w-full rounded-xl text-sm font-bold text-white">{t("Scarica intervallo")}</button>
              <button type="button" onClick={() => void downloadPagesZip()} className="h-11 w-full rounded-xl border border-white/10 bg-white/[.045] text-sm font-semibold text-white hover:bg-white/[.08]">{t("Dividi tutte in ZIP")}</button>
            </div>
          )}
          {tool === 'word' && (
            <div className="space-y-4">
              <InfoBox>{t("Estrae il testo selezionabile in DOCX. Non include OCR, immagini o ricostruzione fedele di tabelle, font e impaginazione. Il testo nascosto nel PDF può essere incluso: non usare documenti oscurati soltanto in modo visivo.")}</InfoBox>
              {hasVisualEdits && <p role="note" className="text-sm leading-6 text-amber-100">{t("Conversione bloccata: questo documento contiene modifiche visive effettuate nella sessione.")}</p>}
              <button type="button" disabled={hasVisualEdits} onClick={() => void convertToWord()} className="brand-button h-11 w-full rounded-xl text-sm font-bold text-white disabled:opacity-40">{t("Scarica Word")}</button>
            </div>
          )}
          {tool === 'select' && (
            <div className="space-y-3 text-sm text-slate-400">
              <p className="font-semibold text-white">{fileName}</p>
              <p>{message('page', { page: currentPage, count: pageCount })}</p>
              <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[.05] p-3 text-sm leading-6 text-emerald-100/75">{t("Il documento resta nel browser. “Modifica visiva” copre le scritte senza eliminarle. Anche la conversione Word può recuperare testo nascosto presente nel PDF.")}</div>
              <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200">{t("Consulta il codice sorgente")} <ChevronDown className="size-3 -rotate-90" /></a>
            </div>
          )}
        </aside>
      </div>
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 bg-[#090d17] px-4 py-2 text-[11px] text-slate-500">
        <span>{fileName} · {pageCount} {pageCount === 1 ? t("pagina") : t("pagine")}</span>
        <span>{t("Elaborazione locale · Per OCR, firme e font incorporati usa")} <a className="text-cyan-300 hover:text-cyan-200" href={MAC_DMG_DOWNLOAD_URL} download={MAC_DMG_FILENAME} title={t(MAC_DMG_DESCRIPTION)}>{t("l’app Mac")}</a></span>
      </div>
    </div>
  );
}

function TextStyleControls({ locale, fontFamily, setFontFamily, fontSize, setFontSize, fontColor, setFontColor }: {
  locale: Locale;
  fontFamily: FontFamily;
  setFontFamily: (value: FontFamily) => void;
  fontSize: number;
  setFontSize: (value: number) => void;
  fontColor: string;
  setFontColor: (value: string) => void;
}) {
  const t = TRANSLATORS[locale];
  return <>
    <label className="block text-xs font-semibold text-slate-400">{t("Carattere")} <select value={fontFamily} onChange={(event) => setFontFamily(event.target.value as FontFamily)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#141a28] px-3 text-sm text-white outline-none"><option>Helvetica</option><option>Times</option><option>Courier</option></select>
    </label>
    <label className="block text-xs font-semibold text-slate-400">{t("Dimensione")} <input type="number" min="6" max="96" step="0.5" value={fontSize} onChange={(event) => setFontSize(Math.max(6, Math.min(96, Number(event.target.value) || 18)))} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#141a28] px-3 text-sm text-white outline-none" />
    </label>
    <label className="block text-xs font-semibold text-slate-400">{t("Colore")} <input type="color" value={fontColor} onChange={(event) => setFontColor(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#141a28] p-1" />
    </label>
  </>;
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[.05] p-3 text-xs leading-5 text-cyan-100/70">{children}</div>;
}

function EditorTopBar({ status, busy, locale }: { status: string; busy: boolean; locale: Locale }) {
  const t = TRANSLATORS[locale];
  return (
    <div className="editor-toolbar">
      <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#ff5f57]" /><span className="size-2.5 rounded-full bg-[#febc2e]" /><span className="size-2.5 rounded-full bg-[#28c840]" /></div>
      <output aria-live="polite" className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[.035] px-3 py-1.5 text-sm text-slate-400">{busy ? <LoaderCircle className="size-3.5 animate-spin text-cyan-300" /> : <span className="size-2 rounded-full bg-emerald-400" />}{status}</output>
      <span className="text-xs font-medium text-slate-500">{t("Nessun upload")}</span>
    </div>
  );
}

function ToolbarButton({ children, onClick, disabled = false, active = false, danger = false, title }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean; danger?: boolean; title: string }) {
  return <button type="button" title={title} disabled={disabled} onClick={onClick} className={`inline-flex h-9 items-center gap-2 rounded-lg border px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-30 [&_svg]:size-4 ${active ? 'border-cyan-300/45 bg-cyan-300/12 text-cyan-100' : danger ? 'border-red-300/10 bg-red-300/[.035] text-red-200 hover:bg-red-300/10' : 'border-white/8 bg-white/[.035] text-slate-300 hover:border-white/16 hover:bg-white/[.07] hover:text-white'}`}>{children}</button>;
}
