import { DocumentData, Firestore, collection, deleteDoc, doc, getDoc, getDocs, setDoc, } from 'firebase/firestore';
import { firestoreSite } from '@/config/firebase/firebase-site.config';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { FirestoreCollection } from '@/enums/firestore';
import { IFund } from '@/models/funds.model';


export interface DocumentProps {
  fundName: string;
  documentName: string;
  data: any;
}

export interface IMigrateCollection {
  oldCollection: string;
  newColletion: string;
}

class FundRepository {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreSite;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  /**
   * @description Busca todos os fundos de investimento
   * @returns {Promise<IFund[] | []>} Retorna todos os fundos de investimento ou um array vazio caso não existam
   */
  public async getAllFunds(): Promise<IFund[] | []> {
    const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
    const field = await getDoc(docRef);

    if (!field.exists()) return [];

    const { data } = field.data() as DocumentData;

    return data;
  }

  /**
   * @description Busca um documento pelo nome do fundo e nome do documento
   * @param fundName
   * @param documentName
   * @returns {Promise<DocumentData | []>}
   */
  public async getFundDocument(fundName: string, documentName: string): Promise<DocumentData> {
    const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
    const collectionRef = collection(docRef, fundName);
    const documentRef = doc(collectionRef, documentName);
    const document = await getDoc(documentRef);

    if (!document.exists()) return [];

    return document.data() as DocumentData;
  }

  /**
   * @description Salva todos os fundos de investimento
   * @param {IFund[]} data - Array de fundos de investimento
   * @returns {Promise<boolean>} Retorna true caso o documento seja salvo com sucesso, false caso contrário
   */
  public async set(data: IFund[]): Promise<boolean> {
    try {
      const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
      await setDoc(docRef, { data }, { merge: true });

      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }

  /**
   * @description Salva um documento
   * @param props: DocumentProps
   * @returns {Promise<boolean>} Retorna true caso o documento seja salvo com sucesso, false caso contrário
   */
  public async setDocument(props: DocumentProps): Promise<boolean> {
    try {
      const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
      const collectionRef = collection(docRef, props.fundName);
      const documentRef = doc(collectionRef, props.documentName);

      await setDoc(documentRef, { data: props.data }, { merge: true });
      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }

  public async migrateCollection(props: IMigrateCollection): Promise<void[]> {
    const oldCollectionPath = `investment_funds/${props.oldCollection}`;
    const newCollectionPath = `investment_funds/${props.newColletion}`;

    const oldCollectionRef = collection(this.production, oldCollectionPath);
    const newCollectionRef = collection(this.production, newCollectionPath);

    const querySnapshot = await getDocs(oldCollectionRef);

    const migrationPromises = querySnapshot.docs.map(async (oldDoc) => {
      const data = oldDoc.data();
      const newDocRef = doc(newCollectionRef, oldDoc.id);
      await setDoc(newDocRef, data);
    });

    await Promise.all(migrationPromises);

    const deletionPromises = querySnapshot.docs.map(async (oldDoc) => {
      await deleteDoc(oldDoc.ref);
    });

    return await Promise.all(deletionPromises);
  }
}

export default new FundRepository();
