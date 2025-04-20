import { DocumentData, Firestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { firestoreSite } from '@/config/firebase/firebase-site.config';
import { FirestoreDocument, FirestoreCollection } from '@/enums/firestore.enum';
import { IPublication, IPublicationRepsitory } from '@/models/publication.model';

class PublicationRepository implements IPublicationRepsitory {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreSite;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  public async get(): Promise<IPublication[] | []> {
    const docRef = doc(this.development, FirestoreDocument.PUBLICATIONS);
    const field = await getDoc(docRef);

    if (!field.exists) return [];

    const { data } = field.data();

    return data;
  }

  public async set(data: IPublication[]): Promise<boolean> {
    try {
      const docRef = doc(this.development, FirestoreDocument.PUBLICATIONS);
      await setDoc(docRef, { data }, { merge: true });

      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }
}

export default new PublicationRepository();
