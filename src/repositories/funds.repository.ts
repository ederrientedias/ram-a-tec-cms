import Firestore from '@/services/firestore';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { IInvestmentFund } from '@/models/firestore';

export const fetchFunds = async (): Promise<IInvestmentFund[]> => {
  const { data } = await Firestore.getDocumentField(FirestoreDocument.INVESTMENT_FUNDS);
  return Array.isArray(data) ? data : [data];
};

export const fetchDocuments = async (collectionName: string, document: string) => {
  const response = await Firestore.getCollectionDocument(
    FirestoreDocument.INVESTMENT_FUNDS,
    collectionName,
    document
  );

  if (typeof response.data === 'string') {
    return JSON.parse(response.data);
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }
};
