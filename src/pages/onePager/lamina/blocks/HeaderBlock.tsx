import React from 'react';
import { useLaminaStore } from '../store';
import { InlineText } from './InlineText';

export const HeaderBlock = React.memo(function HeaderBlock() {
  const title = useLaminaStore((s) => s.doc.header.title);
  const subtitle = useLaminaStore((s) => s.doc.header.subtitle);
  const setTitle = useLaminaStore((s) => s.setHeaderTitle);
  const setSubtitle = useLaminaStore((s) => s.setHeaderSubtitle);

  return (
    <div className="a4-head">
      <InlineText
        className="a4-title"
        value={title}
        onChange={setTitle}
        placeholder="Título"
        singleLine
      />
      <InlineText
        className="a4-subtitle"
        value={subtitle}
        onChange={setSubtitle}
        placeholder="Subtítulo"
        singleLine
      />
    </div>
  );
});
