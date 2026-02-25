import React from 'react';
import type { ChartConfig } from '@/components/ui/chart';
import { LineChartBlock } from './charts/LineChart';
import { BarChartBlock } from './charts/BarChart';
import { AreaChartBlock } from './charts/AreaChart';
import { PieChartBlock } from './charts/PieChart';
import { RadarChartBlock } from './charts/RadarChart';
import { RadialBarChartBlock } from './charts/RadialBarChart';

type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'radialBar';

type ChartBlockProps = {
  type: ChartType;
  chartData: Array<Record<string, any>>;
  chartConfig: ChartConfig;
  linesCount?: number;
  xKey?: string;
  stacked?: boolean;
  nameKey?: string;
  showXAxis?: boolean;
  showYAxis?: boolean;
  blockId?: string;
  onSvgCapture?: (svg: string) => void;
};

export const ChartBlock = React.memo(function ChartBlock({
  type,
  chartData,
  chartConfig,
  linesCount = 1,
  xKey,
  stacked,
  nameKey,
  showXAxis = true,
  showYAxis = true,
  blockId,
  onSvgCapture,
}: ChartBlockProps) {
  const containerId = blockId ? `chart-${blockId}` : undefined;
  const safeData = chartData ?? [];
  const safeConfig = chartConfig ?? {};
  if (type === 'line') {
    return (
      <LineChartBlock
        chartData={safeData}
        chartConfig={safeConfig}
        linesCount={linesCount}
        xKey={xKey || 'date'}
        showXAxis={showXAxis}
        showYAxis={showYAxis}
        containerId={containerId}
        onSvgCapture={onSvgCapture}
      />
    );
  }
  if (type === 'bar') {
    return (
      <BarChartBlock
        chartData={safeData}
        chartConfig={safeConfig}
        linesCount={linesCount}
        xKey={xKey || 'date'}
        stacked={!!stacked}
        showXAxis={showXAxis}
        showYAxis={showYAxis}
        containerId={containerId}
        onSvgCapture={onSvgCapture}
      />
    );
  }
  if (type === 'area') {
    return (
      <AreaChartBlock
        chartData={safeData}
        chartConfig={safeConfig}
        linesCount={linesCount}
        xKey={xKey || 'date'}
        stacked={!!stacked}
        showXAxis={showXAxis}
        showYAxis={showYAxis}
        containerId={containerId}
        onSvgCapture={onSvgCapture}
      />
    );
  }
  if (type === 'pie') {
    return (
      <PieChartBlock
        chartData={safeData}
        chartConfig={safeConfig}
        linesCount={linesCount}
        nameKey={nameKey || 'name'}
        showXAxis={showXAxis}
        showYAxis={showYAxis}
        containerId={containerId}
        onSvgCapture={onSvgCapture}
      />
    );
  }
  if (type === 'radar') {
    return (
      <RadarChartBlock
        chartData={safeData}
        chartConfig={safeConfig}
        linesCount={linesCount}
        xKey={xKey || 'subject'}
        showXAxis={showXAxis}
        showYAxis={showYAxis}
        containerId={containerId}
        onSvgCapture={onSvgCapture}
      />
    );
  }
  if (type === 'radialBar') {
    return (
      <RadialBarChartBlock
        chartData={safeData}
        chartConfig={safeConfig}
        linesCount={linesCount}
        nameKey={nameKey || 'name'}
        showXAxis={showXAxis}
        showYAxis={showYAxis}
        containerId={containerId}
        onSvgCapture={onSvgCapture}
      />
    );
  }
  return null;
});
