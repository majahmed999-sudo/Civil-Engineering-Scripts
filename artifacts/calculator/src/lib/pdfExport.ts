import { jsPDF } from "jspdf";
import type { jsPDF as jsPDFType } from "jspdf";
import { prepareArabicText } from "./arabicText";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface ElementResult {
  id: string; label: string; dim1: number; dim2: number; dim3: number;
  quantity: number; volumeEach: number; totalVolume: number; steelKg: number;
}
interface SectionSummary {
  elements: ElementResult[]; totalVolume: number; totalSteelKg: number;
  totalSteelTons: number; concreteCost: number; steelCost: number; total: number;
}
interface Floor { id: string; name: string; }
interface FloorBreakdown {
  floor: Floor; totalVolume: number; totalSteelKg: number;
  totalSteelTons: number; totalCost: number;
}
interface FullSummary {
  footings: SectionSummary; stripFootings: SectionSummary; raftFootings: SectionSummary;
  columns: SectionSummary; beams: SectionSummary; solidSlabs: SectionSummary;
  hollowSlabs: SectionSummary; flatSlabs: SectionSummary; waffleSlabs: SectionSummary;
  byFloor: FloorBreakdown[]; totalConcreteVolume: number; totalSteelKg: number;
  totalSteelTons: number; totalConcreteCost: number; totalSteelCost: number; grandTotal: number;
}
interface BOQItem {
  no: number; typeLabel: string; typeCode: string; floorName: string;
  label: string; dim1: number; dim2: number; dim3: number;
  qty: number; volEach: number; volTotal: number; steelKgTotal: number; costTotal: number;
}
interface MixDesign {
  cement: string; sand: string; gravel: string;
  compactionFactor: string; bagWeightKg: string;
}
interface MixResult { dryVolume: number; cementVolume: number; sandVolume: number; gravelVolume: number; cementBags: number; }
interface ProjectInfo {
  projectName: string; engineerName: string; clientName: string;
  concretePricePerM3: string; steelPricePerTon: string;
}
interface SectionInfo {
  key: keyof FullSummary; titleAr: string; titleEn: string; totalVolume: number;
  totalSteelKg: number; totalSteelTons: number; total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function computeMix(totalVolume: number, m: MixDesign): MixResult {
  const c  = parseFloat(m.cement)           || 1;
  const s  = parseFloat(m.sand)             || 2;
  const g  = parseFloat(m.gravel)           || 4;
  const cf = parseFloat(m.compactionFactor) || 1.54;
  const bw = parseFloat(m.bagWeightKg)      || 50;
  const total = c + s + g;
  const dryVolume    = totalVolume * cf;
  const cementVolume = (c / total) * dryVolume;
  const sandVolume   = (s / total) * dryVolume;
  const gravelVolume = (g / total) * dryVolume;
  const cementBags   = Math.ceil(cementVolume / (bw / 1440));
  return { dryVolume, cementVolume, sandVolume, gravelVolume, cementBags };
}

/** Format number with thousands separators — 2 decimal places by default */
function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Convert ArrayBuffer → base64 (chunked for large buffers) */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(binary);
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTE
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  darkBlue:   [17, 34, 64] as [number, number, number],
  midBlue:    [26, 54, 93] as [number, number, number],
  accentBlue: [37, 99, 235] as [number, number, number],
  lightBlue:  [219, 234, 254] as [number, number, number],
  headerBg:   [22, 40, 70] as [number, number, number],
  footerBg:   [15, 28, 50] as [number, number, number],

  white:      [255, 255, 255] as [number, number, number],
  offWhite:   [248, 250, 252] as [number, number, number],
  lightGray:  [241, 243, 246] as [number, number, number],
  borderGray: [203, 213, 225] as [number, number, number],
  mutedGray:  [148, 163, 184] as [number, number, number],
  bodyText:   [51, 65, 85] as [number, number, number],
  darkText:   [30, 41, 59] as [number, number, number],

  greenBg:    [240, 253, 244] as [number, number, number],
  greenText:  [22, 101, 52] as [number, number, number],
  greenBorder:[187, 247, 208] as [number, number, number],

  goldAccent: [212, 175, 55] as [number, number, number],
  goldText:   [156, 128, 38] as [number, number, number],
  softDivider:[226, 232, 240] as [number, number, number],
};

// ─────────────────────────────────────────────────────────────────────────────
// FONT LOADING
// ─────────────────────────────────────────────────────────────────────────────

// Resolve font path relative to the base URL (handles /calculator/ prefix in dev)
const _base = typeof import.meta !== "undefined" && import.meta.env?.BASE_URL
  ? import.meta.env.BASE_URL : "/";

const FONT_URLS = {
  regular: `${_base}fonts/Amiri-Regular.ttf`,
  bold:    `${_base}fonts/Amiri-Bold.ttf`,
};

const FONT_FAMILY = "Amiri";

let _fontName: string | null = null;

function _useFont(pdf: jsPDF, style: "normal" | "bold") {
  pdf.setFont(_fontName || "helvetica", style);
}

async function loadFont(pdf: jsPDF, style: "normal" | "bold"): Promise<void> {
  const url = style === "normal" ? FONT_URLS.regular : FONT_URLS.bold;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch ${FONT_FAMILY} ${style}: ${resp.status} ${resp.statusText}`);
  }
  const buffer = await resp.arrayBuffer();
  const b64 = arrayBufferToBase64(buffer);
  const filename = style === "normal" ? "Amiri-Regular.ttf" : "Amiri-Bold.ttf";
  pdf.addFileToVFS(filename, b64);
  pdf.addFont(filename, FONT_FAMILY, style);

  // jsPDF's addFont event handler swallows TTFFont parsing errors via PubSub,
  // so the font entry can be registered with empty metadata. We must verify
  // the font was actually parsed by checking its Unicode width table.
  const p = pdf as unknown as { getFont(name: string, style: string): { metadata?: { Unicode?: { widths?: unknown } } } | undefined };
  const info = p.getFont(FONT_FAMILY, style);
  if (!info?.metadata?.Unicode?.widths) {
    throw new Error(`${FONT_FAMILY} ${style} font registration failed: metadata.Unicode.widths missing (TTFFont parsing error)`);
  }
}

async function loadFonts(pdf: jsPDF): Promise<void> {
  try {
    await loadFont(pdf, "normal");
    await loadFont(pdf, "bold");
    _fontName = FONT_FAMILY;
  } catch (err) {
    _fontName = null;
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[pdfExport] Arabic font registration failed:", msg);
    throw new Error(`Arabic font registration failed: ${msg}. PDF cannot be generated for Arabic content.`);
  }
}

/** Draw text through the Arabic shaping/RTL pipeline before passing to jsPDF. */
function drawText(pdf: jsPDF, text: string | string[], x: number, y: number, options?: any) {
  const processed = Array.isArray(text)
    ? text.map(prepareArabicText)
    : prepareArabicText(text);
  (pdf as any).text(processed, x, y, options);
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const MARGIN = 14;
const PAGE_W = 210; // A4
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const HEADER_BAND_H = 30;
const FOOTER_BAND_H = 14;
const ROW_H = 6.5;

// ─────────────────────────────────────────────────────────────────────────────
// DRAWING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function drawHeaderBand(pdf: jsPDF, isCover = false) {
  const h = isCover ? 120 : HEADER_BAND_H;
  pdf.setFillColor(...C.darkBlue);
  pdf.rect(0, 0, PAGE_W, h, "F");
}

function drawFooter(pdf: jsPDF, pageNum: number, totalPages: number) {
  // Footer bar
  pdf.setFillColor(...C.footerBg);
  pdf.rect(0, PAGE_H - FOOTER_BAND_H, PAGE_W, FOOTER_BAND_H, "F");

  _useFont(pdf, "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(...C.mutedGray);
  drawText(pdf, "Generated by Construction Quantity Calculator", MARGIN, PAGE_H - 4.5);

  // Gold divider line
  pdf.setDrawColor(...C.goldAccent);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN, PAGE_H - FOOTER_BAND_H + 2, PAGE_W - MARGIN, PAGE_H - FOOTER_BAND_H + 2);

  pdf.setFontSize(6);
  drawText(pdf, "Developed by Eng. Majid Alqobidhah", MARGIN, PAGE_H - FOOTER_BAND_H + 8.5);

  _useFont(pdf, "bold");
  pdf.setTextColor(...C.goldAccent);
  const pg = `${pageNum}`;
  const total = `${totalPages}`;
  pdf.setFontSize(7);
  const pageStr = `Page ${pg} of ${total}`;
  drawText(pdf, pageStr, PAGE_W - MARGIN, PAGE_H - 4.5, { align: "right" });
}

function drawPageHeader(pdf: jsPDF, pageNum: number, totalPages: number, project: ProjectInfo, dateStr: string) {
  drawHeaderBand(pdf);
  // Logo placeholder
  pdf.setDrawColor(...C.lightBlue);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(MARGIN + 1, 4, 10, 10, 1.5, 1.5, "S");
  // Thin inner placeholder line
  pdf.roundedRect(MARGIN + 2.5, 5.5, 7, 7, 1, 1, "S");

  // Title
  _useFont(pdf, "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...C.lightBlue);
  drawText(pdf, "Construction Quantity Calculator", MARGIN + 14, 8.5);

  _useFont(pdf, "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...C.mutedGray);
  drawText(pdf, "Structural Quantity Report", MARGIN + 14, 16);

  // Right-aligned meta
  pdf.setFontSize(6.5);
  _useFont(pdf, "normal");
  pdf.setTextColor(...C.mutedGray);
  let rx = PAGE_W - MARGIN;
  const metaItems: string[] = [];
  if (project.projectName) metaItems.push(project.projectName);
  metaItems.push(dateStr);
  const metaStr = metaItems.join("  |  ");
  drawText(pdf, metaStr, rx, 8, { align: "right" });

  pdf.setFontSize(6);
  const metaItems2: string[] = [];
  if (project.engineerName) metaItems2.push(`Engineer: ${project.engineerName}`);
  if (project.clientName) metaItems2.push(`Client: ${project.clientName}`);
  const metaStr2 = metaItems2.join("  |  ");
  if (metaStr2) drawText(pdf, metaStr2, rx, 16, { align: "right" });

  // Divider line below header
  pdf.setDrawColor(...C.goldAccent);
  pdf.setLineWidth(0.4);
  pdf.line(MARGIN, HEADER_BAND_H - 1, PAGE_W - MARGIN, HEADER_BAND_H - 1);

  // Gold accent bar
  pdf.setFillColor(...C.goldAccent);
  pdf.rect(0, HEADER_BAND_H - 1, PAGE_W, 0.8, "F");
}

function checkPageBreak(
  pdf: jsPDF,
  yPos: number,
  needed: number,
  resetY = HEADER_BAND_H + 4,
  onNewPage?: () => void,
): number {
  if (yPos + needed > PAGE_H - FOOTER_BAND_H - 4) {
    pdf.addPage();
    onNewPage?.();
    return resetY;
  }
  return yPos;
}

type OrderedTableColumn = {
  key: string;
  w: number;
  align: "left" | "center" | "right";
};

function drawTableHeader(pdf: jsPDF, y: number, cols: OrderedTableColumn[], headers: string[]) {
  pdf.setFillColor(...C.headerBg);
  pdf.rect(MARGIN, y, CONTENT_W, ROW_H + 1, "F");
  pdf.setTextColor(...C.white);
  _useFont(pdf, "bold");
  pdf.setFontSize(6.5);
  let cx = MARGIN;
  cols.forEach((c, i) => {
    const h = headers[i] ?? "";
    const tx = c.align === "center" ? cx + c.w / 2 : c.align === "right" ? cx + c.w - 1 : cx + 1.5;
    drawText(pdf, h, tx, y + 4.8, { align: c.align });
    cx += c.w;
  });
}

function drawTableRow(
  pdf: jsPDF,
  y: number,
  rowH: number,
  columns: OrderedTableColumn[],
  values: Record<string, string>,
  isEven: boolean,
  isFooter = false,
) {
  if (isFooter) {
    pdf.setFillColor(...C.headerBg);
    pdf.rect(MARGIN, y, CONTENT_W, rowH, "F");
    pdf.setTextColor(...C.white);
    _useFont(pdf, "bold");
    pdf.setFontSize(7);
  } else {
    pdf.setFillColor(...(isEven ? C.offWhite : C.white));
    pdf.rect(MARGIN, y, CONTENT_W, rowH, "F");
    pdf.setTextColor(...C.bodyText);
    _useFont(pdf, "normal");
    pdf.setFontSize(6.5);
  }
  let cx = MARGIN;
  columns.forEach((c) => {
    const tx = c.align === "center" ? cx + c.w / 2 : c.align === "right" ? cx + c.w - 1 : cx + 1.5;
    drawText(pdf, values[c.key] ?? "", tx, y + rowH * 0.7, { align: c.align });
    cx += c.w;
  });
  // Bottom border
  pdf.setDrawColor(...C.softDivider);
  pdf.setLineWidth(0.15);
  pdf.line(MARGIN, y + rowH, MARGIN + CONTENT_W, y + rowH);
}

/**
 * Draw every row from the same keyed column schema, including index 0.
 * No row uses a separate first-row/continuation-row code path.
 */
function drawOrderedTableRow(
  pdf: jsPDF,
  y: number,
  rowH: number,
  columns: OrderedTableColumn[],
  values: Record<string, string>,
  isEven: boolean,
  isFooter = false,
) {
  drawTableRow(pdf, y, rowH, columns, values, isEven, isFooter);
}

// ─────────────────────────────────────────────────────────────────────────────
// COVER PAGE
// ─────────────────────────────────────────────────────────────────────────────

async function drawCoverPage(pdf: jsPDF, project: ProjectInfo, dateStr: string): Promise<number> {
  // Full dark blue background
  pdf.setFillColor(...C.darkBlue);
  pdf.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Gold accent line at top
  pdf.setFillColor(...C.goldAccent);
  pdf.rect(0, 0, PAGE_W, 2, "F");

  // Logo placeholder area
  const logoSize = 28;
  const logoX = (PAGE_W - logoSize) / 2;
  const logoY = 38;
  pdf.setDrawColor(...C.goldAccent);
  pdf.setLineWidth(0.8);
  pdf.roundedRect(logoX, logoY, logoSize, logoSize, 4, 4, "S");
  // Inner
  pdf.setLineWidth(0.4);
  pdf.roundedRect(logoX + 4, logoY + 4, logoSize - 8, logoSize - 8, 2, 2, "S");

  // Main title
  _useFont(pdf, "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(...C.white);
  drawText(pdf, "Construction Quantity Calculator", PAGE_W / 2, logoY + logoSize + 22, { align: "center" });

  // Subtitle
  _useFont(pdf, "normal");
  pdf.setFontSize(13);
  pdf.setTextColor(...C.goldAccent);
  drawText(pdf, "Structural Quantity Report", PAGE_W / 2, logoY + logoSize + 38, { align: "center" });

  // Gold divider
  pdf.setDrawColor(...C.goldAccent);
  pdf.setLineWidth(0.6);
  const divLen = 50;
  pdf.line((PAGE_W - divLen) / 2, logoY + logoSize + 48, (PAGE_W + divLen) / 2, logoY + logoSize + 48);

  // Project details
  const detailY = logoY + logoSize + 65;
  _useFont(pdf, "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...C.mutedGray);

  const details: [string, string][] = [
    ...(project.projectName ? [["Project", project.projectName] as [string, string]] : []),
    ...(project.clientName ? [["Client", project.clientName] as [string, string]] : []),
    ...(project.engineerName ? [["Engineer", project.engineerName] as [string, string]] : []),
    ["Date", dateStr],
    ["Version", "1.0"],
  ];

  if (details.length > 0) {
    const maxLabelW = Math.max(...details.map((d) => pdf.getTextWidth(d[0] + ":")));
    const startX = 70;
    details.forEach(([label, val], i) => {
      const dy = detailY + i * 8;
      _useFont(pdf, "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(...C.goldAccent);
      // Keep the English label outside the Arabic shaping/bidi pipeline.
      // The value is a separate draw call at a fixed x-position.
      (pdf as any).text(`${label}:`, startX, dy, { align: "left" });
      _useFont(pdf, "normal");
      pdf.setTextColor(...C.white);
      pdf.setFontSize(8.5);
      drawText(pdf, val, startX + maxLabelW + 5, dy, { align: "left" });
    });
  }

  // Gold divider before prepared by
  pdf.setDrawColor(...C.goldAccent);
  pdf.setLineWidth(0.4);
  const divLen2 = 40;
  pdf.line((PAGE_W - divLen2) / 2, detailY + details.length * 8 + 14, (PAGE_W + divLen2) / 2, detailY + details.length * 8 + 14);

  // Prepared by section
  const prepY = detailY + details.length * 8 + 24;
  _useFont(pdf, "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...C.mutedGray);
  drawText(pdf, "Prepared by", PAGE_W / 2, prepY, { align: "center" });
  _useFont(pdf, "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(...C.goldAccent);
  drawText(pdf, "Eng. Majid Alqobidhah", PAGE_W / 2, prepY + 10, { align: "center" });
  _useFont(pdf, "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...C.mutedGray);
  drawText(pdf, "Professional Civil Engineer", PAGE_W / 2, prepY + 18, { align: "center" });

  // Bottom gold line
  pdf.setFillColor(...C.goldAccent);
  pdf.rect(0, PAGE_H - 2, PAGE_W, 2, "F");

  return prepY + 30;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY CARDS
// ─────────────────────────────────────────────────────────────────────────────

function drawSummaryCards(pdf: jsPDF, yStart: number, summary: FullSummary, totalElements: number): number {
  const gap = 4;
  const cards = [
    { label: "Concrete Volume", value: `${fmt(summary.totalConcreteVolume, 2)} m³`, icon: "▣" },
    { label: "Steel Weight",    value: `${fmt(summary.totalSteelKg, 1)} kg`,         icon: "≡" },
    { label: "Total Cost",      value: `$${fmt(summary.grandTotal, 2)}`,              icon: "Σ" },
    { label: "Elements",        value: `${totalElements}`,                            icon: "♯" },
  ];

  const cardW = (CONTENT_W - gap * 3) / 4;
  const cardH = 22;

  cards.forEach((card, i) => {
    const cx = MARGIN + i * (cardW + gap);

    // Card background
    pdf.setFillColor(...C.white);
    pdf.setDrawColor(...C.softDivider);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(cx, yStart, cardW, cardH, 2, 2, "FD");

    // Top accent bar
    pdf.setFillColor(...C.darkBlue);
    pdf.roundedRect(cx, yStart, cardW, 3, 1.5, 1.5, "F");

    // Label
    _useFont(pdf, "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(...C.mutedGray);
    drawText(pdf, card.label, cx + cardW / 2, yStart + 8.5, { align: "center" });

    // Value
    _useFont(pdf, "bold");
    pdf.setFontSize(i === 3 ? 14 : 12);
    pdf.setTextColor(...C.darkText);
    drawText(pdf, card.value, cx + cardW / 2, yStart + 18.5, { align: "center" });
  });

  return yStart + cardH + 5;
}

// ─────────────────────────────────────────────────────────────────────────────
// TOTAL SUMMARY ROW
// ─────────────────────────────────────────────────────────────────────────────

function drawTotalSummaryRow(pdf: jsPDF, yStart: number, summary: FullSummary): number {
  const rowH = 16;
  pdf.setFillColor(...C.footerBg);
  pdf.roundedRect(MARGIN, yStart, CONTENT_W, rowH, 2, 2, "F");

  const colW = CONTENT_W / 3;
  const labels = [
    { label: "Total Concrete", value: `${fmt(summary.totalConcreteVolume, 2)} m³` },
    { label: "Total Steel",    value: `${fmt(summary.totalSteelKg, 1)} kg (${fmt(summary.totalSteelTons, 3)} tons)` },
    { label: "Grand Total",    value: `$${fmt(summary.grandTotal, 2)}` },
  ];

  labels.forEach((item, i) => {
    const cx = MARGIN + i * colW;
    _useFont(pdf, "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...C.mutedGray);
    drawText(pdf, item.label, cx + colW * 0.04, yStart + 6);
    _useFont(pdf, "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...C.white);
    drawText(pdf, item.value, cx + colW * 0.04, yStart + 13.5);
  });

  return yStart + rowH + 5;
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOOR BREAKDOWN TABLE
// ─────────────────────────────────────────────────────────────────────────────

function drawFloorBreakdownTable(
  pdf: jsPDF,
  yStart: number,
  summary: FullSummary,
  project: ProjectInfo,
  dateStr: string,
): number {
  const floors = summary.byFloor.filter((bd) => bd.totalVolume > 0);
  if (floors.length <= 1) return yStart;

  const drawHeader = () => drawPageHeader(pdf, 0, 0, project, dateStr);
  let y = checkPageBreak(
    pdf,
    yStart,
    8 + ROW_H * 2 + ROW_H * floors.length,
    HEADER_BAND_H + 4,
    drawHeader,
  );

  // Section title
  pdf.setFillColor(...C.darkBlue);
  pdf.rect(MARGIN, y, CONTENT_W, ROW_H + 1, "F");
  pdf.setTextColor(...C.white);
  _useFont(pdf, "bold");
  pdf.setFontSize(8);
  drawText(pdf, "Floor Breakdown", MARGIN + 2, y + 5);
  y += ROW_H + 2;

  // Column definitions
  const cols: OrderedTableColumn[] = [
    { key: "floor",     w: CONTENT_W * 0.25, align: "left" as const },
    { key: "concrete",  w: CONTENT_W * 0.25, align: "center" as const },
    { key: "steel",     w: CONTENT_W * 0.25, align: "center" as const },
    { key: "cost",      w: CONTENT_W * 0.25, align: "center" as const },
  ];
  const headers = ["Floor", "Concrete (m³)", "Steel (tons)", "Cost"];

  y = checkPageBreak(pdf, y, ROW_H + 2, HEADER_BAND_H + 4, drawHeader);
  drawTableHeader(pdf, y, cols, headers);
  y += ROW_H + 1.5;

  floors.forEach((bd, i) => {
    y = checkPageBreak(pdf, y, ROW_H + 1, HEADER_BAND_H + 4, drawHeader);
    drawTableRow(pdf, y, ROW_H, cols, {
      floor: bd.floor.name,
      concrete: fmt(bd.totalVolume, 3),
      steel: fmt(bd.totalSteelTons, 3),
      cost: fmt(bd.totalCost, 2),
    }, i % 2 === 0);
    y += ROW_H;
  });

  // Totals row
  y = checkPageBreak(pdf, y, ROW_H + 1, HEADER_BAND_H + 4, drawHeader);
  drawTableRow(pdf, y, ROW_H, cols, {
    floor: "TOTAL",
    concrete: fmt(summary.totalConcreteVolume, 3),
    steel: fmt(summary.totalSteelTons, 3),
    cost: fmt(summary.grandTotal, 2),
  }, false, true);
  y += ROW_H + 3;

  return y;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION TABLE
// ─────────────────────────────────────────────────────────────────────────────

function drawSectionTable(
  pdf: jsPDF, yStart: number, section: SectionSummary, title: string,
  project: ProjectInfo, dateStr: string,
): number {
  if (section.elements.length === 0) return yStart;

  let y = yStart;
  const drawHeader = () => drawPageHeader(pdf, 0, 0, project, dateStr);

  y = checkPageBreak(
    pdf,
    y,
    6 + ROW_H * 2 + ROW_H,
    HEADER_BAND_H + 4,
    drawHeader,
  );

  // Section title band
  pdf.setFillColor(...C.darkBlue);
  pdf.rect(MARGIN, y, CONTENT_W, ROW_H + 2, "F");
  pdf.setTextColor(...C.white);
  _useFont(pdf, "bold");
  pdf.setFontSize(8);
  drawText(pdf, title, MARGIN + 2, y + 5.5);
  _useFont(pdf, "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(...C.mutedGray);
  const secSummary = `Volume: ${fmt(section.totalVolume, 3)} m³  |  Steel: ${fmt(section.totalSteelKg, 1)} kg  |  Cost: $${fmt(section.total, 2)}  |  Elements: ${section.elements.length}`;
  drawText(pdf, secSummary, PAGE_W - MARGIN - 2, y + 5.5, { align: "right" });
  y += ROW_H + 3;

  // Column headers
  const elementCols: OrderedTableColumn[] = [
    { key: "label",       w: CONTENT_W * 0.17, align: "left" as const },
    { key: "dimensions",  w: CONTENT_W * 0.23, align: "center" as const },
    { key: "quantity",    w: CONTENT_W * 0.10, align: "center" as const },
    { key: "volume",      w: CONTENT_W * 0.14, align: "center" as const },
    { key: "steel",       w: CONTENT_W * 0.16, align: "center" as const },
    { key: "cost",        w: CONTENT_W * 0.20, align: "right" as const },
  ];
  const elementHeaders = ["Label", "Dimensions (m)", "Qty", "Volume (m³)", "Steel (kg)", "Cost"];

  y = checkPageBreak(pdf, y, ROW_H + 1, HEADER_BAND_H + 4, drawHeader);
  drawTableHeader(pdf, y, elementCols, elementHeaders);
  y += ROW_H + 1.5;

  // Data rows
  section.elements.forEach((er, ri) => {
    y = checkPageBreak(pdf, y, ROW_H + 1, HEADER_BAND_H + 4, drawHeader);
    const cost = er.totalVolume * parseFloat(project.concretePricePerM3 || "0") + (er.steelKg / 1000) * parseFloat(project.steelPricePerTon || "0");
    drawOrderedTableRow(pdf, y, ROW_H, elementCols, {
      label: er.label || "—",
      dimensions: `${er.dim1.toFixed(2)}×${er.dim2.toFixed(2)}×${er.dim3.toFixed(2)}`,
      quantity: String(er.quantity),
      volume: fmt(er.totalVolume, 3),
      steel: fmt(er.steelKg, 1),
      cost: fmt(cost, 2),
    }, ri % 2 === 0);
    y += ROW_H;
  });

  // Footer row
  y = checkPageBreak(pdf, y, ROW_H + 1, HEADER_BAND_H + 4, drawHeader);
  const totalCost = section.total;
  drawOrderedTableRow(pdf, y, ROW_H, elementCols, {
    label: "TOTAL",
    dimensions: "",
    quantity: "",
    volume: fmt(section.totalVolume, 3),
    steel: fmt(section.totalSteelKg, 1),
    cost: fmt(totalCost, 2),
  }, false, true);
  y += ROW_H + 3;

  return y;
}

// ─────────────────────────────────────────────────────────────────────────────
// BILL OF QUANTITIES (BOQ)
// ─────────────────────────────────────────────────────────────────────────────

function drawBOQ(
  pdf: jsPDF,
  yStart: number,
  boqItems: BOQItem[],
  project: ProjectInfo,
  dateStr: string,
): void {
  if (boqItems.length === 0) return;

  const cols: OrderedTableColumn[] = [
    { key: "no",         w: 7,   align: "center" as const },
    { key: "type",       w: 16,  align: "left" as const },
    { key: "floor",      w: 20,  align: "left" as const },
    { key: "label",      w: 20,  align: "left" as const },
    { key: "dimensions", w: 38,  align: "center" as const },
    { key: "quantity",   w: 9,   align: "center" as const },
    { key: "volUnit",    w: 18,  align: "center" as const },
    { key: "totalVol",   w: 22,  align: "center" as const },
    { key: "steel",      w: 15,  align: "center" as const },
    { key: "cost",       w: 22,  align: "right" as const },
  ];

  const headers = ["#", "Type", "Floor", "Label", "L×W×H (m)", "Qty", "Vol/unit", "Total Vol", "Steel kg", "Cost"];
  const totalColW = cols.reduce((s, c) => s + c.w, 0);

  // Calculate rows per page (accounting for headers/footer)
  const headerH = 28;
  const colHeaderH = ROW_H + 2;
  const footerH = 10;
  const firstBodyStart = MARGIN + headerH + colHeaderH;
  const contBodyStart = MARGIN + 18 + colHeaderH;
  const firstRowsPerPage = Math.max(1, Math.floor((PAGE_H - FOOTER_BAND_H - firstBodyStart - footerH) / ROW_H));
  const contRowsPerPage  = Math.max(1, Math.floor((PAGE_H - FOOTER_BAND_H - contBodyStart - footerH) / ROW_H));

  function drawBOQPageHeader(isFirst: boolean) {
    const hh = isFirst ? headerH : 18;
    pdf.setFillColor(...C.darkBlue);
    pdf.rect(0, 0, PAGE_W, hh, "F");
    pdf.setTextColor(...C.white);
    _useFont(pdf, "bold");
    pdf.setFontSize(isFirst ? 12 : 9);
    drawText(pdf, "Bill of Quantities (BOQ)", PAGE_W / 2, isFirst ? 10 : 11, { align: "center" });
    if (isFirst) {
      _useFont(pdf, "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(...C.mutedGray);
      drawText(pdf, project.projectName || "Structural Quantity Report", PAGE_W / 2, 19, { align: "center" });
    }
    // Gold accent
    pdf.setFillColor(...C.goldAccent);
    pdf.rect(0, hh - 0.5, PAGE_W, 0.6, "F");
  }

  function drawBOQColHeaders(bodyY: number) {
    pdf.setFillColor(...C.headerBg);
    pdf.rect(MARGIN, bodyY - colHeaderH, totalColW, colHeaderH, "F");
    pdf.setTextColor(...C.white);
    _useFont(pdf, "bold");
    pdf.setFontSize(6.5);
    let cx = MARGIN;
    headers.forEach((h, i) => {
      const c = cols[i];
      const tx = c.align === "center" ? cx + c.w / 2 : c.align === "right" ? cx + c.w - 1 : cx + 1;
      drawText(pdf, h, tx, bodyY - 2.5, { align: c.align });
      cx += c.w;
    });
  }

  const TYPE_BG: Record<string, [number, number, number]> = {
    F:  [239, 246, 255], SF: [241, 245, 249], RF: [243, 244, 246],
    C:  [255, 247, 237], B:  [240, 253, 244],
    SS: [250, 245, 255], HS: [255, 241, 242], FS: [240, 253, 250],
    WS: [255, 251, 235],
  };

  // The BOQ starts on a fresh page, but page creation still goes through the
  // single page-break helper so no direct addPage call is needed here.
  const beforeBOQPage = pdf.getNumberOfPages();
  checkPageBreak(pdf, yStart, PAGE_H, MARGIN);
  if (pdf.getNumberOfPages() === beforeBOQPage) {
    throw new Error("BOQ page break failed to create a new page");
  }
  drawBOQPageHeader(true);
  drawBOQColHeaders(firstBodyStart);

  let rowY = firstBodyStart + ROW_H * 0.85;
  let rowIdx = 0;
  let boqPage = 1;

  function renderRow(item: BOQItem) {
    const bg = TYPE_BG[item.typeCode] ?? [255, 255, 255];
    pdf.setFillColor(...bg);
    pdf.rect(MARGIN, rowY - ROW_H * 0.8, totalColW, ROW_H, "F");
    pdf.setDrawColor(...C.softDivider);
    pdf.setLineWidth(0.15);
    pdf.line(MARGIN, rowY - ROW_H * 0.8 + ROW_H, MARGIN + totalColW, rowY - ROW_H * 0.8 + ROW_H);
    pdf.setTextColor(...C.bodyText);
    _useFont(pdf, "normal");
    pdf.setFontSize(6.5);

    const values: Record<string, string> = {
      no: String(item.no),
      type: item.typeCode,
      floor: item.floorName.slice(0, 14),
      label: item.label.slice(0, 12),
      dimensions: `${item.dim1.toFixed(2)}×${item.dim2.toFixed(2)}×${item.dim3.toFixed(2)}`,
      quantity: String(item.qty),
      volUnit: fmt(item.volEach, 3),
      totalVol: fmt(item.volTotal, 3),
      steel: fmt(item.steelKgTotal, 1),
      cost: fmt(item.costTotal, 2),
    };

    let cx = MARGIN;
    cols.forEach((col) => {
      const tx = col.align === "center" ? cx + col.w / 2 : col.align === "right" ? cx + col.w - 1 : cx + 1;
      drawText(pdf, values[col.key] ?? "", tx, rowY, { align: col.align });
      cx += col.w;
    });
    rowY += ROW_H;
    rowIdx++;
  }

  const ROWS_FIRST = firstRowsPerPage;
  const ROWS_CONT  = contRowsPerPage;
  const MAX_BOQ_PAGES = 100;

  for (let i = 0; i < boqItems.length && boqPage <= MAX_BOQ_PAGES; i++) {
    const item = boqItems[i];
    const isFirst = boqPage === 1;
    const rowsOnPage = isFirst ? ROWS_FIRST : ROWS_CONT;
    const rowsDone = isFirst ? i : i - ROWS_FIRST - (boqPage - 2) * ROWS_CONT;

    if (i > 0 && rowsDone >= rowsOnPage) {
      const beforePage = pdf.getNumberOfPages();
      rowY = checkPageBreak(pdf, rowY, ROW_H + footerH + 1, contBodyStart);
      boqPage++;
      if (pdf.getNumberOfPages() > beforePage) {
        drawBOQPageHeader(false);
        drawBOQColHeaders(contBodyStart);
        rowY = contBodyStart + ROW_H * 0.85;
      }
    }
    renderRow(item);
  }

  // Totals row on last page
  const beforeTotalsPage = pdf.getNumberOfPages();
  rowY = checkPageBreak(pdf, rowY, ROW_H + footerH + 2, contBodyStart);
  if (pdf.getNumberOfPages() > beforeTotalsPage) {
    boqPage++;
    drawBOQPageHeader(false);
    drawBOQColHeaders(contBodyStart);
    rowY = contBodyStart + ROW_H * 0.85;
  }
  const totY = rowY + 2;
  pdf.setFillColor(...C.goldAccent);
  pdf.rect(MARGIN, totY - ROW_H * 0.8, totalColW, ROW_H + 1.5, "F");
  pdf.setTextColor(...C.footerBg);
  _useFont(pdf, "bold");
  pdf.setFontSize(7.5);

  const totCells = [
    { val: "TOTAL", col: cols[0], align: "left" as const },
  ];
  // Compute totals
  const tVol = boqItems.reduce((s, r) => s + r.volTotal, 0);
  const tSteel = boqItems.reduce((s, r) => s + r.steelKgTotal, 0);
  const tCost = boqItems.reduce((s, r) => s + r.costTotal, 0);

  let cx = MARGIN;
  drawText(pdf, "TOTAL", cx + 1, totY + 1);
  cx += cols[0].w;
  // Skip type, floor, label, dims, qty, volEach
  for (let ci = 1; ci < 6; ci++) cx += cols[ci].w;
  // Total Vol
  drawText(pdf, fmt(tVol, 3), cx + cols[6].w / 2, totY + 1, { align: "center" });
  cx += cols[6].w;
  // Steel kg
  drawText(pdf, fmt(tSteel, 1), cx + cols[7].w / 2, totY + 1, { align: "center" });
  cx += cols[7].w;
  // Cost
  drawText(pdf, fmt(tCost, 2), cx + cols[8].w - 1, totY + 1, { align: "right" });
  cx += cols[8].w;
}

// ─────────────────────────────────────────────────────────────────────────────
// MIX DESIGN PAGE
// ─────────────────────────────────────────────────────────────────────────────

function drawMixDesignPage(
  pdf: jsPDF, summary: FullSummary, mix: MixDesign,
  dateStr: string, project: ProjectInfo,
): void {
  const mr = computeMix(summary.totalConcreteVolume, mix);
  const ratioLabel = `${mix.cement} : ${mix.sand} : ${mix.gravel}`;

  // Header band
  pdf.setFillColor(...C.darkBlue);
  pdf.rect(0, 0, PAGE_W, 34, "F");
  pdf.setTextColor(...C.white);
  _useFont(pdf, "bold");
  pdf.setFontSize(13);
  drawText(pdf, "Concrete Mix Design — Material Quantities", PAGE_W / 2, 12, { align: "center" });
  _useFont(pdf, "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...C.mutedGray);
  drawText(pdf, `Mix Ratio  ${ratioLabel}  (Cement : Sand : Gravel)  •  Compaction factor ${mix.compactionFactor}`, PAGE_W / 2, 23, { align: "center" });

  // Gold accent
  pdf.setFillColor(...C.goldAccent);
  pdf.rect(0, 34 - 0.8, PAGE_W, 0.8, "F");

  // Meta info
  _useFont(pdf, "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...C.bodyText);
  drawText(pdf, dateStr, PAGE_W - MARGIN, 43, { align: "right" });
  if (project.projectName) drawText(pdf, project.projectName, MARGIN, 43);
  pdf.setDrawColor(...C.goldAccent);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN, 46, PAGE_W - MARGIN, 46);

  let y = 54;

  // ── Total concrete callout ────────────────────────────────────────────────
  pdf.setFillColor(...C.lightGray);
  pdf.setDrawColor(...C.goldAccent);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(MARGIN, y, CONTENT_W, 18, 2.5, 2.5, "FD");
  pdf.setTextColor(...C.darkText);
  _useFont(pdf, "bold");
  pdf.setFontSize(10);
  drawText(pdf, "Total Concrete Volume", MARGIN + 6, y + 8);
  pdf.setFontSize(13);
  drawText(pdf, `${fmt(summary.totalConcreteVolume, 3)} m³`, PAGE_W - MARGIN - 6, y + 10, { align: "right" });
  _useFont(pdf, "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...C.bodyText);
  drawText(pdf, `Dry volume required (×${mix.compactionFactor}): ${fmt(mr.dryVolume, 3)} m³`, MARGIN + 6, y + 15);
  y += 24;

  // ── Material quantities table ─────────────────────────────────────────────
  pdf.setFillColor(...C.darkBlue);
  pdf.rect(MARGIN, y, CONTENT_W, ROW_H + 1, "F");
  pdf.setTextColor(...C.white);
  _useFont(pdf, "bold");
  pdf.setFontSize(9);
  drawText(pdf, "Material Quantities", MARGIN + 2, y + 5.5);
  y += ROW_H + 2;

  const mCols: OrderedTableColumn[] = [
    { key: "material",  w: CONTENT_W * 0.18, align: "left" as const },
    { key: "volume",    w: CONTENT_W * 0.22, align: "center" as const },
    { key: "weight",    w: CONTENT_W * 0.28, align: "center" as const },
    { key: "ratio",     w: CONTENT_W * 0.32, align: "center" as const },
  ];
  drawTableHeader(pdf, y, mCols, ["Material", "Volume (m³)", "Equivalent Weight", "Ratio Part"]);
  y += ROW_H + 1.5;

  const matRows = [
    { name: "Cement", vol: mr.cementVolume, wt: `${mr.cementBags} bags × ${mix.bagWeightKg} kg`, ratio: mix.cement },
    { name: "Sand",   vol: mr.sandVolume,   wt: `≈ ${fmt(mr.sandVolume * 1600, 0)} kg`,          ratio: mix.sand },
    { name: "Gravel", vol: mr.gravelVolume, wt: `≈ ${fmt(mr.gravelVolume * 1550, 0)} kg`,         ratio: mix.gravel },
  ];
  matRows.forEach((row, ri) => {
    drawTableRow(pdf, y, ROW_H, mCols, {
      material: row.name,
      volume: fmt(row.vol, 3),
      weight: row.wt,
      ratio: row.ratio,
    }, ri % 2 === 0);
    y += ROW_H;
  });

  // Totals row
  const totalMatVol = mr.cementVolume + mr.sandVolume + mr.gravelVolume;
  drawTableRow(pdf, y, ROW_H, mCols, {
    material: "TOTAL DRY VOLUME",
    volume: fmt(totalMatVol, 3),
    weight: fmt(mr.dryVolume, 3),
    ratio: `${mix.cement} : ${mix.sand} : ${mix.gravel}`,
  }, false, true);
  y += ROW_H + 5;

  // ── Per-m³ reference table ────────────────────────────────────────────────
  const perM = computeMix(1, mix);

  pdf.setFillColor(...C.darkBlue);
  pdf.rect(MARGIN, y, CONTENT_W, ROW_H + 1, "F");
  pdf.setTextColor(...C.white);
  _useFont(pdf, "bold");
  pdf.setFontSize(9);
  drawText(pdf, "Per 1 m³ of Concrete — Reference Quantities", MARGIN + 2, y + 5.5);
  y += ROW_H + 2;

  const refCols: OrderedTableColumn[] = [
    { key: "material",  w: CONTENT_W * 0.18, align: "left" as const },
    { key: "quantity",  w: CONTENT_W * 0.38, align: "center" as const },
    { key: "details",   w: CONTENT_W * 0.44, align: "center" as const },
  ];
  drawTableHeader(pdf, y, refCols, ["Material", "Quantity", "Details"]);
  y += ROW_H + 1.5;

  const refRows = [
    { mat: "Cement", qty: `${perM.cementBags} bags`, det: `${fmt(perM.cementVolume, 4)} m³  •  ${mix.bagWeightKg} kg/bag` },
    { mat: "Sand",   qty: `${fmt(perM.sandVolume, 4)} m³`, det: `≈ ${fmt(perM.sandVolume * 1600, 0)} kg` },
    { mat: "Gravel", qty: `${fmt(perM.gravelVolume, 4)} m³`, det: `≈ ${fmt(perM.gravelVolume * 1550, 0)} kg` },
  ];
  refRows.forEach((row, ri) => {
    drawTableRow(pdf, y, ROW_H, refCols, {
      material: row.mat,
      quantity: row.qty,
      details: row.det,
    }, ri % 2 === 0);
    y += ROW_H;
  });

  y += 6;

  // ── Grand totals row ──────────────────────────────────────────────────────
  pdf.setFillColor(...C.footerBg);
  pdf.roundedRect(MARGIN, y, CONTENT_W, 20, 2, 2, "F");
  pdf.setTextColor(...C.white);
  _useFont(pdf, "bold");

  const gCols3 = [
    { label: "Total Concrete",  value: `${fmt(summary.totalConcreteVolume, 3)} m³` },
    { label: "Total Steel",     value: `${fmt(summary.totalSteelKg, 1)} kg (${fmt(summary.totalSteelTons, 3)} tons)` },
    { label: "Grand Total Cost",value: `$${fmt(summary.grandTotal, 2)}` },
  ];

  gCols3.forEach((item, i) => {
    const gcX = MARGIN + i * (CONTENT_W / 3);
    _useFont(pdf, "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...C.mutedGray);
    drawText(pdf, item.label, gcX + CONTENT_W * 0.03, y + 7);
    _useFont(pdf, "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...C.white);
    drawText(pdf, item.value, gcX + CONTENT_W * 0.03, y + 16.5);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION DEFINITIONS (for main report pages)
// ─────────────────────────────────────────────────────────────────────────────

function getSectionInfo(summary: FullSummary): SectionInfo[] {
  return [
    { key: "footings" as const,    titleAr: "Isolated Footings",   titleEn: "Isolated Footings",   ...summary.footings },
    { key: "stripFootings" as const, titleAr: "Strip Footings",    titleEn: "Strip Footings",      ...summary.stripFootings },
    { key: "raftFootings" as const,  titleAr: "Raft Foundation",   titleEn: "Raft Foundation",     ...summary.raftFootings },
    { key: "columns" as const,     titleAr: "Columns",             titleEn: "Columns",             ...summary.columns },
    { key: "beams" as const,       titleAr: "Beams",               titleEn: "Beams",               ...summary.beams },
    { key: "solidSlabs" as const,  titleAr: "Solid Slabs",         titleEn: "Solid Slabs",         ...summary.solidSlabs },
    { key: "hollowSlabs" as const, titleAr: "Hollow Block Slabs",  titleEn: "Hollow Block Slabs",  ...summary.hollowSlabs },
    { key: "flatSlabs" as const,   titleAr: "Flat Slabs",          titleEn: "Flat Slabs",          ...summary.flatSlabs },
    { key: "waffleSlabs" as const, titleAr: "Waffle Slabs",        titleEn: "Waffle Slabs",        ...summary.waffleSlabs },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export interface ExportPDFParams {
  project: ProjectInfo;
  summary: FullSummary;
  mix: MixDesign;
  floors: Floor[];
  totalElements: number;
  boqItems: BOQItem[];
  /**
   * Optional callback that receives the generated PDF and the intended filename.
   * When provided, it is used instead of `pdf.save()` (useful for tests or custom
   * download handling). Leave undefined for the default browser download behavior.
   */
  onOutput?: (pdf: jsPDFType, filename: string) => void | Promise<void>;
}

export async function exportStructuralReport(params: ExportPDFParams): Promise<void> {
  const { project, summary, mix, totalElements, boqItems } = params;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const dateStr = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  // ── Load Arabic font ───────────────────────────────────────────────────────
  await loadFonts(pdf);
  console.log("[pdfExport] Active font:", _fontName);

  // ── Cover page ─────────────────────────────────────────────────────────────
  await drawCoverPage(pdf, project, dateStr);

  // ── Summary page ───────────────────────────────────────────────────────────
  const drawHeader = () => drawPageHeader(pdf, 0, 0, project, dateStr);
  let y = checkPageBreak(pdf, 0, PAGE_H, HEADER_BAND_H + 4, drawHeader);

  // Summary cards
  y = drawSummaryCards(pdf, y, summary, totalElements);

  // Total summary row
  y = drawTotalSummaryRow(pdf, y, summary);

  // Floor breakdown
  y = drawFloorBreakdownTable(pdf, y, summary, project, dateStr);

  // ── Section detail pages ───────────────────────────────────────────────────
  const sections = getSectionInfo(summary);
  sections.forEach((secDef) => {
    const section = summary[secDef.key] as SectionSummary;
    if (section.elements.length === 0) return;

    y = drawSectionTable(pdf, y, section, secDef.titleEn, project, dateStr);
  });

  // ── BOQ Pages ──────────────────────────────────────────────────────────────
  drawBOQ(pdf, y, boqItems, project, dateStr);

  // ── Mix Design Page ────────────────────────────────────────────────────────
  // Mix design is a full-page composition. Let the centralized page-break
  // helper create a clean page only when the remaining space cannot contain it.
  checkPageBreak(pdf, y, PAGE_H, HEADER_BAND_H + 4);
  drawMixDesignPage(pdf, summary, mix, dateStr, project);

  // Every page is now complete. Add the footer and final page count in a
  // second pass so page numbers can never exceed the actual document length.
  const totalPages = pdf.getNumberOfPages();
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    pdf.setPage(pageNum);
    drawFooter(pdf, pageNum, totalPages);
  }

  // Save
  const filename = `structural-report-${(project.projectName || Date.now().toString()).replace(/\s+/g, "-")}.pdf`;
  if (params.onOutput) {
    await params.onOutput(pdf, filename);
  } else {
    pdf.save(filename);
  }
}

// Export the font loading function for external use
export async function registerCairoFont(pdf: jsPDF): Promise<void> {
  await loadFonts(pdf);
}
