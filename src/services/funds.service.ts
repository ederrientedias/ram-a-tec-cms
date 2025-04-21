import { IFund } from '@/models/funds.model';
import fundsRepository from '@/repositories/funds.repository';

class FundsService {
  public async getFunds(): Promise<IFund[]> {
    return await fundsRepository.get();
  }

  public async setFunds(newFund: IFund): Promise<boolean> {
    const funds = await this.mergePublications(newFund);

    return await fundsRepository.set(funds);
  }

  private async mergePublications(newFund: IFund): Promise<any[]> {
    const publications = await this.getFunds();
    const mergedPublication = [...publications, newFund];

    return mergedPublication;
  }
}

export default new FundsService();
