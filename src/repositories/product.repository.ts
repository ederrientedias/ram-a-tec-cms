import { DocumentData, Firestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { firestoreSite } from '@/config/firebase/firebase-site.config';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { FirestoreCollection } from '@/enums/firestore';

class ProductRepository {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreSite;
    this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, FirestoreCollection.DEVELOPMENT);
  }

  getDescription() {}
  getOverview() {}
  getTagertReturn() {}
  getProfitability() {}
  getPortfolio() {}
  getDocuments() {}
}
