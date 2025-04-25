import {
  IComplianceRepository,
  ITab,
  IFile,
  CollectionName,
  IUploadRef,
} from '@/models/compliance.model';
import { DocumentData, Firestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { firestoreSite } from '@/config/firebase/firebase-site.config';
import { FirestoreDocument, Field } from '@/enums/firestore.enum';
import { FirestoreCollection } from '@/enums/firestore';

class ComplianceRepository implements IComplianceRepository {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreSite;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  public async getTabs(): Promise<ITab[] | []> {
    const docRef = doc(this.development, FirestoreDocument.COMPLIANCE);
    const fields = await getDoc(docRef);

    if (!fields.exists()) return [];

    const { tabs } = fields.data() as DocumentData;

    return tabs;
  }

  public async getLastUploadsRef(): Promise<IUploadRef[] | []> {
    const docRef = doc(this.development, FirestoreDocument.COMPLIANCE);
    const fields = await getDoc(docRef);

    if (!fields.exists()) return [];

    const { last_uploads } = fields.data() as DocumentData;

    return last_uploads;
  }

  public async getFiles(collectionName: string): Promise<IFile[] | []> {
    const docRef = doc(this.development, FirestoreDocument.COMPLIANCE);
    const collectionRef = collection(docRef, collectionName);
    const document = doc(collectionRef, Field.FILES);
    const field = await getDoc(document);

    if (!field.exists()) return [];

    const { data } = field.data() as DocumentData;

    return data;
  }

  public async setUploadsRef(uploadsRef: IUploadRef[]): Promise<boolean> {
    try {
      const docRef = doc(this.development, FirestoreDocument.COMPLIANCE);
      await setDoc(docRef, { [Field.LAST_UPLOADS]: uploadsRef }, { merge: true });

      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }

  public async setFiles(collectionName: string, files: IFile[]): Promise<boolean> {
    try {
      const docRef = doc(this.development, FirestoreDocument.COMPLIANCE);
      const collectionRef = collection(docRef, collectionName);
      const document = doc(collectionRef, Field.FILES);
      await setDoc(document, { data: files }, { merge: true });

      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }
}

export default new ComplianceRepository();
