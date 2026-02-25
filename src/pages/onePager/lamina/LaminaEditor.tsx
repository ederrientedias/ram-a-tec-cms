import React, { useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLaminaStore } from './store';
import { PageA4 } from './PageA4';
import { HeaderBlock } from './blocks/HeaderBlock';
import { TableBlock } from './blocks/TableBlock';
import { TitleTextBlock } from './blocks/TitleTextBlock';
import { TextBlock } from './blocks/TextBlock';
import { ImageGridBlock } from './blocks/ImageGridBlock';
import { renderToHtml } from './export/renderToHtml';
import pdfService from '@/services/pdf.service';
import '@/styles/lamina.css';
import './export/print.css';
import { ICreatePDFProps } from '@/models/pdf.model';
import { Trash2Icon } from 'lucide-react';
import { HighlightBlock } from '@/pages/onePager/lamina/blocks/HighlightBlock';
import { ChartBlock } from '@/pages/onePager/lamina/blocks/ChartBlock';
import { ChartModal } from '@/pages/onePager/lamina/ChartModal';

export default function LaminaEditor() {
  const contentRef = useRef<HTMLDivElement>(null);
  const doc = useLaminaStore((s) => s.doc);
  const addBlock = useLaminaStore((s) => s.addBlock);
  const removeBlock = useLaminaStore((s) => s.removeBlock);
  const addChartBlock = useLaminaStore((s) => s.addChartBlock);
  const setChartSvg = useLaminaStore((s) => s.setChartSvg);
  // const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>('desktop');
  const [openChartModal, setOpenChartModal] = useState(false);

  const sanitizeIds = React.useCallback((svg: string, prefix: string) => {
    const idRegex = /id="([^"]+)"/g;
    const ids = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = idRegex.exec(svg))) ids.add(m[1]);
    ids.forEach((id) => {
      const newId = `${prefix}-${id}`;
      const reId = new RegExp(`id="${id}"`, 'g');
      const reUrl = new RegExp(`url\\(#${id}\\)`, 'g');
      const reHref = new RegExp(`([xlink:]*href="#)${id}(")`, 'g');
      svg = svg
        .replace(reId, `id="${newId}"`)
        .replace(reUrl, `url(#${newId})`)
        .replace(reHref, `$1${newId}$2`);
    });
    return svg;
  }, []);

  const inlineSvgStyles = React.useCallback((svgEl: SVGSVGElement) => {
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', '100%');
    clone.setAttribute('height', '200px');
    const source = [svgEl, ...Array.from(svgEl.querySelectorAll('*'))];
    const targets = [clone, ...Array.from(clone.querySelectorAll('*'))];
    const props = [
      'fill',
      'stroke',
      'stroke-width',
      'stroke-dasharray',
      'stroke-linecap',
      'stroke-linejoin',
      'opacity',
      'font-size',
      'font-family',
      'font-weight',
      'font-style',
      'text-anchor',
      'dominant-baseline',
      'letter-spacing',
    ];
    source.forEach((el, i) => {
      const computed = getComputedStyle(el as Element);
      const style = props
        .map((p) => {
          const v = computed.getPropertyValue(p);
          if (!v) return null;
          const t = v.trim();
          if (!t || t === 'none' || t === 'normal' || t === 'auto') return null;
          return `${p}:${t}`;
        })
        .filter(Boolean)
        .join(';');
      if (style) targets[i]?.setAttribute('style', style);
    });
    return clone.outerHTML;
  }, []);

  const captureChartSvgsFromDom = React.useCallback(() => {
    const root = contentRef.current;
    if (!root) return doc;

    const nextBlocks = doc.blocks.map((b) => {
      if (b.type !== 'chart') return b;
      const svgEl = root.querySelector(
        `[data-chart-block-id="${b.id}"] svg`
      ) as SVGSVGElement | null;
      if (!svgEl) return b;
      const raw = inlineSvgStyles(svgEl);
      const safe = sanitizeIds(raw, `chart-${b.id}`);
      return { ...b, svgMarkup: safe };
    });

    nextBlocks.forEach((b) => {
      if (b.type === 'chart' && b.svgMarkup) setChartSvg(b.id, b.svgMarkup);
    });

    return { ...doc, blocks: nextBlocks };
  }, [doc, inlineSvgStyles, sanitizeIds, setChartSvg]);

  const handleSaveChart = (payload: {
    chartType: 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'radialBar';
    chartData: Array<Record<string, any>>;
    chartConfig: Record<
      string,
      { label?: any; color?: string; theme?: Record<'light' | 'dark', string> }
    >;
    linesCount: number;
    xKey?: string;
    nameKey?: string;
    stacked?: boolean;
    showXAxis: boolean;
    showYAxis: boolean;
    svgMarkup?: string;
  }) => {
    addChartBlock({
      id: crypto.randomUUID(),
      type: 'chart',
      ...payload,
    });
    setOpenChartModal(false);
  };

  const generatePDF = async () => {
    const docForPdf = captureChartSvgsFromDom();
    const { html, css } = renderToHtml(docForPdf);
    // envie para sua API:
    console.log({ doc: docForPdf, HTML: JSON.stringify(html) });
    const props: any = {
      month: 'janeiro',
      year: 2026,
      selectedFund: {
        idName: 'evora-test',
        name: 'evora-test',
      },
      htmlContent: html,
      style: null,
    };

    try {
      const response = await pdfService.generatePDF(props);
      if (response.success) {
        console.log(response);
        console.log('PDF gerado com sucesso:', response.fileUrl);
      } else {
        console.error('🚫 Erro ao gerar o PDF:', response);
      }
    } catch (error) {
      console.error('❌ Erro ao gerar o PDF:', error);
    }
  };

  return (
    <div className="grid grid-cols-12">
      <aside className="col-span-2 h-full max-h-[calc(100vh-120px)] bg-rz-beige/40 p-3">
        <h1 className="text-sm font-semibold mb-3">Componentes</h1>

        <div className="flex flex-col gap-2">
          <button onClick={() => addBlock('titleText')}>Título + Texto</button>
          <button onClick={() => addBlock('text')}>Texto</button>
          <button onClick={() => addBlock('tableGrid')}>Grid de Tabela</button>
          <button onClick={() => addBlock('imageGrid')}>Grid de Imagens</button>
          <button onClick={() => addBlock('highlights')}>Grid de Destaques</button>
          <button onClick={() => setOpenChartModal(true)}>Gráfico</button>

          <hr className="my-2" />

          <button onClick={() => generatePDF()}>Exportar HTML/CSS</button>
        </div>
      </aside>

      <main className="col-span-10">
        <ScrollArea className="h-full max-h-[calc(100vh-120px)] w-full">
          <div
            ref={contentRef}
            className="w-full h-full flex flex-col gap-12 items-center justify-center py-12"
          >
            <PageA4>
              <HeaderBlock />
              <div className="content">
                {doc.blocks.map((b) => {
                  switch (b.type) {
                    case 'tableGrid':
                      return (
                        <div key={b.id} className="relative">
                          <TableBlock blockId={b.id} tableGrid={b.tableGrid} />
                          <button
                            className="absolute top-0 right-0"
                            onClick={() => removeBlock(b.id)}
                            aria-label="Remover bloco"
                          >
                            <Trash2Icon className="w-4 h-4 text-rz-black hover:text-red-500" />
                          </button>
                        </div>
                      );
                    case 'titleText':
                      return (
                        <div key={b.id} className="relative">
                          <TitleTextBlock
                            blockId={b.id}
                            title={b.title}
                            tiptapHtml={b.tiptapHtml}
                          />
                          <button
                            className="absolute top-0 right-0"
                            onClick={() => removeBlock(b.id)}
                            aria-label="Remover bloco"
                          >
                            <Trash2Icon className="w-4 h-4 text-rz-black hover:text-red-500" />
                          </button>
                        </div>
                      );
                    case 'text':
                      return (
                        <div key={b.id} className="relative">
                          <TextBlock blockId={b.id} title={b.title} tiptapHtml={b.tiptapHtml} />
                          <button
                            className="absolute top-0 right-0"
                            onClick={() => removeBlock(b.id)}
                            aria-label="Remover bloco"
                          >
                            <Trash2Icon className="w-4 h-4 text-rz-black hover:text-red-500" />
                          </button>
                        </div>
                      );
                    case 'imageGrid':
                      return (
                        <div key={b.id} className="relative">
                          <ImageGridBlock blockId={b.id} images={b.images} />
                          <button
                            className="absolute top-0 right-0"
                            onClick={() => removeBlock(b.id)}
                            aria-label="Remover bloco"
                          >
                            <Trash2Icon className="w-4 h-4 text-rz-black hover:text-red-500" />
                          </button>
                        </div>
                      );
                    case 'chart':
                      return (
                        <div key={b.id} className="relative" data-chart-block-id={b.id}>
                          <ChartBlock
                            type={b.chartType}
                            chartData={b.chartData}
                            chartConfig={b.chartConfig as any}
                            linesCount={b.linesCount}
                            xKey={b.xKey}
                            stacked={b.stacked}
                            nameKey={b.nameKey}
                            showXAxis={b.showXAxis}
                            showYAxis={b.showYAxis}
                            blockId={b.id}
                            onSvgCapture={(svg) => setChartSvg(b.id, svg)}
                          />
                          <button
                            className="absolute top-0 right-0"
                            onClick={() => removeBlock(b.id)}
                            aria-label="Remover bloco"
                          >
                            <Trash2Icon className="w-4 h-4 text-rz-black hover:text-red-500" />
                          </button>
                        </div>
                      );
                    case 'highlights':
                      return (
                        <div key={b.id} className="relative">
                          <HighlightBlock
                            blockId={b.id}
                            highlights={b.highlights}
                            title={b.title}
                          />
                          <button
                            className="absolute top-0 right-0"
                            onClick={() => removeBlock(b.id)}
                            aria-label="Remover bloco"
                          >
                            <Trash2Icon className="w-4 h-4 text-rz-black hover:text-red-500" />
                          </button>
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
                {/* <div className="chart">
                  <ChartBlock
                    chartData={chartData}
                    chartConfig={chartConfig}
                    linesCount={1}
                    type="line"
                  />
                  <ChartBlock
                    type="bar"
                    chartData={[{ date: 'Jan', a: 4, b: 3, c: 5 }]}
                    chartConfig={{
                      a: { label: 'A', color: '#ef4444' },
                      b: { label: 'B', color: '#22c55e' },
                      c: { label: 'C', color: '#3b82f6' },
                    }}
                    linesCount={2}
                    stacked
                  />
                  <ChartBlock
                    type="bar"
                    chartData={[{ date: 'Jan', a: 4, b: 3, c: 5 }]}
                    chartConfig={{
                      a: { label: 'A', color: '#ef4444' },
                      b: { label: 'B', color: '#22c55e' },
                      c: { label: 'C', color: '#3b82f6' },
                    }}
                    linesCount={2}
                    stacked
                  />
                </div> */}
              </div>
            </PageA4>
          </div>
        </ScrollArea>
      </main>
      <ChartModal open={openChartModal} onOpenChange={setOpenChartModal} onSave={handleSaveChart} />
    </div>
  );
}
