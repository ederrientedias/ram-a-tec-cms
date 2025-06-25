import instrumentService from '@/services/instruments/instrument.service';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { FirestoreDocument } from '@/enums/firestore.enum';
import { IInstrument } from '@/models/instruments.model';

export const useInstrument = (): UseQueryResult<IInstrument[], Error> => {
  return useQuery({
    queryKey: [FirestoreDocument.INSTRUMENTS],
    queryFn: async (): Promise<IInstrument[] | []> => await instrumentService.getAllInstruments(),
    refetchOnWindowFocus: false,
    // staleTime: Infinity,
    enabled: true,
  });
};
