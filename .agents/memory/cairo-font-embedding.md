---
name: Verified Arabic Font Embedding in jsPDF
description: How the verified Arabic TTFs are loaded and validated for proper jsPDF rendering.
---

## Font

Amiri — Regular and Bold weights.

## Loading Process

1. TTF files are stored at `public/fonts/Amiri-{Regular,Bold}.ttf`
2. At runtime, fetched via `fetch` → `ArrayBuffer`
3. ArrayBuffer is converted to base64 (chunked to avoid call-stack overflow: 8KB chunks)
4. Registered with jsPDF:
   - `pdf.addFileToVFS(filename, base64)`
    - `pdf.addFont(filename, "Amiri", style)`
5. Used via `pdf.setFont("Amiri", "normal"|"bold")`

## Critical: font-ready fallback pattern

jsPDF v4's `TTFFont.open` can throw during TTF parsing (unsupported table, bad cmap). When it does:
- The font ENTRY is already registered in jsPDF's fontmap with `metadata: {}` (empty).
- If `setFont("Cairo", ...)` is called afterward, the broken entry is used and `metadata.Unicode` is undefined → **crash on `.widths`**.

**Always** validate the registered font after each `addFont` call by checking that `metadata.Unicode.widths` exists. jsPDF can retain a broken font entry after a TTF parse failure; fail explicitly before any text drawing instead of allowing a later `.widths` crash.

Also: font fetch URL must use `import.meta.env.BASE_URL` when Vite's `base` config is not `/`, because public assets are served at `${BASE_URL}fonts/...` not `/fonts/...`.

## Fallback

If font loading fails (network error or TTF parse failure), the export should fail explicitly because the report is required to contain Arabic content.

## Why Not Embedded in Bundle

TTF files are ~315KB each. Embedding as base64 in a TS source file would add ~840KB to the bundle. Runtime loading keeps the bundle lean and allows the font to be cached by the browser.
