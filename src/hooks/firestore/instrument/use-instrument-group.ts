import instrumentService from '@/services/instruments/instrument-group.service';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { IInstrumentGroup } from '@/models/instruments.model';
import { FirestoreDocument } from '@/enums/firestore.enum';

export const useInstrumentGroup = (): UseQueryResult<IInstrumentGroup[], Error> => {
  return useQuery({
    queryKey: [FirestoreDocument.INSTRUMENTS_GROUP],
    queryFn: async (): Promise<IInstrumentGroup[] | []> =>
      await instrumentService.getInstrumentGroup(),
    refetchOnWindowFocus: false,
    // staleTime: Infinity,
    enabled: true,
  });
};
