'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  FilePlus2,
  Grip,
  LoaderCircle,
  RotateCw,
  Trash2,
  Type,
  Upload,
  X,
} from 'lucide-react';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import type { PDFDocumentProxy, PageViewport, RenderTask } from 'pdfjs-dist';

type DraftText = {
  screenX: number;
  screenY: number;
  pdfX: number;
  pdfY: number;
  text: string;
};

const SOURCE_URL = 'https://github.com/Trader855/PDF';
const RELEASE_URL = 'https://github.com/Trader855/PDF/releases/latest';

async function importPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  return pdfjs;
}

function safeDownloadName(fileName: string) {
  const clean = fileName.replace(/\.pdf$/i, '') || 'documento';
  return `${clean} - modificato.pdf`;
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

export function PdfEditor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasFrameRef = useRef<HTMLDivElement>(null);
  const pdfDocumentRef = useRef<PDFDocumentProxy | null>(null);
  const viewportRef = useRef<PageViewport | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [documentVersion, setDocumentVersion] = useState(0);
  const [fileName, setFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Pronto');
  const [error, setError] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [tool, setTool] = useState<'select' | 'text'>('select');
  const [draft, setDraft] = useState<DraftText | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<'Helvetica' | 'Times' | 'Courier'>('Helvetica');
  const [fontColor, setFontColor] = useState('#111827');
  const dragState = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const renderCurrentPage = useCallback(async () => {
    const document = pdfDocumentRef.current;
    const canvas = canvasRef.current;
    const frame = canvasFrameRef.current;
    if (!document || !canvas || !frame) return;

    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // A completed render task no longer needs cancellation.
      }
    }

    const page = await document.getPage(currentPage);
    const baseViewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(280, Math.min(980, frame.clientWidth - 24));
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
    } catch (renderError: unknown) {
      if (!(renderError instanceof Error) || renderError.name !== 'RenderingCancelledException') throw renderError;
    }
  }, [currentPage]);

  const renderThumbnails = useCallback(async (document: PDFDocumentProxy) => {
    const images: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: 138 / base.width });
      const canvas = window.document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d', { alpha: false });
      if (context) await page.render({ canvas, canvasContext: context, viewport }).promise;
      images.push(canvas.toDataURL('image/jpeg', 0.72));
    }
    setThumbnails(images);
  }, []);

  const loadBytes = useCallback(async (nextBytes: Uint8Array, nextName?: string, preferredPage = 1) => {
    setBusy(true);
    setError('');
    setStatus('Apertura del PDF…');
    try {
      const pdfjs = await importPdfJs();
      if (pdfDocumentRef.current) await pdfDocumentRef.current.cleanup();
      const loadingTask = pdfjs.getDocument({ data: nextBytes.slice() });
      const document = await loadingTask.promise;
      pdfDocumentRef.current = document as PDFDocumentProxy;
      setBytes(nextBytes);
      if (nextName) setFileName(nextName);
      setPageCount(document.numPages);
      setCurrentPage(Math.max(1, Math.min(preferredPage, document.numPages)));
      setDraft(null);
      setDocumentVersion((value) => value + 1);
      setStatus('Documento elaborato soltanto nel browser');
      void renderThumbnails(document as PDFDocumentProxy);
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
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    await loadBytes(fileBytes, file.name);
  }, [loadBytes]);

  useEffect(() => {
    if (!pdfDocumentRef.current) return;
    renderCurrentPage().catch((renderError) => setError(renderError.message));
  }, [currentPage, documentVersion, renderCurrentPage]);

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

  const mutatePdf = async (mutation: (document: PDFDocument) => Promise<void> | void, preferredPage = currentPage) => {
    if (!bytes) return;
    setBusy(true);
    setError('');
    try {
      const document = await PDFDocument.load(bytes.slice());
      await mutation(document);
      const saved = await document.save();
      await loadBytes(saved, undefined, preferredPage);
    } catch (mutationError: unknown) {
      setError(errorMessage(mutationError, 'Modifica non riuscita.'));
    } finally {
      setBusy(false);
    }
  };

  const placeTextDraft = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'text' || !viewportRef.current) return;
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
    const standardFont = fontFamily === 'Times'
      ? StandardFonts.TimesRoman
      : fontFamily === 'Courier'
        ? StandardFonts.Courier
        : StandardFonts.Helvetica;
    await mutatePdf(async (document) => {
      const page = document.getPage(currentPage - 1);
      const font = await document.embedFont(standardFont);
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
  };

  const downloadPdf = () => {
    if (!bytes) return;
    const blob = new Blob([bytes.slice().buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = safeDownloadName(fileName);
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
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
      const saved = await reordered.save();
      await loadBytes(saved, undefined, target + 1);
    } catch (moveError: unknown) {
      setError(errorMessage(moveError, 'Riordino non riuscito.'));
    } finally {
      setBusy(false);
    }
  };

  if (!bytes) {
    return (
      <div className="editor-shell">
        <EditorTopBar status={status} busy={busy} />
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(event) => void acceptFile(event.target.files?.[0])}
        />
        <div className="flex min-h-[540px] items-center justify-center bg-[radial-gradient(circle_at_center,rgba(35,46,82,.42),transparent_68%)] p-5 sm:p-10">
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
            className={`group flex w-full max-w-2xl flex-col items-center rounded-[28px] border border-dashed px-6 py-14 text-center transition sm:py-20 ${
              isDraggingFile
                ? 'border-cyan-300 bg-cyan-300/8 shadow-[0_0_50px_rgba(0,229,255,.12)]'
                : 'border-white/16 bg-white/[.025] hover:border-cyan-300/45 hover:bg-white/[.045]'
            }`}
          >
            <span className="mb-6 grid size-20 place-items-center rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/16 via-blue-500/12 to-fuchsia-400/16 text-cyan-200 shadow-[0_20px_70px_rgba(26,83,255,.2)] transition group-hover:-translate-y-1">
              <Upload className="size-8" />
            </span>
            <span className="text-xl font-bold text-white sm:text-2xl">Trascina qui il tuo PDF</span>
            <span className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              oppure clicca per scegliere un documento. Non serve registrarsi e il file non lascia il dispositivo.
            </span>
            <span className="brand-button mt-7 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white">
              <FilePlus2 className="size-4" /> Apri PDF
            </span>
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
        <ToolbarButton active={tool === 'text'} onClick={() => setTool(tool === 'text' ? 'select' : 'text')} title="Aggiungi testo">
          <Type /> <span>Aggiungi testo</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => void mutatePdf((document) => {
          const page = document.getPage(currentPage - 1);
          page.setRotation(degrees((page.getRotation().angle + 90) % 360));
        })} title="Ruota pagina"><RotateCw /><span className="hidden sm:inline">Ruota</span></ToolbarButton>
        <ToolbarButton onClick={() => void mutatePdf(async (document) => {
          const [copy] = await document.copyPages(document, [currentPage - 1]);
          document.insertPage(currentPage, copy);
        }, currentPage + 1)} title="Duplica pagina"><Copy /><span className="hidden sm:inline">Duplica</span></ToolbarButton>
        <ToolbarButton disabled={pageCount <= 1} danger onClick={() => void mutatePdf((document) => {
          document.removePage(currentPage - 1);
        }, Math.max(1, currentPage - 1))} title="Elimina pagina"><Trash2 /><span className="hidden sm:inline">Elimina</span></ToolbarButton>
        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
        <ToolbarButton disabled={currentPage <= 1} onClick={() => void movePage(-1)} title="Sposta pagina prima"><ChevronLeft /></ToolbarButton>
        <ToolbarButton disabled={currentPage >= pageCount} onClick={() => void movePage(1)} title="Sposta pagina dopo"><ChevronRight /></ToolbarButton>
        <button type="button" onClick={downloadPdf} className="brand-button ml-auto inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold text-white sm:text-sm">
          <ArrowDownToLine className="size-4" /> Scarica PDF
        </button>
      </div>

      {error && <div className="border-b border-red-300/15 bg-red-400/8 px-4 py-2 text-sm text-red-200">{error}</div>}

      <div className="grid min-h-[620px] lg:grid-cols-[190px_minmax(0,1fr)_250px]">
        <aside className="hidden overflow-y-auto border-r border-white/8 bg-[#0b0f1a]/75 p-3 lg:block">
          <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Pagine</p>
          <div className="space-y-3">
            {thumbnails.map((thumbnail, index) => (
              <button key={`${index}-${thumbnail.slice(-12)}`} type="button" onClick={() => { setCurrentPage(index + 1); setDraft(null); }} className={`w-full rounded-xl border p-2 transition ${currentPage === index + 1 ? 'border-cyan-300/70 bg-cyan-300/8' : 'border-white/8 bg-white/[.02] hover:border-white/20'}`}>
                {/* oxlint-disable-next-line next/no-img-element -- data URL generata localmente dal PDF */}
                <img src={thumbnail} alt={`Pagina ${index + 1}`} className="mx-auto max-h-48 rounded bg-white shadow-lg" />
                <span className="mt-1.5 block text-xs text-slate-400">{index + 1}</span>
              </button>
            ))}
          </div>
        </aside>

        <div ref={canvasFrameRef} className="relative flex min-h-[620px] items-start justify-center overflow-auto bg-[#171b24] p-3 sm:p-6">
          <div className="relative shadow-[0_24px_80px_rgba(0,0,0,.48)]">
            <canvas ref={canvasRef} onClick={placeTextDraft} className={tool === 'text' ? 'cursor-text bg-white' : 'bg-white'} />
            {draft && (
              <div className="absolute z-10 flex min-w-44 items-start rounded-lg border border-cyan-400 bg-white shadow-2xl" style={{ left: draft.screenX, top: draft.screenY }}>
                <button
                  type="button"
                  className="grid h-9 w-8 shrink-0 cursor-move place-items-center border-r border-slate-200 text-slate-500"
                  title="Trascina per spostare"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    dragState.current = { startX: event.clientX, startY: event.clientY, initialX: draft.screenX, initialY: draft.screenY };
                  }}
                >
                  <Grip className="size-4" />
                </button>
                <textarea
                  rows={1}
                  value={draft.text}
                  onChange={(event) => setDraft({ ...draft, text: event.target.value })}
                  placeholder="Scrivi direttamente qui…"
                  className="min-h-9 min-w-56 resize both bg-transparent px-2 py-1.5 outline-none"
                  style={{ fontFamily, fontSize, color: fontColor }}
                />
                <button type="button" className="grid h-9 w-8 shrink-0 place-items-center text-slate-400 hover:text-slate-900" onClick={() => setDraft(null)}><X className="size-4" /></button>
              </div>
            )}
          </div>
          {busy && <div className="absolute inset-0 grid place-items-center bg-[#080b14]/55 backdrop-blur-sm"><LoaderCircle className="size-8 animate-spin text-cyan-300" /></div>}
        </div>

        <aside className="border-l border-white/8 bg-[#0b0f1a]/75 p-4">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Proprietà</p>
          {tool === 'text' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[.05] p-3 text-xs leading-5 text-cyan-100/70">
                Clicca sul PDF, scrivi direttamente e trascina la maniglia per posizionare il testo.
              </div>
              <label className="block text-xs font-semibold text-slate-400">Carattere
                <select value={fontFamily} onChange={(event) => setFontFamily(event.target.value as typeof fontFamily)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#141a28] px-3 text-sm text-white outline-none">
                  <option>Helvetica</option><option>Times</option><option>Courier</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-400">Dimensione
                <input type="number" min="6" max="96" value={fontSize} onChange={(event) => setFontSize(Math.max(6, Math.min(96, Number(event.target.value) || 18)))} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#141a28] px-3 text-sm text-white outline-none" />
              </label>
              <label className="block text-xs font-semibold text-slate-400">Colore
                <input type="color" value={fontColor} onChange={(event) => setFontColor(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#141a28] p-1" />
              </label>
              <button type="button" disabled={!draft?.text.trim()} onClick={() => void commitText()} className="brand-button h-10 w-full rounded-lg text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Applica testo</button>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-slate-400">
              <p className="font-semibold text-white">{fileName}</p>
              <p>Pagina {currentPage} di {pageCount}</p>
              <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[.05] p-3 text-xs leading-5 text-emerald-100/65">
                Questo documento non è stato caricato: PDF.js e pdf-lib lavorano localmente nella memoria del browser.
              </div>
              <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200">Consulta il codice sorgente <ChevronDown className="size-3 -rotate-90" /></a>
            </div>
          )}
        </aside>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 bg-[#090d17] px-4 py-2 text-[11px] text-slate-500">
        <span>{fileName} · {pageCount} {pageCount === 1 ? 'pagina' : 'pagine'}</span>
        <span>Web beta · Per la modifica avanzata del testo esistente usa <a className="text-cyan-300 hover:text-cyan-200" href={RELEASE_URL}>l’app Mac</a></span>
      </div>
    </div>
  );
}

function EditorTopBar({ status, busy }: { status: string; busy: boolean }) {
  return (
    <div className="editor-toolbar">
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="hidden items-center gap-2 rounded-lg border border-white/8 bg-white/[.035] px-3 py-1.5 text-xs text-slate-400 sm:flex">
        {busy ? <LoaderCircle className="size-3.5 animate-spin text-cyan-300" /> : <span className="size-2 rounded-full bg-emerald-400" />}
        {status}
      </div>
      <span className="text-xs font-medium text-slate-500">Nessun upload</span>
    </div>
  );
}

function ToolbarButton({ children, onClick, disabled = false, active = false, danger = false, title }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean; danger?: boolean; title: string }) {
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick} className={`inline-flex h-9 items-center gap-2 rounded-lg border px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-30 [&_svg]:size-4 ${active ? 'border-cyan-300/45 bg-cyan-300/12 text-cyan-100' : danger ? 'border-red-300/10 bg-red-300/[.035] text-red-200 hover:bg-red-300/10' : 'border-white/8 bg-white/[.035] text-slate-300 hover:border-white/16 hover:bg-white/[.07] hover:text-white'}`}>
      {children}
    </button>
  );
}
