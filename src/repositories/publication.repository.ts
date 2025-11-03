import { IMediaOutlet, IPublication, IPublicationRepsitory, IType, } from '@/models/publication.model';
import { DocumentData, Firestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { FirestoreDocument, FirestoreCollection } from '@/enums/firestore.enum';
import { firestoreSite } from '@/config/firebase/firebase-site.config';


type SetDocumentProps = {
  collectionRef: string;
  subDocRef: string;
  data: any;
};
class PublicationRepository implements IPublicationRepsitory {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreSite;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  /**
   * @description | Obtém todas as publicações
   * @returns | IPublication[] - Array de publicações
   */
  public async get(): Promise<IPublication[] | []> {
    const docRef = doc(this.production, FirestoreDocument.PUBLICATIONS);
    const field = await getDoc(docRef);

    if (!field.exists) return [];

    const { data } = field.data();

    return data;
  }

  public async getMediaOutlet(): Promise<IMediaOutlet[] | []> {
    const docRef = doc(this.production, FirestoreDocument.PUBLICATIONS);
    const collectionRef = collection(docRef, 'media_outlet');
    const subDocRef = doc(collectionRef, 'companies');
    const field = await getDoc(subDocRef);

    if (!field.exists) return [];

    const { data } = field.data();
    return data;
  }

  public async getTypes(): Promise<IType[] | []> {
    const docRef = doc(this.production, FirestoreDocument.PUBLICATIONS);
    const collectionRef = collection(docRef, 'media_outlet');
    const subDocRef = doc(collectionRef, 'types');
    const field = await getDoc(subDocRef);

    if (!field.exists) return [];

    const { data } = field.data();
    return data;
  }

  /**
   * @description | Salva as publicações
   * @param publications | Array de publicações
   * @returns | boolean - true se salvou com sucesso
   */
  public async set(publications: IPublication[]): Promise<boolean> {
    try {
      const docRef = doc(this.production, FirestoreDocument.PUBLICATIONS);
      await setDoc(docRef, { data: publications }, { merge: true });

      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }

  public async setDocument(props: SetDocumentProps): Promise<boolean> {
    try {
      const docRef = doc(this.production, FirestoreDocument.PUBLICATIONS);
      const colletionRef = collection(docRef, props.collectionRef);
      const subDocRef = doc(colletionRef, props.subDocRef);
      await setDoc(subDocRef, { data: props.data }, { merge: true });
      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }
}

export default new PublicationRepository();
