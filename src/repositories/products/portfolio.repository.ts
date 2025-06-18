import {
  FirestoreDocument,
  FirestoreCollection,
  FundDocument,
  DocumentCollection,
  Field,
} from '@/enums/firestore.enum';
import { Firestore, CollectionReference, collection, doc, setDoc } from 'firebase/firestore';
import { IPortfolioRepository, ITable } from '@/models/portfolio.model';
import { firestoreSite } from '@/config/firebase/firebase-site.config';

class PortfolioRepository implements IPortfolioRepository {
  protected readonly firestore: Firestore;
  protected readonly production: CollectionReference;
  protected readonly development: CollectionReference;

  constructor() {
    this.firestore = firestoreSite;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  /**
   * @description | insere os dados da tabela de ativos
   * @param fundName | nome do fundo
   * @param data :ITable| dados da Tabela de Ativos
   * @returns | retorna true se o portfolio foi atualizado com sucesso
   */
  public async saveAssetsTable(fundName: string, table: ITable): Promise<boolean> {
    try {
      const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
      const fundRef = collection(docRef, fundName);
      const documentRef = doc(fundRef, FundDocument.PORTFOLIO);
      const collectionRef = collection(documentRef, DocumentCollection.LIST_ASSETS);
      const document = doc(collectionRef, Field.TABLE);
      await setDoc(document, { headers: table.headers, rows: table.rows }, { merge: true });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
export default new PortfolioRepository();
