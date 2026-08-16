---
name: Cairo Arabic Font Embedding in jsPDF
description: How Cairo TTF is loaded and embedded for proper Arabic text rendering in PDFs.
---

## Font

Cairo (Google Fonts) — Regular and Bold weights.

## Loading Process

1. TTF files are stored at `public/fonts/Cairo-{Regular,Bold}.ttf`
2. At runtime, fetched via `fetch` → `ArrayBuffer`
3. ArrayBuffer is converted to base64 (chunked to avoid call-stack overflow: 8KB chunks)
4. Registered with jsPDF:
   - `pdf.addFileToVFS(filename, base64)`
   - `pdf.addFont(filename, "Cairo", style)`
5. Used via `pdf.setFont("Cairo", "normal"|"bold")`

## Critical: font-ready fallback pattern

jsPDF v4's `TTFFont.open` can throw during TTF parsing (unsupported table, bad cmap). When it does:
- The font ENTRY is already registered in jsPDF's fontmap with `metadata: {}` (empty).
- If `setFont("Cairo", ...)` is called afterward, the broken entry is used and `metadata.Unicode` is undefined → **crash on `.widths`**.

**Always** use a `_fontReady` flag + a guarded helper:
```ts
let _fontReady = false;
function _useFont(pdf: jsPDF, style: "normal" | "bold") {
  pdf.setFont(_fontReady ? "Cairo" : "helvetica", style);
}
```
Set `_fontReady = true` only after **both** `loadFont(pdf, "normal")` and `loadFont(pdf, "bold")` succeed. This ensures any parsing failure causes a graceful Helvetica fallback instead of a crash.

Also: font fetch URL must use `import.meta.env.BASE_URL` when Vite's `base` config is not `/`, because public assets are served at `${BASE_URL}fonts/...` not `/fonts/...`.

## Fallback

If font loading fails (network error or TTF parse failure), `_useFont` falls back to Helvetica. English text still renders correctly; Arabic will show as missing glyphs (tofu).

## Why Not Embedded in Bundle

TTF files are ~315KB each. Embedding as base64 in a TS source file would add ~840KB to the bundle. Runtime loading keeps the bundle lean and allows the font to be cached by the browser.
