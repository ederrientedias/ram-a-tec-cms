import { DocumentData, Firestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { FirestoreDocument, FundDocument } from '@/enums/firestore.enum';
import { firestoreSite } from '@/config/firebase/firebase-site.config';
import { FirestoreCollection } from '@/enums/firestore';

import { ILog } from '../logs/logs.repository';

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

export interface IFile {
  id: number | string;
  name: string;
  mes: string;
  downloadName: string;
  file: string;
}

export interface IDocumentProps {
  fundName: string;
  collectionName: string;
  year: string;
  file: IFile;
}
export interface IDocumentUpdate {
  fundName: string;
  collectionName: string;
  year: string;
  files: IFile[];
}

class DocumentsRepository {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreSite;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  /**
   * @description Get document by fund name
   * @param fundName Nome do fundo
   * @returns retorna um map de coleções
   */
  async getCollectionsMap(fundName: string): Promise<ICollectionMap[]> {
    const docRef = doc(this.development, FirestoreDocument.INVESTMENT_FUNDS);
    const collectionRef = collection(docRef, fundName);
    const documentRef = doc(collectionRef, FundDocument.DOCUMENTS);
    const document = await getDoc(documentRef);
    const { collectionMap } = document.data() as DocumentData;
    return collectionMap;
  }

  /**
   * @description | Atualiza o map de coleções
   * @param collectionMap | Array de coleções
   * @returns retorna true se atualizou com sucesso
   */
  async updateCollectionsMap(fundName: string, collectionMap: ICollectionMap[]): Promise<boolean> {
    try {
      const docRef = doc(this.development, FirestoreDocument.INVESTMENT_FUNDS);
      const fundRef = collection(docRef, fundName);
      const documentRef = doc(fundRef, FundDocument.DOCUMENTS);
      await setDoc(documentRef, { collectionMap }, { merge: true });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   *
   * @param documentProps
   * @returns
   */
  async getDocument(documentProps: Partial<IDocumentProps>): Promise<IFile[] | []> {
    const docRef = doc(this.development, FirestoreDocument.INVESTMENT_FUNDS);
    const fundRef = collection(docRef, documentProps.fundName);
    const documentRef = doc(fundRef, FundDocument.DOCUMENTS);
    const collectionRef = collection(documentRef, documentProps.collectionName);
    const yearRef = doc(collectionRef, documentProps.year);
    const document = await getDoc(yearRef);
    if (document.exists()) {
      const { files } = document.data() as DocumentData;
      return files;
    }
    return [];
  }

  /**
   * @description | Insere um novo documento
   * @param documentProps
   * @returns
   */
  async setDocument(documentProps: IDocumentProps): Promise<boolean> {
    let _files: IFile[] | [] = [];
    try {
      const filesRef = await this.getDocument(documentProps);
      if (filesRef.length > 0) {
        _files = await this.fileExists(filesRef, documentProps.file);
      }

      if (_files.length === 0) {
        _files = [documentProps.file];
      }

      const docRef = doc(this.development, FirestoreDocument.INVESTMENT_FUNDS);
      const fundRef = collection(docRef, documentProps.fundName);
      const documentRef = doc(fundRef, FundDocument.DOCUMENTS);
      const collectionRef = collection(documentRef, documentProps.collectionName);
      const yearRef = doc(collectionRef, documentProps.year);
      await setDoc(yearRef, { files: _files }, { merge: true });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * @description | Atualiza um documento
   * @param documentProps | objeto com as propriedades do documento
   * @returns | retorna true se o documento foi atualizado com sucesso
   */
  async updateDocument(documentProps: IDocumentUpdate): Promise<boolean> {
    try {
      const docRef = doc(this.development, FirestoreDocument.INVESTMENT_FUNDS);
      const fundRef = collection(docRef, documentProps.fundName);
      const documentRef = doc(fundRef, FundDocument.DOCUMENTS);
      const collectionRef = collection(documentRef, documentProps.collectionName);
      const yearRef = doc(collectionRef, documentProps.year);
      await setDoc(yearRef, { files: documentProps.files }, { merge: true });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * @description | Deleta um arquivo dentro do documento
   * @param fileRef | objeto com as propriedades do documento
   * @returns | retorna true se o documento foi atualizado com sucesso
   */
  async deleteFile(fileRef: ILog): Promise<boolean> {
    const documentProps = {
      fundName: fileRef.fundRef,
      collectionName: fileRef.collectionName,
      year: fileRef.fileYear,
    };

    try {
      const files = await this.getDocument(documentProps);
      const newFiles = files.filter((file: IFile) => file?.mes !== fileRef.fileMonth);
      return await this.updateDocument({ ...documentProps, files: newFiles });
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * @description | Verifica se o arquivo já existe no documento
   * @param files | array de arquivos
   * @param file | objeto com as propriedades do arquivo
   * @returns | retorna um array de arquivos
   */
  async fileExists(files: IFile[], file: IFile): Promise<IFile[]> {
    const index = files.findIndex((item) => {
      return item.mes === file.mes && item.name === file.name;
    });

    if (index !== -1) {
      files[index] = file;
      return files;
    }

    return (files = [...files, file]);
  }
}
export default new DocumentsRepository();
