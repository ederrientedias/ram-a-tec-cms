import firestoreService from '@/services/firestore-intranet/firestore.service';
import { Documents, SubCollection } from '@/enums/firestoreIntranet.enum';
import { IOption } from '@/models/instruments-registration.model';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

export const useSelectOptions = (): UseQueryResult<IOption[], Error> => {
  return useQuery({
    queryKey: [Documents.SelectOption],
    queryFn: async (): Promise<IOption[]> =>
      await firestoreService.getSelectOptions<IOption>(SubCollection.Options),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
