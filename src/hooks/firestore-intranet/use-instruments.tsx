import firestoreService from '@/services/firestore-intranet/firestore.service';
import { IInstrument } from '@/models/instrumentsRegistration.model';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Documents } from '@/enums/firestoreIntranet.enum';


export const useInstruments = (): UseQueryResult<IInstrument[], Error> => {
  return useQuery({
    queryKey: [Documents.Instruments],
    queryFn: async (): Promise<IInstrument[]> => await firestoreService.getInstruments(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
