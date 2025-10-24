import fundsRepository, { DocumentProps, IMigrateCollection, } from '@/repositories/funds.repository';
import { IFund, IFundsService, IGenericType } from '@/models/funds.model';


class FundsService implements IFundsService {
  public async getFunds(): Promise<IFund[]> {
    const response = await fundsRepository.getAllFunds();
    return response.sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  public async getFundById(id: string | number): Promise<IFund | null> {
    const funds = await this.getFunds();
    return funds.find((fund: IFund) => fund.id === Number(id)) || null;
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

  public async setDocument(props: DocumentProps): Promise<boolean> {
    return await fundsRepository.setDocument(props);
  }

  public async migrateCollection(props: IMigrateCollection): Promise<any> {
    return await fundsRepository.migrateCollection(props);
  }

  private async mergePublications(newFund: IFund): Promise<any[]> {
    const funds = await this.getFunds();
    const existingFundIndex = funds.findIndex((f) => f.uuid === newFund.uuid);
    return existingFundIndex === -1
      ? [...funds, newFund]
      : funds.map((fund, index) => (index === existingFundIndex ? { ...fund, ...newFund } : fund));
  }
}

export default new FundsService();
