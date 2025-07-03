import formRepository from '@/repositories/instrument/form.repository';

class FormService {
  public async getAllForms(): Promise<any> {
    const docs = await formRepository.getAllForms();
    const forms = Object.values(docs);
    return forms;
  }
}
export default new FormService();
