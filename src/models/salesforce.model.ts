export interface ISalesforceRizaFundsResponse {
  success: boolean;
  data: Data[];
}

export interface Data {
  id: string;
  name: string;
  isWebsite: boolean;
  idFund: string;
}

/**
 *
 */
export interface FundData {
  mesReferencia: string;
  gestor: EntidadeCNPJ;
  administrador: EntidadeCNPJ;
  fundo: EntidadeCNPJ;
  publicoAlvo: string;
  categoria: string;
  classe: EntidadeCNPJ;
  subclasses: Subclasse[];
  cogestor: EntidadeCNPJ;
  taxaAdministracao: number;
  taxaGestao: number;
  taxaDistribuicao: number;
  taxaEstruturacaoPrevidencia: number;
  formaRemuneracaoTaxaGlobal: 'Valor Fixo' | 'Percentual do PL' | 'Valor Mínimo' | 'Outros';
  valorRemuneracaoTaxaGlobal: number;
  obsFormaRemuneracao: string;
  taxaPerformance: TaxaPerformance | null;
  investimentoInicialMinimo: number;
  movimentacaoMinima: number;
  saldoMinimoPermanencia: number;
  cotizacaoAplicacao: string;
  cotizacaoResgate: string;
  pagamentoResgate: string;
  taxaSaida: number;
  carenciaResgate: CarenciaResgate | null;
  sidePocket: boolean;
  aplicacaoOuResgateAtivos: boolean;
  descricaoBarreiraDeResgate: string | null;
  outrasObservacoes: string;
  formasRemuneração: FormasRemuneracao;
  obsTaxasAdministracao: string;
  taxaAdmDistribuidores: EntidadeCNPJ[];
  acordosComerciais: AcordoComercial[];
  emails: string[]; // Deve conter pelo menos 1 email
}

export interface EntidadeCNPJ {
  nome: string;
  cnpj: string;
}

export interface Subclasse {
  nome: string;
  codigoCVM: string;
}

export interface TaxaPerformance {
  indiceTaxaPerformance: string;
  descricaoTaxaPerformance: string;
  valorTaxaPerformance: number;
}

export interface CarenciaResgate {
  tipoDias: 'Úteis' | 'Corridos';
  dias: number;
}

export interface FormaRemuneracaoBase {
  valor: number;
  tipo: 'Classe/Subclasse' | 'Parcela da Taxa Global';
}

export interface FaixaRemuneracao {
  faixaAtual: boolean;
  de: number;
  ate: number;
  valor: number;
  taxa: number;
  obs: string;
}

export interface FormasRemuneracao {
  valorMinimo: FormaRemuneracaoBase | null;
  valorFixo: FormaRemuneracaoBase | null;
  percentualPL: FormaRemuneracaoBase | null;
  volumeSobAdministracao: FaixaRemuneracao[] | null;
  faixaPorPL: FaixaRemuneracao[] | null;
}

export interface TaxasAcordoComercial {
  taxaAdmDistribuidor: number;
  taxaAdmGestor: number;
  taxaPerfDistribuidor: number;
  taxaPerfGestor: number;
  taxaAdmCogestor: number;
}

export interface AcordoComercial {
  fixo: TaxasAcordoComercial;
  minimo: TaxasAcordoComercial;
  percentualPL: TaxasAcordoComercial;
  taxaPerformance: TaxasAcordoComercial | null;
  outrasReceitas: string;
  condicoesComplementares: string;
  obs: string;
}
