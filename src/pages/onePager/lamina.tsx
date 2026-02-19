import { ScrollArea } from '@/components/ui/scroll-area';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import EdiText from 'react-editext';
import EditableLabel from 'react-inline-editing';

import '../../styles/lamina.css';
import { useState } from 'react';
import { Pencil } from 'lucide-react';

const Lamina = () => {
  const [title, setTitle] = useState('Clique para editar o título');
  const [subtitle, setSubtitle] = useState('Clique para editar o subtítulo');

  const gridTable1 = [
    { id: 0, title: 'Classe: ANBIMA', subtitle: 'Renda Fixa' },
    { id: 1, title: 'Publico-alvo', subtitle: 'Publico Geral' },
    { id: 2, title: 'Classe: ANBIMA', subtitle: 'Renda Fixa' },
    { id: 3, title: 'Classe: ANBIMA', subtitle: 'Renda Variável' },
  ];
  const initialRows = [
    {
      left: { id: 'classe', label: 'Classe: ANBIMA', value: 'Renda Fixa' },
      right: { id: 'taxaAdm', label: 'Taxa Administração', value: '1,00% a.a.' },
    },
    {
      left: { id: 'publico', label: 'Público-alvo:', value: 'Público Geral' },
      right: { id: 'taxaPerf', label: 'Taxa de Performance', value: 'Não se aplica' },
    },
    {
      left: { id: 'cotResgate', label: 'Cotização de Resgate:', value: 'D+30 dias úteis' },
      right: { id: 'aplicMin', label: 'Aplicação Mín Inicial', value: 'R$ 500,00' },
    },
    {
      left: { id: 'liqResgate', label: 'Liquidação de Resgate:', value: 'D+1 útil após cotização' },
      right: { id: 'retorno', label: 'Retorno-Alvo', value: 'CDI + 0,5% a 1,0% a.a.' },
    },
  ];

  const data = [
    { date: 'jul-22', fundo: 2.1, cdi: 1.3 },
    { date: 'out-22', fundo: 8.7, cdi: 6.1 },
    { date: 'jan-23', fundo: 12.5, cdi: 10.2 },
    { date: 'jul-23', fundo: 21.9, cdi: 18.6 },
    { date: 'jan-24', fundo: 31.4, cdi: 27.9 },
    { date: 'jul-24', fundo: 41.0, cdi: 36.4 },
    { date: 'jan-25', fundo: 52.6, cdi: 46.8 },
    { date: 'dez-25', fundo: 64.9, cdi: 58.7 },
  ];

  function RenderLineChart({ series }: { series: { date: string; fundo: number; cdi: number }[] }) {
    const chartConfig = {
      fundo: { label: 'Lotus Prev', color: '#2563eb' },
      cdi: { label: 'CDI', color: '#16a34a' },
    } as const;

    return (
      <ChartContainer config={chartConfig} className="h-[240px] w-full">
        <LineChart data={series} margin={{ top: 12, right: 12, left: 12, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="fundo"
            stroke="var(--color-fundo)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="cdi"
            stroke="var(--color-cdi)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    );
  }

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

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-2 h-full max-h-[calc(100vh-120px)] bg-rz-beige/40">
        <h1>Componentes</h1>
      </div>
      <div className="col-span-10 ">
        <ScrollArea className="h-full max-h-[calc(100vh-120px)] w-full">
          <div className="w-full h-full flex flex-col gap-12 items-center justify-center py-12">
            <div className="a4">
              <div className="head">
                <EditableLabel
                  labelClassName="a4-title"
                  text="Clique para editar"
                  onFocusOut={(value) => setTitle(value)}
                />
                <EditableLabel
                  labelClassName="a4-subtitle"
                  text="Clique para editar"
                  onFocusOut={(value) => setSubtitle(value)}
                />
                {/* <span className="a4-subtitle">Renda Fixa</span> */}
              </div>
              <div className="content">
                {/* Componente de Tabelas */}
                <div className="grid-table">
                  {/* 1 */}
                  <div className="table">
                    {initialRows.map((row) => {
                      return (
                        <div className="row" key={row.left.id}>
                          <div className="cell-title">
                            <EditableLabel
                              text={row.left.label}
                              labelClassName="cell-text"
                              onFocusOut={(val) =>
                                initialRows.map((r) => {
                                  if (r.left.id === row.left.id) {
                                    r.left.label = val;
                                  }
                                })
                              }
                            />
                          </div>
                          <div className="cell-content">
                            <EditableLabel
                              text={row.right.label}
                              labelClassName="cell-text"
                              onFocusOut={(val) =>
                                initialRows.map((r) => {
                                  if (r.right.id === row.right.id) {
                                    r.right.label = val;
                                  }
                                })
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                    {/* <div className="row">
                      <div className="cell-title">
                        <EditableLabel
                          text="Clique para editar"
                          onFocusOut={(texto) => console.log('Texto novo:', texto)}
                        />
                      </div>
                      <div className="cell-content">
                        <span>Renda Fixa</span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="cell-title">
                        <span>Público-alvo:</span>
                      </div>
                      <div className="cell-content">
                        <span>Público Geral</span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="cell-title">
                        <span>Cotização de Resgate:</span>
                      </div>
                      <div className="cell-content">
                        <span>D+30 dias úteis</span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="cell-title">
                        <span>Liquidação de Resgate:</span>
                      </div>
                      <div className="cell-content">
                        <span>D+1 útil após cotização</span>
                      </div>
                    </div> */}
                  </div>
                  {/* 2 */}
                  <div className="table">
                    <div className="row">
                      <div className="cell-title">
                        <span>Taxa Administração</span>
                      </div>
                      <div className="cell-content">
                        <span>1,00% a.a.</span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="cell-title">
                        <span>Taxa de Performance</span>
                      </div>
                      <div className="cell-content">
                        <span>Não se aplica</span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="cell-title">
                        <span>Aplicação Mín Inicial</span>
                      </div>
                      <div className="cell-content">
                        <span>R$ 500,00</span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="cell-title">
                        <span>Retorno-Alvo</span>
                      </div>
                      <div className="cell-content">
                        <span>CDI + 0,5% a 1,0% a.a.</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Componente de Textos */}
                <div className="text-block">
                  <h2>Estratégia e Atuação</h2>
                  <p>
                    O Riza Évora Hedge tem como objetivo encontrar ativos de crédito privado
                    enquadrados na Lei 12.431 que apresentem uma relação risco-retorno atrativa.
                    Sendo assim, é feita uma avaliação minuciosa dos ativos, entendendo não só a
                    perspectiva financeira, como também os detalhes de cada um dos projetos a qual
                    estas dívidas foram concebidas. A combinação das estratégias de ativos líquidos
                    e estruturados permite ao Évora Hedge acessar diferentes fontes de retorno
                    dentro do universo de crédito incentivado, com controle de risco e agilidade na
                    alocação. Essa diversificação proporciona flexibilidade para aproveitar
                    oportunidades em debêntures incentivadas e operações estruturadas com garantias
                    reais, gerando uma relação risco-retorno mais eficiente que a média dos fundos
                    da categoria.
                  </p>
                </div>
                {/* Componente de Destaques */}
                <div className="highlight">
                  <h2>Posicionamento</h2>
                  <div className="highlight-grid">
                    <div className="highlight-item">
                      <span>Carrego</span>
                      <strong>CDI + 0,7% a.a</strong>
                    </div>
                    <div className="highlight-item">
                      <span>Duration</span>
                      <strong>4,5 anos</strong>
                    </div>
                    <div className="highlight-item">
                      <span>Emissores</span>
                      <strong>70</strong>
                    </div>
                  </div>
                </div>
                {/* Componente de Galeria */}
                <div className="galery">
                  <img
                    src="https://storage.googleapis.com/docs.rizaasset.com/img/daikon/carrego%201%201.svg"
                    alt=""
                  />
                  <img
                    src="https://storage.googleapis.com/docs.rizaasset.com/img/daikon/indexador%201.svg"
                    alt=""
                  />
                  <img
                    src="https://storage.googleapis.com/docs.rizaasset.com/img/daikon/setor%201.svg"
                    alt=""
                  />
                </div>
                {/* Componente de Textos */}
                <div className="text-block">
                  <h2>Performance</h2>
                  <p>
                    O Riza Évora Hedge entregou 6,49% desde o início (Eq. 111% do CDI), ao
                    realizarmos o gross-up desse retorno considerando uma alíquota de 15% de IR o
                    fundo tem um retorno de 130% do CDI.
                  </p>
                </div>
                <div className="galery-col-1">
                  <Banner image="https://storage.googleapis.com/docs.rizaasset.com/img/daikon/desdeinicio.svg" />
                  {/* <RenderLineChart series={data} /> */}
                </div>
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
