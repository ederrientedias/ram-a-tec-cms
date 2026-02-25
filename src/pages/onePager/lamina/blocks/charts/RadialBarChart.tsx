import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { RadialBar, RadialBarChart as RRadialBarChart, PolarAngleAxis } from 'recharts';

type RadialBarChartBlockProps = {
  chartData: Array<Record<string, any>>;
  chartConfig: ChartConfig;
  linesCount: number;
  nameKey?: string;
  showXAxis?: boolean;
  showYAxis?: boolean;
  containerId?: string;
  onSvgCapture?: (svg: string) => void;
};

export const RadialBarChartBlock = React.memo(function RadialBarChartBlock({
  chartData,
  chartConfig,
  linesCount,
  nameKey = 'name',
  showXAxis = true,
  showYAxis = true,
  containerId,
  onSvgCapture,
}: RadialBarChartBlockProps) {
  const keys = Object.keys(chartConfig);
  // Aggregate values for each series key across rows
  const rows = keys
    .map((k) => ({
      [nameKey]: k,
      value: chartData.reduce((acc, row) => (typeof row[k] === 'number' ? acc + row[k] : acc), 0),
      key: k,
    }))
    .filter((r) => r.value > 0)
    .slice(0, Math.max(0, Math.min(linesCount, keys.length)));

  const config: ChartConfig = Object.fromEntries(
    rows.map((r) => [
      r[nameKey] as string,
      {
        label: chartConfig[r.key]?.label || r.key,
        ...(chartConfig[r.key]?.theme
          ? { theme: chartConfig[r.key]?.theme as any }
          : chartConfig[r.key]?.color
            ? { color: chartConfig[r.key]?.color as string }
            : {}),
      },
    ])
  );

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
  }, [rows, showXAxis, showYAxis, containerId, onSvgCapture, sanitizeIds, inlineSvgStyles]);

  return (
    <ChartContainer
      ref={containerRef}
      id={containerId}
      config={config}
      className="aspect-square h-[260px] w-full"
    >
      <RRadialBarChart
        innerRadius="20%"
        outerRadius="100%"
        barSize={12}
        data={rows}
        startAngle={90}
        endAngle={-270}
      >
        {showYAxis && (
          <PolarAngleAxis
            type="number"
            domain={[0, Math.max(...rows.map((r) => r.value))]}
            tick={axisTickStyle}
          />
        )}
        <ChartTooltip content={<ChartTooltipContent className="w-[150px]" nameKey={nameKey} />} />
        <ChartLegend content={<ChartLegendContent />} />
        {rows.map((r) => (
          <RadialBar
            key={r.key}
            dataKey="value"
            name={r[nameKey] as string}
            cornerRadius={4}
            background
            fill={getSeriesColor(r.key)}
          />
        ))}
      </RRadialBarChart>
    </ChartContainer>
  );
});
