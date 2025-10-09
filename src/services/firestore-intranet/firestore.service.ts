import { FieldsBlocksCollection, IBlock, IFormsMap, InstrumentsGroupsCollection, RegisteredAssetsCollection, RegisteredFormsCollection, SelectOptionsCollection, } from '@/models/instruments-registration.model';
import firestoreRepository from '@/repositories/firestore-intranet/firestore.repository';
import { Document, SubCollection } from '@/enums/firestoreIntranet.enum';
import { toast } from 'sonner';


class FirestoreService {
  public async getInstrumentsOrGroups<T>(
    collection: InstrumentsGroupsCollection
  ): Promise<T[] | []> {
    const data = await firestoreRepository.getAll<T>(Document.InstrumentsGroups, collection);
    return (
      data.sort((a: any, b: any) => {
        if (!a.name || !b.name) return 0;
        return a.name.localeCompare(b.name);
      }) ?? []
    );
  }

  public async getInstrumentOrGroupById<T>(
    collection: InstrumentsGroupsCollection,
    id: string
  ): Promise<T | []> {
    return await firestoreRepository.getById<T>(Document.InstrumentsGroups, collection, id);
  }

  public async getAllInstrumentsOrGroupsById<T>(
    collection: InstrumentsGroupsCollection,
    ref: { key: string; id: string }
  ): Promise<T[] | []> {
    const docRef = await this.getInstrumentsOrGroups<T>(collection);
    const data = docRef.filter((doc: any) => doc[ref.key] === ref.id);
    return data ?? [];
  }

  public async setInstrumentOrGroup<T>(
    collection: InstrumentsGroupsCollection,
    data: T
  ): Promise<boolean> {
    if (Object.keys(data).length === 0) {
      console.log('Campo data não pode ser vazio.');
      return false;
    }

    return await firestoreRepository.set(Document.InstrumentsGroups, collection, data);
  }

  public async deleteInstrumentOrGroup(
    collection: InstrumentsGroupsCollection,
    idRef: string
  ): Promise<any> {
    return await firestoreRepository.delete(Document.InstrumentsGroups, collection, idRef);
  }

  public async getFieldsOrBlocks<T>(collection: FieldsBlocksCollection): Promise<T[] | []> {
    const data = await firestoreRepository.getAll<T>(Document.FieldsBlocks, collection);
    return (
      data.sort((a: any, b: any) => {
        if (!a.name || !b.name) return 0;
        return a.name.localeCompare(b.name);
      }) ?? []
    );
  }

  public async getFieldOrBlockById<T>(
    collection: FieldsBlocksCollection,
    id: string
  ): Promise<T | []> {
    return await firestoreRepository.getById<T>(Document.FieldsBlocks, collection, id);
  }

  public async getBlockByGroup(group: string): Promise<IBlock[] | []> {
    const blocks: IBlock[] = await this.getFieldsOrBlocks<IBlock>(SubCollection.Blocks);
    const data = blocks.filter((block) => {
      if (Array.isArray(block.group)) return block.group.includes(group);
      return block.group === group;
    });

    return data;
  }

  public async setFieldOrBlock<T>(collection: FieldsBlocksCollection, data: T): Promise<boolean> {
    if (Object.keys(data).length === 0) {
      console.log('Campo data não pode ser vazio.');
      return false;
    }

    return await firestoreRepository.set(Document.FieldsBlocks, collection, data);
  }

  public async deleteFieldOrBlock(collection: FieldsBlocksCollection, idRef: string): Promise<any> {
    return await firestoreRepository.delete(Document.FieldsBlocks, collection, idRef);
  }

  public async getRegisteredAssets<T>(collection: RegisteredAssetsCollection): Promise<T[] | []> {
    return await firestoreRepository.getAll<T>(Document.RegisteredAssets, collection);
  }

  public async getRegisteredAssetById<T>(
    collection: RegisteredAssetsCollection,
    id: string
  ): Promise<T | []> {
    return await firestoreRepository.getById<T>(Document.RegisteredAssets, collection, id);
  }

  public async setRegisteredAsset<T>(
    collection: RegisteredAssetsCollection,
    data: T
  ): Promise<boolean> {
    if (Object.keys(data).length === 0) {
      console.log('Campo data não pode ser vazio.');
      return false;
    }

    return await firestoreRepository.set(Document.RegisteredAssets, collection, data);
  }

  public async getRegisteredForms<T>(collection: RegisteredFormsCollection): Promise<T[] | []> {
    return await firestoreRepository.getAll<T>(Document.RegisteredForms, collection);
  }

  public async getFormsMap(): Promise<IFormsMap[] | []> {
    const data = await firestoreRepository.getDocumentFields<IFormsMap>(Document.RegisteredForms);
    return (
      data.sort((a: any, b: any) => {
        if (!a.name || !b.name) return 0;
        return a.name.localeCompare(b.name);
      }) ?? []
    );
  }

  public async getRegisteredFormById<T>(
    collection: RegisteredFormsCollection,
    id: string
  ): Promise<T | []> {
    return await firestoreRepository.getById<T>(Document.RegisteredForms, collection, id);
  }

  public async setRegisteredForm<T>(
    collection: RegisteredFormsCollection,
    data: T
  ): Promise<boolean> {
    if (Object.keys(data).length === 0) {
      console.log('Campo data não pode ser vazio.');
      return false;
    }

    return await firestoreRepository.set(Document.RegisteredForms, collection, data);
  }

  public async setFormMap(formMap: IFormsMap): Promise<boolean> {
    const formsMap: IFormsMap[] = await this.getFormsMap();
    const exists = formsMap?.findIndex((f) => f.nickname === formMap.nickname);

    if (formsMap.length > 0 && exists !== -1) {
      toast.info(`O formulário de cadastro para "${formMap.nickname}" já existe.`);
      return false;
    }

    if (Array.isArray(formsMap) && formsMap.length === 0) {
      return await firestoreRepository.setDocumentFields(Document.RegisteredForms, [formMap]);
    }

    if (Array.isArray(formsMap) && formsMap.length > 0) {
      const exists = formsMap.some((e: IFormsMap) => e.formId === formMap.formId);
      const index = formsMap.findIndex((e: IFormsMap) => e.formId === formMap.formId);

      if (exists && index !== -1) {
        formsMap[index] = formMap;
        return await firestoreRepository.setDocumentFields(Document.RegisteredForms, formMap);
      }

      const mergedFormsMap = [...formsMap, formMap];
      return await firestoreRepository.setDocumentFields(Document.RegisteredForms, mergedFormsMap);
    }
  }

  public async getSelectOptions<T>(collection: SelectOptionsCollection): Promise<T[] | []> {
    return await firestoreRepository.getAll<T>(Document.SelectOptions, collection);
  }

  public async getSelectOptionById<T>(
    collection: SelectOptionsCollection,
    id: string
  ): Promise<T | []> {
    return await firestoreRepository.getById<T>(Document.SelectOptions, collection, id);
  }

  public async setSelectOption<T>(collection: SelectOptionsCollection, data: T): Promise<boolean> {
    if (Object.keys(data).length === 0) {
      console.log('Campo data não pode ser vazio.');
      return false;
    }

    return await firestoreRepository.set(Document.SelectOptions, collection, data);
  }

  public async deleteSelectOption(
    collection: SelectOptionsCollection,
    idRef: string
  ): Promise<boolean> {
    return await firestoreRepository.delete(Document.SelectOptions, collection, idRef);
  }
}
export default new FirestoreService();
