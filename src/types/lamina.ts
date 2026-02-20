export type PageMeta = {
  page: 'A4';
  marginMm: { top: number; right: number; bottom: number; left: number };
};

export type Header = { title: string; subtitle: string };

export type TableCell = { id: string; label: string; value: string };
export type TableGrid = { left: TableCell; right: TableCell };

export type Block =
  | { id: string; type: 'titleText'; title: string; tiptapHtml: string }
  | { id: string; type: 'text'; title?: string; tiptapHtml: string }
  | { id: string; type: 'tableGrid'; tableGrid: TableGrid[] }
  | { id: string; type: 'imageGrid'; images: string[] }; // 1..3

export type Doc = {
  meta: PageMeta;
  header: Header;
  blocks: Block[];
};
