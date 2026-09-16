---
name: PDF bidi and table layout
description: Rules for mixed Arabic/English metadata and consistent keyed table rendering.
---

## Rule

Draw English labels and Arabic values as separate text calls at fixed positions. Route every table row—including the first row after a section or BOQ type header—through one keyed column schema and one cell-position renderer.

**Why:** Mixed-direction strings can reorder an English label around its Arabic value, and duplicated positional loops can make only header-adjacent rows diverge while later rows look correct.

**How to apply:** Keep bidi processing on the value only. Define columns as `{ key, width, align }`, build keyed row objects, and share the same x-position calculation for section tables, Floor Breakdown, BOQ, totals, and continuation pages.