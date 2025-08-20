import { DocumentData, Firestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { IComplianceRepository, IFile, ITab } from '@/models/compliance.model';
import { firestoreSite } from '@/config/firebase/firebase-site.config';
import { Field, FirestoreDocument } from '@/enums/firestore.enum';
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

  /**
   * @description | Obtém as tabs do compliance
   * @returns | ITab[] | []
   */
  public async getTabs(): Promise<ITab[] | []> {
    const docRef = doc(this.production, FirestoreDocument.COMPLIANCE);
    const fields = await getDoc(docRef);

    if (!fields.exists()) return [];

    const { tabs } = fields.data() as DocumentData;

    return tabs;
  }

  /**
   * @description | Retorna os arquivos do compliance
   * @param collectionName | Nome da collection
   * @returns | IFile[] | []
   */
  public async getFiles(collectionName: string): Promise<IFile[] | []> {
    const docRef = doc(this.production, FirestoreDocument.COMPLIANCE);
    const collectionRef = collection(docRef, collectionName);
    const document = doc(collectionRef, Field.FILES);
    const field = await getDoc(document);

    if (!field.exists()) return [];

    const { data } = field.data() as DocumentData;

    return data;
  }

  /**
   * @description | Salva os arquivos do compliance
   * @param collectionName | Nome da collection
   * @param files | Arquivos a serem salvos
   * @returns | boolean
   */
  public async setFiles(collectionName: string, files: IFile[]): Promise<boolean> {
    try {
      const docRef = doc(this.production, FirestoreDocument.COMPLIANCE);
      const collectionRef = collection(docRef, collectionName);
      const document = doc(collectionRef, Field.FILES);
      await setDoc(document, { data: files }, { merge: true });

      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }

  /**
   * @description | Salva as abas do compliance
   * @param tabs | metadados das abas
   * @returns | boolean
   */
  public async setTabs(tabs: ITab[]): Promise<boolean> {
    try {
      const docRef = doc(this.production, FirestoreDocument.COMPLIANCE);
      await setDoc(docRef, { tabs }, { merge: true });

      return true;
    } catch (error) {
      console.error('Erro ao salvar as abas:', error);
      return false;
    }
  }
}

export default new ComplianceRepository();
