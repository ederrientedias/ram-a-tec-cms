import { IFundResponse, IAnbimaSummaryData } from '@/models/salesforce.model';
import salesforceRepository from '@/repositories/salesforce.repository';

class SalesforceService {
  /**
   * @description Obtém dados do Salesforce para fundos Riza
   * @returns {Promise<IFundResponse[] | []>} A resposta da API do Salesforce
   * @throws {Error} Se a solicitação falhar ou a resposta não for bem-sucedida
   */
  public async getAllRizaFunds(): Promise<IFundResponse[] | []> {
    const response = (await salesforceRepository.getAllRizaFunds()).sort();
    return response;
  }

  public async getSummaryById(id: string): Promise<IAnbimaSummaryData> {
    return await salesforceRepository.getAnbimaSummary(id);
  }
}

export default new SalesforceService();
