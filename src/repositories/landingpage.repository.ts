import { DocumentData, Firestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { IFileMetadata, IDocumentProps, ICollectionMap } from '@/models/landingpage.model';
import { firestoreSite } from '@/config/firebase/firebase-site.config';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { FirestoreCollection } from '@/enums/firestore';


class LandingPageRepository {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreSite;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  public async getCollectionMap(fundName: string): Promise<[] | DocumentData> {
    const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
    const collectionRef = collection(docRef, fundName);
    const documentRef = doc(collectionRef, 'documents');
    const document = await getDoc(documentRef);

    if (!document.exists()) return [];

    const { collectionMap } = document.data() as DocumentData;

    return collectionMap;
  }

  public async getDocuments(props: IDocumentProps): Promise<[] | DocumentData> {
    const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
    const collectionRef = collection(docRef, props.fundName);
    const documentRef = doc(collectionRef, 'documents');
    const collections = collection(documentRef, props.collectionName);
    const document = doc(collections, props.year);
    const collectionData = await getDoc(document);

    if (!collectionData.exists()) return [];

    return collectionData.data().files as DocumentData;
  }

  public async setDocuments(props: IDocumentProps, files: IFileMetadata[]): Promise<boolean> {
    try {
      const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
      const collectionRef = collection(docRef, props.fundName);
      const documentRef = doc(collectionRef, 'documents');
      const collections = collection(documentRef, props.collectionName);
      const document = doc(collections, props.year);
      await setDoc(document, { files }, { merge: true });

      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }

  public async setCollectionMap(collectionName: string, files: ICollectionMap[]): Promise<boolean> {
    try {
      const docRef = doc(this.production, FirestoreDocument.INVESTMENT_FUNDS);
      const collectionRef = collection(docRef, collectionName);
      const documentRef = doc(collectionRef, 'documents');
      await setDoc(documentRef, { collectionMap: files }, { merge: true });

      return true;
    } catch (error) {
      console.error('Erro ao salvar o map de coleções:', error);
      return false;
    }
  }
}
export default new LandingPageRepository();
