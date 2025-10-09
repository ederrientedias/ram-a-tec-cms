import firestoreService from '@/services/firestore-intranet/firestore.service';
import { Document, SubCollection } from '@/enums/firestoreIntranet.enum';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { IGroup } from '@/models/instruments-registration.model';


export const useGroups = (): UseQueryResult<IGroup[], Error> => {
  return useQuery({
    queryKey: [SubCollection.Groups],
    queryFn: async (): Promise<IGroup[]> =>
      await firestoreService.getInstrumentsOrGroups<IGroup>(SubCollection.Groups),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
