import fieldsBlocksRepository from '@/repositories/instrument/fields-blocks.repository';
import { IFieldAndBlock, IField } from '@/models/instruments.model';

class FieldsBlocksService {
  /**
   * @description - Obtém todos os campos do Firestore
   * @returns - Array de campos
   */
  public async getFields(): Promise<IField[] | []> {
    const fields = await fieldsBlocksRepository.getFields();
    if (!fields) return [];
    return fields;
  }

  /**
   * @description - Obtém todos os campos e blocos do Firestore
   * @returns - Array de campos e blocos
   */
  public async getAllFieldsBlocks(): Promise<IFieldAndBlock[] | []> {
    const docs = await fieldsBlocksRepository.getAllFieldsBlocks();
    if (!docs) return [];
    const fieldsBlocks = Object.values(docs);
    return fieldsBlocks;
  }
}
export default new FieldsBlocksService();
