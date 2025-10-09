import { collection, deleteDoc, doc, Firestore, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { firestoreIntranet } from '@/config/firebase.config';
import { Collection } from '@/enums/firestoreIntranet.enum';


class FirestoreIntranetRepository {
  protected readonly firestore: Firestore;
  protected readonly production: any;
  protected readonly development: any;
  protected readonly InstrumentRegistration: any;

  constructor() {
    this.firestore = firestoreIntranet;
    // this.production = collection(this.firestore, FirestoreCollection.PRODUCTION);
    this.development = collection(this.firestore, Collection.development);
    this.InstrumentRegistration = collection(this.firestore, Collection.InstrumentRegistration);
  }

  // public async getFields(): Promise<IField[] | []> {
  //   const docRef = doc(this.InstrumentRegistration, Documents.Fields);
  //   const fields = await getDoc(docRef);

  //   if (!fields.exists()) return [];

  //   const { data } = fields.data();

  //   return data ?? [];
  // }

  // public async getFieldsBlock(): Promise<IFieldsBlock[] | []> {
  //   const docRef = doc(this.InstrumentRegistration, Documents.FieldsBlock);
  //   const fieldsBlock = await getDoc(docRef);

  //   if (!fieldsBlock.exists()) return [];

  //   const { data } = fieldsBlock.data();

  //   return data ?? [];
  // }

  // public async getSelectOptions(): Promise<ISelectOption[] | []> {
  //   const docRef = doc(this.InstrumentRegistration, Documents.SelectOption);
  //   const selectOption = await getDoc(docRef);

  //   if (!selectOption.exists()) return [];

  //   const { data } = selectOption.data();

  //   return data ?? [];
  // }

  // public async getInstrumentsGroup(): Promise<IInstrumentsGroup[] | []> {
  //   const docRef = doc(this.InstrumentRegistration, Documents.InstrumentsGroup);
  //   const instrumentsGroup = await getDoc(docRef);

  //   if (!instrumentsGroup.exists()) return [];

  //   const { data } = instrumentsGroup.data();

  //   return data ?? [];
  // }

  // public async getInstruments(): Promise<IInstrument[] | []> {
  //   const docRef = doc(this.InstrumentRegistration, Documents.Instruments);
  //   const instruments = await getDoc(docRef);

  //   if (!instruments.exists()) return [];

  //   const { data } = instruments.data();

  //   return data ?? [];
  // }

  // public async getFormById(formId: string): Promise<ICollectionFields[] | []> {
  //   const docRef = doc(this.InstrumentRegistration, Documents.Forms);
  //   const formCollection = collection(docRef, formId);
  //   const formDocument = doc(formCollection, 'form');
  //   const fields = await getDoc(formDocument);

  //   if (!fields.exists()) return [];

  //   const { data } = fields.data();

  //   return data ?? [];
  // }

  // public async getFormsMap(): Promise<IFormsMap[] | []> {
  //   const docRef = doc(this.InstrumentRegistration, Documents.Forms);
  //   const fields = await getDoc(docRef);

  //   if (!fields.exists()) return [];

  //   const { formsMap } = fields.data();

  //   return formsMap ?? [];
  // }

  // public async getAllRegistredAssets(): Promise<any> {
  //   const assetsRef = collection(
  //     this.firestore,
  //     Collection.InstrumentRegistration,
  //     Documents.RegistredAssets,
  //     'assets'
  //   );

  //   const querySnapshot = await getDocs(assetsRef);

  //   const assetsData = querySnapshot.docs.map((doc) => ({ ...doc.data().data }));

  //   return assetsData;
  // }

  // public async setFields(fields: IField[]): Promise<boolean> {
  //   try {
  //     const docRef = doc(this.InstrumentRegistration, Documents.Fields);
  //     await setDoc(docRef, { data: fields }, { merge: true });
  //     return true;
  //   } catch (error) {
  //     console.error('Erro ao salvar documento:', error);
  //     return false;
  //   }
  // }

  // public async setFieldsBlock(fieldsBlock: IFieldsBlock[]): Promise<boolean> {
  //   try {
  //     const docRef = doc(this.InstrumentRegistration, Documents.FieldsBlock);
  //     await setDoc(docRef, { data: fieldsBlock }, { merge: true });
  //     return true;
  //   } catch (error) {
  //     console.error('Erro ao salvar documento:', error);
  //     return false;
  //   }
  // }

  // public async setSelectOptions(data: ISelectOption[]): Promise<boolean> {
  //   try {
  //     const docRef = doc(this.InstrumentRegistration, Documents.SelectOption);
  //     await setDoc(docRef, { data }, { merge: true });
  //     return true;
  //   } catch (error) {
  //     console.error('Erro ao salvar documento:', error);
  //     return false;
  //   }
  // }

  // public async setInstrumentGroup(data: IInstrumentsGroup[]): Promise<boolean> {
  //   try {
  //     const docRef = doc(this.InstrumentRegistration, Documents.InstrumentsGroup);
  //     await setDoc(docRef, { data }, { merge: true });
  //     return true;
  //   } catch (error) {
  //     console.error('Erro ao salvar documento:', error);
  //     return false;
  //   }
  // }

  // public async setInstruments(data: IInstrument[]): Promise<boolean> {
  //   try {
  //     const docRef = doc(this.InstrumentRegistration, Documents.Instruments);
  //     await setDoc(docRef, { data }, { merge: true });
  //     return true;
  //   } catch (error) {
  //     console.error('Erro ao salvar documento:', error);
  //     return false;
  //   }
  // }

  // public async setForm(form: IForm): Promise<boolean> {
  //   try {
  //     const docRef = doc(this.InstrumentRegistration, Documents.Forms);
  //     const formCollectionRef = collection(docRef, form.id);
  //     const formDocumentRef = doc(formCollectionRef, 'form');
  //     await setDoc(formDocumentRef, { data: form.forms }, { merge: true });
  //     return true;
  //   } catch (error) {
  //     console.error('Erro ao salvar documento:', error);
  //     return false;
  //   }
  // }

  // public async setFormsMap(data: IFormsMap[]): Promise<boolean> {
  //   try {
  //     const docRef = doc(this.InstrumentRegistration, Documents.Forms);
  //     await setDoc(docRef, { formsMap: data }, { merge: true });
  //     return true;
  //   } catch (error) {
  //     console.error('Erro ao salvar documento:', error);
  //     return false;
  //   }
  // }

  // public async setRegistredAssets(data: { id: string; [key: string]: any }): Promise<boolean> {
  //   try {
  //     const docRef = doc(this.InstrumentRegistration, Documents.RegistredAssets);
  //     const collectionRef = collection(docRef, 'assets');
  //     const docRefAsset = doc(collectionRef, data.id);
  //     await setDoc(docRefAsset, { data }, { merge: true });
  //     return true;
  //   } catch (error) {
  //     console.error('Erro ao salvar documento:', error);
  //     return false;
  //   }
  // }

  /**
   * Obtém todos os documentos de uma subcoleção específica
   *
   * Esta função realiza uma consulta completa em uma subcoleção do Firestore,
   * retornando todos os documentos contidos nela. Ideal para listagens completas
   * onde é necessário carregar todos os registros de uma determinada coleção.
   *
   * @template T - Tipo genérico que define a estrutura dos documentos retornados
   * @param {string} documentRef - Caminho do documento pai no Firestore
   * @param {string} collectionRef - Nome da subcoleção a ser consultada
   * @returns {Promise<T[]>} Array de documentos do tipo T. Retorna array vazio se não houver dados
   *
   * @example
   * // Obter todos os campos cadastrados
   * const fields = await getAll<IField>('fields_blocks', 'fields');
   *
   * @example
   * // Obter todos os ativos cadastrados
   * const assets = await getAll<any>('registred_assets', 'assets');
   */
  public async getAll<T>(documentRef: string, collectionRef: string): Promise<T[] | []> {
    const docRef = doc(this.development, documentRef);
    const subCollection = collection(docRef, collectionRef);
    const snapshot = await getDocs(subCollection);
    const data = snapshot.docs.map((doc: any) => ({ ...doc.data().data }));
    return data ?? [];
  }

  /**
   * Obtém um documento específico de uma subcoleção pelo ID
   *
   * Busca um documento individual dentro de uma subcoleção utilizando seu ID único.
   * Retorna os dados do documento se encontrado, ou array vazio se o documento não existir.
   *
   * @template T - Tipo genérico que define a estrutura do documento retornado
   * @param {string} documentRef - Caminho do documento pai no Firestore
   * @param {string} collectionRef - Nome da subcoleção onde o documento está armazenado
   * @param {string} id - ID único do documento a ser recuperado
   * @returns {Promise<T | []>} Documento do tipo T se encontrado, array vazio se não existir
   *
   * @example
   * // Obter um usuário específico pelo ID
   * const fields = await getById<IField>('fields_blocks', 'fields', '06d83356-183c-439d-9cbf-...');
   *
   * @example
   * // Obter um produto específico
   * const instruments = await getById<IInstrument>('instruments_groups', 'instruments', '06d83356-183c-439d-9cbf-...');
   */
  public async getById<T>(documentRef: string, collectionRef: string, id: string): Promise<T | []> {
    const docRef = doc(this.development, documentRef);
    const subCollection = collection(docRef, collectionRef);
    const document = doc(subCollection, id);
    const snapshot = await getDoc(document);

    if (!snapshot.exists()) return [];

    const { data } = snapshot.data();

    return data ?? [];
  }

  public async getDocumentFields<T>(documentRef: string): Promise<T[] | []> {
    const docRef = doc(this.development, documentRef);
    const fields = await getDoc(docRef);

    if (!fields.exists()) return [];

    const { data } = fields.data();

    return data ?? [];
  }

  /**
   * Cria ou atualiza um documento em uma subcoleção
   *
   * Esta função salva um documento em uma subcoleção específica. Se o documento já existir,
   * os dados são mesclados (merge). Se não existir, um novo documento é criado.
   * Utiliza o campo `id` do objeto data como identificador do documento.
   *
   * @param {string} documentRef - Caminho do documento pai no Firestore
   * @param {string} collectionRef - Nome da subcoleção onde o documento será salvo
   * @param {any} data - Dados do documento a serem salvos. Deve conter campo `id`
   * @returns {Promise<boolean>} `true` se salvo com sucesso, `false` em caso de erro
   *
   * @example
   * // Salvar um novo campo
   * await set(fields_blocks, fields, {
   *   id: '06d83356-183c-439d-9cbf-...',
   *   name: 'Nome do Ativo Financeioro',
   *   ...
   * });
   */
  public async set(documentRef: string, collectionRef: string, data: any): Promise<boolean> {
    try {
      const docRef = doc(this.development, documentRef);
      const subCollection = collection(docRef, collectionRef);
      const document = doc(subCollection, data?.id);
      await setDoc(document, { data }, { merge: true });
      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }

  public async setDocumentFields(documentRef: string, data: any): Promise<boolean> {
    try {
      const docRef = doc(this.development, documentRef);
      await setDoc(docRef, { data }, { merge: true });
      return true;
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      return false;
    }
  }

  public async delete(documentRef: string, collectionRef: string, idRef: string): Promise<boolean> {
    try {
      const docRef = doc(this.development, documentRef);
      const subCollection = collection(docRef, collectionRef);
      const document = doc(subCollection, idRef);
      await deleteDoc(document);
      return true;
    } catch (error) {
      console.error('Erro ao deletar o documento:', error);
      return false;
    }
  }
}
export default new FirestoreIntranetRepository();
