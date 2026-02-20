import { ScrollArea } from '@/components/ui/scroll-area';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import EdiText from 'react-editext';
import EditableLabel from 'react-inline-editing';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { HeaderBlock } from './lamina/blocks/HeaderBlock';
import { TableBlock } from './lamina/blocks/TableBlock';
import { TitleTextBlock } from './lamina/blocks/TitleTextBlock';

import '../../styles/lamina.css';
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useLaminaStore } from '@/pages/onePager/lamina/store';
import { TextBlock } from '@/pages/onePager/lamina/blocks/TextBlock';
import { ImageGridBlock } from '@/pages/onePager/lamina/blocks/ImageGridBlock';

const Lamina = () => {
  const doc = useLaminaStore((s) => s.doc);
  const addBlock = useLaminaStore((s) => s.addBlock);
  const [title, setTitle] = useState('Clique para editar o título');
  const [subtitle, setSubtitle] = useState('Clique para editar o subtítulo');
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Comece a editar o conteúdo aqui</p>',
  });

  const [A4Canvas, setA4Canvas] = useState({
    title,
    subtitle,
  });

  const tableBlock = [
    {
      left: { id: 'l1', label: 'Classe: ANBIMA', value: 'Renda Fixa' },
      right: { id: 'r1', label: 'Taxa Administração', value: '1,00% a.a.' },
    },
    {
      left: { id: 'l2', label: 'Público-alvo:', value: 'Público Geral' },
      right: { id: 'r2', label: 'Taxa de Performance', value: 'Não se aplica' },
    },
    {
      left: { id: 'l3', label: 'Cotização de Resgate:', value: 'D+30 dias úteis' },
      right: { id: 'r3', label: 'Aplicação Mín Inicial', value: 'R$ 500,00' },
    },
    {
      left: {
        id: 'l4',
        label: 'Liquidação de Resgate:',
        value: 'D+1 útil após cotização',
      },
      right: { id: 'r4', label: 'Retorno-Alvo', value: 'CDI + 0,5% a 1,0% a.a.' },
    },
  ];

  const table = {
    column1: [
      // {
      //   id:1,
      //   label:'Classe: ANBIMA',
      //   value:'Renda Fixa',
      // },
      // {
      //   id:2,
      //   label:'Público-alvo:',
      //   value:'1,00% a.a.',
      // },
      {
        left: { id: 'l1', label: 'Classe: ANBIMA', value: 'Renda Fixa' },
        right: { id: 'r1', label: 'Taxa Administração', value: '1,00% a.a.' },
      },
      {
        left: { id: 'l2', label: 'Público-alvo:', value: 'Público Geral' },
        right: { id: 'r2', label: 'Taxa de Performance', value: 'Não se aplica' },
      },
      {
        left: { id: 'l3', label: 'Cotização de Resgate:', value: 'D+30 dias úteis' },
        right: { id: 'r3', label: 'Aplicação Mín Inicial', value: 'R$ 500,00' },
      },
      {
        left: {
          id: 'l4',
          label: 'Liquidação de Resgate:',
          value: 'D+1 útil após cotização',
        },
        right: { id: 'r4', label: 'Retorno-Alvo', value: 'CDI + 0,5% a 1,0% a.a.' },
      },
    ],
    column2: [
      {
        left: { id: 'column2-0', label: 'Classe: ANBIMA', value: 'Renda Fixa' },
        right: { id: 'column2-1', label: 'Taxa Administração', value: '1,00% a.a.' },
      },
      {
        left: { id: 'column2-2', label: 'Público-alvo:', value: 'Público Geral' },
        right: { id: 'column2-3', label: 'Taxa de Performance', value: 'Não se aplica' },
      },
      {
        left: { id: 'column2-4', label: 'Cotização de Resgate:', value: 'D+30 dias úteis' },
        right: { id: 'column2-5', label: 'Aplicação Mín Inicial', value: 'R$ 500,00' },
      },
      {
        left: {
          id: 'column2-6',
          label: 'Liquidação de Resgate:',
          value: 'D+1 útil após cotização',
        },
        right: { id: 'column2-7', label: 'Retorno-Alvo', value: 'CDI + 0,5% a 1,0% a.a.' },
      },
    ],
  };

  function Banner({ image }) {
    return (
      <div
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: 'contain',
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          height: '200px',
        }}
      />
    );
  }

  const A4Head = () => {
    return (
      <div className="head">
        <EditableLabel labelClassName="a4-title" text={title} onFocusOut={(val) => setTitle(val)} />
        <EditableLabel
          labelClassName="a4-subtitle"
          text={subtitle}
          onFocusOut={(val) => setSubtitle(val)}
        />
      </div>
    );
  };

  const BTitleText = () => {
    return (
      <div className="text-block">
        <EditableLabel labelClassName="a4-title" text={title} onFocusOut={(val) => setTitle(val)} />
        <EditorContent editor={editor} />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-2 h-full max-h-[calc(100vh-120px)] bg-rz-beige/40">
        <h1>Componentes</h1>
      </div>
      <div className="col-span-10 ">
        <ScrollArea className="h-full max-h-[calc(100vh-120px)] w-full">
          <div className="w-full h-full flex flex-col gap-12 items-center justify-center py-12">
            <div className="a4">
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
            </div>
            <div className="a4">
              <div className="head">
                <hgroup>
                  <h1 className="a4-title">Riza Lotus</h1>
                  <span className="a4-subtitle">Renda Fixa</span>
                </hgroup>
              </div>
              <div className="content"></div>
              <div className="footer"></div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
export default Lamina;
