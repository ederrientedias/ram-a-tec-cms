export interface IInformationalTransparency {
  id: number | string;
  idName: string;
  totalFee: string;
  fund: Fund;
  admFee: AdmFee;
  managementFee: AdmFee;
  performanceFee: AdmFee;
  distributorRebate: DistributorRebate;
  distributors: Distributors;
  summary: Summary;
  documents: Documents;
  simulator: Simulator;
}

export interface Simulator {
  id: number;
  hasSimulator: boolean;
  collumnName: string;
  uuid: string;
}

export interface Documents {
  id: number;
  collumnName: string;
  link: string;
}

export interface Summary {
  id: number;
  collumnName: string;
  title: string;
  link: string;
}

export interface Distributors {
  id: number;
  uuid: string;
  collumnName: string;
  options: Option[];
}

export interface Option {
  id: number;
  uuid: string;
  name: string;
  displayName: string;
}

export interface DistributorRebate {
  id: number;
  collumnName: string;
  rebates: Rebate[];
}

export interface Rebate {
  id: number;
  uuid: string;
  values: Value[];
}

export interface Value {
  id: number;
  value: string;
  text: string;
}

export interface AdmFee {
  id: number;
  collumnName: string;
  value: string;
  text: string;
}

export interface Fund {
  collumnName: string;
  id: number;
  subtitle: string;
  title: string;
}

export interface IUpdateSummaries {
  fundName: string;
  month: string;
  year: string;
  file: IFile;
}

export interface IFile {
  id: string;
  downloadName: string;
  file: string;
  name: string;
}
