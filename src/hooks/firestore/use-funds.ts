import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { FirestoreDocument } from '@/enums/firestore.enum';
import fundsService from '@/services/funds.service';

export const useFunds = (): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: [FirestoreDocument.INVESTMENT_FUNDS],
    queryFn: async (): Promise<any> => await fundsService.getFunds(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
