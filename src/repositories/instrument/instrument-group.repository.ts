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

interface IGroup {
  code: string;
  name: string;
}

class InstrumentGroupRepository {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreIntranet;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  public async getAllGroups(): Promise<DocumentData | []> {
    const docRef = doc(this.development, FirestoreDocument.GROUPS);
    const document = await getDoc(docRef);
    if (!document.exists()) return [];
    const { data } = document.data();
    return data;
  }

  public async getAllInstrumentGroup(): Promise<DocumentData | []> {
    const docRef = doc(this.development, FirestoreDocument.INSTRUMENTS_GROUP);
    const document = await getDoc(docRef);
    if (!document.exists()) return [];
    return document.data();
  }

  public async groupExistis(code: string): Promise<boolean> {
    const groups = await this.getAllGroups();
    const isGroup = groups.findIndex((g: IGroup) => g.code === code);
    return isGroup !== -1 ? false : true;
  }

  public async creatInstrumentGroup(data: IInstrumentGroup): Promise<boolean> {
    try {
      const docRef = doc(this.development, FirestoreDocument.INSTRUMENTS_GROUP);
      await setDoc(docRef, { [data.idName]: data }, { merge: true });
      return true;
    } catch (error) {
      console.error('Erro ao criar o Grupo:', error);
      return false;
    }
  }

  public async updateInstrumentGroup(instrumentGroup: IInstrumentGroup): Promise<boolean> {
    try {
      const docRef = doc(this.development, FirestoreDocument.INSTRUMENTS_GROUP);
      await setDoc(docRef, { [instrumentGroup.idName]: instrumentGroup }, { merge: true });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar o Grupo de Instrumentos:', error);
      return false;
    }
  }

  public async deleteInstrumentGroup(idName: string): Promise<boolean> {
    try {
      const docRef = doc(this.development, FirestoreDocument.INSTRUMENTS_GROUP);
      await updateDoc(docRef, { [idName]: deleteField() });
      return true;
    } catch (error) {
      return false;
    }
  }
}
export default new InstrumentGroupRepository();
