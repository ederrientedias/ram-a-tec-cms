import { create } from 'zustand';
import type { Doc, Block, TableGrid } from '@/types/lamina';

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

const initialDoc: Doc = {
  meta: { page: 'A4', marginMm: { top: 12, right: 12, bottom: 12, left: 12 } },
  header: {
    title: 'Clique para editar o nome do fundo',
    subtitle: 'Clique para editar o subtítulo',
  },
  blocks: [
    { id: uid(), type: 'tableGrid', tableGrid },
    { id: uid(), type: 'titleText', title: 'Título', tiptapHtml: '<p>Comece a editar…</p>' },
    { id: uid(), type: 'imageGrid', images: [] },
    { id: uid(), type: 'text', title: 'Performance', tiptapHtml: '<p>Escreva aqui…</p>' },
  ],
};

type Actions = {
  setHeaderTitle: (title: string) => void;
  setHeaderSubtitle: (subtitle: string) => void;

  addBlock: (type: Block['type']) => void;
  removeBlock: (id: string) => void;

  updateTitleTextBlockTitle: (id: string, title: string) => void;
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
    const newBlock: Block =
      type === 'titleText'
        ? { id: uid(), type, title: 'Título', tiptapHtml: '<p>Texto…</p>' }
        : type === 'text'
          ? { id: uid(), type, title: 'Título', tiptapHtml: '<p>Texto…</p>' }
          : type === 'tableGrid'
            ? { id: uid(), type, tableGrid }
            : { id: uid(), type, images: [] };

    set((s) => ({ doc: { ...s.doc, blocks: [...s.doc.blocks, newBlock] } }));
  },

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
