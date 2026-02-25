export type PageMeta = {
  page: 'A4';
  marginMm: { top: number; right: number; bottom: number; left: number };
};

export type Header = { title: string; subtitle: string };

export type TableCell = { id: string; label: string; value: string };
export type TableGrid = { left: TableCell; right: TableCell };
export type HighlightItem = { id: string; label: string; value: string };
export type Highlight = {
  id: string;
  type: 'highlights';
  title: string;
  highlights: HighlightItem[];
};

export type Block =
  | { id: string; type: 'titleText'; title: string; tiptapHtml: string }
  | { id: string; type: 'text'; title?: string; tiptapHtml: string }
  | { id: string; type: 'tableGrid'; tableGrid: TableGrid[] }
  | { id: string; type: 'imageGrid'; images: string[] }
  | { id: string; type: 'highlights'; title: string; highlights: HighlightItem[] }
  | {
      id: string;
      type: 'chart';
      chartType: 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'radialBar';
      chartData: Array<Record<string, any>>;
      chartConfig: Record<
        string,
        { label?: any; color?: string; theme?: Record<'light' | 'dark', string> }
      >;
      linesCount: number;
      xKey?: string;
      stacked?: boolean;
      nameKey?: string;
      showXAxis?: boolean;
      showYAxis?: boolean;
      svgMarkup?: string;
    };

export type Doc = {
  meta: PageMeta;
  header: Header;
  blocks: Block[];
};
