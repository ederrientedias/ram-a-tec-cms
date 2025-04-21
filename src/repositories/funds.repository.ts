import { firestoreSite } from '@/config/firebase/firebase-site.config';
import { FirestoreCollection } from '@/enums/firestore';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { IFund } from '@/models/funds.model';
import { DocumentData, Firestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';

class FundRepository {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreSite;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  public async get(): Promise<IFund[] | []> {
    const docRef = doc(this.development, FirestoreDocument.INVESTMENT_FUNDS);
    const field = await getDoc(docRef);

    if (!field.exists()) return [];

    const { data } = field.data() as DocumentData;

    return data;
  }

  public async set(data: IFund[]): Promise<boolean> {
    try {
      const docRef = doc(this.development, FirestoreDocument.INVESTMENT_FUNDS);
      await setDoc(docRef, { data }, { merge: true });

      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }
}

export default new FundRepository();
