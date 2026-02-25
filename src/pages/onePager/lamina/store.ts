import { create } from 'zustand';
import type { Doc, Block, TableGrid, HighlightItem, Highlight } from '@/types/lamina';

const uid = () => crypto.randomUUID();

const tableGrid: TableGrid[] = [
  {
    left: { id: uid(), label: 'Classe: ANBIMA', value: 'Renda Fixa' },
    right: { id: uid(), label: 'Taxa Administração', value: '1,00% a.a.' },
  },
  {
    left: { id: uid(), label: 'Público-alvo:', value: 'Público Geral' },
    right: { id: uid(), label: 'Taxa de Performance', value: 'Não se aplica' },
  },
  {
    left: { id: uid(), label: 'Cotização de Resgate:', value: 'D+30 dias úteis' },
    right: { id: uid(), label: 'Aplicação Mín Inicial', value: 'R$ 500,00' },
  },
  {
    left: {
      id: uid(),
      label: 'Liquidação de Resgate:',
      value: 'D+1 útil após cotização',
    },
    right: { id: uid(), label: 'Retorno-Alvo', value: 'CDI + 0,5% a 1,0% a.a.' },
  },
];

const highlightsItems: HighlightItem[] = [
  { id: uid(), label: 'Carrego', value: '-' },
  { id: uid(), label: 'Duration', value: '-' },
  { id: uid(), label: 'Emissor', value: '-' },
];

const highlights: Highlight = {
  id: uid(),
  type: 'highlights',
  title: 'Título',
  highlights: highlightsItems,
};

const initialDoc: Doc = {
  meta: { page: 'A4', marginMm: { top: 12, right: 12, bottom: 12, left: 12 } },
  header: {
    title: 'Clique para editar o nome do fundo',
    subtitle: 'Clique para editar o subtítulo',
  },
  blocks: [
    { id: uid(), type: 'tableGrid', tableGrid },
    { id: uid(), type: 'titleText', title: 'Título', tiptapHtml: '<p>Comece a editar…</p>' },
  ],
};

type Actions = {
  setHeaderTitle: (title: string) => void;
  setHeaderSubtitle: (subtitle: string) => void;

  addBlock: (type: Block['type']) => void;
  removeBlock: (id: string) => void;
  addChartBlock: (block: Extract<Block, { type: 'chart' }>) => void;
  updateChartBlock: (id: string, patch: Partial<Extract<Block, { type: 'chart' }>>) => void;
  setChartData: (id: string, chartData: Array<Record<string, any>>) => void;
  setChartConfig: (
    id: string,
    chartConfig: Extract<Block, { type: 'chart' }>['chartConfig']
  ) => void;

  setChartSvg: (id: string, svgMarkup: string) => void;
  updateTitleTextBlockTitle: (id: string, title: string) => void;
  updateHighlightTitle: (id: string, title: string) => void;
  updateHightlightItem: (
    blockId: string,
    highlightId: string,
    patch: Partial<HighlightItem>
  ) => void;

  updateBlockHtml: (id: string, html: string) => void;

  updateTableCell: (
    blockId: string,
    cellId: string,
    patch: Partial<{ label: string; value: string }>
  ) => void;

  addImageToGrid: (blockId: string, url: string) => void;
  removeImageFromGrid: (blockId: string, index: number) => void;

  setDoc: (doc: Doc) => void;
};

export const useLaminaStore = create<{ doc: Doc } & Actions>((set, get) => ({
  doc: initialDoc,

  setDoc: (doc) => set({ doc }),

  setHeaderTitle: (title) =>
    set((s) => ({ doc: { ...s.doc, header: { ...s.doc.header, title } } })),

  setHeaderSubtitle: (subtitle) =>
    set((s) => ({ doc: { ...s.doc, header: { ...s.doc.header, subtitle } } })),

  addBlock: (type) => {
    let newBlock: Block | null = null;
    if (type === 'titleText') {
      newBlock = { id: uid(), type, title: 'Título', tiptapHtml: '<p>Texto…</p>' };
    } else if (type === 'text') {
      newBlock = { id: uid(), type, title: 'Título', tiptapHtml: '<p>Texto…</p>' };
    } else if (type === 'tableGrid') {
      newBlock = { id: uid(), type, tableGrid };
    } else if (type === 'highlights') {
      newBlock = highlights;
    } else if (type === 'imageGrid') {
      newBlock = { id: uid(), type, images: [] };
    } else if (type === 'chart') {
      newBlock = {
        id: uid(),
        type: 'chart',
        chartType: 'line',
        chartData: [],
        chartConfig: {},
        linesCount: 1,
        xKey: 'date',
        showXAxis: true,
        showYAxis: true,
        svgMarkup: undefined,
      };
    } else {
      newBlock = null;
    }
    if (newBlock) {
      set((s) => ({ doc: { ...s.doc, blocks: [...s.doc.blocks, newBlock as Block] } }));
    }
  },

  addChartBlock: (block) => set((s) => ({ doc: { ...s.doc, blocks: [...s.doc.blocks, block] } })),

  updateChartBlock: (id, patch) =>
    set((s) => ({
      doc: {
        ...s.doc,
        blocks: s.doc.blocks.map((b) =>
          b.id === id && b.type === 'chart' ? { ...b, ...patch } : b
        ),
      },
    })),

  setChartData: (id, chartData) =>
    set((s) => ({
      doc: {
        ...s.doc,
        blocks: s.doc.blocks.map((b) =>
          b.id === id && b.type === 'chart' ? { ...b, chartData } : b
        ),
      },
    })),

  setChartConfig: (id, chartConfig) =>
    set((s) => ({
      doc: {
        ...s.doc,
        blocks: s.doc.blocks.map((b) =>
          b.id === id && b.type === 'chart' ? { ...b, chartConfig } : b
        ),
      },
    })),

  setChartSvg: (id, svgMarkup) =>
    set((s) => {
      let changed = false;
      const blocks = s.doc.blocks.map((b) => {
        if (b.id !== id || b.type !== 'chart') return b;
        if (b.svgMarkup === svgMarkup) return b;
        changed = true;
        return { ...b, svgMarkup };
      });
      if (!changed) return s;
      return { doc: { ...s.doc, blocks } };
    }),

  removeBlock: (id) =>
    set((s) => ({ doc: { ...s.doc, blocks: s.doc.blocks.filter((b) => b.id !== id) } })),

  updateTitleTextBlockTitle: (id, title) =>
    set((s) => ({
      doc: {
        ...s.doc,
        blocks: s.doc.blocks.map((b) =>
          b.id === id && b.type === 'titleText' ? { ...b, title } : b
        ),
      },
    })),

  updateBlockHtml: (id, html) =>
    set((s) => ({
      doc: {
        ...s.doc,
        blocks: s.doc.blocks.map((b) =>
          b.id === id && (b.type === 'titleText' || b.type === 'text')
            ? { ...b, tiptapHtml: html }
            : b
        ),
      },
    })),

  updateTableCell: (blockId, cellId, patch) => {
    set((s) => ({
      doc: {
        ...s.doc,
        blocks: s.doc.blocks.map((b) => {
          if (b.id !== blockId || b.type !== 'tableGrid') return b;

          const tableGrid = b.tableGrid.map((r) => {
            const left = r.left.id === cellId ? { ...r.left, ...patch } : r.left;
            const right = r.right.id === cellId ? { ...r.right, ...patch } : r.right;
            return { ...r, left, right };
          });

          return { ...b, tableGrid };
        }),
      },
    }));
  },

  updateHighlightTitle: (id, title) =>
    set((s) => ({
      doc: {
        ...s.doc,
        blocks: s.doc.blocks.map((b) =>
          b.id === id && b.type === 'highlights' ? { ...b, title } : b
        ),
      },
    })),

  updateHightlightItem: (blockId, highlightId, patch) => {
    set((s) => ({
      doc: {
        ...s.doc,
        blocks: s.doc.blocks.map((b) => {
          if (b.id !== blockId || b.type !== 'highlights') return b;

          const highlights = b.highlights.map((r) =>
            r.id === highlightId ? { ...r, ...patch } : r
          );

          return { ...b, highlights };
        }),
      },
    }));
  },

  addImageToGrid: (blockId, url) => {
    set((s) => ({
      doc: {
        ...s.doc,
        blocks: s.doc.blocks.map((b) => {
          if (b.id !== blockId || b.type !== 'imageGrid') return b;
          if (b.images.length >= 3) return b; // limite 3
          return { ...b, images: [...b.images, url] };
        }),
      },
    }));
  },

  removeImageFromGrid: (blockId, index) => {
    set((s) => ({
      doc: {
        ...s.doc,
        blocks: s.doc.blocks.map((b) => {
          if (b.id !== blockId || b.type !== 'imageGrid') return b;
          return { ...b, images: b.images.filter((_, i) => i !== index) };
        }),
      },
    }));
  },
}));
