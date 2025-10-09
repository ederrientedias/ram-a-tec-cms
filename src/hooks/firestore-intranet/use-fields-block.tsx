import firestoreService from '@/services/firestore-intranet/firestore.service';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { IBlock } from '@/models/instruments-registration.model';
import { SubCollection } from '@/enums/firestoreIntranet.enum';


export const useFieldsBlock = (): UseQueryResult<IBlock[], Error> => {
  return useQuery({
    queryKey: [SubCollection.Blocks],
    queryFn: async (): Promise<IBlock[]> =>
      await firestoreService.getFieldsOrBlocks<IBlock>(SubCollection.Blocks),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
