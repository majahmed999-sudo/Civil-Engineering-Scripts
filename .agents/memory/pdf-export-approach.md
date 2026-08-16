---
name: PDF Export via Programmatic jsPDF
description: Why DOM-screenshot PDF fails and how programmatic drawing succeeds for this project.
---

## Decision

Use jsPDF's drawing API (text, rect, roundedRect, line) to generate PDFs programmatically from data structures, instead of capturing a DOM screenshot with html2canvas.

## Why

Tailwind CSS v4 defines its entire color system using `oklch()` for CSS custom properties and `color-mix(in oklab, ...)` for opacity utilities. html2canvas's CSS parser cannot parse these modern color functions, causing the entire screenshot pipeline to fail silently.

Every approach that screenshots the DOM will hit this wall because the CSS cascade ultimately resolves to `oklch`/`oklab` color spaces that html2canvas doesn't understand.

## How to apply

PDF is built from `FullSummary`, `SectionSummary`, `ElementResult`, `BOQItem`, `FloorBreakdown`, and `MixResult` data structures directly. All drawing (text, shapes, colors) is done with explicit jsPDF calls. No CSS, no DOM, no computed styles.

The pdfExport module is at `src/lib/pdfExport.ts`. The main export function is `exportStructuralReport(params)`.
