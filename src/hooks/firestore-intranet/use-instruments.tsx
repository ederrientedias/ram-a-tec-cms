import firestoreService from '@/services/firestore-intranet/firestore.service';
import { Documents, SubCollection } from '@/enums/firestoreIntranet.enum';
import { IInstrument } from '@/models/instruments-registration.model';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

export const useInstruments = (): UseQueryResult<IInstrument[], Error> => {
  return useQuery({
    queryKey: [Documents.Instruments],
    queryFn: async (): Promise<IInstrument[]> =>
      await firestoreService.getInstrumentsOrGroups<IInstrument>(SubCollection.Instruments),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
