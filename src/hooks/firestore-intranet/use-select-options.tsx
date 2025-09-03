import firestoreService from '@/services/firestore-intranet/firestore.service';
import { ISelectOption } from '@/models/instrumentsRegistration.model';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Documents } from '@/enums/firestoreIntranet.enum';

export const useSelectOptions = (): UseQueryResult<ISelectOption[], Error> => {
  return useQuery({
    queryKey: [Documents.SelectOption],
    queryFn: async (): Promise<ISelectOption[]> => await firestoreService.getSelectOptions(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
