import { StandardFonts, degrees, rgb } from 'pdf-lib';
import { uprightTextRotation } from './page-rotation.mjs';

const FONT_NAMES = {
  Helvetica: StandardFonts.Helvetica,
  Times: StandardFonts.TimesRoman,
  Courier: StandardFonts.Courier,
};

/** Bind visual-edit consent to the exact document, target and proposed font.
 * @param {number} revision @param {number} page @param {string} targetId
 * @param {string} font @param {string} text @param {number} size
 */
export function textEditConsentKey(revision, page, targetId, font, text, size) {
  return JSON.stringify([revision, page, targetId, font, text, size]);
}

/** Focus at mount time, without a deferred callback stealing later input.
 * @param {{isConnected: boolean, focus: (options?: {preventScroll?: boolean}) => void} | null} element
 */
export function focusConnectedDraft(element) {
  if (element?.isConnected) element.focus({ preventScroll: true });
}

/** @param {string} value */
function colour(value) {
  const normalized = /^#[0-9a-f]{6}$/i.test(value) ? value.slice(1) : '111827';
  return {
    red: Number.parseInt(normalized.slice(0, 2), 16) / 255,
    green: Number.parseInt(normalized.slice(2, 4), 16) / 255,
    blue: Number.parseInt(normalized.slice(4, 6), 16) / 255,
  };
}

/**
 * Materialises browser-session text objects only when an operation needs PDF
 * bytes. Keeping them as overlays beforehand makes move/edit lossless and
 * avoids leaving covered duplicate strings behind after every drag.
 * @param {import('pdf-lib').PDFDocument} pdf
 * @param {Array<{page: number, pdfX: number, pdfY: number, text: string, fontFamily: keyof typeof FONT_NAMES, fontSize: number, fontColor: string}>} objects
 */
export async function materializeAddedTexts(pdf, objects) {
  const fonts = new Map();
  for (const object of objects) {
    if (!object.text.trim()) continue;
    const pageIndex = object.page - 1;
    if (pageIndex < 0 || pageIndex >= pdf.getPageCount()) continue;
    let font = fonts.get(object.fontFamily);
    if (!font) {
      font = await pdf.embedFont(FONT_NAMES[object.fontFamily] || StandardFonts.Helvetica);
      fonts.set(object.fontFamily, font);
    }
    const page = pdf.getPage(pageIndex);
    const fill = colour(object.fontColor);
    page.drawText(object.text, {
      x: object.pdfX,
      y: object.pdfY,
      size: object.fontSize,
      font,
      color: rgb(fill.red, fill.green, fill.blue),
      rotate: degrees(uprightTextRotation(page.getRotation().angle)),
    });
  }
}

export function clampZoom(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 100;
  return Math.max(35, Math.min(250, Math.round(numeric)));
}
