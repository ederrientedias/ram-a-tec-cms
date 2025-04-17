import { db } from '../config/firebase.config';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { FirestoreDocuments } from '../models/firestore';

class FirestoreService {
  firestore: any;
  production: any;
  development: any;

  constructor() {
    this.firestore = db;
    this.production = collection(this.firestore, 'production');
    this.development = collection(this.firestore, 'development');
  }

  // Ler um documento específico
  async getDocumentField(document: FirestoreDocuments) {
    try {
      const docRef = doc(this.development, document);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      }

      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  /* GET DOCUMENTS */
  async getCollectionDocument(
    documentName: FirestoreDocuments,
    collectionName: string,
    document: string
  ): Promise<any> {
    try {
      const docRef = doc(this.development, documentName);
      const collectionRef = collection(docRef, collectionName);
      const collectionDocumentRef = doc(collectionRef, document);
      const docSnap = await getDoc(collectionDocumentRef);

      if (docSnap.exists()) {
        return docSnap.data();
      }

      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  // Criar/Atualizar um documento
  async setDocument(collectionPath, documentId, data) {
    try {
      const docRef = doc(this.firestore, collectionPath, documentId);
      await setDoc(docRef, data, { merge: true });
      return { id: documentId, ...data };
    } catch (error) {
      console.error('Error setting document:', error);
      throw error;
    }
  }

  // Adicionar novo documento (com ID automático)
  async addDocument(collectionPath, data) {
    try {
      const collectionRef = collection(this.firestore, collectionPath);
      const docRef = await addDoc(collectionRef, data);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  // Atualizar campos específicos de um documento
  async updateDocument(collectionPath, documentId, data) {
    try {
      const docRef = doc(this.firestore, collectionPath, documentId);
      await updateDoc(docRef, data);
      return { id: documentId, ...data };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Deletar um documento
  async deleteDocument(collectionPath, documentId) {
    try {
      const docRef = doc(this.firestore, collectionPath, documentId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Ler todos os documentos de uma coleção
  async getCollection(collectionPath) {
    try {
      const collectionRef = collection(this.firestore, collectionPath);
      const querySnapshot = await getDocs(collectionRef);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting collection:', error);
      throw error;
    }
  }
}

export default new FirestoreService();
