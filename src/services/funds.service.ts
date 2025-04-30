import { IFund, IFundsService, IGenericType } from '@/models/funds.model';
import fundsRepository from '@/repositories/funds.repository';

class FundsService implements IFundsService {

  public async getFunds(): Promise<IFund[]> {
    return await fundsRepository.getAllFunds();
  }

  public async getUniqueValues<T extends keyof IFund>(propertyName: T): Promise<IGenericType[]> {
    const funds = await this.getFunds();
    const typesMap = new Map<string, IGenericType>();
    let idCounter = 0;

    funds.forEach((fund: IFund) => {
      const propertyValue = fund[propertyName];

      if (
        (typeof propertyValue === 'string' && propertyValue.length > 0) ||
        typeof propertyValue === 'number'
      ) {
        const key = String(propertyValue);

        if (!typesMap.has(key)) {
          typesMap.set(key, {
            id: idCounter++,
            name: key,
          });
        }
      }
    });

    return Array.from(typesMap.values());
  }

  public async setFunds(newFund: IFund): Promise<boolean> {
    const funds = await this.mergePublications(newFund);
    return await fundsRepository.set(funds);
  }

  private async mergePublications(newFund: IFund): Promise<any[]> {
    const funds = await this.getFunds();
    const mergedFunds = [...funds, newFund];

    return mergedFunds;
  }
}

export default new FundsService();
