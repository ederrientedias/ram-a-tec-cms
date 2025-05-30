import salesforceRepository from '@/repositories/salesforce.repository';
import { Data } from '@/models/salesforce.model';

class SalesforceService {
  /**
   * @description Obtém dados do Salesforce para fundos Riza
   * @returns {Promise<data[] | []>} A resposta da API do Salesforce
   * @throws {Error} Se a solicitação falhar ou a resposta não for bem-sucedida
   */
  public async getAllRizaFunds(): Promise<Data[] | []> {
    const response = await salesforceRepository.getAllRizaFunds();
    return response;
  }

  public async getRizaFundById(id: string): Promise<any> {}
}

export default new SalesforceService();
