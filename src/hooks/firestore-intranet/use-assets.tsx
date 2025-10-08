import firestoreService from '@/services/firestore-intranet/firestore.service';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { SubCollection } from '@/enums/firestoreIntranet.enum';


export const useAssets = (): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: ['registered-asset'],
    queryFn: async (): Promise<any[]> =>
      await firestoreService.getRegisteredAssets(SubCollection.Assets),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
