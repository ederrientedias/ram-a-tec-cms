import {
  DocumentData,
  Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { firestoreSite } from "@/config/firebase/firebase-site.config";

class FirebaseService {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreSite;
    this.production = collection(this.firestore, "production");
    this.development = collection(this.firestore, "development");
  }

  public async getDocument(documentName: string): Promise<DocumentData> {
    const docRef = doc(this.development, documentName);
    const field = await getDoc(docRef);
    return field.data();
  }

  public async getCollection(
    documentName: string,
    collectionName: string,
    field: string
  ): Promise<DocumentData> {
    const docRef = doc(this.production, documentName);
    const collectionRef = collection(docRef, collectionName);
    const document = doc(collectionRef, field);
    const snapshot = await getDoc(document);
    return snapshot.data();
  }

  public async fetch(queryString: string): Promise<DocumentData> {
    const docRef = doc(this.production, queryString);
    const snapshot = await getDoc(docRef);
    return snapshot.data();
  }

  public async setDocument(
    documentName: string,
    field: string,
    data: any
  ): Promise<void> {
    const docRef = doc(this.development, documentName);
    await setDoc(docRef, { [field]: data }, { merge: true });
  }

  public async setDocumentCollection(
    documentName: string,
    collectionName: string,
    field: string,
    data: any
  ): Promise<void> {
    const docRef = doc(this.development, documentName);
    const collectionRef = collection(docRef, collectionName);
    const document = doc(collectionRef, field);
    await setDoc(document, { data }, { merge: true });
  }

  async updateDocumentCollection(
    documentName: string,
    collectionName: string,
    field: string,
    fileData: any
  ) {
    const file = await this.getCollection(documentName, collectionName, field);
    if (!file.data) return;
    const currentData = file.data;
    const currentId = currentData[currentData.length - 1].id;
    const dataUpdeted = [{ ...fileData, id: currentId + 1 }, ...currentData];
    return await this.setDocumentCollection(
      documentName,
      collectionName,
      field,
      dataUpdeted
    )
      .then(() => {
        return true;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  async updateUploadsRef(
    documentName: string,
    field: string,
    uploadRef: any
  ): Promise<any> {
    const { _, last_uploads } = await this.getDocument(documentName);
    // console.log(file);
    // if (!last_uploads) return false;
    const updatedData = [uploadRef, ...last_uploads];
    console.log(updatedData);

    // return await this.setDocument(documentName, field, updatedData)
    //   .then(() => true)
    //   .catch((error) => {
    //     console.error(error);
    //     return error;
    //   });
  }
}
export default new FirebaseService();
