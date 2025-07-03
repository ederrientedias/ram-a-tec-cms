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
import { firestoreIntranet } from '@/config/firebase.config';
import { IField } from '@/models/instruments.model';

class FieldsBlocksRepository {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreIntranet;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  public async getFields(): Promise<IField[] | null> {
    const docRef = doc(this.development, FirestoreDocument.FIELDS);
    const document = await getDoc(docRef);
    if (!document.exists()) return null;
    const { data } = document.data();
    return data;
  }

  public async getAllFieldsBlocks(): Promise<DocumentData | null> {
    const docRef = doc(this.development, FirestoreDocument.FIELDS_BLOCKS);
    const document = await getDoc(docRef);
    if (!document.exists()) return null;
    return document.data();
  }
}
export default new FieldsBlocksRepository();
