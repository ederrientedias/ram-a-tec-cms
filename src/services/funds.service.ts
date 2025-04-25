import { IFund, IFundsService, IGenericType } from '@/models/funds.model';
import fundsRepository from '@/repositories/funds.repository';

class FundsService implements IFundsService {
  public async getFunds(): Promise<IFund[]> {
    return await fundsRepository.get();
  }

  public async getUniqueValues<T extends keyof IFund>(propertyName: T): Promise<IGenericType[]> {
    const funds = await fundsRepository.get();
    const typesMap = new Map<string, IGenericType>(); // A chave do Map é sempre string
    let idCounter = 0;

    funds.forEach((fund: IFund) => {
      const propertyValue = fund[propertyName];

      // Verificamos se o valor da propriedade é string ou number
      if (typeof propertyValue === 'string' || typeof propertyValue === 'number') {
        const key = String(propertyValue); // Convertemos para string para usar como chave

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
    const funds = await fundsRepository.get();
    const mergedFunds = [...funds, newFund];

    return mergedFunds;
  }
}

export default new FundsService();
