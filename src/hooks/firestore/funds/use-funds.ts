import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { FirestoreDocument } from '@/enums/firestore.enum';
import fundsService from '@/services/funds.service';
import { IFund } from '@/models/funds.model';

export const useFunds = (): UseQueryResult<IFund[], Error> => {
  return useQuery({
    queryKey: [FirestoreDocument.INVESTMENT_FUNDS],
    queryFn: async (): Promise<IFund[]> => await fundsService.getFunds(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
