import {
  collection,
  doc,
  DocumentData,
  Firestore,
  getDoc,
  setDoc,
  deleteField,
  updateDoc,
  DocumentReference,
} from 'firebase/firestore';
import { FirestoreCollection, FirestoreDocument } from '@/enums/firestore.enum';
import { firestoreIntranet } from '@/config/firebase.config';
import { IInstrument } from '@/models/instruments.model';

class InstrumentRepository {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreIntranet;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  /**
   * @description - Busca a referência do documento
   * @returns - Retorna a referência do documento
   */
  public async getDocRef(): Promise<DocumentReference> {
    const docRef = doc(this.development, FirestoreDocument.INSTRUMENTS);
    return docRef;
  }

  /**
   * @description Busca todos os instrumentos no Firestore.
   * @returns Promise<IIntruments[] | []> - Retorna uma lista de instrumentos ou um array vazio se nenhum instrumento for encontrado.
   * @throws Erro ao buscar os instrumentos.
   */
  public async getAllInstruments(): Promise<DocumentData | null> {
    const docRef = doc(this.development, FirestoreDocument.INSTRUMENTS);
    const document = await getDoc(docRef);
    if (!document.exists()) return null;
    return document.data();
  }

  /**
   * @description Cria um novo instrumento no Firestore.
   * @param intrument | IIntruments - O instrumento a ser criado.
   * @returns Promise<boolean> - Retorna true se a criação for bem-sucedida, caso contrário, false.
   * @throws Erro ao criar o instrumento.
   */
  public async createInstrument(intrument: IInstrument): Promise<boolean> {
    try {
      const docRef = doc(this.development, FirestoreDocument.INSTRUMENTS);
      await setDoc(docRef, { [intrument.idName]: intrument }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error creating instrument:', error);
      return false;
    }
  }

  /**
   * @description Deleta um instrumento do Firestore.
   * @param idName - O idName do instrumento a ser deletado.
   * @returns | Promise<boolean> - Retorna true se o instrumento for deletado, caso contrário, false.
   * @throws Erro ao deletar o instrumento.
   */
  public async deleteInstrument(idName: string): Promise<boolean> {
    try {
      const docRef = doc(this.development, FirestoreDocument.INSTRUMENTS);
      await updateDoc(docRef, { [idName]: deleteField() });
      return true;
    } catch (error) {
      return false;
    }
  }
}
export default new InstrumentRepository();
