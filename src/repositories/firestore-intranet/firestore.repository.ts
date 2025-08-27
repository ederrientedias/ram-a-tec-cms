import { collection, doc, DocumentData, Firestore, getDoc, setDoc } from 'firebase/firestore';
import { IField, IFieldsBlock, ISelectOption } from '@/models/instrumentsRegistration.model';
import { Collection, Documents } from '@/enums/firestoreIntranet.enum';
import { firestoreIntranet } from '@/config/firebase.config';


class FirestoreIntranetRepository {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;

  constructor() {
    this.firestore = firestoreIntranet;
    // this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, Collection.InstrumentRegistration);
  }

  public async getFields(): Promise<IField[] | []> {
    const docRef = doc(this.development, Documents.Fields);
    const fields = await getDoc(docRef);

    if (!fields.exists()) return [];

    const { data } = fields.data();

    return data ?? [];
  }

  public async getFieldsBlock(): Promise<IFieldsBlock[] | []> {
    const docRef = doc(this.development, Documents.FieldsBlock);
    const fieldsBlock = await getDoc(docRef);

    if (!fieldsBlock.exists()) return [];

    const { data } = fieldsBlock.data();

    return data ?? [];
  }

  public async getSelectOptions(): Promise<ISelectOption[]> {
    const docRef = doc(this.development, Documents.SelectOption);
    const selectOption = await getDoc(docRef);

    if (!selectOption.exists()) return [];

    const { data } = selectOption.data();

    return data ?? [];
  }

  public async setFields(fields: IField[]): Promise<any> {
    try {
      const docRef = doc(this.development, Documents.Fields);
      await setDoc(docRef, { data: fields }, { merge: true });
      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }

  public async setFieldsBlock(fieldsBlock: any[]): Promise<any> {
    try {
      const docRef = doc(this.development, Documents.FieldsBlock);
      await setDoc(docRef, { data: fieldsBlock }, { merge: true });
      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }

  public async setSelectOptions(data: ISelectOption[]): Promise<any> {
    try {
      const docRef = doc(this.development, Documents.SelectOption);
      await setDoc(docRef, { data }, { merge: true });
      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }
}
export default new FirestoreIntranetRepository();
