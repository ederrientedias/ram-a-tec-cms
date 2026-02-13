import PortfolioRepository from '@/repositories/products/portfolio.repository';
import { IPortfolioService, ITable } from '@/models/portfolio.model';

class PortfolioService implements IPortfolioService {
  /**
   * @description | Atualiza a tabela de ativos do fundo
   * @param fundName | nome do fundo
   * @param data | dados da tabela
   * @returns | retorna true se a tabela foi atualizada com sucesso
   */
  public async updateAssetTable(fundName: string, data: ITable): Promise<boolean> {
    return await PortfolioRepository.saveAssetsTable(fundName, data);
  }
}
export default new PortfolioService();
