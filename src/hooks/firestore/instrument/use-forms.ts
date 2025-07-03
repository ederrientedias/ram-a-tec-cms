import { useQuery, UseQueryResult } from '@tanstack/react-query';
import formService from '@/services/instruments/form.service';
import { FirestoreDocument } from '@/enums/firestore.enum';

export const useForms = (): UseQueryResult<any> => {
  return useQuery({
    queryKey: [FirestoreDocument.FORMS],
    queryFn: async (): Promise<any> => await formService.getAllForms(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: true,
  });
};
