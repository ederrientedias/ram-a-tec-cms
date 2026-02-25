import { InlineText } from '@/pages/onePager/lamina/blocks/InlineText';
import { useLaminaStore } from '@/pages/onePager/lamina/store';
import React from 'react';
type Props = {
  blockId: string;
  title: string;
  highlights: { id: string; label: string; value: string }[];
};

export const HighlightBlock = React.memo(function HighlightBlock({
  blockId,
  title,
  highlights,
}: Props) {
  const setTitle = useLaminaStore((s) => s.updateHighlightTitle);
  const updateHighlightItem = useLaminaStore((s) => s.updateHightlightItem);

  return (
    <div className="highlight">
      <InlineText
        className="a4-title"
        value={title}
        onChange={(v) => setTitle(blockId, v)}
        placeholder="Título"
        singleLine
      />
      <div className="highlight-grid">
        {highlights.map((h) => (
          <div className="highlight-item" key={h.id}>
            <InlineText
              className="hl-label"
              value={h.label}
              onChange={(v) => updateHighlightItem(blockId, h.id, { label: v })}
              placeholder="Título"
              singleLine
            />
            <InlineText
              className="hl-value"
              value={h.value}
              onChange={(v) => updateHighlightItem(blockId, h.id, { value: v })}
              placeholder="Título"
              singleLine
            />
          </div>
        ))}
      </div>
    </div>
  );
});
