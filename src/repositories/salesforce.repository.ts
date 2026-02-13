import {
  IRizaFundsResponse,
  IFundResponse,
  IGetAnbimaSummaryResponse,
  IAnbimaSummaryData,
} from '@/models/salesforce.model';
import { createApiInstance } from '@/lib/api';

class SalesforceRepository {
  protected readonly base_url = import.meta.env.VITE_API_SALESFORCE;

  /**
   * @description Obtém dados do Salesforce para fundos Riza
   * @returns {Promise<Data[] | []>} A resposta da API do Salesforce
   */
  public async getAllRizaFunds(): Promise<IFundResponse[] | []> {
    const api = createApiInstance(this.base_url);
    const response = await api.get<IRizaFundsResponse>('/funds');

    if (!response.data.success) {
      return [];
    }

    return response.data.data;
  }

  public async getAnbimaSummary(id: string): Promise<IAnbimaSummaryData | null> {
    const api = createApiInstance(this.base_url);
    try {
      const { data: response } = await api.post<IGetAnbimaSummaryResponse>('/fund', { id });
      return response.success ? response.data : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
export default new SalesforceRepository();
