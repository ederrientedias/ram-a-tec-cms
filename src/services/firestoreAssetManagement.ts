import { collection, doc, Firestore, getDoc } from 'firebase/firestore';
import { firestoreAssetManagement } from '@/config/firebase.config';
import { FirestoreCollection } from '@/enums/firestore.enum';

class FirestoreAssetManagement {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  // /production/management-centers/research-and-risk/asset-register
  constructor() {
    this.firestore = firestoreAssetManagement;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  public async getCollectionData(collectionName: string): Promise<any> {
    const docRef = doc(this.production, 'management-centers');
    const collectionRef = collection(docRef, 'research-and-risk');
    const document = doc(collectionRef, 'asset-register');
    const field = await getDoc(document);

    if (!field.exists()) return [];

    const data = field.data()[collectionName];

    return data;
  }
}
export default new FirestoreAssetManagement();
