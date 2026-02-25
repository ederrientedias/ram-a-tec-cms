import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Pie, PieChart as RPieChart, Cell } from 'recharts';

type PieChartBlockProps = {
  chartData: Array<Record<string, any>>;
  chartConfig: ChartConfig;
  linesCount: number;
  nameKey?: string;
  showXAxis?: boolean;
  showYAxis?: boolean;
  containerId?: string;
  onSvgCapture?: (svg: string) => void;
};

export const PieChartBlock = React.memo(function PieChartBlock({
  chartData,
  chartConfig,
  linesCount,
  nameKey = 'name',
  showXAxis = true,
  showYAxis = true,
  containerId,
  onSvgCapture,
}: PieChartBlockProps) {
  const keys = Object.keys(chartConfig);
  // Aggregate values by key across data rows
  const slices = keys.map((k) => ({
    key: k,
    value: chartData.reduce((acc, row) => (typeof row[k] === 'number' ? acc + row[k] : acc), 0),
  }));
  const data = slices
    .filter((s) => s.value > 0)
    .slice(0, Math.max(0, Math.min(linesCount, slices.length)))
    .map((s) => ({ [nameKey]: s.key, value: s.value, key: s.key }));
  const getSliceColor = React.useCallback(
    (key: string) => chartConfig[key]?.color ?? chartConfig[key]?.theme?.light ?? '#2563eb',
    [chartConfig]
  );

  const config: ChartConfig = Object.fromEntries(
    data.map((d) => [
      d[nameKey] as string,
      {
        label: chartConfig[d.key]?.label || d.key,
        // propagate provided color if present
        ...(chartConfig[d.key]?.theme
          ? { theme: chartConfig[d.key]?.theme as any }
          : chartConfig[d.key]?.color
            ? { color: chartConfig[d.key]?.color as string }
            : {}),
      },
    ])
  );

  const containerRef = React.useRef<HTMLDivElement>(null);

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

  React.useLayoutEffect(() => {
    if (!onSvgCapture || !containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (!svgEl) return;
    const raw = inlineSvgStyles(svgEl as SVGSVGElement);
    const safe = sanitizeIds(raw, containerId || 'chart');
    onSvgCapture(safe);
  }, [
    data,
    config,
    nameKey,
    showXAxis,
    showYAxis,
    containerId,
    onSvgCapture,
    sanitizeIds,
    inlineSvgStyles,
  ]);

  return (
    <ChartContainer
      ref={containerRef}
      id={containerId}
      config={config}
      className="aspect-square h-[200px] w-full"
    >
      <RPieChart>
        <ChartTooltip content={<ChartTooltipContent className="w-[150px]" nameKey={nameKey} />} />
        <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} />
        <Pie data={data} dataKey="value" nameKey={nameKey} outerRadius={70} innerRadius={40}>
          {data.map((entry) => (
            <Cell key={entry.key} fill={getSliceColor(entry.key)} />
          ))}
        </Pie>
      </RPieChart>
    </ChartContainer>
  );
});
