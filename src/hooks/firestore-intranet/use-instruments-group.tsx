import firestoreService from '@/services/firestore-intranet/firestore.service';
import { IInstrumentsGroup } from '@/models/instrumentsRegistration.model';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Documents } from '@/enums/firestoreIntranet.enum';


export const useInstrumentsGroup = (): UseQueryResult<IInstrumentsGroup[], Error> => {
  return useQuery({
    queryKey: [Documents.InstrumentsGroup],
    queryFn: async (): Promise<IInstrumentsGroup[]> => await firestoreService.getInstrumentsGroup(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
