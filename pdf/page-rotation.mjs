const QUARTER_TURNS = new Set([0, 90, 180, 270]);

/**
 * Normalizza /Rotate e rifiuta angoli che pdf-lib non può salvare come rotazione pagina.
 * @param {number} angle
 * @returns {0 | 90 | 180 | 270}
 */
export function uprightTextRotation(angle) {
  const numericAngle = Number(angle);
  const normalized = ((numericAngle % 360) + 360) % 360;
  if (!Number.isFinite(numericAngle) || !QUARTER_TURNS.has(normalized)) {
    throw new Error(`Rotazione pagina PDF non supportata: ${angle}`);
  }
  return /** @type {0 | 90 | 180 | 270} */ (normalized);
}
