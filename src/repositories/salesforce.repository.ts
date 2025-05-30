import { Data, ISalesforceRizaFundsResponse } from '@/models/salesforce.model';
import { createApiInstance } from '@/lib/api';

class SalesforceRepository {
  protected readonly base_url = import.meta.env.VITE_API_SALESFORCE;

  /**
   * @description Obtém dados do Salesforce para fundos Riza
   * @returns {Promise<Data[] | []>} A resposta da API do Salesforce
   */
  public async getAllRizaFunds(): Promise<Data[] | []> {
    const api = createApiInstance(this.base_url);
    const response = await api.get<ISalesforceRizaFundsResponse>('/funds');

    if (!response.data.success) {
      return [];
    }

    return response.data.data;
  }
}
export default new SalesforceRepository();
