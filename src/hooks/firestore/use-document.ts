import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchDocuments } from '@/repositories/funds.repository';
import { FirestoreDocuments } from '@/enums/firestore.enum';
import { IInvestmentFund } from '@/models/firestore';

export const useDocument = (collectionName: string): UseQueryResult<IInvestmentFund[], Error> => {
  return useQuery({
    queryKey: [FirestoreDocuments.INVESTMENT_FUNDS],
    queryFn: () => fetchDocuments(collectionName, 'documents'),
  });
};
