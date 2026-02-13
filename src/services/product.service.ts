import FundsRepository from '@/repositories/funds.repository';
import { FundDocument } from '@/enums/firestore.enum';

class ProductService {
  public async getDescription(fundName: string, documentName: string): Promise<any> {
    const docRef = await FundsRepository.getFundDocument(fundName, documentName);
    const { description, goal, target_return } = docRef;
    return { description, goal, target_return };
  }

  public async getDocuments(fundName: string): Promise<any> {
    const docRef = await FundsRepository.getFundDocument(fundName, FundDocument.DOCUMENTS);
    const { data } = docRef;

    if (typeof data === 'string') {
      return JSON.parse(data);
    }

    if (Array.isArray(data)) {
      return data;
    }
  }

  public async getDocumentKeys(fundName: string): Promise<string[]> {
    const document = await this.getDocuments(fundName);

    if (Array.isArray(document)) {
      const keys = document.map((item: any) => item.tabName);
      return keys;
    } else if (typeof document === 'object') {
      return Object.keys(document);
    } else {
      return [];
    }
  }

  public async getCollectionsMap(fundName: string): Promise<any[]> {
    return;
  }

  public async getDocumentByYear(): Promise<any[]> {
    return;
  }

  public async setDocuments(props: any): Promise<any> {}
}
export default new ProductService();
