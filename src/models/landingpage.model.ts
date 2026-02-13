export interface IDocumentProps {
  fundName: string;
  collectionName: string;
  year: string;
}

export interface ICollectionMap {
  id: number;
  isActive: boolean;
  isDisabled: boolean;
  bucketName: string;
  isSelected: boolean;
  collectionName: string;
  displayName: string;
  years: string[];
  order: number;
}

export interface IFileMetadata {
  id: number | string;
  name: string;
  month: string;
  downloadName: string;
  file: string;
  mes?: string;
}
