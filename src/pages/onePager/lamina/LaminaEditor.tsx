import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLaminaStore } from './store';
import { PageA4 } from './PageA4';
import { HeaderBlock } from './blocks/HeaderBlock';
import { TableBlock } from './blocks/TableBlock';
import { TitleTextBlock } from './blocks/TitleTextBlock';
import { TextBlock } from './blocks/TextBlock';
import { ImageGridBlock } from './blocks/ImageGridBlock';
import { renderToHtml } from './export/renderToHtml';

import '@/styles/lamina.css';
import './export/print.css';

export default function LaminaEditor() {
  const doc = useLaminaStore((s) => s.doc);
  const addBlock = useLaminaStore((s) => s.addBlock);

  return (
    <div className="grid grid-cols-12">
      <aside className="col-span-2 h-full max-h-[calc(100vh-120px)] bg-rz-beige/40 p-3">
        <h1 className="text-sm font-semibold mb-3">Componentes</h1>

        <div className="flex flex-col gap-2">
          <button onClick={() => addBlock('titleText')}>Título + Texto</button>
          <button onClick={() => addBlock('text')}>Texto</button>
          <button onClick={() => addBlock('tableGrid')}>Grid de Tabela</button>
          <button onClick={() => addBlock('imageGrid')}>Grid de Imagens</button>

          <hr className="my-2" />

          <button
            onClick={() => {
              const { html, css } = renderToHtml(doc);
              // envie para sua API:
              console.log({ html, css });
            }}
          >
            Exportar HTML/CSS
          </button>
        </div>
      </aside>

      <main className="col-span-10">
        <ScrollArea className="h-full max-h-[calc(100vh-120px)] w-full">
          <div className="w-full h-full flex flex-col gap-12 items-center justify-center py-12">
            <PageA4>
              <HeaderBlock />
              <div className="content">
                {doc.blocks.map((b) => {
                  switch (b.type) {
                    case 'tableGrid':
                      return <TableBlock key={b.id} blockId={b.id} tableGrid={b.tableGrid} />;
                    case 'titleText':
                      return (
                        <TitleTextBlock
                          key={b.id}
                          blockId={b.id}
                          title={b.title}
                          tiptapHtml={b.tiptapHtml}
                        />
                      );
                    case 'text':
                      return (
                        <TextBlock
                          key={b.id}
                          blockId={b.id}
                          title={b.title}
                          tiptapHtml={b.tiptapHtml}
                        />
                      );
                    case 'imageGrid':
                      return <ImageGridBlock key={b.id} blockId={b.id} images={b.images} />;
                    default:
                      return null;
                  }
                })}
              </div>
            </PageA4>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
