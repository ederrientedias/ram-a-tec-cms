/**
 * Interface de resposta do método GET fundos Riza
 */

export interface IRizaFundsResponse {
  success: boolean;
  data: IFundResponse[];
}
export interface IFundResponse {
  id: string;
  idFund: string | null;
  name: string;
  subSegment: string | null;
  product: string | null;
  type: string | null;
  category: string | null;
  flagship: boolean;
  isWebsite: boolean;
}

/** INTERFACE DE RETORNO DO METODO GET ANBIMA SUMMARY */
export interface IGetAnbimaSummaryResponse {
  success: boolean;
  data: IAnbimaSummaryData;
}

export interface IAnbimaSummaryData {
  valorRemuneracaoTaxaGlobal: number;
  taxaSaida: null;
  taxaPerformance: ITaxaPerformance;
  taxaGestao: number;
  taxaEstruturacaoPrevidencia: null;
  taxaDistribuicao: null;
  taxaAdministracao: number;
  subclasses: ISubClass[] | null;
  sidePocket: boolean;
  saldoMinimoPermanencia: number;
  publicoAlvo: string;
  pagamentoResgate: string;
  outrasObservacoes: null;
  obsTaxasAdministracao: null;
  obsFormaRemuneracao: null;
  movimentacaoMinima: number;
  mesReferencia: null;
  investimentoInicialMinimo: number;
  gestor: Gestor;
  fundo: Gestor;
  formasRemuneracao: IFormasRemuneracao;
  formaRemuneracaoTaxaGlobal: string;
  emails: string[];
  distribuidores: Gestor[];
  descricaoBarreiraDeResgate: null;
  cotizacaoResgate: string;
  cotizacaoAplicacao: string;
  cogestor: Gestor[] | null;
  classe: Gestor | null;
  categoria: string;
  carenciaResgate: null;
  aplicacaoOuResgateAtivos: boolean;
  administrador: Gestor | null;
  acordosComerciais: IAcordosComerciai[] | null;
}

interface IAcordosComerciai {
  taxaPerformance: null;
  rebateLiquido: boolean;
  percentualPL: IPercentualPL2;
  outrasReceitas: null;
  obs: null;
  minimo: null;
  fixo: null;
  condicoesComplementares: null;
  distribuidor: Gestor;
}

interface IPercentualPL2 {
  taxaPerfGestor: number;
  taxaPerfDistribuidor: number;
  taxaAdmGestor: number;
  taxaAdmDistribuidor: number;
  taxaAdmCogestor: null;
}

interface IFormasRemuneracao {
  volumeSobAdministracao: null;
  valorMinimo: IPercentualPL | null;
  valorFixo: IPercentualPL | null;
  percentualPL: IPercentualPL;
  faixaPorPL: null;
}

interface ISubClass {
  nome: string;
  codigoCVM: string;
}
interface IPercentualPL {
  valor: number;
  tipo: string;
}

interface Gestor {
  nome: string;
  cnpj: string;
  nomeComercial: string;
}

interface ITaxaPerformance {
  valorTaxaPerformance: number;
  indiceTaxaPerformance: string;
  descricaoTaxaPerformance: string;
}
