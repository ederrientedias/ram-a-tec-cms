import {
  collection,
  doc,
  DocumentData,
  DocumentSnapshot,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
} from 'firebase/firestore';
import { FirestoreCollection, FirestoreDocument } from '@/enums/firestore.enum';
import { IInstrumentGroup } from '@/models/instruments.model';
import { firestoreIntranet } from '@/config/firebase.config';

class FormRepository {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreIntranet;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  public async getAllForms(): Promise<DocumentData | []> {
    const docRef = doc(this.development, FirestoreDocument.FORMS);
    const document = await getDoc(docRef);
    if (!document.exists()) return null;
    return document.data();
  }
}
export default new FormRepository();
