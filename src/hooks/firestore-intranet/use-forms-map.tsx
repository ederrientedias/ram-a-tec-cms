import firestoreService from '@/services/firestore-intranet/firestore.service';
import { IFormsMap } from '@/models/instruments-registration.model';
import { useQuery, UseQueryResult } from '@tanstack/react-query';


export const useFormsMap = (): UseQueryResult<IFormsMap[], Error> => {
  return useQuery({
    queryKey: ['formsMap'],
    queryFn: async (): Promise<IFormsMap[]> => await firestoreService.getFormsMap(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
