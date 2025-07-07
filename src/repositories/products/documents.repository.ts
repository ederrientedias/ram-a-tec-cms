import {
  CollectionReference,
  DocumentData,
  Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import {
  ICollectionMap,
  IDocumentProps,
  IDocumentsRepository,
  IFile,
} from '@/models/documents.model';
import { FirestoreDocument, FundDocument } from '@/enums/firestore.enum';
import { firestoreSite } from '@/config/firebase/firebase-site.config';
import { FirestoreCollection } from '@/enums/firestore';

class DocumentsRepository implements IDocumentsRepository {
  protected readonly firestore: Firestore;
  protected readonly production: CollectionReference;
  protected readonly development: CollectionReference;

  constructor() {
    this.firestore = firestoreSite;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  /**
   * @description | Retorna o mapa de coleções de um fundo
   * @param fundName | nome do fundo
   * @returns | retorna o mapa de coleções de um fundo
   */
  public async getCollectionsMap(fundName: string): Promise<ICollectionMap[] | []> {
    const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
    const collectionRef = collection(docRef, fundName);
    const documentRef = doc(collectionRef, FundDocument.DOCUMENTS);
    const document = await getDoc(documentRef);

    if (!document.exists()) return [];

    const { collectionMap } = document.data() as DocumentData;
    return collectionMap;
  }

  /**
   * @description | Atualiza o mapa de coleções de um fundo
   * @param fundName | nome do fundo
   * @param collectionMap | mapa de coleções de um fundo
   * @returns | retorna true se o mapa de coleções foi atualizado com sucesso
   */
  public async updateCollectionsMap(
    fundName: string,
    collectionMap: ICollectionMap[]
  ): Promise<boolean> {
    try {
      const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
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
   * @description | Obtém os arquivos de um fundo
   * @param documentProps | propriedades do documento
   * @returns | retorna os arquivos de um fundo
   */
  public async getFiles(documentProps: Partial<IDocumentProps>): Promise<IFile[] | []> {
    const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
    const fundRef = collection(docRef, documentProps.fundName);
    const documentRef = doc(fundRef, FundDocument.DOCUMENTS);
    const collectionRef = collection(documentRef, documentProps.collectionName);
    const yearRef = doc(collectionRef, documentProps.year);
    const document = await getDoc(yearRef);
    if (!document.exists()) return [];

    const { files } = document.data() as DocumentData;
    return files;
  }

  /**
   * @description | Insere os arquivos de um fundo
   * @param documentProps | propriedades do documento
   * @returns | retorna true se os arquivos foram inseridos com sucesso
   */
  public async setFiles(documentProps: IDocumentProps): Promise<boolean> {
    try {
      const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
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
}
export default new DocumentsRepository();
