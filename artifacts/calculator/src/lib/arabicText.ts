// Arabic text shaping for jsPDF.
// Uses vendored copies of arabic-reshaper (GPL-3.0) and bidi-js (MIT) because
// the workspace pnpm store is currently misaligned and cannot install new deps.

// @ts-ignore — UMD vendor module
import ArabicReshaper from './vendor/arabic-reshaper/index.js';
const ARABIC_RANGE = /[\u0600-\u06FF]/;

/**
 * Prepare a string for jsPDF rendering.
 *
 * jsPDF 4 applies its own bidi pass in the `postProcessText` event. Returning
 * a manually bidi-reordered string here caused a second reversal in the PDF
 * output. We therefore only shape Arabic letters here and leave direction and
 * alignment to jsPDF's single internal bidi pass.
 */
export function prepareArabicText(text: string): string {
  if (!text || typeof text !== 'string') return text || '';
  if (!ARABIC_RANGE.test(text)) return text;

  const reshaper = ArabicReshaper as { convertArabic: (s: string) => string };
  return reshaper.convertArabic(text);
}
