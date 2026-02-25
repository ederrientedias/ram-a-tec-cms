import type { Doc, TableGrid } from '@/types/lamina';
import CSSContent from '../../../../styles/lamina.css?inline'; // Vite. Se não usar Vite, leia o arquivo como string.

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const svgLegend = (config: Record<string, any>) => {
  const items = Object.keys(config || {}).map((k) => {
    const label = config?.[k]?.label ?? k;
    const color =
      config?.[k]?.color || (config?.[k]?.theme && config?.[k]?.theme.light) || '#666666';
    return `<div style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:10px;height:10px;background:${color};border-radius:2px;"></span><span>${escapeHtml(String(label))}</span></div>`;
  });
  return `<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center;width:100%;font-size:12px;font-family:'Inter Light',sans-serif;color:#282828;">${items.join('')}</div>`;
};

export function renderToHtml(doc: Doc) {
  const { top, right, bottom, left } = doc.meta.marginMm;

  const blocksHtml = doc.blocks
    .map((b) => {
      if (b.type === 'tableGrid') {
        return `
          <section class="grid-table">
            ${b.tableGrid
              .map(
                (r) => `
                  <div class="table">
                    <div class="row">
                      <div class="col-label">
                      <span class="cell-label">${escapeHtml(r.left.label)}</span>
                      </div>
                      <div class="col-value">
                      <span class="cell-label">${escapeHtml(r.left.value)}</span>
                      </div>
                    </div>
                  </div>
                  <div class="table">
                    <div class="row">
                      <div class="col-label">
                      <span class="cell-label">${escapeHtml(r.right.label)}</span>
                      </div>
                      <div class="col-value">
                      <span class="cell-label">${escapeHtml(r.right.value)}</span>
                      </div>
                    </div>
                  </div>
                `
              )
              .join('')}
          </section>
        `;
      }

      if (b.type === 'chart') {
        const svg = b.svgMarkup || '';
        if (!svg) return '';
        const legend = svgLegend(b.chartConfig as any);
        return `
          <section class="chart-block" style="width:100%; display:flex;flex-direction:column;gap:8px;">
            ${svg}
            ${legend}
          </section>
        `;
      }

      if (b.type === 'titleText') {
        return `
          <section class="text-block">
            <h2 class="a4-title">${escapeHtml(b.title)}</h2>
            <div class="richtext">${b.tiptapHtml}</div>
          </section>
        `;
      }

      if (b.type === 'text') {
        return `
          <section class="text-block">
            ${b.title ? `<h2 class="a4-title">${escapeHtml(b.title)}</h2>` : ''}
            <div class="richtext">${b.tiptapHtml}</div>
          </section>
        `;
      }

      if (b.type === 'imageGrid') {
        const cols = Math.max(1, Math.min(b.images.length || 1, 3));
        return `
          <section class="image-grid-block">
            <div class="image-grid" style="grid-template-columns: repeat(${cols}, 1fr);">
              ${
                b.images.length
                  ? b.images
                      .map(
                        (url) => `<div class="image-cell"><img src="${escapeHtml(url)}" /></div>`
                      )
                      .join('')
                  : `<div class="image-cell"><div class="image-placeholder">Sem imagens</div></div>`
              }
            </div>
          </section>
        `;
      }

      if (b.type === 'highlights') {
        return `
          <section class="highlight">
            <h2 class="a4-title">${escapeHtml(b.title)}</h2>
            <div class="highlight-grid">
              ${b.highlights
                .map(
                  (h) => `
                    <div class="highlight-item">
                      <div class="hl-label">${escapeHtml(h.label)}</div>
                      <div class="hl-value">${escapeHtml(h.value)}</div>
                    </div>
                  `
                )
                .join('')}
            </div>
          </section>
        `;
      }

      return '';
    })
    .join('');

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        ${CSSContent}
      </style>
    </head>
    <body>
      <div class="a4">
        <header class="a4-head">
          <h1 class="a4-title">${escapeHtml(doc.header.title)}</h1>
          <div class="a4-subtitle">${escapeHtml(doc.header.subtitle)}</div>
        </header>
        <main class="content">
          ${blocksHtml}
        </main>
      </div>
    </body>
  </html>
  `;

  return { html, css: CSSContent };
}
