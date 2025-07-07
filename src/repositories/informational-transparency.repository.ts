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
  IInformationalTransparency,
  ISimmulatorTable,
  IUpdateSummaries,
} from '@/models/informational-transparency.model';
import { FirestoreCollection, FirestoreDocument } from '@/enums/firestore.enum';
import { firestoreSite } from '@/config/firebase/firebase-site.config';

class InformationalTransparencyRepository {
  protected readonly firestore: Firestore;
  protected readonly production: CollectionReference;
  protected readonly development: CollectionReference;

  constructor() {
    this.firestore = firestoreSite;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  public async getInformationalTransparency(): Promise<IInformationalTransparency[] | []> {
    const docRef = doc(this.production, FirestoreDocument.INFORMATIONAL_TRANPARENCY);
    const response = await getDoc(docRef);

    if (!response.exists()) return [];

    const { data } = response.data() as DocumentData;

    return data;
  }

  public async updateInformationalTransparency(data: IInformationalTransparency[]) {
    const docRef = doc(this.production, FirestoreDocument.INFORMATIONAL_TRANPARENCY);
    return await setDoc(docRef, { data }, { merge: true });
  }

  public async updateSummaries(props: IUpdateSummaries) {
    const docRef = doc(this.production, FirestoreDocument.INFORMATIONAL_TRANPARENCY);
    const collectionRef = collection(docRef, 'summaries');
    const fundDocumentRef = doc(collectionRef, props.fundName);
    const yearRef = collection(fundDocumentRef, props.year);
    const monthRef = doc(yearRef, props.month);
    const response = await getDoc(monthRef);
    if (!response.exists()) return [];

    const { file } = response.data() as DocumentData;

    return file;
  }

  public async setSimulatorDataTable(fundName: string, data: ISimmulatorTable) {
    const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
    const fundDocumentRef = collection(docRef, fundName);
    const collectionRef = doc(fundDocumentRef, 'simulator');
    return await setDoc(collectionRef, { data }, { merge: true });
  }
}
export default new InformationalTransparencyRepository();
