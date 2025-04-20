import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchFunds } from '@/repositories/funds.repository';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { IInvestmentFund } from '@/models/firestore';

export const useFunds = (): UseQueryResult<IInvestmentFund[], Error> => {
  return useQuery({
    queryKey: [FirestoreDocument.INVESTMENT_FUNDS],
    queryFn: fetchFunds,
  });
};
