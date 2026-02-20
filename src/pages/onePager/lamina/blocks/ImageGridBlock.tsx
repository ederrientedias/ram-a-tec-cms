import React, { useMemo, useState } from 'react';
import { useLaminaStore } from '../store';
import { Trash2Icon } from 'lucide-react';

type Props = { blockId: string; images: string[] };

export const ImageGridBlock = React.memo(function ImageGridBlock({ blockId, images }: Props) {
  const addImage = useLaminaStore((s) => s.addImageToGrid);
  const removeImage = useLaminaStore((s) => s.removeImageFromGrid);
  const [url, setUrl] = useState('');

  const cols = useMemo(() => Math.max(1, Math.min(images.length || 1, 3)), [images.length]);

  return (
    <div className="image-grid-block">
      <div className="flex items-center gap-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Cole a URL da imagem"
          className="px-3 py-2 border border-rz-beige text-rz-black font-sans text-xs outline-none"
        />
        <button
          onClick={() => {
            if (!url.trim()) return;
            addImage(blockId, url.trim());
            setUrl('');
          }}
          disabled={images.length >= 3}
          className="px-3 py-2 bg-rz-beige text-rz-black font-sans text-xs cursor-pointer hover:bg-rz-beige/50 hover:text-rz-gold color-transparent"
        >
          Adicionar
        </button>
        <small>{images.length}/3</small>
      </div>

      <div
        className="image-grid"
        style={{ gridTemplateColumns: `repeat(${Math.min(images.length || 1, 3)}, 1fr)` }}
      >
        {(images.length ? images : ['__placeholder__']).map((src, i) => (
          <div key={src + i} className="image-cell">
            {src === '__placeholder__' ? (
              <div className="image-placeholder">Sem imagens</div>
            ) : (
              <>
                <img src={src} alt="" />
                <button
                  className="p-1 bg-rz-smoke-white text-rz-white rounded cursor-pointer group"
                  onClick={() => removeImage(blockId, i)}
                >
                  <Trash2Icon className="w-4 h-4 text-rz-black group-hover:text-red-500" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});
