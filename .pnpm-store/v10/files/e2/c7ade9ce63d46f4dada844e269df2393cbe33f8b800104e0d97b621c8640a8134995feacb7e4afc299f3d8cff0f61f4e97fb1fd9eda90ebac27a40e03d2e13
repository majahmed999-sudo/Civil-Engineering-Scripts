"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = renderTextTable;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
/**
 * Render a simple column-aligned text table with a bold header row, a dashed
 * separator, the data rows, and an optional footer row (preceded by its own
 * separator). Columns are padded to the widest cell in that column.
 */
function renderTextTable(headers, rows, footerRow) {
    const allRows = footerRow ? [...rows, footerRow] : rows;
    const colWidths = headers.map((h, i) => Math.max(h.length, ...allRows.map(r => (r[i] ?? '').length)));
    const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join('  ');
    const separatorLine = colWidths.map(w => '-'.repeat(w)).join('  ');
    const dataLines = rows.map(row => row.map((cell, i) => (cell ?? '').padEnd(colWidths[i])).join('  '));
    const lines = [chalk_1.default.bold(headerLine), separatorLine, ...dataLines];
    if (footerRow) {
        lines.push(separatorLine);
        lines.push(footerRow.map((cell, i) => (cell ?? '').padEnd(colWidths[i])).join('  '));
    }
    return lines.join('\n');
}
