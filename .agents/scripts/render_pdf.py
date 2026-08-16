from pathlib import Path
import fitz
src = Path('artifacts/calculator/qa/three-rows-all-table-types-proof.pdf')
out = Path('.agents/outputs/pdf-render')
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(src)
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    path = out / f'page-{i+1}.png'
    pix.save(path)
    print(path)
print('pages', doc.page_count)
