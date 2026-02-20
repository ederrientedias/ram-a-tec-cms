import React from 'react';
import { useLaminaStore } from '../store';
import type { TableGrid } from '@/types/lamina';
import { InlineText } from './InlineText';

type Props = { blockId: string; tableGrid: TableGrid[] };

export const TableBlock = React.memo(function TableBlock({ blockId, tableGrid }: Props) {
  const updateCell = useLaminaStore((s) => s.updateTableCell);

  return (
    <div className="grid-table">
      {/* Coluna 1 */}
      <div className="table">
        {tableGrid.map((row) => (
          <div className="row" key={row.left.id}>
            <div className="col-label">
              <InlineText
                className="cell-label"
                value={row.left.label}
                onChange={(v) => updateCell(blockId, row.left.id, { label: v })}
                singleLine
              />
            </div>
            <div className="col-value">
              <InlineText
                className="cell-label"
                value={row.left.value}
                onChange={(v) => updateCell(blockId, row.left.id, { value: v })}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Coluna 2 */}
      <div className="table">
        {tableGrid.map((row) => (
          <div className="row" key={row.right.id}>
            <div className="col-label">
              <InlineText
                className="cell-label"
                value={row.right.label}
                onChange={(v) => updateCell(blockId, row.right.id, { label: v })}
                singleLine
              />
            </div>
            <div className="col-value">
              <InlineText
                className="cell-label"
                value={row.right.value}
                onChange={(v) => updateCell(blockId, row.right.id, { value: v })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
