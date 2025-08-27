import { IField, IFieldsBlock, ISelectOption } from '@/models/instrumentsRegistration.model';
import firestoreRepository from '@/repositories/firestore-intranet/firestore.repository';


class FirestoreService {
  public async getFields(): Promise<any> {
    const fields = await firestoreRepository.getFields();
    return fields;
  }

  public async getFieldsBlock(): Promise<IFieldsBlock[] | []> {
    const fieldsBlock = await firestoreRepository.getFieldsBlock();
    return fieldsBlock;
  }

  public async getSelectOptions(): Promise<ISelectOption[]> {
    return await firestoreRepository.getSelectOptions();
  }

  public async getSelectOptionByID(optionRef: string): Promise<ISelectOption> {
    const response = await firestoreRepository.getSelectOptions();
    const options = response.find((option) => option.id === optionRef);
    return options;
  }

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
}
export default new FirestoreService();
