import '../styles/summary.css';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoadingDocAnimation from '@/components/animations/loadingDoc';
import { ICreatePDFProps, ISelectedFund } from '@/models/pdf.model';
import { useRizaFunds } from '@/hooks/use-riza-funds';
import { getMonthAndYear } from '@/utils/month-year';
import pdfService from '@/services/pdf.service.ts';
import { Data } from '@/models/salesforce.model';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import useStyle from '@/hooks/use-style';
import { useState, useRef } from 'react';

import { Style } from '../styles/summary';

export const InformationalTransparency = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { month, year } = getMonthAndYear();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFund, setSelectedFund] = useState<ISelectedFund | null>(null);
  const { data: rizaFunds, isLoading: isLoadingFunds, error: errorFunds } = useRizaFunds();

  const handleSelectFund = (fundId: string) => {
    const fund = rizaFunds?.find((fund: any) => fund.id === fundId);
    const values = [fund?.name.replace(/\s+/g, ''), fund?.id];
    const idName = values.join('-');
    setSelectedFund({ ...fund, idName });
  };

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    const htmlContent = contentRef.current.innerHTML;

    const props: ICreatePDFProps = {
      month,
      year,
      selectedFund,
      htmlContent,
      style: Style,
    };

    try {
      const response = await pdfService.generatePDF(props);
      if (response.success) {
        console.log('PDF gerado com sucesso:', response);
        window.open(response.fileUrl, '_blank');
      } else {
        console.error('Erro ao gerar o PDF:', response);
      }
    } catch (error) {
      console.error('Erro ao gerar o PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start">
        <h1 className="text-2xl font-bold text-gray-900">Gerador de Sumário Anbima</h1>
      </div>
      {/* Header    */}
      <div className="w-full flex items-center justify-between bg-white shadow rounded-lg p-6 sticky top-0 z-10  transition-all duration-300">
        <div className="space-y-2 w-80">
          <Label htmlFor="fundName">Nome do Fundo</Label>
          <Select onValueChange={handleSelectFund}>
            <SelectTrigger>
              {isLoadingFunds ? (
                <SelectValue placeholder="Carregando fundos..." />
              ) : errorFunds ? (
                <SelectValue placeholder="Erro ao carregar fundos" />
              ) : (
                <SelectValue placeholder="Selecione um fundo" />
              )}
            </SelectTrigger>
            <SelectContent>
              {rizaFunds?.map((fund) => (
                <SelectItem key={fund.id} value={fund.id}>
                  {fund.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGeneratePDF} disabled={isLoading}>
          {isLoading ? 'Gerando...' : 'Gerar PDF'}
        </Button>
      </div>
      {/* Content */}
      {isLoading ? (
        <LoadingDocAnimation />
      ) : (
        <div ref={contentRef} className="w-full flex flex-col items-center gap-4">
          {/* Página A4 - 1 */}
          <div className="a4-sheet">
            {/* HEADER */}
            <div className="page-head">
              <div className="page-header">
                <div className="month-ref">
                  <h3>Mês Referência</h3>
                  <div className="date-ref">
                    <span>{month}</span>
                    <div className="bar"></div>
                    <span>{year}</span>
                  </div>
                </div>
                <div className="logo">
                  <img
                    src="https://storage.googleapis.com/docs.rizaasset.com/img/logo-riza.png"
                    alt="Logo Riza"
                  />
                </div>
              </div>
              <p className="obs">
                As informações deste sumário estão atualizadas e referem-se ao mês em que ocorreram
                as últimas alterações dos acordos.
              </p>
            </div>
            {/* CONTENT */}
            <div className="content">
              <div className="content-title">
                <h1>Informações Gerais</h1>
              </div>
              <div className="box">
                <div className="box-title">
                  <h2>Prestadores de Serviços Essenciais</h2>
                </div>
                <div className="box-content">
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Gestor de Recursos</strong>
                      <div className="divider"></div>
                      <span>Riza Gestora de Recursos Ltda.</span>
                    </div>
                    <div className="box-item">
                      <strong>CNPJ do Gestor</strong>
                      <div className="divider"></div>
                      <span>12.209.584/0001-99</span>
                    </div>
                  </div>
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Administrador Fiduciário</strong>
                      <div className="divider"></div>
                      <span>
                        XP INVESTIMENTOS CORRETORA DE CAMBIO, TITULOS E VALORES MOBILIARIOS S/A
                      </span>
                    </div>
                    <div className="box-item">
                      <strong>CNPJ do Administrador</strong>
                      <div className="divider"></div>
                      <span>02.332.886/0001-04</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box">
                <div className="box-title">
                  <h2>Características da Classe/Subclasse</h2>
                </div>
                <div className="box-content">
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Fundo</strong>
                      <div className="divider"></div>
                      <span>Riza Domus Fundo de Investimento Imobiliário</span>
                    </div>
                    <div className="box-item">
                      <strong>CNPJ</strong>
                      <div className="divider"></div>
                      <span>50.750.438/0001-65</span>
                    </div>
                  </div>
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Público Alvo</strong>
                      <div className="divider"></div>
                      <span> Investidores em Geral </span>
                    </div>
                    <div className="box-item">
                      <strong>Categoria</strong>
                      <div className="divider"></div>
                      <span>FII</span>
                    </div>
                    <div className="box-item">
                      <strong>Tipo de Classe</strong>
                      <div className="divider"></div>
                      <span>-</span>
                    </div>
                  </div>
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Nome da Classe</strong>
                      <div className="divider"></div>
                      <span> Riza Domus Fundo de Investimento Imobiliário </span>
                    </div>
                    <div className="box-item">
                      <strong>CNPJ da Classe</strong>
                      <div className="divider"></div>
                      <span>50.750.438/0001-65</span>
                    </div>
                    <div className="box-item">
                      <strong>Possui Sublcasse?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    {/* se a subclasse for sim*/}
                    {/* <div className="box-item">
                      <strong>Nome da Subclasse</strong>
                      <div className="divider"></div>
                      <span>-</span>
                    </div>
                    <div className="box-item">
                      <strong>Código CVM da Subclasse</strong>
                      <div className="divider"></div>
                      <span>-</span>
                    </div> */}
                    <div className="box-item">
                      <strong>Possui Cogestão?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    {/* se a cogestão for sim*/}
                    {/* <div className="box-item">
                      <strong>Cogestor</strong>
                      <div className="divider"></div>
                      <span>-</span>
                    </div>

                    <div className="box-item">
                      <strong>CNPJ do Cogestor</strong>
                      <div className="divider"></div>
                      <span>-</span>
                    </div> */}
                  </div>
                </div>
              </div>
              <div className="box">
                <div className="box-title">
                  <h2>Condições de Investimento</h2>
                </div>
                <div className="box-content">
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Taxa Global composta por:</strong>
                      <div className="divider"></div>
                      <div className="double-item">
                        <span>Taxa de Administração</span>
                        <span>Taxa de Gestão</span>
                      </div>
                    </div>
                    <div className="box-item">
                      <strong>Forma de Remuneração da Taxa Global</strong>
                      <div className="divider"></div>
                      <span>Percentual do PL</span>
                    </div>
                    <div className="box-item">
                      <strong>% do PL</strong>
                      <div className="divider"></div>
                      <span>1,2500%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box">
                <div className="box-title">
                  <h2>Observação da Forma de Remuneração</h2>
                </div>
                <div className="box-content">
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Possui Taxa de Performance</strong>
                      <div className="divider"></div>
                      <span>Sim</span>
                    </div>
                    <div className="box-item">
                      <strong>Índice de Referência (Benchmark)</strong>
                      <div className="divider"></div>
                      <span>CDI</span>
                    </div>
                    <div className="box-item">
                      <strong>Descrição da Taxa de Performance</strong>
                      <div className="divider"></div>
                      <span>20% do que exceder o CDI a.a.</span>
                    </div>
                    <div className="box-item">
                      <strong>Cobra Taxa de Saída?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    <div className="box-item">
                      <strong>Possui Carência para Resgate?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    <div className="box-item">
                      <strong>Prevê uso de Side Pocket?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    <div className="box-item">
                      <strong>Prevê Aplicação ou Resgate em Ativos?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    <div className="box-item">
                      <strong>Prevê Barreira aos Resgates?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    <p className="obs">
                      Side Pocket: cisão da parcela excepcionalmente ilíquida dos ativos da classe
                    </p>
                  </div>
                  <div className="box-content-row"></div>
                </div>
              </div>
              <div className="box">
                <div className="box-title">
                  <h2>Outras Observações</h2>
                </div>
                <div className="box-content">
                  <div className="box-content-row">
                    <p className="obs">
                      1 - O conteúdo deste "Sumário de Remuneração dos Prestadores de Serviços"
                      reflete as informações mais atualizadas. Eventuais alterações e novos acordos
                      comerciais estabelecidos serão refletidos neste documento minimamente até o 5º
                      (quinto) dia útil do mês subsequente a sua celebração. Para mais informações
                      sobre o produto, leia o regulamento, anexo ou apêndice do fundo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/*FOOTER */}
            <div className="footer">
              <p className="obs">
                O conteúdo deste "Sumário de Remuneração dos Prestadores de Serviços" reflete as
                informações de remuneração da classe ou, quando aplicável, da subclasse oferecida ao
                investidor. Quaisquer alterações ou novos acordos comerciais firmados serão
                incorporados a este documento, no mínimo, até o 5º (quinto) dia útil do mês
                subsequente à sua celebração. Para mais detalhes sobre o produto, consulte o
                regulamento, a Lâmina de Informações Essenciais, o Formulário de Informações
                Complementares e o Prospecto dos fundos de investimento.
              </p>
              <div className="anbima">
                <img
                  src="https://storage.googleapis.com/docs.rizaasset.com/img/selo-anbima-gestao-recursos.svg"
                  alt="logo Autorregulação Anbima"
                />
              </div>
            </div>
          </div>
          {/* Página A4 - 2 */}
          <div className="a4-sheet">
            {/* HEADER */}
            <div className="page-head">
              <div className="page-header">
                <div className="month-ref">
                  <h3>Mês Referência</h3>
                  <div className="date-ref">
                    <span>{month}</span>
                    <div className="bar"></div>
                    <span>{year}</span>
                  </div>
                </div>
                <div className="logo">
                  <img
                    src="https://storage.googleapis.com/docs.rizaasset.com/img/logo-riza.png"
                    alt="Logo Riza"
                  />
                </div>
              </div>
              <p className="obs">
                As informações deste sumário estão atualizadas e referem-se ao mês em que ocorreram
                as últimas alterações dos acordos.
              </p>
            </div>
            {/* CONTENT */}
            <div className="content">
              <div className="content-title">
                <h1>Remuneração de Administração Fiduciária</h1>
              </div>
              <div className="box">
                <div className="box-title">
                  <h2>Taxa de Administração Fiduciária</h2>
                </div>
                <div className="box-content">
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Forma de Remuneração</strong>
                      <div className="divider"></div>
                      <span>Percentual do PL</span>
                    </div>
                    <div className="box-item">
                      <strong>Percentual do PL</strong>
                      <div className="divider"></div>
                      <span>0,1000%</span>
                    </div>
                    <div className="box-item">
                      <strong>Forma de pagamento</strong>
                      <div className="divider"></div>
                      <span>Parcela da Taxa Global</span>
                    </div>
                  </div>
                  {/* <div className="box-content-row">
                    <div className="box-item">
                      <strong>Administrador Fiduciário</strong>
                      <div className="divider"></div>
                      <span>
                        XP INVESTIMENTOS CORRETORA DE CAMBIO, TITULOS E VALORES MOBILIARIOS S/A
                      </span>
                    </div>
                    <div className="box-item">
                      <strong>CNPJ do Administrador</strong>
                      <div className="divider"></div>
                      <span>02.332.886/0001-04</span>
                    </div>
                  </div> */}
                </div>
              </div>
              {/* <div className="box">
                <div className="box-title">
                  <h2>Características da Classe/Subclasse</h2>
                </div>
                <div className="box-content">
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Fundo</strong>
                      <div className="divider"></div>
                      <span>Riza Domus Fundo de Investimento Imobiliário</span>
                    </div>
                    <div className="box-item">
                      <strong>CNPJ</strong>
                      <div className="divider"></div>
                      <span>50.750.438/0001-65</span>
                    </div>
                  </div>
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Público Alvo</strong>
                      <div className="divider"></div>
                      <span> Investidores em Geral </span>
                    </div>
                    <div className="box-item">
                      <strong>Categoria</strong>
                      <div className="divider"></div>
                      <span>FII</span>
                    </div>
                    <div className="box-item">
                      <strong>Tipo de Classe</strong>
                      <div className="divider"></div>
                      <span>-</span>
                    </div>
                  </div>
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Nome da Classe</strong>
                      <div className="divider"></div>
                      <span> Riza Domus Fundo de Investimento Imobiliário </span>
                    </div>
                    <div className="box-item">
                      <strong>CNPJ da Classe</strong>
                      <div className="divider"></div>
                      <span>50.750.438/0001-65</span>
                    </div>
                    <div className="box-item">
                      <strong>Possui Sublcasse?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    <div className="box-item">
                      <strong>Nome da Subclasse</strong>
                      <div className="divider"></div>
                      <span>-</span>
                    </div>
                    <div className="box-item">
                      <strong>Código CVM da Subclasse</strong>
                      <div className="divider"></div>
                      <span>-</span>
                    </div>
                    <div className="box-item">
                      <strong>Possui Cogestão?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    <div className="box-item">
                      <strong>Cogestor</strong>
                      <div className="divider"></div>
                      <span>-</span>
                    </div>

                    <div className="box-item">
                      <strong>CNPJ do Cogestor</strong>
                      <div className="divider"></div>
                      <span>-</span>
                    </div>
                  </div>
                </div>
              </div> */}
              {/* <div className="box">
                <div className="box-title">
                  <h2>Condições de Investimento</h2>
                </div>
                <div className="box-content">
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Taxa Global composta por:</strong>
                      <div className="divider"></div>
                      <div className="double-item">
                        <span>Taxa de Administração</span>
                        <span>Taxa de Gestão</span>
                      </div>
                    </div>
                    <div className="box-item">
                      <strong>Forma de Remuneração da Taxa Global</strong>
                      <div className="divider"></div>
                      <span>Percentual do PL</span>
                    </div>
                    <div className="box-item">
                      <strong>% do PL</strong>
                      <div className="divider"></div>
                      <span>1,2500%</span>
                    </div>
                  </div>
                </div>
              </div> */}
              {/* <div className="box">
                <div className="box-title">
                  <h2>Observação da Forma de Remuneração</h2>
                </div>
                <div className="box-content">
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Possui Taxa de Performance</strong>
                      <div className="divider"></div>
                      <span>Sim</span>
                    </div>
                    <div className="box-item">
                      <strong>Índice de Referência (Benchmark)</strong>
                      <div className="divider"></div>
                      <span>CDI</span>
                    </div>
                    <div className="box-item">
                      <strong>Descrição da Taxa de Performance</strong>
                      <div className="divider"></div>
                      <span>20% do que exceder o CDI a.a.</span>
                    </div>
                    <div className="box-item">
                      <strong>Cobra Taxa de Saída?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    <div className="box-item">
                      <strong>Possui Carência para Resgate?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    <div className="box-item">
                      <strong>Prevê uso de Side Pocket?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    <div className="box-item">
                      <strong>Prevê Aplicação ou Resgate em Ativos?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    <div className="box-item">
                      <strong>Prevê Barreira aos Resgates?</strong>
                      <div className="divider"></div>
                      <span>Não</span>
                    </div>
                    <p className="obs">
                      Side Pocket: cisão da parcela excepcionalmente ilíquida dos ativos da classe
                    </p>
                  </div>
                  <div className="box-content-row"></div>
                </div>
              </div> */}
              {/* <div className="box">
                <div className="box-title">
                  <h2>Outras Observações</h2>
                </div>
                <div className="box-content">
                  <div className="box-content-row">
                    <p className="obs">
                      1 - O conteúdo deste "Sumário de Remuneração dos Prestadores de Serviços"
                      reflete as informações mais atualizadas. Eventuais alterações e novos acordos
                      comerciais estabelecidos serão refletidos neste documento minimamente até o 5º
                      (quinto) dia útil do mês subsequente a sua celebração. Para mais informações
                      sobre o produto, leia o regulamento, anexo ou apêndice do fundo.
                    </p>
                  </div>
                </div>
              </div> */}
            </div>
            {/*FOOTER */}
            <div className="footer">
              <p className="obs">
                O conteúdo deste "Sumário de Remuneração dos Prestadores de Serviços" reflete as
                informações de remuneração da classe ou, quando aplicável, da subclasse oferecida ao
                investidor. Quaisquer alterações ou novos acordos comerciais firmados serão
                incorporados a este documento, no mínimo, até o 5º (quinto) dia útil do mês
                subsequente à sua celebração. Para mais detalhes sobre o produto, consulte o
                regulamento, a Lâmina de Informações Essenciais, o Formulário de Informações
                Complementares e o Prospecto dos fundos de investimento.
              </p>
              <div className="anbima">
                <img
                  src="https://storage.googleapis.com/docs.rizaasset.com/img/selo-anbima-gestao-recursos.svg"
                  alt="logo Autorregulação Anbima"
                />
              </div>
            </div>
          </div>
          {/* Página A4 - 3 */}
          <div className="a4-sheet">
            {/* HEADER */}
            <div className="page-head">
              <div className="page-header">
                <div className="month-ref">
                  <h3>Mês Referência</h3>
                  <div className="date-ref">
                    <span>{month}</span>
                    <div className="bar"></div>
                    <span>{year}</span>
                  </div>
                </div>
                <div className="logo">
                  <img
                    src="https://storage.googleapis.com/docs.rizaasset.com/img/logo-riza.png"
                    alt="Logo Riza"
                  />
                </div>
              </div>
              <p className="obs">
                As informações deste sumário estão atualizadas e referem-se ao mês em que ocorreram
                as últimas alterações dos acordos.
              </p>
            </div>
            {/* CONTENT */}
            <div className="content">
              <div className="content-title">
                <h1>Remuneração de Distribuidores e Gestores</h1>
              </div>
              {/* Acordo 1 */}
              <div className="box">
                <div className="box-title">
                  <h2>Lista de Distribuidores Contratados</h2>
                </div>
                <div className="box-content">
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>CNPJ</strong>
                      <div className="divider"></div>
                      <span>02.332.886/0001-04 </span>
                    </div>
                    <div className="box-item">
                      <strong>Distribuidor</strong>
                      <div className="divider"></div>
                      <span>
                        XP INVESTIMENTOS CORRETORA DE CAMBIO, TITULOS E VALORES MOBILIARIOS S/A
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box">
                <div className="box-title">
                  <h2>Acordos Comerciais Entre o Gestor e os Distribuidores</h2>
                </div>
                <div className="box-subtitle">
                  <h3>Acordo Comercial 1</h3>
                </div>
                {/* bloco 1 */}
                <div className="box-content">
                  <div className="box-content-title">
                    <h4>Percentual do PL</h4>
                  </div>
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Taxa Distribuidor</strong>
                      <div className="divider"></div>
                      <span> 0,2300% </span>
                    </div>
                    <div className="box-item">
                      <strong>Taxa Gestor</strong>
                      <div className="divider"></div>
                      <span>0,9200%</span>
                    </div>
                    <div className="box-item">
                      <strong>Distribuidor Recebe Parcela da Taxa de Performance?</strong>
                      <div className="divider"></div>
                      <span> Sim </span>
                    </div>
                    <div className="box-item">
                      <strong>Parcela da Taxa de Performance Distribuidor</strong>
                      <div className="divider"></div>
                      <span>20,0000%</span>
                    </div>
                    <div className="box-item">
                      <strong>Parcela da Taxa de Performance Gestor</strong>
                      <div className="divider"></div>
                      <span>80,0000%</span>
                    </div>
                  </div>
                </div>
                {/* bloco 2 */}
                <div className="box-content">
                  <div className="box-content-title">
                    <h4>Simulação de Cenários</h4>
                  </div>
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Benchmark</strong>
                      <div className="divider"></div>
                      <span> CDI </span>
                    </div>
                    <div className="box-item">
                      <strong>Taxa de Performance</strong>
                      <div className="divider"></div>
                      <span>20% do que exceder o CDI</span>
                    </div>
                  </div>
                </div>
                {/* bloco 3 */}
                <div className="box-content">
                  <div className="box-content-title">
                    <h4>Cenário com Apropriação de Taxa de Performance</h4>
                  </div>
                  <p className="obs">
                    Rentabilidade de 2% (em termos absolutos) acima da rentabilidade do índice de
                    referência utilizado como base no cálculo da taxa de performance da classe.
                  </p>
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Remuneração Distribuidor</strong>
                      <div className="divider"></div>
                      <span> 0,4000% </span>
                    </div>
                    <div className="box-item">
                      <strong>Remuneração Gestor</strong>
                      <div className="divider"></div>
                      <span>1,6000%</span>
                    </div>
                  </div>
                </div>

                {/* bloco 4 */}
                <div className="box-content">
                  <div className="box-content-title">
                    <h4>Cenário sem Apropriação de Taxa de Performance</h4>
                  </div>
                  <p className="obs">
                    Rentabilidade de 2% (em termos absolutos) abaixo da rentabilidade do índice de
                    referência utilizado como base no cálculo da taxa de performance da classe.
                  </p>
                  <div className="box-content-row">
                    <div className="box-item">
                      <strong>Remuneração Distribuidor</strong>
                      <div className="divider"></div>
                      <span>0,0000%</span>
                    </div>
                    <div className="box-item">
                      <strong>Remuneração Gestor</strong>
                      <div className="divider"></div>
                      <span>0,0000%</span>
                    </div>
                  </div>
                  <p className="obs">
                    Esta simulação trata meramente de informações ilustrativas acerca da remuneração
                    do Gestor de Recursos e do Distribuidor com o objetivo de ilustrar cenários
                    hipótese de rentabilidade de classe/subclasse, sem vinculação aos valores
                    efetivamente recebidos no âmbito da remuneração desta classe/subclasse.
                  </p>
                </div>
              </div>
            </div>
            {/*FOOTER */}
            <div className="footer">
              <p className="obs">
                O conteúdo deste "Sumário de Remuneração dos Prestadores de Serviços" reflete as
                informações de remuneração da classe ou, quando aplicável, da subclasse oferecida ao
                investidor. Quaisquer alterações ou novos acordos comerciais firmados serão
                incorporados a este documento, no mínimo, até o 5º (quinto) dia útil do mês
                subsequente à sua celebração. Para mais detalhes sobre o produto, consulte o
                regulamento, a Lâmina de Informações Essenciais, o Formulário de Informações
                Complementares e o Prospecto dos fundos de investimento.
              </p>
              <div className="anbima">
                <img
                  src="https://storage.googleapis.com/docs.rizaasset.com/img/selo-anbima-gestao-recursos.svg"
                  alt="logo Autorregulação Anbima"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
