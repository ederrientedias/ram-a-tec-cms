import '../styles/summary.css';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { InformationalTransparencyService, ISummaryProps, } from '@/services/informational-transparency.service';
import LoadingSavingFileAnimation from '@/components/animations/loadinfSavingFile';
import LoadingFindDataAnimation from '@/components/animations/loadingFinddata';
import { IAnbimaSummaryData, IFundResponse } from '@/models/salesforce.model';
import LoadingPageAnimation from '@/components/animations/loadingPage';
import LoadingDocAnimation from '@/components/animations/loadingDoc';
import Loading404Animation from '@/components/animations/loading404';
import { ICreatePDFProps, ISelectedFund } from '@/models/pdf.model';
import { useCallback, useEffect, useRef, useState } from 'react';
import salesforceService from '@/services/salesforce.service';
import { useRizaFunds } from '@/hooks/use-riza-funds';
import { getMonthAndYear } from '@/utils/month-year';
import fundsService from '@/services/funds.service';
import pdfService from '@/services/pdf.service';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IFund } from '@/models/funds.model';
import { toast } from 'sonner';

import { Style } from '../styles/summary';


interface FeeLabels {
  administrationFee: number | null;
  managementFee: number | null;
  distributionFee: number | null;
  pensionStructuringFee: number | null;
}

export const InformationalTransparency = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { month, year } = getMonthAndYear();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAnbimaSummary, setIsLoadingAnbimaSummary] = useState(false);
  const [isLoadingSavingFile, setIsLoadingSavingFile] = useState(false);
  const [selectedFund, setSelectedFund] = useState<ISelectedFund | null>(null);
  const [fundRef, setFundRef] = useState<IFund | null>(null);
  const [anbimaSummary, setAnbimaSummary] = useState<IAnbimaSummaryData | null>(null);
  const { data: rizaFunds, isLoading: isLoadingFunds, error: errorFunds } = useRizaFunds();

  const getAnbimaSummary = useCallback(async (id: string) => {
    const data = await salesforceService.getSummaryById(id);
    setAnbimaSummary(data);
    setIsLoadingAnbimaSummary(false);
  }, []);

  const searchFundByName = useCallback(async () => {
    const funds = await fundsService.getFunds();
    const fund = funds.find((fund: any) => fund.name === selectedFund?.name);
    setFundRef(fund);
  }, [selectedFund]);

  const getFundRef = useCallback(
    async (fundId: string) => {
      const fund = await fundsService.getFundById(fundId);
      if (!fund) {
        await searchFundByName();
        return;
      }
      setFundRef(fund);
    },
    [searchFundByName]
  );

  const handleSelectedFund = useCallback(
    async (fund: IFundResponse) => {
      await Promise.all([getFundRef(fund.idFund), getAnbimaSummary(fund.id)]);
    },
    [getFundRef, getAnbimaSummary]
  );

  useEffect(() => {
    if (selectedFund) {
      handleSelectedFund(selectedFund);
    }
  }, [selectedFund, handleSelectedFund]);

  const handleSelectFund = async (fundId: string) => {
    setIsLoadingAnbimaSummary(true);
    const fund = rizaFunds?.find((fund: any) => fund.id === fundId);
    const idName = convertToNameID(fund?.name, fund?.id);
    setSelectedFund({ ...fund, idName });
  };

  const convertToNameID = (name: string, id: string) => {
    const values = [name.replace(/\s+/g, ''), id];
    return values.join('-');
  };

  const buildFeeDescriptionString = (fees: FeeLabels): string => {
    const feeLabels = [
      { key: 'administrationFee', label: 'Taxa de Administração' },
      { key: 'managementFee', label: 'Taxa de Gestão' },
      { key: 'distributionFee', label: 'Taxa de Distribuição' },
      { key: 'pensionStructuringFee', label: 'Taxa de Estruturação de Previdência' },
    ];

    const activeFees = feeLabels.filter(({ key }) => fees[key] !== null).map(({ label }) => label);

    return activeFees.join(',');
  };

  const formatPercentage = (number: number): string => {
    if (!number) return '-';
    const numeroFormatado = number.toFixed(4).replace('.', ',');
    return `${numeroFormatado}%`;
  };

  const scenarioSimulation = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Value must be a valid number');
    }
    const fee = (value * 0.02).toFixed(4);
    return `${fee}%`.replace('.', ',');
  };

  const isDistributionFee = (item: any) => {
    return item.percentualPL.taxaPerfDistribuidor && item.percentualPL.taxaPerfDistribuidor > 0
      ? true
      : false;
  };

  const handleGeneratePDF = async () => {
    if (!selectedFund) {
      toast('Selecione um fundo');
      return;
    }
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
        setIsLoading(false);
        setIsLoadingSavingFile(false);
        await handleInformationalTransparency(response.fileUrl);
      } else {
        console.error('🚫 Erro ao gerar o PDF:', response);
        setIsLoading(false);
        toast('Não foi possível gerar o PDF');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar o PDF:', error);
      setIsLoading(false);
      toast('Não foi possível gerar o PDF');
    }
  };

  const handleInformationalTransparency = async (url: string) => {
    const summaryProps: ISummaryProps = {
      idName: selectedFund?.idName,
      anbimaSummary,
      selectedFund,
      fundRef,
      month,
      year: String(year),
      fileUrl: url,
    };

    await new InformationalTransparencyService(summaryProps)
      .execute()
      .then((response) => {
        setIsLoadingSavingFile(false);
        toast('Sumário gerado com sucesso');
      })
      .catch((error) => {
        console.log(error);
        toast('Não foi possível gerar o sumário');
        setIsLoading(false);
      });
  };

  if (isLoadingFunds) return <LoadingPageAnimation />;
  if (errorFunds) return <Loading404Animation />;

  return (
    <div className="space-y-6">
      <div className="w-full bg-rz-white sticky top-0 z-10">
        <div className="flex items-center justify-start p-3">
          <h1 className="text-2xl font-medium font-serif text-rz-black">
            Gerador de Sumário ANBIMA
          </h1>
        </div>
        {/* Header    */}
        <div className="w-full flex items-center justify-between bg-rz-white  p-6   transition-all duration-300">
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
          <Button onClick={handleGeneratePDF} disabled={!selectedFund ? true : false}>
            {isLoading ? 'Gerando...' : 'Gerar PDF'}
          </Button>
        </div>
      </div>
      {/* Content */}
      {(!selectedFund && !isLoadingAnbimaSummary && !isLoading && !isLoadingSavingFile && (
        <div className="w-full h-96 flex items-center justify-center">
          <h1 className="text-zinc-950 font-semibold text-base">
            Selecione um fundo para gerar o sumário ANBIMA
          </h1>
        </div>
      )) ||
        (selectedFund && isLoadingAnbimaSummary && <LoadingFindDataAnimation />) ||
        (selectedFund &&
          !isLoadingAnbimaSummary &&
          anbimaSummary &&
          !isLoading &&
          !isLoadingSavingFile && (
            <div ref={contentRef} className="w-full flex flex-col items-center gap-4">
              {/* Página A4 - Informações Gerais */}
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
                    As informações deste sumário estão atualizadas e referem-se ao mês em que
                    ocorreram as últimas alterações dos acordos.
                  </p>
                </div>
                {/* CONTENT */}
                <div className="content">
                  <div className="content-title">
                    <h1>Informações Gerais</h1>
                  </div>
                  {/* Bloco - Prestadores de Serviços Essenciais */}
                  <div className="box">
                    <div className="box-title">
                      <h2>Prestadores de Serviços Essenciais</h2>
                    </div>
                    <div className="box-content">
                      <div className="box-content-row">
                        <div className="box-item">
                          <strong>Gestor de Recursos</strong>
                          <div className="divider"></div>
                          <span>{anbimaSummary?.gestor?.nome || '-'}</span>
                        </div>
                        <div className="box-item">
                          <strong>CNPJ do Gestor</strong>
                          <div className="divider"></div>
                          <span>{anbimaSummary?.gestor?.cnpj || '-'}</span>
                        </div>
                        <div className="box-item">
                          <strong>Administrador Fiduciário</strong>
                          <div className="divider"></div>
                          <span>{anbimaSummary?.administrador?.nome || '-'}</span>
                        </div>
                        <div className="box-item">
                          <strong>CNPJ do Administrador</strong>
                          <div className="divider"></div>
                          <span>{anbimaSummary?.administrador?.cnpj || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloco - Características da Classe/Subclasse */}
                  <div className="box">
                    <div className="box-title">
                      <h2>Características da Classe/Subclasse</h2>
                    </div>
                    <div className="box-content">
                      <div className="box-content-row">
                        <div className="box-item">
                          <strong>Fundo</strong>
                          <div className="divider"></div>
                          <span>{anbimaSummary?.fundo?.nome || '-'}</span>
                        </div>
                        <div className="box-item">
                          <strong>CNPJ</strong>
                          <div className="divider"></div>
                          <span>{anbimaSummary?.fundo?.cnpj || '-'}</span>
                        </div>
                        <div className="box-item">
                          <strong>Público Alvo</strong>
                          <div className="divider"></div>
                          <span> {anbimaSummary?.publicoAlvo || '-'} </span>
                        </div>
                        <div className="box-item">
                          <strong>Categoria</strong>
                          <div className="divider"></div>
                          <span>{anbimaSummary?.categoria || '-'}</span>
                        </div>
                      </div>
                      <div className="box-content-row">
                        <div className="box-item">
                          <strong>Nome da Classe</strong>
                          <div className="divider"></div>
                          <span> {anbimaSummary?.classe?.nome || '-'} </span>
                        </div>
                        <div className="box-item">
                          <strong>CNPJ da Classe</strong>
                          <div className="divider"></div>
                          <span>{anbimaSummary?.classe?.cnpj || '-'}</span>
                        </div>
                        <div className="box-item">
                          <strong>Possui Subclasse?</strong>
                          <div className="divider"></div>
                          <span>{!anbimaSummary?.subclasses ? 'Não' : 'Sim'}</span>
                        </div>
                        <div className="box-item">
                          <strong>Possui Cogestão?</strong>
                          <div className="divider"></div>
                          <span>{!anbimaSummary?.cogestor ? 'Não' : 'Sim'}</span>
                        </div>
                        {/* se subclasse for sim*/}
                        {anbimaSummary?.subclasses &&
                          anbimaSummary?.subclasses?.map((item) => {
                            return (
                              <>
                                <div key={item?.nome} className="box-item">
                                  <strong>Nome da Subclasse</strong>
                                  <div className="divider"></div>
                                  <span>{item?.nome || '-'}</span>
                                </div>
                                <div key={item?.codigoCVM} className="box-item">
                                  <strong>Código CVM da Subclasse</strong>
                                  <div className="divider"></div>
                                  <span>{item?.codigoCVM || '-'}</span>
                                </div>
                              </>
                            );
                          })}

                        {/* se cogestão for sim*/}
                        {anbimaSummary?.cogestor &&
                          anbimaSummary?.cogestor.map((item) => {
                            return (
                              <>
                                <div key={item?.nome} className="box-item">
                                  <strong>Cogestor</strong>
                                  <div className="divider"></div>
                                  <span>{item?.nome || '-'}</span>
                                </div>

                                <div key={item?.cnpj} className="box-item">
                                  <strong>CNPJ do Cogestor</strong>
                                  <div className="divider"></div>
                                  <span>{item?.cnpj || '-'}</span>
                                </div>
                              </>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                  {/* Bloco - Condições de Investimento */}
                  <div className="box">
                    <div className="box-title">
                      <h2>Condições de Investimento</h2>
                    </div>
                    <div className="box-content">
                      <div className="box-content-row">
                        <div className="box-item">
                          <strong>Taxa Global composta por</strong>
                          <div className="divider"></div>
                          <div className="double-item">
                            <span>
                              {buildFeeDescriptionString({
                                administrationFee: anbimaSummary?.taxaAdministracao,
                                managementFee: anbimaSummary?.taxaGestao,
                                distributionFee: anbimaSummary?.taxaDistribuicao,
                                pensionStructuringFee: anbimaSummary?.taxaEstruturacaoPrevidencia,
                              }) || '-'}
                            </span>
                          </div>
                        </div>
                        <div className="box-item">
                          <strong>Forma de Remuneração da Taxa Global</strong>
                          <div className="divider"></div>
                          <span>{anbimaSummary?.formasRemuneracao?.percentualPL?.tipo || '-'}</span>
                        </div>
                        <div className="box-item">
                          <strong>% do PL</strong>
                          <div className="divider"></div>
                          <span>
                            {formatPercentage(anbimaSummary?.valorRemuneracaoTaxaGlobal) || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Observação da Forma de Remuneração */}
                  <div className="box">
                    <div className="box-title">
                      <h2>Observação da Forma de Remuneração</h2>
                    </div>
                    <div className="box-content">
                      <div className="box-content-row">
                        <div className="box-item">
                          <strong>Possui Taxa de Performance</strong>
                          <div className="divider"></div>
                          <span>{!anbimaSummary?.taxaPerformance ? 'Não' : 'Sim'}</span>
                        </div>
                        <div className="box-item">
                          <strong>Índice de Referência (Benchmark)</strong>
                          <div className="divider"></div>
                          <span>
                            {anbimaSummary?.taxaPerformance?.indiceTaxaPerformance || '-'}
                          </span>
                        </div>
                        <div className="box-item">
                          <strong>Descrição da Taxa de Performance</strong>
                          <div className="divider"></div>
                          <span>
                            {anbimaSummary?.taxaPerformance?.descricaoTaxaPerformance || '-'}
                          </span>
                        </div>
                        <div className="box-item">
                          <strong>Cobra Taxa de Saída?</strong>
                          <div className="divider"></div>
                          <span>{!anbimaSummary?.taxaSaida ? 'Não' : 'Sim'}</span>
                        </div>
                        <div className="box-item">
                          <strong>Possui Carência para Resgate?</strong>
                          <div className="divider"></div>
                          <span>{!anbimaSummary?.carenciaResgate ? 'Não' : 'Sim'}</span>
                        </div>
                        <div className="box-item">
                          <strong>Prevê uso de Side Pocket?</strong>
                          <div className="divider"></div>
                          <span>{!anbimaSummary?.sidePocket ? 'Não' : 'Sim'}</span>
                        </div>
                        <div className="box-item">
                          <strong>Prevê Aplicação ou Resgate em Ativos?</strong>
                          <div className="divider"></div>
                          <span>{!anbimaSummary?.aplicacaoOuResgateAtivos ? 'Não' : 'Sim'}</span>
                        </div>
                        <div className="box-item">
                          <strong>Prevê Barreira aos Resgates?</strong>
                          <div className="divider"></div>
                          <span>{!anbimaSummary.descricaoBarreiraDeResgate ? 'Não' : 'Sim'}</span>
                        </div>
                        {anbimaSummary?.descricaoBarreiraDeResgate && (
                          <div className="box-item">
                            <strong>Descrição da Barreira</strong>
                            <div className="divider"></div>
                            <span>{anbimaSummary?.descricaoBarreiraDeResgate || '-'}</span>
                          </div>
                        )}

                        <p className="obs">
                          Side Pocket: cisão da parcela excepcionalmente ilíquida dos ativos da
                          classe
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Outras Observações */}
                  {anbimaSummary?.outrasObservacoes && (
                    <div className="box">
                      <div className="box-title">
                        <h2>Outras Observações</h2>
                      </div>
                      <div className="box-content">
                        <div className="box-content-row">
                          <p className="obs">{anbimaSummary?.outrasObservacoes || '-'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/*FOOTER */}
                <div className="footer">
                  <p className="obs">
                    O conteúdo deste "Sumário de Remuneração dos Prestadores de Serviços" reflete as
                    informações de remuneração da classe ou, quando aplicável, da subclasse
                    oferecida ao investidor. Quaisquer alterações ou novos acordos comerciais
                    firmados serão incorporados a este documento, no mínimo, até o 5º (quinto) dia
                    útil do mês subsequente à sua celebração. Para mais detalhes sobre o produto,
                    consulte o regulamento, a Lâmina de Informações Essenciais, o Formulário de
                    Informações Complementares e o Prospecto dos fundos de investimento.
                  </p>
                  <div className="anbima">
                    <img
                      src="https://storage.googleapis.com/docs.rizaasset.com/img/art-gestao.jpg"
                      alt="Selo Anbima gestão de recursos permanente"
                    />
                  </div>
                </div>
              </div>

              {/* Página A4 - Remuneração de Administração Fiduciária */}
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
                    As informações deste sumário estão atualizadas e referem-se ao mês em que
                    ocorreram as últimas alterações dos acordos.
                  </p>
                </div>
                {/* CONTENT */}
                <div className="content">
                  <div className="content-title">
                    <h1>Remuneração de Administração Fiduciária</h1>
                  </div>
                  {/* Taxa de Administração Fiduciária< */}
                  <div className="box">
                    <div className="box-title">
                      <h2>Taxa de Administração Fiduciária</h2>
                    </div>
                    <div className="box-content">
                      {/* Bloco 1 */}
                      <div className="box-content-row">
                        <div className="box-item">
                          <strong>Forma de Remuneração</strong>
                          <div className="divider"></div>
                          <span>{anbimaSummary?.formaRemuneracaoTaxaGlobal || '-'}</span>
                        </div>
                        <div className="box-item">
                          <strong>Percentual do PL</strong>
                          <div className="divider"></div>
                          <span>
                            {formatPercentage(
                              anbimaSummary?.formasRemuneracao?.percentualPL?.valor
                            ) || '-'}
                          </span>
                        </div>
                        <div className="box-item">
                          <strong>Forma de pagamento</strong>
                          <div className="divider"></div>
                          <span>{anbimaSummary?.formasRemuneracao?.percentualPL?.tipo || '-'}</span>
                        </div>
                      </div>
                      {/* Bloco - Valor Fixo */}
                      {anbimaSummary?.formasRemuneracao?.valorFixo && (
                        <div className="box-content-row">
                          <div className="box-item">
                            <strong>Valor Fixo</strong>
                            <div className="divider"></div>
                            <span>{anbimaSummary?.formasRemuneracao?.valorFixo?.valor || '-'}</span>
                          </div>
                          <div className="box-item">
                            <strong>Forma de pagamento</strong>
                            <div className="divider"></div>
                            <span>{anbimaSummary?.formasRemuneracao?.valorFixo?.tipo || '-'}</span>
                          </div>
                        </div>
                      )}
                      {/* Bloco - Valor Mínimo */}
                      {anbimaSummary?.formasRemuneracao?.valorMinimo && (
                        <div className="box-content-row">
                          <div className="box-item">
                            <strong>Valor Mínimo</strong>
                            <div className="divider"></div>
                            <span>
                              {anbimaSummary?.formasRemuneracao?.valorMinimo?.valor || '-'}
                            </span>
                          </div>
                          <div className="box-item">
                            <strong>Forma de pagamento</strong>
                            <div className="divider"></div>
                            <span>
                              {anbimaSummary?.formasRemuneracao?.valorMinimo?.tipo || '-'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Lista de Distribuidores Contratados */}
                  <div className="box">
                    <div className="box-title">
                      <h2>Lista de Distribuidores Contratados</h2>
                    </div>
                    <div className="box-content-collumn">
                      {anbimaSummary?.distribuidores ? (
                        anbimaSummary.distribuidores?.map((item) => {
                          return (
                            <div key={item?.cnpj} className="block">
                              <div className="item">
                                <strong>Distribuidor</strong>
                                <div className="divider"></div>
                                <span>{item?.nome || '-'}</span>
                              </div>
                              <div className="item">
                                <strong>CNPJ</strong>
                                <div className="divider"></div>
                                <span>{item?.cnpj || '-'}</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="block">
                          <div className="item">
                            <strong>Distribuidor</strong>
                            <div className="divider"></div>
                            <span>Não há</span>
                          </div>
                          <div className="item">
                            <strong>CNPJ</strong>
                            <div className="divider"></div>
                            <span>Não há</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {!anbimaSummary.distribuidores && (
                  <div className="contact">
                    <strong>E-mail de Contato:</strong>
                    <span>{anbimaSummary?.emails.join(';')}</span>
                  </div>
                )}
                {/*FOOTER */}
                <div className="footer">
                  <p className="obs">
                    O conteúdo deste "Sumário de Remuneração dos Prestadores de Serviços" reflete as
                    informações de remuneração da classe ou, quando aplicável, da subclasse
                    oferecida ao investidor. Quaisquer alterações ou novos acordos comerciais
                    firmados serão incorporados a este documento, no mínimo, até o 5º (quinto) dia
                    útil do mês subsequente à sua celebração. Para mais detalhes sobre o produto,
                    consulte o regulamento, a Lâmina de Informações Essenciais, o Formulário de
                    Informações Complementares e o Prospecto dos fundos de investimento.
                  </p>
                  <div className="anbima">
                    <img
                      src="https://storage.googleapis.com/docs.rizaasset.com/img/art-gestao.jpg"
                      alt="Selo Anbima gestão de recursos permanente"
                    />
                  </div>
                </div>
              </div>

              {/* Página A4 - Remuneração de Distribuidores e Gestores */}
              {anbimaSummary?.acordosComerciais &&
                anbimaSummary?.acordosComerciais?.map((item, index) => {
                  return (
                    <div key={index} className="a4-sheet">
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
                          As informações deste sumário estão atualizadas e referem-se ao mês em que
                          ocorreram as últimas alterações dos acordos.
                        </p>
                      </div>
                      {/* CONTENT */}
                      <div className="content">
                        <div className="content-title">
                          <h1>Remuneração de Distribuidores e Gestores</h1>
                        </div>
                        {/* Acordo - Lista de Distribuidores Contratados */}
                        <div className="box">
                          <div className="box-title">
                            <h2>Acordos Comerciais Entre o Gestor e os Distribuidores</h2>
                          </div>
                          <div className="box-subtitle">
                            <h3>{`Acordo Comercial ${index + 1}`}</h3>
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
                                <span>
                                  {formatPercentage(item.percentualPL.taxaAdmDistribuidor) || '-'}
                                </span>
                              </div>
                              <div className="box-item">
                                <strong>Taxa Gestor</strong>
                                <div className="divider"></div>
                                <span>
                                  {formatPercentage(item.percentualPL.taxaAdmGestor) || '-'}
                                </span>
                              </div>
                              <div className="box-item">
                                <strong>Distribuidor Recebe Parcela da Taxa de Performance?</strong>
                                <div className="divider"></div>
                                <span>{isDistributionFee(item) ? 'Sim' : 'Não'}</span>
                              </div>
                              {isDistributionFee(item) ? (
                                <>
                                  <div className="box-item">
                                    <strong>Parcela da Taxa de Performance Distribuidor</strong>
                                    <div className="divider"></div>
                                    <span>
                                      {formatPercentage(item.percentualPL.taxaPerfDistribuidor) ||
                                        '-'}
                                    </span>
                                  </div>
                                  <div className="box-item">
                                    <strong>Parcela da Taxa de Performance Gestor</strong>
                                    <div className="divider"></div>
                                    <span>
                                      {formatPercentage(item.percentualPL.taxaPerfGestor) || '-'}
                                    </span>
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </div>
                          {/* bloco 2 - Simulação de Cenários */}
                          <div className="box-content">
                            <div className="box-content-title">
                              <h4>Simulação de Cenários</h4>
                            </div>
                            <div className="box-content-row">
                              <div className="box-item">
                                <strong>Benchmark</strong>
                                <div className="divider"></div>
                                <span>
                                  {anbimaSummary?.taxaPerformance?.indiceTaxaPerformance || '-'}
                                </span>
                              </div>
                              <div className="box-item">
                                <strong>Taxa de Performance</strong>
                                <div className="divider"></div>
                                <span>
                                  {anbimaSummary?.taxaPerformance?.descricaoTaxaPerformance || '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* bloco 3 - Cenário com Apropriação de Taxa de Performance */}
                          <div className="box-content">
                            <div className="box-content-title">
                              <h4>Cenário com Apropriação de Taxa de Performance</h4>
                            </div>
                            <p className="obs">
                              Rentabilidade de 2% (em termos absolutos) acima da rentabilidade do
                              índice de referência utilizado como base no cálculo da taxa de
                              performance da classe.
                            </p>
                            <div className="box-content-row">
                              <div className="box-item">
                                <strong>Remuneração Distribuidor</strong>
                                <div className="divider"></div>
                                <span>
                                  {scenarioSimulation(item.percentualPL?.taxaPerfDistribuidor) ||
                                    '-'}
                                </span>
                              </div>
                              <div className="box-item">
                                <strong>Remuneração Gestor</strong>
                                <div className="divider"></div>
                                <span>
                                  {scenarioSimulation(item.percentualPL?.taxaPerfGestor) || '-'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* bloco 4 - Cenário sem Apropriação de Taxa de Performance */}
                          <div className="box-content">
                            <div className="box-content-title">
                              <h4>Cenário sem Apropriação de Taxa de Performance</h4>
                            </div>
                            <p className="obs">
                              Rentabilidade de 2% (em termos absolutos) abaixo da rentabilidade do
                              índice de referência utilizado como base no cálculo da taxa de
                              performance da classe.
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
                              Esta simulação trata meramente de informações ilustrativas acerca da
                              remuneração do Gestor de Recursos e do Distribuidor com o objetivo de
                              ilustrar cenários hipótese de rentabilidade de classe/subclasse, sem
                              vinculação aos valores efetivamente recebidos no âmbito da remuneração
                              desta classe/subclasse.
                            </p>
                            <p className="obs">As taxas desse sumário estão expressas ao ano.</p>
                          </div>
                          {/* bloco 5 - Outras Receitas Recebidas Pelo Distribuidor Pagas Diretamente Pelos Essenciais */}
                          {item?.outrasReceitas && (
                            <div className="box-content">
                              <div className="box-content-title">
                                <h4>
                                  Outras Receitas Recebidas Pelo Distribuidor Pagas Diretamente
                                  Pelos Essenciais
                                </h4>
                              </div>
                              <p className="obs">{item.outrasReceitas}</p>
                            </div>
                          )}
                          {/* bloco 6 - Condições Complentares Sobre a Forma de Remuneração do Distribuidor */}
                          {item.condicoesComplementares && (
                            <div className="box-content">
                              <div className="box-content-title">
                                <h4>
                                  Condições Complentares Sobre a Forma de Remuneração do
                                  Distribuidor
                                </h4>
                              </div>
                              <p className="obs">{item.condicoesComplementares}</p>
                            </div>
                          )}
                          {/* bloco 7 - Outras Observações */}
                          {item.obs && (
                            <div className="box-content">
                              <div className="box-content-title">
                                <h4>Outras Observações</h4>
                              </div>
                              <p className="obs">{item.obs}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {anbimaSummary.distribuidores.length - 1 === index && (
                        <div className="contact">
                          <strong>E-mail de Contato:</strong>
                          <span>{anbimaSummary?.emails.join(';')}</span>
                        </div>
                      )}

                      {/*FOOTER */}
                      <div className="footer">
                        <p className="obs">
                          O conteúdo deste "Sumário de Remuneração dos Prestadores de Serviços"
                          reflete as informações de remuneração da classe ou, quando aplicável, da
                          subclasse oferecida ao investidor. Quaisquer alterações ou novos acordos
                          comerciais firmados serão incorporados a este documento, no mínimo, até o
                          5º (quinto) dia útil do mês subsequente à sua celebração. Para mais
                          detalhes sobre o produto, consulte o regulamento, a Lâmina de Informações
                          Essenciais, o Formulário de Informações Complementares e o Prospecto dos
                          fundos de investimento.
                        </p>
                        <div className="anbima">
                          <img
                            src="https://storage.googleapis.com/docs.rizaasset.com/img/art-gestao.jpg"
                            alt="Selo Anbima gestão de recursos permanente"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )) ||
        (isLoading && !isLoadingSavingFile && <LoadingDocAnimation />) ||
        (!isLoading && isLoadingSavingFile && <LoadingSavingFileAnimation />)}
    </div>
  );
};
