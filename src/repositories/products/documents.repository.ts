import { DocumentData, Firestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { FirestoreDocument, FundDocument } from '@/enums/firestore.enum';
import { firestoreSite } from '@/config/firebase/firebase-site.config';
import { FirestoreCollection } from '@/enums/firestore';

export interface ICollectionMap {
  id: number;
  displayName: string;
  collectionName: string;
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
   *
   * @param documentProps
   * @returns
   */
  async getDocument(documentProps: Partial<IDocumentProps>): Promise<IFile[]> {
    const docRef = doc(this.development, FirestoreDocument.INVESTMENT_FUNDS);
    const fundRef = collection(docRef, documentProps.fundName);
    const documentRef = doc(fundRef, FundDocument.DOCUMENTS);
    const collectionRef = collection(documentRef, documentProps.collectionName);
    const yearRef = doc(collectionRef, documentProps.year);
    const document = await getDoc(yearRef);
    const { files } = document.data() as DocumentData;
    return files;
  }

  /**
   *
   * @param documentProps
   * @returns
   */
  async setDocument(documentProps: IDocumentProps): Promise<boolean> {
    try {
      const files = await this.getDocument(documentProps);
      const docRef = doc(this.development, FirestoreDocument.INVESTMENT_FUNDS);
      const fundRef = collection(docRef, documentProps.fundName);
      const documentRef = doc(fundRef, FundDocument.DOCUMENTS);
      const collectionRef = collection(documentRef, documentProps.collectionName);
      const yearRef = doc(collectionRef, documentProps.year);
      await setDoc(yearRef, { files: [documentProps.file, ...files] });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
export default new DocumentsRepository();
