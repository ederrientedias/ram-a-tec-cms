import type { Doc, TableGrid } from '@/types/lamina';
import printCss from './print.css?inline'; // Vite. Se não usar Vite, leia o arquivo como string.

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderToHtml(doc: Doc) {
  const { top, right, bottom, left } = doc.meta.marginMm;

  const blocksHtml = doc.blocks
    .map((b) => {
      if (b.type === 'tableGrid') {
        return `
          <section class="block table-block">
            ${b.tableGrid
              .map(
                (r) => `
                  <div class="row">
                    <div class="cell">
                      <div class="cell-label">${escapeHtml(r.left.label)}</div>
                      <div class="cell-value">${escapeHtml(r.left.value)}</div>
                    </div>
                    <div class="cell">
                      <div class="cell-label">${escapeHtml(r.right.label)}</div>
                      <div class="cell-value">${escapeHtml(r.right.value)}</div>
                    </div>
                  </div>
                `
              )
              .join('')}
          </section>
        `;
      }

      if (b.type === 'titleText') {
        return `
          <section class="block title-text-block">
            <h2 class="block-title">${escapeHtml(b.title)}</h2>
            <div class="richtext">${b.tiptapHtml}</div>
          </section>
        `;
      }

      if (b.type === 'text') {
        return `
          <section class="block text-block">
            ${b.title ? `<h2 class="block-title">${escapeHtml(b.title)}</h2>` : ''}
            <div class="richtext">${b.tiptapHtml}</div>
          </section>
        `;
      }

      if (b.type === 'imageGrid') {
        const cols = Math.max(1, Math.min(b.images.length || 1, 3));
        return `
          <section class="block image-grid-block">
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

      return '';
    })
    .join('');

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        ${printCss}
        :root { --mTop:${top}mm; --mRight:${right}mm; --mBottom:${bottom}mm; --mLeft:${left}mm; }
      </style>
    </head>
    <body>
      <div class="page">
        <header class="head">
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

  return { html, css: printCss };
}
