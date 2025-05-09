export interface IComplianceRepository {
  getTabs: () => Promise<ITab[] | []>;
  getFiles: (collectionName: string) => Promise<IFile[] | []>;
  setFiles(collectionName: string, files: IFile[]): Promise<boolean>;
}

export type CollectionName =
  | 'riza_allocation'
  | 'riza_asset'
  | 'riza_direct_lending'
  | 'riza_group'
  | 'riza_infrastructure'
  | 'riza_liquids'
  | 'riza_real_estate'
  | 'riza_structured_credit'
  | 'riza_wealth_management';

export interface ITab {
  id: number;
  name: string;
  collection: string;
  bucketName: string;
  isActive: boolean;
}
export interface IFile {
  id: number;
  fileName: string;
  downloadName: string;
  url: string;
}
