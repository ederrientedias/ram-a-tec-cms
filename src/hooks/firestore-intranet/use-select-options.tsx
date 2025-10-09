import firestoreService from '@/services/firestore-intranet/firestore.service';
import { IOption } from '@/models/instruments-registration.model';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { SubCollection } from '@/enums/firestoreIntranet.enum';


export const useSelectOptions = (): UseQueryResult<IOption[], Error> => {
  return useQuery({
    queryKey: [SubCollection.Options],
    queryFn: async (): Promise<IOption[]> =>
      await firestoreService.getSelectOptions<IOption>(SubCollection.Options),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
