import firestoreService from '@/services/firestore-intranet/firestore.service';
import { IInstrument } from '@/models/instruments-registration.model';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { SubCollection } from '@/enums/firestoreIntranet.enum';


export const useInstruments = (): UseQueryResult<IInstrument[], Error> => {
  return useQuery({
    queryKey: [SubCollection.Instruments],
    queryFn: async (): Promise<IInstrument[]> =>
      await firestoreService.getInstrumentsOrGroups<IInstrument>(SubCollection.Instruments),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
