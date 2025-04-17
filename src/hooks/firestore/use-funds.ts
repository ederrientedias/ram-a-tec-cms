import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchFunds } from '@/repositories/funds.repository';
import { FirestoreDocuments } from '@/enums/firestore.enum';
import { IInvestmentFund } from '@/models/firestore';

export const useFunds = (): UseQueryResult<IInvestmentFund[], Error> => {
  return useQuery({
    queryKey: [FirestoreDocuments.INVESTMENT_FUNDS],
    queryFn: fetchFunds,
  });
};
