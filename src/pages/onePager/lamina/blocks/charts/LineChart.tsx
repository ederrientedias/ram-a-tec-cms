import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

type LineChartBlockProps = {
  chartData: Array<Record<string, any>>;
  chartConfig: ChartConfig;
  linesCount: number;
  xKey?: string;
  showXAxis?: boolean;
  showYAxis?: boolean;
  containerId?: string;
  onSvgCapture?: (svg: string) => void;
};

export const LineChartBlock = React.memo(function LineChartBlock({
  chartData,
  chartConfig,
  linesCount,
  xKey = 'date',
  showXAxis = true,
  showYAxis = true,
  containerId,
  onSvgCapture,
}: LineChartBlockProps) {
  const sample = chartData?.[0] ?? {};
  const possibleKeys = Object.keys(chartConfig).filter((k) => k in sample);
  const seriesKeys = possibleKeys.slice(0, Math.max(0, Math.min(linesCount, possibleKeys.length)));
  const containerRef = React.useRef<HTMLDivElement>(null);
  const axisTickStyle = React.useMemo(() => ({ fontSize: 10, fill: '#282828' }), []);
  const getSeriesColor = React.useCallback(
    (key: string) => chartConfig[key]?.color ?? chartConfig[key]?.theme?.light ?? '#2563eb',
    [chartConfig]
  );

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
    chartData,
    chartConfig,
    linesCount,
    xKey,
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
      config={chartConfig}
      className="aspect-auto h-[200px] w-full"
    >
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} horizontal={false} />
        {showXAxis && (
          <XAxis
            dataKey={xKey}
            tick={axisTickStyle}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
          />
        )}
        {showYAxis && <YAxis tick={axisTickStyle} tickLine={false} axisLine={false} />}
        <ChartTooltip content={<ChartTooltipContent className="w-[150px]" />} />
        <ChartLegend content={<ChartLegendContent />} />
        {seriesKeys.map((key) => (
          <Line
            key={key}
            dataKey={key}
            type="monotone"
            stroke={getSeriesColor(key)}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
});
