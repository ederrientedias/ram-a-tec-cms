import {
  IField,
  IFieldsBlock,
  IInstrument,
  IInstrumentsGroup,
  ISelectOption,
} from '@/models/instrumentsRegistration.model';
import firestoreRepository from '@/repositories/firestore-intranet/firestore.repository';

class FirestoreService {
  /* GET */
  public async getFields(): Promise<any> {
    const fields = await firestoreRepository.getFields();
    return fields;
  }

  public async getFieldsBlock(): Promise<IFieldsBlock[] | []> {
    return await firestoreRepository.getFieldsBlock();
  }

  public async getFieldsBlockByGroup(group: string): Promise<IFieldsBlock[] | []> {
    const fieldsBlock: IFieldsBlock[] = await firestoreRepository.getFieldsBlock();
    if (fieldsBlock.length === 0) return [];

    const data = fieldsBlock.filter((field) => field.group === group);

    return data;
  }

  public async getSelectOptions(): Promise<ISelectOption[] | []> {
    return await firestoreRepository.getSelectOptions();
  }

  public async getSelectOptionByID(optionRef: string): Promise<ISelectOption> {
    const response = await firestoreRepository.getSelectOptions();
    const options = response?.find((option: ISelectOption) => option.id === optionRef);
    return options;
  }

  public async getInstrumentsGroup(): Promise<IInstrumentsGroup[] | []> {
    return await firestoreRepository.getInstrumentsGroup();
  }

  public async getInstrumentsById(id: string): Promise<IInstrument[] | []> {
    const instrumentsGroup: IInstrument[] = await firestoreRepository.getInstruments();

    if (instrumentsGroup.length === 0) return [];

    const data = instrumentsGroup.filter((item) => item.instrumentGroupRef === id);

    return data;
  }

  public async getInstruments(): Promise<IInstrument[] | []> {
    return await firestoreRepository.getInstruments();
  }

  /* SET */
  public async setField(field: IField): Promise<boolean> {
    console.log('setField', field);
    const fields = await firestoreRepository.getFields();
    console.log('get', fields);

    if (Array.isArray(fields) && fields.length === 0) {
      return await firestoreRepository.setFields([field]);
    }

    if (Array.isArray(fields) && fields.length > 0) {
      const exists = fields.some((f: IField) => f.id === field.id);
      const index = fields.findIndex((f: IField) => f.id === field.id);

      if (exists && index !== -1) {
        fields[index] = field;
        return await firestoreRepository.setFields(fields);
      }

      const mergedFields = [...fields, field];
      return await firestoreRepository.setFields(mergedFields);
    }
  }

  public async setFieldsBlock(data: IFieldsBlock): Promise<boolean> {
    const fieldaBlock = await firestoreRepository.getFieldsBlock();

    if (Array.isArray(fieldaBlock) && fieldaBlock.length === 0) {
      return await firestoreRepository.setFieldsBlock([data]);
    }

    if (Array.isArray(fieldaBlock) && fieldaBlock.length > 0) {
      const exists = fieldaBlock.some((f: IFieldsBlock) => f.id === data.id);
      const index = fieldaBlock.findIndex((f: IFieldsBlock) => f.id === data.id);

      if (exists && index !== -1) {
        fieldaBlock[index] = data;
        return await firestoreRepository.setFieldsBlock(fieldaBlock);
      }

      const mergedFieldaBlock = [...fieldaBlock, data];
      return await firestoreRepository.setFieldsBlock(mergedFieldaBlock);
    }
  }

  public async setSelectOption(data: ISelectOption): Promise<boolean> {
    const selectOptions = await firestoreRepository.getSelectOptions();

    if (Array.isArray(selectOptions) && selectOptions.length === 0) {
      return await firestoreRepository.setSelectOptions([data]);
    }

    if (Array.isArray(selectOptions) && selectOptions.length > 0) {
      const exists = selectOptions.some((s: ISelectOption) => s.id === data.id);
      const index = selectOptions.findIndex((s: ISelectOption) => s.id === data.id);

      if (exists && index !== -1) {
        selectOptions[index] = data;
        return await firestoreRepository.setSelectOptions(selectOptions);
      }

      const mergedSelectOptions = [...selectOptions, data];
      return await firestoreRepository.setSelectOptions(mergedSelectOptions);
    }
  }

  public async setInstrumentGroup(data: IInstrumentsGroup): Promise<boolean> {
    const instrumentsGroup = await firestoreRepository.getInstrumentsGroup();

    if (Array.isArray(instrumentsGroup) && instrumentsGroup.length === 0) {
      return await firestoreRepository.setInstrumentGroup([data]);
    }

    if (Array.isArray(instrumentsGroup) && instrumentsGroup.length > 0) {
      const exists = instrumentsGroup.some((e: IInstrumentsGroup) => e.id === data.id);
      const index = instrumentsGroup.findIndex((e: IInstrumentsGroup) => e.id === data.id);

      if (exists && index !== -1) {
        instrumentsGroup[index] = data;
        return await firestoreRepository.setInstrumentGroup(instrumentsGroup);
      }

      const mergedInstrumentGroup = [...instrumentsGroup, data];
      return await firestoreRepository.setInstrumentGroup(mergedInstrumentGroup);
    }
  }

  public async setInstrument(instrument: IInstrument): Promise<boolean> {
    const instruments = await firestoreRepository.getInstruments();

    if (Array.isArray(instruments) && instruments.length === 0) {
      return await firestoreRepository.setInstruments([instrument]);
    }

    if (Array.isArray(instruments) && instruments.length > 0) {
      const exists = instruments.some((e: IInstrument) => e.id === instrument.id);
      const index = instruments.findIndex((e: IInstrument) => e.id === instrument.id);

      if (exists && index !== -1) {
        instruments[index] = instrument;
        return await firestoreRepository.setInstruments(instruments);
      }

      const mergedInstruments = [...instruments, instrument];
      return await firestoreRepository.setInstruments(mergedInstruments);
    }
  }

  /* DELETE */
  public async deleteField(field: IField): Promise<boolean> {
    const fields = await firestoreRepository.getFields();
    if (!Array.isArray(fields) || fields.length === 0) {
      return false;
    }

    if (Array.isArray(fields) && fields.length > 0) {
      const exists = fields.some((f: IField) => f.id === field.id);
      const index = fields.findIndex((f: IField) => f.id === field.id);

      if (!exists && index === -1) {
        return false;
      }

      if (exists && index !== -1) {
        fields.splice(index, 1);
        return await firestoreRepository.setFields(fields);
      }
    }
  }

  public async deleteSelectOptions(optionRef: string): Promise<boolean> {
    const options = await firestoreRepository.getSelectOptions();
    if (!Array.isArray(options) || options.length === 0) {
      return false;
    }

    if (Array.isArray(options) && options.length > 0) {
      const exists = options.some((s: ISelectOption) => s.id === optionRef);
      const index = options.findIndex((s: ISelectOption) => s.id === optionRef);

      if (!exists && index === -1) {
        return false;
      }

      if (exists && index !== -1) {
        options.splice(index, 1);
        return await firestoreRepository.setSelectOptions(options);
      }
    }
  }

  public async deleteFieldBlock(fieldBlockId: string): Promise<boolean> {
    const fieldsBlock = await firestoreRepository.getFieldsBlock();
    if (!Array.isArray(fieldsBlock) || fieldsBlock.length === 0) {
      return false;
    }

    if (Array.isArray(fieldsBlock) && fieldsBlock.length > 0) {
      const exists = fieldsBlock.some((f: IFieldsBlock) => f.id === fieldBlockId);
      const index = fieldsBlock.findIndex((f: IFieldsBlock) => f.id === fieldBlockId);

      if (!exists && index === -1) {
        return false;
      }

      if (exists && index !== -1) {
        fieldsBlock.splice(index, 1);
        return await firestoreRepository.setFieldsBlock(fieldsBlock);
      }
    }
  }

  public async deleteIntrumentGroup(id: string): Promise<boolean> {
    const instrumentsGroup = await firestoreRepository.getInstrumentsGroup();

    if (!Array.isArray(instrumentsGroup) || instrumentsGroup.length === 0) {
      return false;
    }

    if (Array.isArray(instrumentsGroup) && instrumentsGroup.length > 0) {
      const exists = instrumentsGroup.some((e: IInstrumentsGroup) => e.id === id);
      const index = instrumentsGroup.findIndex((e: IInstrumentsGroup) => e.id === id);

      if (!exists && index === -1) {
        return false;
      }

      if (exists && index !== -1) {
        instrumentsGroup.splice(index, 1);
        return await firestoreRepository.setInstrumentGroup(instrumentsGroup);
      }
    }
  }

  public async deleteIntrument(id: string): Promise<boolean> {
    const instruments = await firestoreRepository.getInstruments();

    if (!Array.isArray(instruments) || instruments.length === 0) {
      return false;
    }

    if (Array.isArray(instruments) && instruments.length > 0) {
      const exists = instruments.some((e: IInstrument) => e.id === id);
      const index = instruments.findIndex((e: IInstrument) => e.id === id);

      if (!exists && index === -1) {
        return false;
      }

      if (exists && index !== -1) {
        instruments.splice(index, 1);
        return await firestoreRepository.setInstruments(instruments);
      }
    }
  }
}
export default new FirestoreService();
