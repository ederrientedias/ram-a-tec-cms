import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartBlock } from '@/pages/onePager/lamina/blocks/ChartBlock';

type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'radialBar';

type ChartModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: {
    chartType: ChartType;
    chartData: Array<Record<string, any>>;
    chartConfig: ChartConfig;
    linesCount: number;
    xKey?: string;
    nameKey?: string;
    stacked?: boolean;
    showXAxis: boolean;
    showYAxis: boolean;
    svgMarkup?: string;
  }) => void;
};

export function ChartModal({ open, onOpenChange, onSave }: ChartModalProps) {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [csvText, setCsvText] = useState('');
  const [xKey, setXKey] = useState('date');
  const [nameKey, setNameKey] = useState('name');
  const [linesCount, setLinesCount] = useState(1);
  const [stacked, setStacked] = useState(false);
  const [showXAxis, setShowXAxis] = useState(true);
  const [showYAxis, setShowYAxis] = useState(true);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [labelMap, setLabelMap] = useState<Record<string, string>>({});
  const [previewSvg, setPreviewSvg] = useState('');

  const parseCsv = (text: string): Array<Record<string, any>> => {
    const rows = text.trim().split(/\r?\n/).filter(Boolean);
    if (rows.length < 2) return [];
    const header = rows[0].split(',').map((h) => h.trim());
    return rows.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim());
      const obj: Record<string, any> = {};
      header.forEach((h, i) => {
        const raw = cols[i] ?? '';
        const num = Number(raw.replace('%', ''));
        obj[h] = !isNaN(num) && raw !== '' ? num : raw;
      });
      return obj;
    });
  };

  const previewData = useMemo(() => (csvText ? parseCsv(csvText) : []), [csvText]);
  const detectedKeys = useMemo(() => {
    const first = previewData[0] || {};
    return Object.keys(first);
  }, [previewData]);

  const seriesKeys = useMemo(
    () => detectedKeys.filter((k) => k !== xKey && k !== nameKey),
    [detectedKeys, xKey, nameKey]
  );

  const previewConfig: ChartConfig = useMemo(() => {
    const entries = seriesKeys.map((k) => [
      k,
      {
        label: labelMap[k] || k,
        color: colorMap[k] || '#2563eb',
      },
    ]);
    return Object.fromEntries(entries);
  }, [seriesKeys, colorMap, labelMap]);

  const handleSave = () => {
    if (!previewData.length || seriesKeys.length === 0) {
      onOpenChange(false);
      return;
    }
    onSave({
      chartType,
      chartData: previewData,
      chartConfig: previewConfig,
      linesCount,
      xKey: chartType === 'pie' || chartType === 'radialBar' ? undefined : xKey,
      nameKey: chartType === 'pie' || chartType === 'radialBar' ? nameKey : undefined,
      stacked: chartType === 'bar' || chartType === 'area' ? stacked : undefined,
      showXAxis,
      showYAxis,
      svgMarkup: previewSvg || undefined,
    });
    onOpenChange(false);
    setCsvText('');
    setColorMap({});
    setLabelMap({});
    setLinesCount(1);
    setStacked(false);
    setShowXAxis(true);
    setShowYAxis(true);
    setPreviewSvg('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar Gráfico</DialogTitle>
          <DialogDescription>
            Configure os dados e visualize a prévia antes de salvar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6 space-y-3">
            <div>
              <Label>Tipo</Label>
              <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Linha</SelectItem>
                  <SelectItem value="bar">Barra</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                  <SelectItem value="pie">Pizza</SelectItem>
                  <SelectItem value="radar">Radar</SelectItem>
                  <SelectItem value="radialBar">Radial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {chartType !== 'pie' && chartType !== 'radialBar' && (
              <div>
                <Label>Chave do eixo X</Label>
                <Input value={xKey} onChange={(e) => setXKey(e.target.value)} placeholder="date" />
              </div>
            )}
            {(chartType === 'pie' || chartType === 'radialBar') && (
              <div>
                <Label>Nome da categoria</Label>
                <Input
                  value={nameKey}
                  onChange={(e) => setNameKey(e.target.value)}
                  placeholder="name"
                />
              </div>
            )}
            {(chartType === 'bar' || chartType === 'area') && (
              <div className="flex items-center gap-2">
                <input
                  id="stacked"
                  type="checkbox"
                  checked={stacked}
                  onChange={(e) => setStacked(e.target.checked)}
                />
                <Label htmlFor="stacked">Empilhar séries</Label>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                id="show-x-axis"
                type="checkbox"
                checked={showXAxis}
                onChange={(e) => setShowXAxis(e.target.checked)}
              />
              <Label htmlFor="show-x-axis">Exibir eixo X</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="show-y-axis"
                type="checkbox"
                checked={showYAxis}
                onChange={(e) => setShowYAxis(e.target.checked)}
              />
              <Label htmlFor="show-y-axis">Exibir eixo Y</Label>
            </div>
            <div>
              <Label>Linhas/Séries</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={linesCount}
                onChange={(e) => setLinesCount(parseInt(e.target.value || '1', 10))}
              />
            </div>
            <div>
              <Label>CSV (primeira linha com cabeçalho)</Label>
              <Textarea
                className="min-h-[140px]"
                placeholder="date,fundo,cdi&#10;2024-01-01,2.1,1.3"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
              />
            </div>
            {!!seriesKeys.length && (
              <div className="space-y-2">
                <Label>Configurar séries</Label>
                {seriesKeys.map((k) => {
                  const currentColor = colorMap[k] ?? '#2563eb';
                  const safeColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(currentColor)
                    ? currentColor
                    : '#2563eb';
                  return (
                    <div key={k} className="flex items-center gap-2">
                      <Input
                        className="flex-1"
                        value={labelMap[k] ?? k}
                        onChange={(e) => setLabelMap((s) => ({ ...s, [k]: e.target.value }))}
                        placeholder={`Label para ${k}`}
                      />
                      <Input
                        className="w-28"
                        value={currentColor}
                        onChange={(e) => setColorMap((s) => ({ ...s, [k]: e.target.value }))}
                        placeholder="#2563eb"
                      />
                      <Input
                        type="color"
                        className="w-14 px-1"
                        value={safeColor}
                        onChange={(e) => setColorMap((s) => ({ ...s, [k]: e.target.value }))}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="col-span-6">
            <Label className="mb-2 block">Pré-visualização</Label>
            <div className="border rounded p-2 bg-white">
              {previewData.length && seriesKeys.length ? (
                <ChartBlock
                  type={chartType}
                  chartData={previewData}
                  chartConfig={previewConfig}
                  linesCount={linesCount}
                  xKey={xKey}
                  stacked={stacked}
                  nameKey={nameKey}
                  showXAxis={showXAxis}
                  showYAxis={showYAxis}
                  blockId="preview"
                  onSvgCapture={setPreviewSvg}
                />
              ) : (
                <div className="text-xs text-muted-foreground">
                  Insira dados CSV para visualizar.
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
