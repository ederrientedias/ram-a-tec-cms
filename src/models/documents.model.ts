import { ILandingPageLog } from './log.model';

export interface IDocumentsRepository {
  getCollectionsMap: (fundName: string) => Promise<ICollectionMap[] | []>;
  updateCollectionsMap: (fundName: string, collectionMap: ICollectionMap[]) => Promise<boolean>;
  getFiles: (documentProps: Partial<IDocumentProps>) => Promise<IFile[] | []>;
  setFiles: (documentProps: IDocumentProps) => Promise<boolean>;
}

export interface IDocumentService {
  getCollectionsMap: (fundName: string) => Promise<ICollectionMap[] | []>;
  updateCollectionsMap: (fundName: string, collectionMap: ICollectionMap[]) => Promise<boolean>;
  getFiles: (documentProps: Partial<IDocumentProps>) => Promise<IFile[] | []>;
  updateFile: (documentProps: IDocumentUpdate) => Promise<boolean>;
  deleteFile: (documentProps: ILandingPageLog) => Promise<boolean>;
}

export interface ICollectionMap {
  id: number;
  displayName: string;
  collectionName: string;
  bucketName: string;
  years: string[];
  isActive: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  order: number;
}

export interface IDocumentProps {
  fundName: string;
  collectionName: string;
  year: string;
  files: IFile[];
}

export interface IFile {
  id: number | string;
  name: string;
  mes?: string;
  month: string;
  downloadName: string;
  docId: string;
  file: string;
}

export interface IDocumentUpdate {
  fundName: string;
  collectionName: string;
  year: string;
  file: IFile;
}
