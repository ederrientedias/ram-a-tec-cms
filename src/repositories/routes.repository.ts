import { collection, doc, Firestore, getDoc, setDoc } from 'firebase/firestore';
import { firestoreSite } from '@/config/firebase/firebase-site.config';
import { FirestoreCollection } from '@/enums/firestore.enum';
import { IRoute } from '@/models/routes.model';


class RouteRepository {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreSite;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  public async getRoutes(): Promise<IRoute[] | []> {
    const docRef = doc(this.production, 'routes');
    const field = await getDoc(docRef);

    if (!field.exists()) return [];

    const { data } = field.data();

    return data;
  }

  public async setRoutes(routes: IRoute[]): Promise<any> {
    try {
      const docRef = doc(this.production, 'routes');
      await setDoc(docRef, { data: routes }, { merge: true });
      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }
}
export default new RouteRepository();
